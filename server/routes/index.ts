import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import schoolsRouter from './schools.js';
import usersRouter from './users.js';
import classesRouter from './classes.js';
import experimentsRouter from './experiments.js';
import assignmentsRouter from './assignments.js';
import attemptsRouter from './attempts.js';
import emailsRouter from './emails.js';
import { isSupabaseConfigured } from '../db/supabase.js';
import { store } from '../db/store.js';
import { routeGuard, requireRole, attachSession, AuthedRequest } from '../auth.js';
import { usingServiceRole } from '../db/supabase.js';

const apiRouter = Router();

// Health: minimal when public, detailed for platform admins only
apiRouter.get('/health', (req: Request, res: Response) => {
  return res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

apiRouter.get('/health/details', requireRole('super_admin'), (req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured(),
    serviceRoleKey: usingServiceRole(),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY),
    setupKeyConfigured: Boolean(process.env.SUPER_ADMIN_SETUP_KEY),
    databaseMode: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'In-memory seed store (data is not persisted)',
    counts: {
      schools: store.schools.length, users: store.users.length, classes: store.classes.length,
      experiments: store.experiments.length, assignments: store.assignments.length,
      attempts: store.attempts.length, dispatchedEmails: store.emails.length
    }
  });
});

// Dev-only: wipe the in-memory store. Never available in production.
apiRouter.post('/reset', requireRole('super_admin'), (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return res.status(404).json({ error: 'Not found' });
  store.resetToDefaults();
  return res.json({ success: true, message: 'Database reset to initial KCSE curriculum defaults' });
});

// Download Corporate BRD/DRD Word Document (.docx)
apiRouter.get('/download-brd', (req: Request, res: Response) => {
  const filePath = path.resolve('public', 'STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="STEM_SPARK_VIRTUAL_LAB_BRD_DRD_SPECIFICATION.docx"');
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: 'Specification document not found on server' });
  }
});

// Minimal public fields for the student sign-up form (signed-out visitors only)
const publicClassFields = (req: AuthedRequest, res: Response, next: any) => {
  if (!attachSession(req) && req.method === 'GET') {
    const json = res.json.bind(res);
    res.json = (body: any) => json(Array.isArray(body)
      ? body.map(({ id, schoolId, name, formYear, subject }: any) => ({ id, schoolId, name, formYear, subject })) : body);
  }
  next();
};

const staff = ['teacher', 'school_admin', 'super_admin'] as const;
const admins = ['school_admin', 'super_admin'] as const;

// Sub-routers (anything not listed in a guard requires a signed-in user)
apiRouter.use('/schools', routeGuard([
  ['GET', /^\/$/, 'public'], ['POST', /^\/$/, 'public'], ['DELETE', /./, ['super_admin']]
]), schoolsRouter);
apiRouter.use('/users', routeGuard([
  ['POST', /^\/(login|admin|student|request-reset-otp|verify-reset-otp|change-password)$/, 'public']
]), usersRouter);
apiRouter.use('/classes', routeGuard([
  ['GET', /^\/$/, 'public'], ['POST', /./, [...admins]]
]), publicClassFields, classesRouter);
apiRouter.use('/experiments', routeGuard([
  ['GET', /./, 'auth'], ['POST', /^\/[^/]+\/promote$/, [...admins]], ['*', /./, [...staff]]
]), experimentsRouter);
apiRouter.use('/assignments', routeGuard([['GET', /./, 'auth'], ['*', /./, [...staff]]]), assignmentsRouter);
apiRouter.use('/attempts', routeGuard([['POST', /^\/$/, 'auth'], ['GET', /./, 'auth'], ['*', /./, [...staff]]]), attemptsRouter);
apiRouter.use('/emails', routeGuard([['POST', /^\/send$/, [...staff]], ['*', /./, ['super_admin']]]), emailsRouter);

export default apiRouter;
