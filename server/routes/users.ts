import crypto from 'crypto';
import { Router, Response } from 'express';
import { store } from '../db/store.js';
import {
  isSupabaseConfigured, getSupabaseClient, userFromDb, userToDb, classFromDb, schoolFromDb, emailToDb
} from '../db/supabase.js';
import { User, EmailDispatch, ClassGroup, School } from '../../src/types/index.js';
import { sendEmail } from '../services/mailer.js';
import {
  AuthedRequest, attachSession, hashPassword, verifyPassword, isHashed, validNewPassword, issueSession,
  signToken, readToken, otpDigest, randomOtp, safeEquals, sanitizeUser, rateLimited, clientIp
} from '../auth.js';

const router = Router();
const isProd = () => process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const SENDER = 'intellicaautomationgroup@gmail.com';
const norm = (e: unknown) => String(e || '').trim().toLowerCase();
const tempPw = (prefix: string) => `${prefix}-${crypto.randomBytes(5).toString('base64url')}`;

// ---------------------------------------------------------------- data access
// Supabase is the source of truth when configured; the in-memory store is only a dev fallback.

async function findUser(by: { email?: string; id?: string }): Promise<User | undefined> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const q = supabase.from('users').select('*');
    const { data, error } = by.id ? await q.eq('id', by.id).maybeSingle() : await q.eq('email', by.email!).maybeSingle();
    if (!error) return data ? userFromDb(data) : undefined;
    console.warn('[DB] user lookup failed:', error.message);
  }
  return store.users.find(u => (by.id ? u.id === by.id : u.email.toLowerCase() === by.email));
}

async function countRole(role: string): Promise<number> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', role);
    if (!error && count !== null) return count;
  }
  return store.users.filter(u => u.role === role).length;
}

async function insertUser(u: User) {
  // Never overwrite an existing account, whichever storage mode is in use.
  if (await findUser({ email: u.email.toLowerCase() })) throw Object.assign(new Error('exists'), { status: 409 });
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const { error } = await supabase.from('users').insert(userToDb(u));
    if (error) {
      if (error.code === '23505') throw Object.assign(new Error('exists'), { status: 409 });
      throw new Error(error.message);
    }
  }
  store.users = store.users.filter(x => x.id !== u.id && x.email.toLowerCase() !== u.email.toLowerCase());
  store.users.unshift(u);
}

async function patchUser(id: string, fields: Partial<User>) {
  const row: Record<string, any> = {};
  if ('password' in fields) row.password = fields.password ?? null;
  if ('tempPassword' in fields) row.temp_password = fields.tempPassword ?? null;
  if ('mustChangePassword' in fields) row.must_change_password = Boolean(fields.mustChangePassword);
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const { error } = await supabase.from('users').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  }
  store.users = store.users.map(u => (u.id === id ? { ...u, ...fields } : u));
}

async function getSchool(id: string): Promise<School | undefined> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const { data } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
    if (data) return schoolFromDb(data);
  }
  return store.schools.find(s => s.id === id);
}

async function getClass(id: string): Promise<ClassGroup | undefined> {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) {
    const { data } = await supabase.from('classes').select('*').eq('id', id).maybeSingle();
    if (data) return classFromDb(data);
  }
  return store.classes.find(c => c.id === id);
}

async function syncCounts(schoolId?: string | null, classId?: string | null) {
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (!supabase || !schoolId) return;
  const cnt = async (role: string, col: 'school_id' | 'class_id', v: string) =>
    (await supabase.from('users').select('*', { count: 'exact', head: true }).eq(col, v).eq('role', role)).count;
  const [students, teachers] = await Promise.all([cnt('student', 'school_id', schoolId), cnt('teacher', 'school_id', schoolId)]);
  await supabase.from('schools').update({
    ...(students !== null ? { total_students: students } : {}),
    ...(teachers !== null ? { total_teachers: teachers } : {})
  }).eq('id', schoolId);
  if (classId) {
    const c = await cnt('student', 'class_id', classId);
    if (c !== null) await supabase.from('classes').update({ student_count: c }).eq('id', classId);
  }
}

/** Logs an email in the audit trail with any secret removed. */
async function logEmail(d: EmailDispatch, secretToHide?: string) {
  const safe: EmailDispatch = {
    ...d,
    tempPassword: undefined,
    messageBody: secretToHide ? d.messageBody.split(secretToHide).join('••••••••') : d.messageBody
  };
  store.emails.unshift(safe);
  const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
  if (supabase) await supabase.from('dispatched_emails').insert([emailToDb(safe)]);
  return safe;
}

