/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - AI provider layer (OmniRoute gateway first, Gemini as fallback)
 */

import { GoogleGenAI } from '@google/genai';

const PLACEHOLDERS = new Set(['', 'MY_GEMINI_API_KEY', 'MY_OMNIROUTE_URL', 'MY_OMNIROUTE_API_KEY']);
const REQUEST_TIMEOUT_MS = 60_000;

function envValue(name: string): string | null {
  const raw = process.env[name]?.trim() ?? '';
  return PLACEHOLDERS.has(raw) ? null : raw;
}

export type AiProviderName = 'omniroute' | 'gemini';

export function configuredProviders(): AiProviderName[] {
  const providers: AiProviderName[] = [];
  if (envValue('OMNIROUTE_BASE_URL')) providers.push('omniroute');
  if (envValue('GEMINI_API_KEY')) providers.push('gemini');
  return providers;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super('La síntesis con IA no está disponible: falta configurar un proveedor de IA en el servidor.');
  }
}

interface JsonRequest {
  system?: string;
  prompt: string;
  /** Gemini responseSchema, used only by the Gemini provider. */
  geminiSchema?: unknown;
}

/** Removes ```json fences some models wrap around JSON output. */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

async function callOmniRoute({ system, prompt }: JsonRequest): Promise<unknown> {
  const baseUrl = envValue('OMNIROUTE_BASE_URL')!.replace(/\/+$/, '');
  const apiKey = envValue('OMNIROUTE_API_KEY');
  const model = envValue('OMNIROUTE_MODEL') || 'auto';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new Error(`OmniRoute respondió ${res.status}${detail ? `: ${detail}` : ''}`);
  }

  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OmniRoute devolvió una respuesta vacía.');
  }
  return extractJson(content);
}

async function callGemini({ system, prompt, geminiSchema }: JsonRequest): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: envValue('GEMINI_API_KEY')! });
  const response = await ai.models.generateContent({
    model: envValue('GEMINI_MODEL') || 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      ...(system ? { systemInstruction: system } : {}),
      responseMimeType: 'application/json',
      ...(geminiSchema ? { responseSchema: geminiSchema as any } : {}),
    },
  });
  return extractJson(response.text ?? '{}');
}

/**
 * Runs the request against each configured provider in order (OmniRoute, then Gemini)
 * and returns the first valid JSON answer.
 */
export async function generateJson(request: JsonRequest): Promise<unknown> {
  const providers = configuredProviders();
  if (providers.length === 0) throw new AiNotConfiguredError();

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      return provider === 'omniroute' ? await callOmniRoute(request) : await callGemini(request);
    } catch (err: any) {
      const message = err?.name === 'TimeoutError' ? 'tiempo de espera agotado' : err?.message;
      console.warn(`[ai] ${provider} falló: ${message}`);
      errors.push(`${provider}: ${message}`);
    }
  }
  throw new Error(`No se pudo generar la respuesta con IA (${errors.join(' | ')}).`);
}
