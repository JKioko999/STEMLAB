import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  userFromDb, 
  userToDb, 
  classFromDb,
  schoolFromDb,
  emailToDb 
} from '../db/supabase.js';
import { User, EmailDispatch, ClassGroup, School } from '../../src/types/index.js';
import { sendEmail } from '../services/mailer.js';

const router = Router();

// GET /api/users - List users (supports ?schoolId= & ?role= & ?email=)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, role, email } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('users').select('*');
        if (schoolId) query = query.eq('school_id', schoolId);
        if (role) query = query.eq('role', role);
        if (email) query = query.ilike('email', String(email).trim());
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(userFromDb));
        }
      }
    }

    let results = [...store.users];
    if (schoolId) {
      results = results.filter(u => u.schoolId === schoolId);
    }
    if (role) {
      results = results.filter(u => u.role === role);
    }
    if (email) {
      results = results.filter(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/admin - Register or update a Platform Super Administrator
router.post('/admin', async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required admin name or email' });
    }

    const adminId = id || `usr-super-${Date.now().toString(36)}`;
    const newAdmin: User = {
      id: adminId,
      schoolId: null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'super_admin',
      avatarColor: 'bg-slate-900',
      mustChangePassword: false,
      tempPassword: password || undefined
    };

    // Remove any existing user with same email in memory store
    store.users = store.users.filter(u => u.email.toLowerCase() !== newAdmin.email);
    store.users.unshift(newAdmin);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Upsert by email so duplicate email registers/updates existing platform owner cleanly
        const { error: upsertErr } = await supabase
          .from('users')
          .upsert(userToDb(newAdmin), { onConflict: 'email' });
        if (upsertErr) {
          console.error('[SUPABASE] Admin upsert error:', upsertErr);
        }
      }
    }

    return res.status(201).json(newAdmin);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/student - Register a candidate student
router.post('/student', async (req: Request, res: Response) => {
  try {
    const { id, name, email, schoolId, classId, admissionNumber } = req.body;
    if (!name || !email || !schoolId || !classId) {
      return res.status(400).json({ error: 'Missing required student registration fields' });
    }

    const studentId = id || `usr-student-${Date.now().toString(36)}`;
    let targetClass: ClassGroup | undefined = store.classes.find(c => c.id === classId);

    if (!targetClass && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: clsData } = await supabase.from('classes').select('*').eq('id', classId).maybeSingle();
        if (clsData) targetClass = classFromDb(clsData);
      }
    }

    const newStudentUser: User = {
      id: studentId,
      schoolId: schoolId,
      name: name,
      email: email.trim().toLowerCase(),
      role: 'student',
      admissionNumber: admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      classId: classId,
      className: targetClass?.name || 'Class Stream',
      teacherId: targetClass?.teacherId,
      teacherName: targetClass?.teacherName,
      avatarColor: 'bg-emerald-600'
    };

    store.users.unshift(newStudentUser);

    // Update class and school counts in local store
    store.classes = store.classes.map(c => c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c);
    store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s);

    // Update in Supabase
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: insErr } = await supabase
          .from('users')
          .upsert(userToDb(newStudentUser), { onConflict: 'email' });
        if (insErr) {
          console.error('[SUPABASE] Student registration error:', insErr);
        }
        // Sync actual student count in class
        const { count: clsCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('class_id', classId).eq('role', 'student');
        if (clsCount !== null) {
          await supabase.from('classes').update({ student_count: clsCount }).eq('id', classId);
        }
        // Sync actual student count in school
        const { count: schCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student');
        if (schCount !== null) {
          await supabase.from('schools').update({ total_students: schCount }).eq('id', schoolId);
        }
      }
    }

    return res.status(201).json(newStudentUser);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/teacher - Register / Appoint a Science Teacher
