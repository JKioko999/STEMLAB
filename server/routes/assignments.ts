import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { Assignment } from '../../src/types/index.js';

const router = Router();

// GET /api/assignments - List assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { schoolId, teacherId, classId } = req.query;
    let results = [...store.assignments];

    if (schoolId) results = results.filter(a => a.schoolId === schoolId);
    if (teacherId) results = results.filter(a => a.teacherId === teacherId);
    if (classId) results = results.filter(a => a.classId === classId);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('assignments').select('*');
        if (schoolId) query = query.eq('school_id', schoolId);
        if (teacherId) query = query.eq('teacher_id', teacherId);
        if (classId) query = query.eq('class_id', classId);
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
        await supabase.from('assignments').insert([{
          id: newAssignment.id,
          school_id: newAssignment.schoolId,
          teacher_id: newAssignment.teacherId,
          teacher_name: newAssignment.teacherName,
          class_id: newAssignment.classId,
          class_name: newAssignment.className,
          experiment_id: newAssignment.experimentId,
          experiment_title: newAssignment.experimentTitle,
          subject: newAssignment.subject,
          kcse_paper: newAssignment.kcsePaper,
          mode: newAssignment.mode,
          deadline: newAssignment.deadline,
          time_limit_minutes: newAssignment.timeLimitMinutes,
          total_enrolled_students: newAssignment.totalEnrolledStudents,
          submitted_count: 0
        }]);
      }
    }

    return res.status(201).json(newAssignment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
