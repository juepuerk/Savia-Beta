/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Client IP helpers shared by Vercel functions and the local dev server
 */

export function normalizeClientIp(rawIp: string | null | undefined): string {
  if (!rawIp) return '127.0.0.1';
  const first = rawIp.split(',')[0].trim();
  if (first === '::1' || first === '::ffff:127.0.0.1') return '127.0.0.1';
  return first.replace(/^::ffff:/, '');
}
