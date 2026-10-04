import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { ClassGroup } from '../../src/types/index.js';

const router = Router();

// GET /api/classes - List class streams
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId } = req.query;
    let results = [...store.classes];

    if (schoolId) {
      results = results.filter(c => c.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter(c => c.teacherId === teacherId);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('classes').select('*');
        if (schoolId) query = query.eq('school_id', schoolId);
        if (teacherId) query = query.eq('teacher_id', teacherId);
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

// POST /api/classes - Add a Form Stream
router.post('/', async (req: Request, res: Response) => {
  try {
    const classData = req.body;
    if (!classData.name || !classData.schoolId) {
      return res.status(400).json({ error: 'Missing class name or schoolId' });
    }

    const studentCount = classData.studentCount !== undefined ? Number(classData.studentCount) : 40;
    const newClass: ClassGroup = {
      ...classData,
      id: `cls-${Date.now().toString(36)}`,
      studentCount: studentCount
    };

    store.classes.unshift(newClass);
    store.schools = store.schools.map(s => s.id === classData.schoolId ? { ...s, totalStudents: s.totalStudents + studentCount } : s);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('classes').insert([{
          id: newClass.id,
          school_id: newClass.schoolId,
          name: newClass.name,
          form_year: newClass.formYear,
          teacher_id: newClass.teacherId,
          teacher_name: newClass.teacherName,
          subject: newClass.subject,
          student_count: newClass.studentCount
        }]);
      }
    }

    return res.status(201).json(newClass);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
