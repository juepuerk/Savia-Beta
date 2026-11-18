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
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function normalizeClientIp(rawIp: string | undefined): string {
  if (!rawIp) return '127.0.0.1';
  const first = rawIp.split(',')[0].trim();
  if (first === '::1' || first === '::ffff:127.0.0.1') return '127.0.0.1';
  return first.replace(/^::ffff:/, '');
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

  app.post('/api/ai/synthesize', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY no configurada en el servidor.',
      });
      return;
    }

    const { projectTitle, objective, evidencePayload } = req.body || {};
    if (!projectTitle || !evidencePayload) {
      res.status(400).json({ error: 'Faltan datos del proyecto para sintetizar.' });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analiza la siguiente evidencia de investigación UX/servicio del proyecto "${projectTitle}" (Objetivo: ${objective || 'General'}).
Evidencia recopilada:
${JSON.stringify(evidencePayload, null, 2)}

Devuelve entre 2 y 4 hallazgos accionables en español claro para revisión humana.`,
        config: {
          systemInstruction:
            'Eres un investigador senior de UX y diseño de servicios. Sintetizas evidencia empírica en hallazgos concretos, verificables y en español claro.',
          responseMimeType: 'application/json',
          responseSchema: {
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
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error generando síntesis con IA.' });
    }
  });

  app.post('/api/ai/suggest-questions', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({ error: 'GEMINI_API_KEY no configurada en el servidor.' });
      return;
    }

    const { objective, productType } = req.body || {};
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Sugiere 4 preguntas concisas para una encuesta UX sobre "${productType || 'Producto digital'}" con objetivo "${objective || 'Evaluar usabilidad'}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
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
      });
      res.json(JSON.parse((response.text ?? '[]').trim()));
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Error sugiriendo preguntas.' });
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
    console.log(`Savia server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