const fail = (res: Response, err: any) =>
  err?.status === 409
    ? res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' })
    : (console.error('[users]', err), res.status(500).json({ error: 'Something went wrong. Please try again.' }));

// ---------------------------------------------------------------- list

router.get('/', async (req: AuthedRequest, res) => {
  try {
    const me = req.auth!;
    if (me.role === 'student') {
      const self = await findUser({ id: me.sub });
      return res.json(self ? [sanitizeUser(self)] : []);
    }
    const { schoolId, role, email } = req.query;
    const scope = me.role === 'super_admin' ? (schoolId as string | undefined) : (me.schoolId || '__none__');
    let rows: User[];
    const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
    if (supabase) {
      let q = supabase.from('users').select('*');
      if (scope) q = q.eq('school_id', scope);
      if (role) q = q.eq('role', String(role));
      if (email) q = q.eq('email', norm(email));
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      rows = (data || []).map(userFromDb);
    } else {
      rows = store.users.filter(u => (!scope || u.schoolId === scope) && (!role || u.role === role) && (!email || u.email.toLowerCase() === norm(email)));
    }
    return res.json(rows.map(sanitizeUser));
  } catch (err) { return fail(res, err); }
});

// ---------------------------------------------------------------- login

router.post('/login', async (req, res) => {
  try {
    const email = norm(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Please enter both your email address and password.' });
    if (rateLimited(`login:${clientIp(req)}:${email}`, 8, 15 * 60_000)) {
      return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });
    }

    const user = await findUser({ email });
    const generic = { error: 'Incorrect email or password.' };
    if (!user) { await hashPassword(password); return res.status(401).json(generic); }

    const usePermanent = Boolean(user.password);
    const stored = usePermanent ? user.password : user.tempPassword;
    if (!(await verifyPassword(password, stored))) return res.status(401).json(generic);

    // Upgrade legacy plaintext credentials to hashes on first successful sign-in.
    if (stored && !isHashed(stored)) {
      const h = await hashPassword(password);
      await patchUser(user.id, usePermanent ? { password: h } : { tempPassword: h }).catch(e => console.warn('[auth] rehash failed', e.message));
    }

    return res.json({ success: true, user: sanitizeUser(user), token: issueSession(user) });
  } catch (err) { return fail(res, err); }
});

// ---------------------------------------------------------------- registration

