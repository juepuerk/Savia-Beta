/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Local server (development and self-hosting).
 * On Vercel the same endpoints run as serverless functions in api/.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { isAiAvailable, suggestQuestions, synthesize, toErrorResponse } from './lib/ai.js';
import { normalizeClientIp } from './lib/ip.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/session/ip', (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || req.socket.remoteAddress;
    res.json({ ipAddress: normalizeClientIp(rawIp) });
  });

  app.get('/api/ai/status', (_req, res) => {
    res.json({ available: isAiAvailable() });
  });

  app.post('/api/ai/synthesize', async (req, res) => {
    try {
      res.json(await synthesize(req.body));
    } catch (err) {
      const { status, body } = toErrorResponse(err);
      res.status(status).json(body);
    }
  });

  app.post('/api/ai/suggest-questions', async (req, res) => {
    try {
      res.json(await suggestQuestions(req.body));
    } catch (err) {
      const { status, body } = toErrorResponse(err);
      res.status(status).json(body);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Savia server running on http://localhost:${PORT}`);
    if (!isAiAvailable()) console.log('[ai] GEMINI_API_KEY no configurada: la síntesis con IA estará desactivada.');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
