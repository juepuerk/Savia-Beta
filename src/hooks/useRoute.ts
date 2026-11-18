/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Hash-based routing so the browser back button, reloads and shared links work.
 *
 *   #/panel                       dashboard
 *   #/proyectos                   project list
 *   #/proyectos/:id               project studio (default tool)
 *   #/proyectos/:id/:tool         project studio on a given tool (method id, "resumen" or "hallazgos")
 *   #/metodos  #/informes  #/admin
 */

import { useCallback, useEffect, useState } from 'react';
import type { EvaluationMethodId } from '../types';

export type SectionName = 'dashboard' | 'projects' | 'methods' | 'reports' | 'admin';
export type StudioTool = EvaluationMethodId | 'summary' | 'findings';

export type Route =
  | { name: SectionName }
  | { name: 'project'; projectId: string; tool?: StudioTool };

const SECTION_SLUGS: Record<SectionName, string> = {
  dashboard: 'panel',
  projects: 'proyectos',
  methods: 'metodos',
  reports: 'informes',
  admin: 'admin',
};

const TOOL_SLUGS: Partial<Record<StudioTool, string>> = {
  summary: 'resumen',
  findings: 'hallazgos',
};

function toolFromSlug(slug: string | undefined): StudioTool | undefined {
  if (!slug) return undefined;
  const entry = Object.entries(TOOL_SLUGS).find(([, s]) => s === slug);
  return (entry ? entry[0] : slug) as StudioTool;
}

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second, third] = parts;
  if (first === SECTION_SLUGS.projects && second) {
    return { name: 'project', projectId: second, tool: toolFromSlug(third) };
  }
  const section = (Object.keys(SECTION_SLUGS) as SectionName[]).find((k) => SECTION_SLUGS[k] === first);
  return { name: section ?? 'dashboard' };
}

export function routeToHash(route: Route): string {
  if (route.name === 'project') {
    const tool = route.tool ? `/${encodeURIComponent(TOOL_SLUGS[route.tool] ?? route.tool)}` : '';
    return `#/${SECTION_SLUGS.projects}/${encodeURIComponent(route.projectId)}${tool}`;
  }
  return `#/${SECTION_SLUGS[route.name]}`;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route, options: { replace?: boolean } = {}) => {
    const hash = routeToHash(next);
    if (hash === window.location.hash) return;
    if (options.replace) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
      setRoute(parseRoute(hash));
    } else {
      window.location.hash = hash;
    }
    if (!options.replace) window.scrollTo({ top: 0 });
  }, []);

  return { route, navigate };
}
