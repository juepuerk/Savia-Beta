/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Full-Stack Express + Vite Server
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { Type } from '@google/genai';
import { AiNotConfiguredError, configuredProviders, generateJson } from './aiProvider.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

function normalizeClientIp(rawIp: string | undefined): string {
  if (!rawIp) return '127.0.0.1';
  const first = rawIp.split(',')[0].trim();
  if (first === '::1' || first === '::ffff:127.0.0.1') return '127.0.0.1';
  return first.replace(/^::ffff:/, '');
}

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Normalizes the synthesis so the client always receives the expected shape. */
function normalizeSynthesis(raw: any) {
  const findings = Array.isArray(raw?.draftFindings) ? raw.draftFindings : [];
  return {
    executiveSummary: asText(raw?.executiveSummary),
    draftFindings: findings
      .filter((f: any) => f && typeof f === 'object' && asText(f.title))
      .map((f: any) => ({
        title: asText(f.title),
        severityOrImportance: asText(f.severityOrImportance),
        description: asText(f.description),
        evidence: asText(f.evidence),
        recommendation: asText(f.recommendation),
      })),
  };
}

function normalizeQuestions(raw: any) {
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.questions) ? raw.questions : [];
  return list
    .filter((q: any) => q && typeof q === 'object' && asText(q.title))
    .map((q: any) => ({ title: asText(q.title), type: asText(q.type) || 'text' }));
}

function sendAiError(res: express.Response, err: any, fallbackMessage: string) {
  if (err instanceof AiNotConfiguredError) {
    res.status(503).json({ error: err.message });
    return;
  }
  console.error('[ai]', err);
  res.status(502).json({ error: err?.message || fallbackMessage });
}

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
    const providers = configuredProviders();
    res.json({ available: providers.length > 0, providers });
  });

  app.post('/api/ai/synthesize', async (req, res) => {
    const { projectTitle, objective, evidencePayload } = req.body || {};
    if (!projectTitle || !evidencePayload) {
      res.status(400).json({ error: 'Faltan datos del proyecto para sintetizar.' });
      return;
    }

    try {
      const raw = await generateJson({
        system:
          'Eres un investigador senior de UX y diseño de servicios. Sintetizas evidencia empírica en hallazgos concretos, verificables y en español claro. Respondes solo con JSON válido.',
        prompt: `Analiza la siguiente evidencia de investigación UX/servicio del proyecto "${projectTitle}" (Objetivo: ${objective || 'General'}).

Evidencia recopilada:
${JSON.stringify(evidencePayload, null, 2)}

Devuelve entre 2 y 4 hallazgos accionables en español claro para revisión humana.
Responde solo con un objeto JSON con esta forma exacta:
{"executiveSummary": string, "draftFindings": [{"title": string, "severityOrImportance": string, "description": string, "evidence": string, "recommendation": string}]}`,
        geminiSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            draftFindings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severityOrImportance: { type: Type.STRING },
                  description: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
              },
            },
          },
        },
      });

      const synthesis = normalizeSynthesis(raw);
      if (!synthesis.executiveSummary && synthesis.draftFindings.length === 0) {
        throw new Error('La IA devolvió una síntesis vacía. Inténtalo de nuevo.');
      }
      res.json(synthesis);
    } catch (err: any) {
      sendAiError(res, err, 'Error generando síntesis con IA.');
    }
  });

  app.post('/api/ai/suggest-questions', async (req, res) => {
    const { objective, productType } = req.body || {};
    try {
      const raw = await generateJson({
        prompt: `Sugiere 4 preguntas concisas para una encuesta UX sobre "${productType || 'Producto digital'}" con objetivo "${objective || 'Evaluar usabilidad'}".
Responde solo con un objeto JSON con esta forma exacta:
{"questions": [{"title": string, "type": string}]}`,
        geminiSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
              },
            },
          },
        },
      });
      res.json(normalizeQuestions(raw));
    } catch (err: any) {
      sendAiError(res, err, 'Error sugiriendo preguntas.');
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    const providers = configuredProviders();
    console.log(`Savia server running on http://0.0.0.0:${PORT}`);
    console.log(`[ai] proveedores activos: ${providers.length ? providers.join(' -> ') : 'ninguno'}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
