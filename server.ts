import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API routes
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API ${req.method}] ${req.url}`);
    }
    next();
  });

  // Mount Backend API Routes
  app.use('/api', apiRouter);

  if (!isProduction) {
    // Mount Vite Dev Server middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve bundled static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  STEM-SPARK-LAB Fullstack Server Running`);
    console.log(`  Local URL:    http://0.0.0.0:${PORT}`);
    console.log(`  API Health:   http://0.0.0.0:${PORT}/api/health`);
    console.log(`  Environment:  ${isProduction ? 'Production' : 'Development (Vite Middleware)'}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
