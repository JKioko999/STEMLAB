import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  classFromDb, 
  classToDb 
} from '../db/supabase.js';
import { ClassGroup } from '../../src/types/index.js';

const router = Router();

// GET /api/classes - List class streams
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('classes').select('*').order('form_year', { ascending: true });
        if (schoolId) query = query.eq('school_id', schoolId);
        if (teacherId) query = query.eq('teacher_id', teacherId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(classFromDb));
        }
      }
    }

    let results = [...store.classes];
    if (schoolId) {
      results = results.filter(c => c.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter(c => c.teacherId === teacherId);
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

    const studentCount = classData.studentCount !== undefined ? Number(classData.studentCount) : 0;
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
        await supabase.from('classes').insert([classToDb(newClass)]);
        if (studentCount > 0) {
          const { count } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', classData.schoolId).eq('role', 'student');
          if (count !== null) {
            await supabase.from('schools').update({ total_students: count }).eq('id', classData.schoolId);
          }
        }
      }
    }

    return res.status(201).json(newClass);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