router.post('/teacher', async (req: Request, res: Response) => {
  try {
    const { id, name, email, schoolId, subjectSpecialization, tempPassword: passedTempPassword } = req.body;
    if (!name || !email || !schoolId) {
      return res.status(400).json({ error: 'Missing required teacher fields' });
    }

    const teacherId = id || `usr-teacher-${Date.now().toString(36)}`;
    const tempPassword = passedTempPassword || `Tchr${Math.floor(1000 + Math.random() * 9000)}!`;
    let targetSchool: School | undefined = store.schools.find(s => s.id === schoolId);

    if (!targetSchool && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: schData } = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
        if (schData) targetSchool = schoolFromDb(schData);
      }
    }

    const newTeacher: User = {
      id: teacherId,
      schoolId: schoolId,
      name: name,
      email: email.trim().toLowerCase(),
      role: 'teacher',
      subjectSpecialization: subjectSpecialization || 'Chemistry & Biology',
      mustChangePassword: true,
      tempPassword: tempPassword,
      avatarColor: 'bg-amber-600'
    };

    const emailDispatch: EmailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      senderEmail: 'intellicaautomationgroup@gmail.com',
      recipientEmail: email,
      recipientName: name,
      recipientRole: 'teacher',
      subject: `STEM-SPARK-LAB Faculty Appointment: ${targetSchool?.name || 'Secondary School'}`,
      tempPassword: tempPassword,
      sentAt: new Date().toISOString(),
      schoolName: targetSchool?.name,
      messageBody: `Dear Teacher ${name},\n\nYou have been registered as a Science Teacher (${newTeacher.subjectSpecialization}) at ${targetSchool?.name || 'your institution'} on STEM-SPARK-LAB by Intellica Automation Group.\n\nYour temporary password: ${tempPassword}\nPlease update your password on initial sign in.\n\nFrom: Intellica Automation Group <intellicaautomationgroup@gmail.com>\nSupport: intellicaautomationgroup@gmail.com`
    };

    store.users = store.users.filter(u => u.email.toLowerCase() !== newTeacher.email);
    store.users.unshift(newTeacher);
    store.emails.unshift(emailDispatch);
    store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error: tchrErr } = await supabase
          .from('users')
          .upsert(userToDb(newTeacher), { onConflict: 'email' });
        if (tchrErr) {
          console.error('[SUPABASE] Teacher registration error:', tchrErr);
        }
        await supabase.from('dispatched_emails').insert([emailToDb(emailDispatch)]);
        // Sync actual teacher count
        const { count: tchrCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher');
        if (tchrCount !== null) {
          await supabase.from('schools').update({ total_teachers: tchrCount }).eq('id', schoolId);
        }
      }
    }

    // Transmit email directly from intellicaautomationgroup@gmail.com
    const mailResult = await sendEmail({
      to: email,
      toName: name,
      subject: emailDispatch.subject,
      text: emailDispatch.messageBody,
      tempPassword: tempPassword
    });
    console.info(`[MAILER] Teacher registration email dispatched to ${email}:`, mailResult);

    return res.status(201).json({ teacher: newTeacher, emailDispatch, mailResult });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/teacher/:id - Remove science teacher