router.post('/admin', async (req: AuthedRequest, res) => {
  try {
    const { id, name, password, setupKey } = req.body || {};
    const email = norm(req.body?.email);
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
    if (!validNewPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const me = attachSession(req);
    if (me?.role !== 'super_admin') {
      if ((await countRole('super_admin')) > 0) return res.status(403).json({ error: 'A platform administrator already exists. Ask them to add you.' });
      const required = process.env.SUPER_ADMIN_SETUP_KEY;
      if (required) {
        if (!setupKey || !safeEquals(String(setupKey), required)) return res.status(403).json({ error: 'Invalid setup key.' });
      } else if (isProd()) {
        return res.status(403).json({ error: 'Platform setup is locked. Set SUPER_ADMIN_SETUP_KEY in your hosting environment first.' });
      }
    }

    const user: User = {
      id: id || `usr-super-${Date.now().toString(36)}`, schoolId: null, name: String(name).trim(), email,
      role: 'super_admin', avatarColor: 'bg-slate-900', mustChangePassword: false, password: await hashPassword(password)
    };
    await insertUser(user);
    return res.status(201).json({ user: sanitizeUser(user), token: issueSession(user) });
  } catch (err) { return fail(res, err); }
});

router.post('/student', async (req, res) => {
  try {
    const { id, name, schoolId, classId, admissionNumber, password } = req.body || {};
    const email = norm(req.body?.email);
    if (!name || !email || !schoolId || !classId) return res.status(400).json({ error: 'Please complete all required fields.' });
    if (!validNewPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const [school, cls] = await Promise.all([getSchool(schoolId), getClass(classId)]);
    if (!school || !cls || cls.schoolId !== schoolId) return res.status(400).json({ error: 'Selected school or class was not found.' });

    const user: User = {
      id: id || `usr-student-${Date.now().toString(36)}`, schoolId, name: String(name).trim(), email, role: 'student',
      admissionNumber: admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      classId, className: cls.name, teacherId: cls.teacherId, teacherName: cls.teacherName,
      avatarColor: 'bg-emerald-600', mustChangePassword: false, password: await hashPassword(password)
    };
    await insertUser(user);
    store.classes = store.classes.map(c => (c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c));
    store.schools = store.schools.map(s => (s.id === schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s));
    await syncCounts(schoolId, classId);
    return res.status(201).json({ user: sanitizeUser(user), token: issueSession(user) });
  } catch (err) { return fail(res, err); }
});

router.post('/teacher', async (req: AuthedRequest, res) => {
  try {
    const me = req.auth!;
    if (me.role !== 'school_admin' && me.role !== 'super_admin') return res.status(403).json({ error: 'You do not have permission to do that.' });
    const { id, name, schoolId, subjectSpecialization } = req.body || {};
    const email = norm(req.body?.email);
    if (!name || !email || !schoolId) return res.status(400).json({ error: 'Missing required teacher fields.' });
    if (me.role === 'school_admin' && me.schoolId !== schoolId) return res.status(403).json({ error: 'You can only add teachers to your own school.' });

    const school = await getSchool(schoolId);
    if (!school) return res.status(400).json({ error: 'School not found.' });

    const supplied = req.body?.tempPassword;
    const plain = validNewPassword(supplied) ? supplied : tempPw('Tchr');
    const teacher: User = {
      id: id || `usr-teacher-${Date.now().toString(36)}`, schoolId, name: String(name).trim(), email, role: 'teacher',
      subjectSpecialization: subjectSpecialization || 'Chemistry & Biology', mustChangePassword: true,
      tempPassword: await hashPassword(plain), avatarColor: 'bg-amber-600'
    };
    await insertUser(teacher);

    const dispatch: EmailDispatch = {
      id: `email-${Date.now().toString(36)}`, senderEmail: SENDER, recipientEmail: email, recipientName: name, recipientRole: 'teacher',
      subject: `STEM-SPARK-LAB Faculty Appointment: ${school.name}`, sentAt: new Date().toISOString(), schoolName: school.name,
      messageBody: `Dear ${name},\n\nYou have been registered as a Science Teacher (${teacher.subjectSpecialization}) at ${school.name}.\n\nSign in with your email and this temporary password: ${plain}\n\nYou will be asked to choose a new password the first time you sign in.`
    };
    const logged = await logEmail(dispatch, plain);
    store.schools = store.schools.map(s => (s.id === schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s));
    await syncCounts(schoolId);
    const mailResult = await sendEmail({ to: email, toName: name, subject: dispatch.subject, text: dispatch.messageBody, tempPassword: plain });
    return res.status(201).json({ teacher: sanitizeUser(teacher), emailDispatch: logged, mailResult: { success: mailResult.success, simulated: mailResult.simulated } });
  } catch (err) { return fail(res, err); }
});

// ---------------------------------------------------------------- delete

async function removeUser(req: AuthedRequest, res: Response, id: string) {
  try {
    const me = req.auth!;
    if (me.role !== 'school_admin' && me.role !== 'super_admin') return res.status(403).json({ error: 'You do not have permission to do that.' });
    if (id === me.sub) return res.status(400).json({ error: 'You cannot delete your own account.' });
    const target = await findUser({ id });
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (me.role === 'school_admin' && (target.schoolId !== me.schoolId || !['teacher', 'student'].includes(target.role))) {
      return res.status(403).json({ error: 'You can only remove teachers and students in your own school.' });
    }
    const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
    if (supabase) {
      await supabase.from('users').delete().eq('id', id);
      if (target.role === 'teacher') await supabase.from('classes').update({ teacher_id: null, teacher_name: 'Unassigned' }).eq('teacher_id', id);
    }
    store.users = store.users.filter(u => u.id !== id);
    store.classes = store.classes.map(c => (c.teacherId === id ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c));
    if (target.schoolId) {
      const field = target.role === 'teacher' ? 'totalTeachers' : target.role === 'student' ? 'totalStudents' : null;
      if (field) store.schools = store.schools.map(s => (s.id === target.schoolId ? { ...s, [field]: Math.max(0, (s as any)[field] - 1) } : s));
      await syncCounts(target.schoolId, target.classId);
    }
    return res.json({ success: true, deletedUserId: id, deletedTeacherId: id });
  } catch (err) { return fail(res, err); }
}
router.delete('/teacher/:id', (req: AuthedRequest, res) => removeUser(req, res, req.params.id));
router.delete('/:id', (req: AuthedRequest, res) => removeUser(req, res, req.params.id));

// ---------------------------------------------------------------- password change / reset

router.post('/change-password', async (req: AuthedRequest, res) => {
  try {
    const { newPassword, currentPassword, resetGrant } = req.body || {};
    if (!validNewPassword(newPassword)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    let user: User | undefined;
    const me = attachSession(req);
    if (me) {
      user = await findUser({ id: me.sub });
      if (!user) return res.status(401).json({ error: 'Please sign in again.' });
      if (!user.mustChangePassword) {
        if (rateLimited(`chgpw:${user.id}`, 6, 15 * 60_000)) return res.status(429).json({ error: 'Too many attempts. Please wait and try again.' });
        const ok = await verifyPassword(String(currentPassword || ''), user.password || user.tempPassword);
        if (!ok) return res.status(403).json({ error: 'Your current password is incorrect.' });
      }
    } else {
      const grant = readToken<{ email: string }>(resetGrant, 'reset');
      if (!grant) return res.status(401).json({ error: 'Your verification has expired. Please request a new code.' });
      user = await findUser({ email: grant.email });
      if (!user) return res.status(404).json({ error: 'Account not found.' });
    }

    await patchUser(user.id, { password: await hashPassword(newPassword), tempPassword: undefined, mustChangePassword: false });

    const notice = `Dear ${user.name},\n\nThe password for your STEM-SPARK-LAB account was just changed. If this wasn't you, reset it immediately and contact your school administrator.`;
    logEmail({
      id: `email-pwd-${Date.now().toString(36)}`, senderEmail: SENDER, recipientEmail: user.email, recipientName: user.name,
      recipientRole: user.role, subject: 'Security alert: your STEM-SPARK-LAB password was changed', messageBody: notice, sentAt: new Date().toISOString()
    }).catch(() => {});
    sendEmail({ to: user.email, toName: user.name, subject: 'Security alert: your STEM-SPARK-LAB password was changed', text: notice }).catch(e => console.warn('[mailer]', e?.message));

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { return fail(res, err); }
});

router.post('/request-reset-otp', async (req, res) => {
  try {
    const email = norm(req.body?.email);
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    if (rateLimited(`otpreq:${clientIp(req)}`, 10, 15 * 60_000) || rateLimited(`otpreq:${email}`, 4, 15 * 60_000)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a few minutes and try again.' });
    }

    const otp = randomOtp();
    // Same response whether or not the account exists, so this endpoint can't be used to discover who is registered.
    const challenge = signToken({ email, h: otpDigest(email, otp) }, 'otp', 600);
    const user = await findUser({ email });
    if (user) {
      const subject = 'Your STEM-SPARK-LAB verification code';
      const body = `Dear ${user.name},\n\nYour one-time verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`;
      await logEmail({ id: `email-otp-${Date.now().toString(36)}`, senderEmail: SENDER, recipientEmail: user.email, recipientName: user.name, recipientRole: user.role, subject, messageBody: body, sentAt: new Date().toISOString() }, otp);
      const mail = await sendEmail({ to: user.email, toName: user.name, subject, text: body, tempPassword: otp });
      if (!mail.success) console.error('[mailer] OTP email failed:', mail.error);
    }
    return res.json({ success: true, challenge, message: 'If that email is registered, a 6-digit code has been sent to it.' });
  } catch (err) { return fail(res, err); }
});

router.post('/verify-reset-otp', (req, res) => {
  const email = norm(req.body?.email);
  const otp = String(req.body?.otp || '').trim();
  if (!email || !otp) return res.status(400).json({ error: 'Email and code are required.' });
  if (rateLimited(`otpver:${email}`, 6, 10 * 60_000)) return res.status(429).json({ error: 'Too many wrong attempts. Please request a new code.' });

  const c = readToken<{ email: string; h: string }>(req.body?.challenge, 'otp');
  if (!c || c.email !== email) return res.status(400).json({ error: 'This code has expired. Please request a new one.' });
  if (!safeEquals(c.h, otpDigest(email, otp))) return res.status(400).json({ error: 'That code is incorrect. Please check your email and try again.' });
  return res.json({ success: true, resetGrant: signToken({ email }, 'reset', 600) });
});

export default router;
