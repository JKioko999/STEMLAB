import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import apiRouter from '../server/routes/index.js';

const app = express();

// Enable CORS for client-to-serverless communication
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL Normalizer: handles paths whether Vercel passes /api/* or strips /api
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4);
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});

// Mount the API router at both root and /api for bulletproof matching
app.use('/', apiRouter);
app.use('/api', apiRouter);

// Catch-all for unhandled routes (ensures Vercel always receives an HTTP response)
app.use((req: Request, res: Response) => {
  return res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Vercel Serverless Error]:', err);
  return res.status(500).json({ error: err?.message || 'Server error' });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
