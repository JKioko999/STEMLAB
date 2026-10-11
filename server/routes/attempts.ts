import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { 
  isSupabaseConfigured, 
  getSupabaseClient, 
  attemptFromDb, 
  attemptToDb 
} from '../db/supabase.js';
import { Attempt } from '../../src/types/index.js';

const router = Router();

// GET /api/attempts - List attempts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assignmentId, studentId, schoolId } = req.query;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('attempts').select('*').order('started_at', { ascending: false });
        if (assignmentId) query = query.eq('assignment_id', assignmentId);
        if (studentId) query = query.eq('student_id', studentId);
        if (schoolId) query = query.eq('school_id', schoolId);
        const { data, error } = await query;
        if (!error && data) {
          return res.json(data.map(attemptFromDb));
        }
      }
    }

    let results = [...store.attempts];
    if (assignmentId) results = results.filter(a => a.assignmentId === assignmentId);
    if (studentId) results = results.filter(a => a.studentId === studentId);
    if (schoolId) results = results.filter(a => a.schoolId === schoolId);

    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts - Submit a lab attempt
router.post('/', async (req: Request, res: Response) => {
  try {
    const attemptData = req.body;
    if (!attemptData.experimentId) {
      return res.status(400).json({ error: 'Missing experimentId' });
    }

    const newAttempt: Attempt = {
      ...attemptData,
      id: `att-${Date.now().toString(36)}`,
      submittedAt: new Date().toISOString()
    };

    store.attempts.unshift(newAttempt);

    // Update assignment submitted count if applicable
    if (newAttempt.assignmentId) {
      store.assignments = store.assignments.map(a =>
        a.id === newAttempt.assignmentId
          ? { ...a, submittedCount: a.submittedCount + 1 }
          : a
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('attempts').insert([attemptToDb(newAttempt)]);
        if (newAttempt.assignmentId) {
          const { count } = await supabase.from('attempts').select('*', { count: 'exact', head: true }).eq('assignment_id', newAttempt.assignmentId);
          if (count !== null) {
            await supabase.from('assignments').update({ submitted_count: count }).eq('id', newAttempt.assignmentId);
          }
        }
      }
    }

    return res.status(201).json(newAttempt);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/attempts/:id/grade - Teacher evaluates and updates scores
router.patch('/:id/grade', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { scoreUpdates, teacherComments } = req.body;

    let attempt: Attempt | undefined = store.attempts.find(a => a.id === id);

    if (!attempt && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: attData } = await supabase.from('attempts').select('*').eq('id', id).maybeSingle();
        if (attData) attempt = attemptFromDb(attData);
      }
    }

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const updatedAnswers = attempt.answers.map(ans => {
      const update = scoreUpdates?.find((u: any) => u.questionId === ans.questionId);
      if (update) {
        return {
          ...ans,
          teacherScore: update.teacherScore,
          feedback: update.feedback || ans.feedback
        };
      }
      return ans;
    });

    const questionMarks = updatedAnswers.reduce((acc, a) => acc + (a.teacherScore !== undefined ? a.teacherScore : a.autoScore), 0);
    const proceduralMarks = attempt.stepLogs.reduce((acc, l) => acc + l.marksEarned, 0);
    const newTotal = questionMarks + proceduralMarks;
    const newPercentage = Math.round((newTotal / attempt.maxScore) * 100);

    const updatedAttempt: Attempt = {
      ...attempt,
      answers: updatedAnswers,
      totalScore: newTotal,
      percentage: newPercentage,
      teacherComments: teacherComments || attempt.teacherComments,
      status: 'graded'
    };

    store.attempts = store.attempts.map(a => a.id === id ? updatedAttempt : a);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('attempts').update({
          answers: updatedAttempt.answers,
          total_score: updatedAttempt.totalScore,
          percentage: updatedAttempt.percentage,
          teacher_comments: updatedAttempt.teacherComments,
          status: 'graded'
        }).eq('id', id);
      }
    }

    return res.json(updatedAttempt);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts/release-grades - Release feedback to students
router.post('/release-grades', async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ error: 'Missing assignmentId' });
    }

    store.attempts = store.attempts.map(a => a.assignmentId === assignmentId ? { ...a, teacherFeedbackReleased: true } : a);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('attempts').update({ teacher_feedback_released: true }).eq('assignment_id', assignmentId);
      }
    }

    return res.json({ success: true, assignmentId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
