import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  schoolFromDb, 
  schoolToDb, 
  userFromDb, 
  userToDb, 
  classFromDb, 
  emailToDb 
} from '../db/supabase.js';
import { School, User, EmailDispatch } from '../../src/types/index.js';
import { sendEmail } from '../services/mailer.js';
import crypto from 'crypto';
import { AuthedRequest, attachSession, hashPassword, validNewPassword, issueSession, sanitizeUser } from '../auth.js';

const router = Router();

// GET /api/schools - List all secondary schools
router.get('/', async (req: AuthedRequest, res: Response) => {
  try {
    const me = attachSession(req);
    const reply = (list: School[]) => {
      if (!me) return res.json(list.map(({ id, name, county, subCounty, category }) => ({ id, name, county, subCounty, category })));
      if (me.role !== 'super_admin') return res.json(list.filter(s => s.id === me.schoolId));
      return res.json(list);
    };
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return reply(data.map(schoolFromDb));
        }
      }
    }
    return reply(store.schools);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch schools' });
  }
});

// GET /api/schools/:id - Detailed school profile with teachers and classes
router.get('/:id', async (req: AuthedRequest, res: Response) => {
  const { id } = req.params;
  if (req.auth!.role !== 'super_admin' && req.auth!.schoolId !== id) return res.status(403).json({ error: 'You do not have permission to do that.' });
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: sch, error } = await supabase.from('schools').select('*').eq('id', id).maybeSingle();
        if (!error && sch) {
          const { data: teachers } = await supabase.from('users').select('*').eq('school_id', id).eq('role', 'teacher');
          const { data: classes } = await supabase.from('classes').select('*').eq('school_id', id);
          const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', id).eq('role', 'student');
          return res.json({
            school: schoolFromDb(sch),
            teachers: (teachers || []).map(userFromDb).map(sanitizeUser),
            classes: (classes || []).map(classFromDb),
            studentCount: studentCount || 0
          });
        }
      }
    }

    const school = store.schools.find(s => s.id === id);
    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    const schoolTeachers = store.users.filter(u => u.schoolId === id && u.role === 'teacher');
    const schoolClasses = store.classes.filter(c => c.schoolId === id);
    const schoolStudents = store.users.filter(u => u.schoolId === id && u.role === 'student');

    return res.json({
      school,
      teachers: schoolTeachers.map(sanitizeUser),
      classes: schoolClasses,
      studentCount: schoolStudents.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/schools - Register a new secondary school
router.post('/', async (req: AuthedRequest, res: Response) => {
  try {
    const me = attachSession(req);
    const { schoolData, adminPassword, schoolId: passedSchoolId, adminUserId: passedAdminUserId } = req.body || {};
    if (!schoolData || !schoolData.name || !schoolData.adminEmail) {
      return res.status(400).json({ error: 'Missing required school name or admin email' });
    }
    if (me && me.role !== 'super_admin') return res.status(403).json({ error: 'You do not have permission to do that.' });

    const adminEmail = String(schoolData.adminEmail).trim().toLowerCase();
    const plain: string = validNewPassword(adminPassword) ? adminPassword : `Stem-${crypto.randomBytes(5).toString('base64url')}`;
    const schoolId = passedSchoolId || `sch-${Date.now().toString(36)}`;
    const adminUserId = passedAdminUserId || `usr-admin-${Date.now().toString(36)}`;

    const newSchool: School = {
      ...schoolData, id: schoolId, adminEmail, totalStudents: 0, totalTeachers: 0,
      createdAt: new Date().toISOString().split('T')[0], status: 'active'
    };
    const adminUser: User = {
      id: adminUserId, schoolId, name: schoolData.adminName, email: adminEmail, role: 'school_admin',
      mustChangePassword: true, tempPassword: await hashPassword(plain), avatarColor: 'bg-blue-600'
    };
    // Self-registering principals chose their own password, so it is permanent; super-admin-created ones must change theirs.
    if (!me) { adminUser.password = adminUser.tempPassword; adminUser.tempPassword = undefined; adminUser.mustChangePassword = false; }

    const supabase = isSupabaseConfigured() ? getSupabaseClient() : null;
    if (supabase) {
      const { data: dup } = await supabase.from('users').select('id').eq('email', adminEmail).maybeSingle();
      if (dup) return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
      const s1 = await supabase.from('schools').insert(schoolToDb(newSchool));
      if (s1.error) throw new Error(s1.error.message);
      const s2 = await supabase.from('users').insert(userToDb(adminUser));
      if (s2.error) { await supabase.from('schools').delete().eq('id', schoolId); throw new Error(s2.error.message); }
    } else if (store.users.some(u => u.email.toLowerCase() === adminEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }
    store.schools.unshift(newSchool);
    store.users.unshift(adminUser);

    const body = `Dear ${schoolData.adminName},\n\n${schoolData.name} has been enrolled in the STEM-SPARK-LAB KCSE Virtual Science Laboratory.\n\nSign in with ${adminEmail} and this password: ${plain}${me ? '\n\nYou will be asked to choose a new password the first time you sign in.' : ''}`;
    const dispatch: EmailDispatch = {
      id: `email-${Date.now().toString(36)}`, senderEmail: 'intellicaautomationgroup@gmail.com', recipientEmail: adminEmail,
      recipientName: schoolData.adminName, recipientRole: 'school_admin', subject: `STEM-SPARK-LAB Portal Credentials: ${schoolData.name}`,
      sentAt: new Date().toISOString(), schoolName: schoolData.name, messageBody: body.split(plain).join('••••••••')
    };
    store.emails.unshift(dispatch);
    if (supabase) await supabase.from('dispatched_emails').insert([emailToDb(dispatch)]);

    const mailResult = await sendEmail({ to: adminEmail, toName: schoolData.adminName, subject: dispatch.subject, text: body, tempPassword: plain });
    return res.status(201).json({
      school: newSchool, adminUser: sanitizeUser(adminUser),
      // A platform admin creating a school sees the initial password once, here; it is never stored in readable form.
      emailDispatch: me ? { ...dispatch, messageBody: body, tempPassword: plain } : dispatch,
      mailResult: { success: mailResult.success, simulated: mailResult.simulated },
      token: me ? undefined : issueSession(adminUser)
    });
  } catch (err: any) {
    console.error('[schools] create failed:', err);
    return res.status(500).json({ error: 'Failed to create school. Please try again.' });
  }
});

// DELETE /api/schools/:id - Permanently delete a school and cascade purge records
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    store.schools = store.schools.filter(s => s.id !== id);
    store.users = store.users.filter(u => u.schoolId !== id);
    store.classes = store.classes.filter(c => c.schoolId !== id);
    store.assignments = store.assignments.filter(a => a.schoolId !== id);
    store.experiments = store.experiments.filter(e => e.schoolId !== id);
    store.attempts = store.attempts.filter(a => a.schoolId !== id);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('schools').delete().eq('id', id);
      }
    }

    return res.json({ success: true, deletedSchoolId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
