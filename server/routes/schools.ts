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

const router = Router();

// GET /api/schools - List all secondary schools
router.get('/', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return res.json(data.map(schoolFromDb));
        }
      }
    }
    return res.json(store.schools);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch schools' });
  }
});

// GET /api/schools/:id - Detailed school profile with teachers and classes
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
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
            teachers: (teachers || []).map(userFromDb),
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
      teachers: schoolTeachers,
      classes: schoolClasses,
      studentCount: schoolStudents.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/schools - Register a new secondary school
router.post('/', async (req: Request, res: Response) => {
  try {
    const { schoolData, adminPassword, schoolId: passedSchoolId, adminUserId: passedAdminUserId } = req.body;
    if (!schoolData || !schoolData.name || !schoolData.adminEmail) {
      return res.status(400).json({ error: 'Missing required school name or admin email' });
    }

    const schoolId = schoolData.id || passedSchoolId || `sch-${Date.now().toString(36)}`;
    const adminUserId = passedAdminUserId || `usr-admin-${Date.now().toString(36)}`;
    const tempPassword = adminPassword || `Kcse${Math.floor(1000 + Math.random() * 9000)}!`;

    const newSchool: School = {
      ...schoolData,
      id: schoolId,
      totalStudents: 0,
      totalTeachers: 0,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    const adminUser: User = {
      id: adminUserId,
      schoolId: schoolId,
      name: schoolData.adminName,
      email: schoolData.adminEmail,
      role: 'school_admin',
      mustChangePassword: true,
      tempPassword: tempPassword,
      avatarColor: 'bg-blue-600'
    };

    const emailDispatch: EmailDispatch = {
      id: `email-${Date.now().toString(36)}`,
      recipientEmail: schoolData.adminEmail,
      recipientName: schoolData.adminName,
      recipientRole: 'school_admin',
      subject: `STEM-SPARK-LAB Portal Credentials: ${schoolData.name}`,
      tempPassword: tempPassword,
      sentAt: new Date().toISOString(),
      schoolName: schoolData.name,
      messageBody: `Dear Principal ${schoolData.adminName},\n\nYour school ${schoolData.name} has been enrolled into the STEM-SPARK-LAB KCSE Virtual Science Laboratory platform.`
    };

    // Save to local store
    store.schools.unshift(newSchool);
    store.users.unshift(adminUser);
    store.emails.unshift(emailDispatch);

    // Save to live Supabase database if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('schools').insert([schoolToDb(newSchool)]);
        await supabase.from('users').insert([userToDb(adminUser)]);
        await supabase.from('dispatched_emails').insert([emailToDb(emailDispatch)]);
      }
    }

    return res.status(201).json({ school: newSchool, adminUser, emailDispatch });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create school' });
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
