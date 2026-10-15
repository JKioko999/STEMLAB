import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import apiRouter from '../server/routes/index.js';

const app = express();

// Enable CORS for all incoming requests (Vercel client-to-serverless communication)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL Normalizer: handles paths whether Vercel passes /api/* or strips /api
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '');
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});

// Mount the API router
app.use('/', apiRouter);
app.use('/api', apiRouter);

export default app;
