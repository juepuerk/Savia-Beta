/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel function: POST /api/ai/synthesize
 */

import { synthesize, toErrorResponse } from '../../lib/ai.js';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({}));
    return Response.json(await synthesize(body));
  } catch (err) {
    const { status, body } = toErrorResponse(err);
    return Response.json(body, { status });
  }
}
