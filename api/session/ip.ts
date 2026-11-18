/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel function: GET /api/session/ip
 */

import { normalizeClientIp } from '../../lib/ip.js';

export function GET(request: Request): Response {
  const raw = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  return Response.json({ ipAddress: normalizeClientIp(raw) });
}
