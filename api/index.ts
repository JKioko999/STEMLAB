import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import apiRouter from '../server/routes/index.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount backend API routes for Vercel Serverless Function execution
app.use('/api', apiRouter);

export default app;
