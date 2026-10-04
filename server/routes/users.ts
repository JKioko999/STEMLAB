import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { User, EmailDispatch } from '../../src/types/index.js';

const router = Router();

// GET /api/users - List users (supports ?schoolId= & ?role=)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, role } = req.query;
    let results = [...store.users];

    if (schoolId) {
      results = results.filter(u => u.schoolId === schoolId);
    }
    if (role) {
      results = results.filter(u => u.role === role);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('users').select('*');
        if (schoolId) query = query.eq('school_id', schoolId);
        if (role) query = query.eq('role', role);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return res.json(data);
        }
      }
    }

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/student - Register a candidate student
router.post('/student', async (req: Request, res: Response) => {
  try {
    const { name, email, schoolId, classId, admissionNumber } = req.body;
    if (!name || !email || !schoolId || !classId) {
      return res.status(400).json({ error: 'Missing required student registration fields' });
    }

    const studentId = `usr-student-${Date.now().toString(36)}`;
    const targetClass = store.classes.find(c => c.id === classId);

    const newStudentUser: User = {
      id: studentId,
      schoolId: schoolId,
      name: name,
      email: email,
      role: 'student',
      admissionNumber: admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      classId: classId,
      className: targetClass?.name || 'Form 3 East',
      teacherId: targetClass?.teacherId,
      teacherName: targetClass?.teacherName,
      avatarColor: 'bg-emerald-600'
    };

    store.users.unshift(newStudentUser);

    // Update class and school counts
    store.classes = store.classes.map(c => c.id === classId ? { ...c, studentCount: c.studentCount + 1 } : c);
    store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalStudents: s.totalStudents + 1 } : s);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').insert([{
          id: newStudentUser.id,
          school_id: newStudentUser.schoolId,
          name: newStudentUser.name,
          email: newStudentUser.email,
          role: 'student',
          admission_number: newStudentUser.admissionNumber,
          class_id: newStudentUser.classId,
          class_name: newStudentUser.className,
          teacher_id: newStudentUser.teacherId,
          teacher_name: newStudentUser.teacherName,
          avatar_color: newStudentUser.avatarColor
        }]);
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
    const { name, email, schoolId, subjectSpecialization } = req.body;
    if (!name || !email || !schoolId) {
      return res.status(400).json({ error: 'Missing required teacher fields' });
    }

    const teacherId = `usr-teacher-${Date.now().toString(36)}`;
    const tempPassword = `Tchr${Math.floor(1000 + Math.random() * 9000)}!`;
    const targetSchool = store.schools.find(s => s.id === schoolId);

    const newTeacher: User = {
      id: teacherId,
      schoolId: schoolId,
      name: name,
      email: email,
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
      messageBody: `Dear Teacher ${name},\n\nYou have been registered as a Science Teacher at ${targetSchool?.name || 'your institution'} on STEM-SPARK-LAB.`
    };

    store.users.unshift(newTeacher);
    store.emails.unshift(emailDispatch);
    store.schools = store.schools.map(s => s.id === schoolId ? { ...s, totalTeachers: s.totalTeachers + 1 } : s);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').insert([{
          id: newTeacher.id,
          school_id: newTeacher.schoolId,
          name: newTeacher.name,
          email: newTeacher.email,
          role: 'teacher',
          subject_specialization: newTeacher.subjectSpecialization,
          must_change_password: true,
          temp_password: tempPassword,
          avatar_color: newTeacher.avatarColor
        }]);
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
    if (teacher && teacher.schoolId) {
      store.schools = store.schools.map(s => s.id === teacher.schoolId ? { ...s, totalTeachers: Math.max(0, s.totalTeachers - 1) } : s);
    }
    store.users = store.users.filter(u => u.id !== id);
    store.classes = store.classes.map(c => c.teacherId === id ? { ...c, teacherId: '', teacherName: 'Unassigned' } : c);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').delete().eq('id', id);
      }
    }

    return res.json({ success: true, deletedTeacherId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/users/change-password - Change private password
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'Missing userId or newPassword' });
    }

    store.users = store.users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          mustChangePassword: false,
          tempPassword: undefined
        };
      }
      return u;
    });

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('users').update({
          must_change_password: false,
          temp_password: null
        }).eq('id', userId);
      }
    }

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