router.delete('/teacher/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const teacher = store.users.find(u => u.id === id);
    const schoolId = teacher?.schoolId;

    if (schoolId) {
      store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s);
    }
    store.users = store.users.filter(u => u.id !== id);
    store.classes = store.classes.map(c => c.teacherId === id ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').delete().eq('id', id);
        await supabase.from('classes').update({ teacher_id: null, teacher_name: 'Unassigned' }).eq('teacher_id', id);
        if (schoolId) {
          const { count: tchrCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher');
          if (tchrCount !== null) {
            await supabase.from('schools').update({ total_teachers: tchrCount }).eq('id', schoolId);
          }
        }
      }
    }

    return res.json({ success: true, deletedTeacherId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id - Remove any user
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = store.users.find(u => u.id === id);
    const schoolId = user?.schoolId;

    if (user?.role === 'teacher' && schoolId) {
      store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s);
      store.classes = store.classes.map(c => c.teacherId === id ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c);
    } else if (user?.role === 'student' && schoolId) {
      store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalStudents: Math.max(0, s.totalStudents - 1) } : s);
    }

    store.users = store.users.filter(u => u.id !== id);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').delete().eq('id', id);
        if (user?.role === 'teacher') {
          await supabase.from('classes').update({ teacher_id: null, teacher_name: 'Unassigned' }).eq('teacher_id', id);
          if (schoolId) {
            const { count: tchrCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher');
            if (tchrCount !== null) {
              await supabase.from('schools').update({ total_teachers: tchrCount }).eq('id', schoolId);
            }
          }
        } else if (user?.role === 'student' && schoolId) {
          const { count: stdCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'student');
          if (stdCount !== null) {
            await supabase.from('schools').update({ total_students: stdCount }).eq('id', schoolId);
          }
        }
      }
    }

    return res.json({ success: true, deletedUserId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/change-password - Change private password
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { userId, email, newPassword } = req.body;
    if ((!userId && !email) || !newPassword) {
      return res.status(400).json({ error: 'Missing userId/email or newPassword' });
    }

    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;

    store.users = store.users.map(u => {
      const match = (userId && u.id === userId) || (normalizedEmail && u.email.toLowerCase() === normalizedEmail);
      if (match) {
        return {
          ...u,
          mustChangePassword: false,
          tempPassword: undefined,
          password: newPassword
        };
      }
      return u;
    });

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let q = supabase.from('users').update({
          must_change_password: false,
          temp_password: null
        });
        if (userId) {
          await q.eq('id', userId);
        } else if (normalizedEmail) {
          await q.eq('email', normalizedEmail);
        }
      }
    }

    // Notify user of password change via email from intellicaautomationgroup@gmail.com
    const changedUser = store.users.find(u => (userId && u.id === userId) || (normalizedEmail && u.email.toLowerCase() === normalizedEmail));
    if (changedUser) {
      const securityDispatch: EmailDispatch = {
        id: `email-pwd-${Date.now().toString(36)}`,
        senderEmail: 'intellicaautomationgroup@gmail.com',
        recipientEmail: changedUser.email,
        recipientName: changedUser.name,
        recipientRole: changedUser.role,
        subject: 'Security Alert: Password Updated - STEM-SPARK-LAB',
        messageBody: `Dear ${changedUser.name},\n\nYour password for STEM-SPARK-LAB Kenya was successfully updated.\n\nIf you made this change, no further action is required.\nIf you did not authorize this change, please contact Intellica Automation Group immediately at intellicaautomationgroup@gmail.com.\n\nFrom: Intellica Automation Group <intellicaautomationgroup@gmail.com>\nRegards,\nIntellica Automation Group Security Directorate`,
        sentAt: new Date().toISOString()
      };
      store.emails.unshift(securityDispatch);
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from('dispatched_emails').insert([emailToDb(securityDispatch)]);
          } catch (e) {}
        }
      }

      sendEmail({
        to: changedUser.email,
        toName: changedUser.name,
        subject: securityDispatch.subject,
        text: securityDispatch.messageBody
      }).catch(err => console.warn('[MAILER] Password change notice error:', err));
    }

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/request-reset-otp - Send OTP from intellicaautomationgroup@gmail.com
router.post('/request-reset-otp', async (req: Request, res: Response) => {
  try {
    const { email, name, role, schoolId, user } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let targetUser: User | undefined = store.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!targetUser && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.from('users').select('*').eq('email', normalizedEmail).maybeSingle();
        if (data) {
          targetUser = userFromDb(data);
          store.users.unshift(targetUser);
        }
      }
    }

    // If target user exists on the client (e.g. registered in local session) but server restarted, restore into store
    if (!targetUser && (name || user)) {
      const restoredUser: User = {
        id: (user && user.id) || `usr-${Date.now().toString(36)}`,
        name: name || (user && user.name) || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: (role || (user && user.role) || 'student') as any,
        schoolId: schoolId || (user && user.schoolId) || null
      };
      targetUser = restoredUser;
      store.users.unshift(restoredUser);
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase.from('users').upsert(userToDb(restoredUser), { onConflict: 'email' });
          } catch (e) {}
        }
      }
    }

    if (!targetUser) {
      return res.status(404).json({
        error: `No registered account found with email "${email}". Password reset is only available for registered school administrators, teachers, and students.`
      });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    store.resetOtpSessions.set(normalizedEmail, { otp, expiresAt, user: targetUser });

    const subject = `Password Reset Verification Code: ${otp} - Intellica Automation Group`;
    const messageBody = `Dear ${targetUser.name},\n\nYou requested a password reset for your STEM-SPARK-LAB Kenya registered account (${targetUser.email}).\n\nYour One-Time Password (OTP) verification code is:\n\n${otp}\n\n• Validity: 10 minutes\n• Enter this 6-digit OTP code on the verification screen to verify your identity and set a new password.\n• If you did not request this verification code, please ignore this email or contact support at intellicaautomationgroup@gmail.com.\n\nFrom: Intellica Automation Group <intellicaautomationgroup@gmail.com>\nRegards,\nIntellica Automation Group Security Team\nSTEM-SPARK-LAB Kenya Directorate`;

    const emailDispatch: EmailDispatch = {
      id: `email-otp-${Date.now().toString(36)}`,
      senderEmail: 'intellicaautomationgroup@gmail.com',
      recipientEmail: targetUser.email,
      recipientName: targetUser.name,
      recipientRole: targetUser.role,
      subject,
      tempPassword: otp,
      messageBody,
      sentAt: new Date().toISOString()
    };

    store.emails.unshift(emailDispatch);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('dispatched_emails').insert([emailToDb(emailDispatch)]);
      }
    }

    // Deliver via real Gmail SMTP / mailer from intellicaautomationgroup@gmail.com
    const mailResult = await sendEmail({
      to: targetUser.email,
      toName: targetUser.name,
      subject,
      text: messageBody,
      tempPassword: otp
    });

    if (!mailResult.success) {
      return res.status(400).json({
        error: mailResult.error || 'Failed to dispatch email via Gmail SMTP.',
        targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }
      });
    }

    return res.json({
      success: true,
      message: mailResult.simulated
        ? `Verification code dispatched from intellicaautomationgroup@gmail.com.`
        : `Verification code sent to ${targetUser.email} from intellicaautomationgroup@gmail.com.`,
      simulated: mailResult.simulated,
      targetUser: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/verify-reset-otp - Verify OTP code
router.post('/verify-reset-otp', (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP code are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const session = store.resetOtpSessions.get(normalizedEmail);
    if (!session) {
      return res.status(400).json({ error: 'No active OTP verification session found for this email. Please request a new code.' });
    }

    if (Date.now() > session.expiresAt) {
      store.resetOtpSessions.delete(normalizedEmail);
      return res.status(400).json({ error: 'The verification code has expired (10-minute limit). Please request a new code.' });
    }

    const isValid = session.otp === cleanOtp;
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code. Please check the 6-digit OTP code sent to your email.' });
    }

    return res.json({ success: true, message: 'Identity verified successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
