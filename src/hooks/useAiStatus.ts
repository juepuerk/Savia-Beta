/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Whether the server has AI configured (cached for the session).
 */

import { useEffect, useState } from 'react';

let cached: Promise<boolean> | null = null;

function fetchStatus(): Promise<boolean> {
  if (!cached) {
    cached = fetch('/api/ai/status')
      .then((res) => (res.ok ? res.json() : { available: false }))
      .then((data) => Boolean(data?.available))
      .catch(() => false);
  }
  return cached;
}

/** null while loading, then true/false. */
export function useAiStatus(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetchStatus().then((value) => {
      if (active) setAvailable(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return available;
}
