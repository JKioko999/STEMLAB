import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  assignmentFromDb, 
  assignmentToDb 
} from '../db/supabase.js';
import { Assignment } from '../../src/types/index.js';

const router = Router();

// GET /api/assignments - List assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId, classId } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('assignments').select('*').order('assigned_at', { ascending: false });
        if (schoolId) query = query.eq('school_id', schoolId);
        if (teacherId) query = query.eq('teacher_id', teacherId);
        if (classId) query = query.eq('class_id', classId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(assignmentFromDb));
        }
      }
    }

    let results = [...store.assignments];
    if (schoolId) results = results.filter(a => a.schoolId === schoolId);
    if (teacherId) results = results.filter(a => a.teacherId === teacherId);
    if (classId) results = results.filter(a => a.classId === classId);

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments - Create a practical assignment
router.post('/', async (req: Request, res: Response) => {
  try {
    const assignmentData = req.body;
    if (!assignmentData.experimentId || !assignmentData.classId || !assignmentData.schoolId) {
      return res.status(400).json({ error: 'Missing required assignment fields' });
    }

    const newAssignment: Assignment = {
      ...assignmentData,
      id: `asg-${Date.now().toString(36)}`,
      assignedAt: new Date().toISOString(),
      submittedCount: 0
    };

    store.assignments.unshift(newAssignment);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('assignments').insert([assignmentToDb(newAssignment)]);
      }
    }

    return res.status(201).json(newAssignment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
