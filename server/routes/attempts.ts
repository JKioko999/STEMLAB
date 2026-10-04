import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { Attempt } from '../../src/types/index.js';

const router = Router();

// GET /api/attempts - List attempts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assignmentId, studentId, teacherId, schoolId } = req.query;
    let results = [...store.attempts];

    if (assignmentId) results = results.filter(a => a.assignmentId === assignmentId);
    if (studentId) results = results.filter(a => a.studentId === studentId);
    if (teacherId) results = results.filter(a => a.teacherId === teacherId);
    if (schoolId) results = results.filter(a => a.schoolId === schoolId);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('attempts').select('*');
        if (assignmentId) query = query.eq('assignment_id', assignmentId);
        if (studentId) query = query.eq('student_id', studentId);
        if (schoolId) query = query.eq('school_id', schoolId);
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

// POST /api/attempts - Submit a lab attempt
router.post('/', async (req: Request, res: Response) => {
  try {
    const attemptData = req.body;
    if (!attemptData.experimentId || !attemptData.studentId) {
      return res.status(400).json({ error: 'Missing experimentId or studentId' });
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
        await supabase.from('attempts').insert([{
          id: newAttempt.id,
          school_id: newAttempt.schoolId,
          assignment_id: newAttempt.assignmentId,
          is_practice_open_lab: newAttempt.isPracticeOpenLab,
          experiment_id: newAttempt.experimentId,
          experiment_title: newAttempt.experimentTitle,
          subject: newAttempt.subject,
          student_id: newAttempt.studentId,
          student_name: newAttempt.studentName,
          student_admission: newAttempt.studentAdmission,
          teacher_id: newAttempt.teacherId,
          teacher_name: newAttempt.teacherName,
          class_id: newAttempt.classId,
          class_name: newAttempt.className,
          mode: newAttempt.mode,
          started_at: newAttempt.startedAt,
          submitted_at: newAttempt.submittedAt,
          status: newAttempt.status,
          step_logs: newAttempt.stepLogs,
          answers: newAttempt.answers,
          total_score: newAttempt.totalScore,
          max_score: newAttempt.maxScore,
          percentage: newAttempt.percentage
        }]);
      }
    }

    return res.status(201).json(newAttempt);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/attempts/:id/grade - Teacher grading override and feedback release
router.put('/:id/grade', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scoreUpdates, teacherComments } = req.body;
  try {
    let updatedAttempt: Attempt | null = null;

    store.attempts = store.attempts.map(att => {
      if (att.id !== id) return att;

      const updatedAnswers = att.answers.map(ans => {
        const update = (scoreUpdates || []).find((u: any) => u.questionId === ans.questionId);
        if (update) {
          return {
            ...ans,
            teacherScore: update.teacherScore,
            feedback: update.feedback
          };
        }
        return ans;
      });

      const stepScore = att.stepLogs.reduce((acc, curr) => acc + curr.marksEarned, 0);
      const answerScore = updatedAnswers.reduce((acc, curr) => {
        const score = curr.teacherScore !== undefined ? curr.teacherScore : curr.autoScore;
        return acc + score;
      }, 0);

      const totalScore = Math.min(att.maxScore, stepScore + answerScore);
      const percentage = Math.round((totalScore / att.maxScore) * 100);

      updatedAttempt = {
        ...att,
        answers: updatedAnswers,
        totalScore,
        percentage,
        teacherComments,
        status: 'graded'
      };

      return updatedAttempt;
    });

    if (!updatedAttempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    return res.json(updatedAttempt);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts/release-grades - Release graded marks to students
router.post('/release-grades', async (req: Request, res: Response) => {
  const { assignmentId } = req.body;
  try {
    store.attempts = store.attempts.map(att => {
      if (att.assignmentId === assignmentId) {
        return {
          ...att,
          teacherFeedbackReleased: true
        };
      }
      return att;
    });

    return res.json({ success: true, assignmentId });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
