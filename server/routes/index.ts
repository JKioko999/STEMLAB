import { Router, Request, Response } from 'express';
import schoolsRouter from './schools.js';
import usersRouter from './users.js';
import classesRouter from './classes.js';
import experimentsRouter from './experiments.js';
import assignmentsRouter from './assignments.js';
import attemptsRouter from './attempts.js';
import emailsRouter from './emails.js';
import { isSupabaseConfigured } from '../db/supabase.js';
import { store } from '../db/store.js';

const apiRouter = Router();

// Health Check & Backend Status
apiRouter.get('/health', (req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured(),
    databaseMode: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Fast In-Memory Seed Store',
    counts: {
      schools: store.schools.length,
      users: store.users.length,
      classes: store.classes.length,
      experiments: store.experiments.length,
      assignments: store.assignments.length,
      attempts: store.attempts.length,
      dispatchedEmails: store.emails.length
    }
  });
});

// Reset Database to Seed Defaults
apiRouter.post('/reset', (req: Request, res: Response) => {
  store.resetToDefaults();
  return res.json({ success: true, message: 'Database reset to initial KCSE curriculum defaults' });
});

// Sub-routers
apiRouter.use('/schools', schoolsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/classes', classesRouter);
apiRouter.use('/experiments', experimentsRouter);
apiRouter.use('/assignments', assignmentsRouter);
apiRouter.use('/attempts', attemptsRouter);
apiRouter.use('/emails', emailsRouter);

export default apiRouter;
