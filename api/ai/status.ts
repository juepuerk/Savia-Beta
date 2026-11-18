/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel function: GET /api/ai/status
 */

import { isAiAvailable } from '../../lib/ai.js';

export function GET(): Response {
  return Response.json({ available: isAiAvailable() });
}
