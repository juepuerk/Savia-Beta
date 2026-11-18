/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - AI logic shared by the Vercel functions (api/) and the local dev server (server.ts)
 */

import { GoogleGenAI, Type } from '@google/genai';

const DEFAULT_MODEL = 'gemini-4-hydrogen';

/** Error with an HTTP status and a message that is safe to show to end users. */
export class AiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key !== 'MY_GEMINI_API_KEY' ? key : null;
}

export function isAiAvailable(): boolean {
  return getApiKey() !== null;
}

function getClient(): GoogleGenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new AiError(503, 'La IA no está disponible en esta versión beta.');
  }
  return new GoogleGenAI({ apiKey });
}

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function parseJson(text: string | undefined): unknown {
  try {
    return JSON.parse((text ?? '').trim());
  } catch {
    throw new AiError(502, 'La IA devolvió una respuesta que no se pudo leer. Inténtalo de nuevo.');
  }
}

async function generate(request: Parameters<GoogleGenAI['models']['generateContent']>[0]) {
  try {
    return await getClient().models.generateContent(request);
  } catch (err) {
    if (err instanceof AiError) throw err;
    console.error('[ai] Gemini error:', err);
    throw new AiError(502, 'El servicio de IA no respondió. Inténtalo de nuevo en unos minutos.');
  }
}

export interface SynthesisInput {
  projectTitle?: string;
  objective?: string;
  evidencePayload?: unknown;
}

export interface DraftFinding {
  title: string;
  severityOrImportance: string;
  description: string;
  evidence: string;
  recommendation: string;
}

export async function synthesize(input: SynthesisInput) {
  const { projectTitle, objective, evidencePayload } = input || {};
  if (!projectTitle || !evidencePayload) {
    throw new AiError(400, 'Faltan datos del proyecto para sintetizar.');
  }

  const response = await generate({
    model: getModel(),
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

  const raw: any = parseJson(response.text);
  const findings: any[] = Array.isArray(raw?.draftFindings) ? raw.draftFindings : [];
  const draftFindings: DraftFinding[] = findings
    .filter((f) => f && typeof f === 'object' && asText(f.title))
    .map((f) => ({
      title: asText(f.title),
      severityOrImportance: asText(f.severityOrImportance) || 'Media',
      description: asText(f.description),
      evidence: asText(f.evidence),
      recommendation: asText(f.recommendation),
    }));
  const executiveSummary = asText(raw?.executiveSummary);

  if (!executiveSummary && draftFindings.length === 0) {
    throw new AiError(502, 'La IA no encontró hallazgos en la evidencia. Añade más datos e inténtalo de nuevo.');
  }
  return { executiveSummary, draftFindings };
}

export interface SuggestQuestionsInput {
  objective?: string;
  productType?: string;
}

export async function suggestQuestions(input: SuggestQuestionsInput) {
  const { objective, productType } = input || {};
  const response = await generate({
    model: getModel(),
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

  const raw = parseJson(response.text);
  const list: any[] = Array.isArray(raw) ? raw : [];
  return list
    .filter((q) => q && typeof q === 'object' && asText(q.title))
    .map((q) => ({ title: asText(q.title), type: asText(q.type) || 'text' }));
}

/** Maps any thrown error to an HTTP status and a user-facing JSON body. */
export function toErrorResponse(err: unknown): { status: number; body: { error: string } } {
  if (err instanceof AiError) return { status: err.status, body: { error: err.message } };
  console.error('[ai] unexpected error:', err);
  return { status: 500, body: { error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' } };
}
