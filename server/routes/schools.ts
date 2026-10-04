import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { School, User, EmailDispatch } from '../../src/types/index.js';

const router = Router();

// GET /api/schools - List all secondary schools
router.get('/', async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.json(data);
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
    const { schoolData, adminPassword } = req.body;
    if (!schoolData || !schoolData.name || !schoolData.adminEmail) {
      return res.status(400).json({ error: 'Missing required school name or admin email' });
    }

    const schoolId = `sch-${Date.now().toString(36)}`;
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
      id: `usr-admin-${Date.now().toString(36)}`,
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

    // Optional Supabase insertion
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('schools').insert([{
          id: newSchool.id,
          name: newSchool.name,
          registration_number: newSchool.registrationNumber,
          county: newSchool.county,
          sub_county: newSchool.subCounty,
          category: newSchool.category,
          subscription_plan: newSchool.subscriptionPlan,
          admin_name: newSchool.adminName,
          admin_email: newSchool.adminEmail,
          phone: newSchool.phone,
          status: 'active'
        }]);
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
