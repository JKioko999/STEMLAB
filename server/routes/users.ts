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

const router = Router();

// GET /api/users - List users (supports ?schoolId= & ?role=)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, role, email } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('users').select('*');
        if (schoolId) query = query.eq('school_id', schoolId);
        if (role) query = query.eq('role', role);
        if (email) query = query.eq('email', email);
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
      results = results.filter(u => u.email.toLowerCase() === String(email).toLowerCase());
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/admin - Register a Platform Super Administrator
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

    store.users.unshift(newAdmin);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').insert([userToDb(newAdmin)]);
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
        await supabase.from('users').insert([userToDb(newStudentUser)]);
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
      recipientEmail: email,
      recipientName: name,
      recipientRole: 'teacher',
      subject: `STEM-SPARK-LAB Faculty Appointment: ${targetSchool?.name || 'Secondary School'}`,
      tempPassword: tempPassword,
      sentAt: new Date().toISOString(),
      schoolName: targetSchool?.name,
      messageBody: `Dear Teacher ${name},\n\nYou have been registered as a Science Teacher (${newTeacher.subjectSpecialization}) at ${targetSchool?.name || 'your institution'} on STEM-SPARK-LAB.\n\nYour temporary password: ${tempPassword}\nPlease update your password on initial sign in.`
    };

    store.users.unshift(newTeacher);
    store.emails.unshift(emailDispatch);
    store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').insert([userToDb(newTeacher)]);
        await supabase.from('dispatched_emails').insert([emailToDb(emailDispatch)]);
        // Sync actual teacher count
        const { count: tchrCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher');
        if (tchrCount !== null) {
          await supabase.from('schools').update({ total_teachers: tchrCount }).eq('id', schoolId);
        }
      }
    }

    return res.status(201).json({ teacher: newTeacher, emailDispatch });
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

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
