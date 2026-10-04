import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';
import { isSupabaseConfigured, getSupabaseClient } from '../db/supabase.js';
import { ExperimentSpec } from '../../src/types/index.js';

const router = Router();

// GET /api/experiments - List experiments with optional filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject, tier, schoolId, teacherId } = req.query;
    let results = [...store.experiments];

    if (subject) {
      results = results.filter(e => e.subject === subject);
    }
    if (tier) {
      results = results.filter(e => e.ownerType === tier);
    }
    if (schoolId) {
      results = results.filter(e => e.ownerType === 'global' || e.schoolId === schoolId);
    }
    if (teacherId) {
      results = results.filter(e => e.ownerType === 'global' || e.teacherId === teacherId);
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let query = supabase.from('experiments').select('*');
        if (subject) query = query.eq('subject', subject);
        if (tier) query = query.eq('owner_type', tier);
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

// GET /api/experiments/:id - Get single experiment specification
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const exp = store.experiments.find(e => e.id === id);
    if (!exp) {
      return res.status(404).json({ error: 'Experiment specification not found' });
    }
    return res.json(exp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments - Create a new experiment
router.post('/', async (req: Request, res: Response) => {
  try {
    const specData: ExperimentSpec = req.body;
    if (!specData.title || !specData.subject) {
      return res.status(400).json({ error: 'Missing required experiment title or subject' });
    }

    const newSpec: ExperimentSpec = {
      ...specData,
      id: specData.id || `exp-custom-${Date.now().toString(36)}`,
      status: 'published'
    };

    store.experiments.unshift(newSpec);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').insert([{
          id: newSpec.id,
          subject: newSpec.subject,
          title: newSpec.title,
          kcse_paper: newSpec.kcsePaper,
          topic: newSpec.topic,
          objectives: newSpec.objectives,
          estimated_duration_minutes: newSpec.estimatedDurationMinutes,
          apparatus: newSpec.apparatus,
          steps: newSpec.steps,
          simulation_type: newSpec.simulationType,
          simulation_config: newSpec.simulationConfig,
          answer_sheet: newSpec.answerSheet,
          owner_type: newSpec.ownerType,
          school_id: newSpec.schoolId,
          teacher_id: newSpec.teacherId,
          author_name: newSpec.authorName,
          status: newSpec.status
        }]);
      }
    }

    return res.status(201).json(newSpec);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/experiments/:id - Modify / Update an existing experiment (steps, apparatus, bench, marks)
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedSpec: ExperimentSpec = req.body;
    let found = false;

    store.experiments = store.experiments.map(e => {
      if (e.id === id) {
        found = true;
        return { ...updatedSpec, id };
      }
      return e;
    });

    if (!found) {
      // If it's a new or customized copy
      store.experiments.unshift({ ...updatedSpec, id });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').upsert([{
          id,
          subject: updatedSpec.subject,
          title: updatedSpec.title,
          kcse_paper: updatedSpec.kcsePaper,
          topic: updatedSpec.topic,
          objectives: updatedSpec.objectives,
          estimated_duration_minutes: updatedSpec.estimatedDurationMinutes,
          apparatus: updatedSpec.apparatus,
          steps: updatedSpec.steps,
          simulation_type: updatedSpec.simulationType,
          simulation_config: updatedSpec.simulationConfig,
          answer_sheet: updatedSpec.answerSheet,
          owner_type: updatedSpec.ownerType,
          school_id: updatedSpec.schoolId,
          teacher_id: updatedSpec.teacherId,
          author_name: updatedSpec.authorName,
          status: updatedSpec.status
        }]);
      }
    }

    return res.json({ success: true, experiment: updatedSpec });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/experiments/:id - Delete an experiment
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    store.experiments = store.experiments.filter(e => e.id !== id);
    store.assignments = store.assignments.filter(a => a.experimentId !== id);

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('experiments').delete().eq('id', id);
      }
    }

    return res.json({ success: true, deletedExperimentId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments/:id/clone - Clone an experiment for teacher customization
router.post('/:id/clone', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorTeacher } = req.body;
  try {
    const source = store.experiments.find(e => e.id === id);
    if (!source) {
      return res.status(404).json({ error: 'Source experiment not found' });
    }

    const cloned: ExperimentSpec = {
      ...source,
      id: `exp-custom-${Date.now().toString(36)}`,
      title: `Copy of ${source.title}`,
      ownerType: 'teacher',
      schoolId: authorTeacher?.schoolId || null,
      teacherId: authorTeacher?.id || null,
      authorName: authorTeacher?.name || 'Science Teacher',
      clonedFrom: source.id,
      status: 'draft'
    };

    store.experiments.unshift(cloned);
    return res.status(201).json(cloned);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/experiments/:id/promote - Promote an experiment to school-tier
router.post('/:id/promote', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { schoolId } = req.body;
  try {
    const exp = store.experiments.find(e => e.id === id);
    if (!exp) return res.status(404).json({ error: 'Experiment not found' });

    const schoolExp: ExperimentSpec = {
      ...exp,
      id: `exp-school-${Date.now().toString(36)}`,
      ownerType: 'school',
      schoolId: schoolId,
      title: `[School Approved] ${exp.title}`,
      status: 'published'
    };

    store.experiments.unshift(schoolExp);
    return res.status(201).json(schoolExp);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
