/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Pure Evaluation, Method Progress, Quantitative Metrics & Access Control Logic
 */

import {
  EvaluationMethodId,
  IcebergItem,
  IcebergLevel,
  Project,
  User,
  WcagCriterion,
} from '../types';

export function calculateSusScore(answers: number[]): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  adjective: string;
  percentile: string;
} {
  if (!answers || answers.length !== 10) {
    return { score: 0, grade: 'F', adjective: 'Insuficiente', percentile: '0%' };
  }

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const val = Math.max(1, Math.min(5, answers[i]));
    sum += i % 2 === 0 ? val - 1 : 5 - val;
  }

  const score = Math.round(sum * 2.5 * 10) / 10;
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  let adjective = 'Pobre';
  let percentile = '< 20%';

  if (score >= 80.3) {
    grade = 'A';
    adjective = 'Excelente';
    percentile = '90% - 99%';
  } else if (score >= 74) {
    grade = 'B';
    adjective = 'Bueno';
    percentile = '70% - 89%';
  } else if (score >= 68) {
    grade = 'C';
    adjective = 'Aceptable';
    percentile = '50% - 69%';
  } else if (score >= 51) {
    grade = 'D';
    adjective = 'Mejorable';
    percentile = '20% - 49%';
  }

  return { score, grade, adjective, percentile };
}

export function getSeverityLabel(severity: number): { label: string; color: string } {
  switch (severity) {
    case 4:
      return { label: 'Catastrófico', color: '#FF6B1A' };
    case 3:
      return { label: 'Grave', color: '#F472B6' };
    case 2:
      return { label: 'Moderado', color: '#C4B5FD' };
    case 1:
      return { label: 'Menor', color: '#38BDF8' };
    default:
      return { label: 'Cosmético', color: '#A78BFA' };
  }
}

export function classifyImpactEffort(
  impact: number,
  effort: number
): 'quick_win' | 'major_project' | 'fill_in' | 'thankless_task' {
  const highImpact = impact >= 6;
  const lowEffort = effort <= 5;
  if (highImpact && lowEffort) return 'quick_win';
  if (highImpact && !lowEffort) return 'major_project';
  if (!highImpact && lowEffort) return 'fill_in';
  return 'thankless_task';
}

export function calculateWcagCompliance(items: WcagCriterion[]): {
  complianceRate: number;
  passCount: number;
  failCount: number;
  evaluatedCount: number;
} {
  const evaluated = items.filter((i) => i.status === 'pass' || i.status === 'fail');
  const passCount = evaluated.filter((i) => i.status === 'pass').length;
  const failCount = evaluated.filter((i) => i.status === 'fail').length;
  const evaluatedCount = evaluated.length;
  const complianceRate =
    evaluatedCount === 0 ? 0 : Math.round((passCount / evaluatedCount) * 100);

  return { complianceRate, passCount, failCount, evaluatedCount };
}

export function calculateIcebergDepthCoverage(items: IcebergItem[]): {
  counts: Record<IcebergLevel, number>;
  levelsCovered: number;
  deepCount: number;
  deepRatio: number;
  total: number;
} {
  const counts: Record<IcebergLevel, number> = {
    events: 0,
    patterns: 0,
    structures: 0,
    mental_models: 0,
  };

  for (const item of items) {
    counts[item.level] = (counts[item.level] || 0) + 1;
  }

  const levelsCovered = (Object.keys(counts) as IcebergLevel[]).filter(
    (k) => counts[k] > 0
  ).length;
  const total = items.length;
  const deepCount = counts.structures + counts.mental_models;
  const deepRatio = total === 0 ? 0 : Math.round((deepCount / total) * 100);

  return { counts, levelsCovered, deepCount, deepRatio, total };
}

export function calculateMethodProgress(
  project: Project,
  methodId: EvaluationMethodId
): { percent: number; completedLabel: string; count: number } {
  switch (methodId) {
    case 'iceberg_model': {
      const items = project.icebergItems || [];
      const cov = calculateIcebergDepthCoverage(items);
      const percent = Math.min(100, cov.levelsCovered * 25);
      return {
        percent,
        completedLabel: `${cov.levelsCovered}/4 estratos`,
        count: items.length,
      };
    }
    case 'heuristic_evaluation': {
      const items = project.heuristicItems || [];
      if (items.length === 0) return { percent: 0, completedLabel: '0/5 ítems', count: 0 };
      const approved = items.filter((i) => i.status === 'aprobado').length;
      const base = Math.min(1, items.length / 5) * 75;
      const approvalBonus = (approved / items.length) * 25;
      return {
        percent: Math.min(100, Math.round(base + approvalBonus)),
        completedLabel: `${items.length} obs · ${approved} aprob.`,
        count: items.length,
      };
    }
    case 'usability_sus': {
      const tasks = project.usabilityTasks || [];
      const resps = project.susRespondents || [];
      const taskPart = Math.min(1, tasks.length / 3) * 50;
      const susPart = Math.min(1, resps.length / 3) * 50;
      return {
        percent: Math.min(100, Math.round(taskPart + susPart)),
        completedLabel: `${tasks.length} tareas · ${resps.length} SUS`,
        count: tasks.length + resps.length,
      };
    }
    case 'customer_journey': {
      const stages = project.journeyStages || [];
      if (stages.length === 0) return { percent: 0, completedLabel: '0/4 fases', count: 0 };
      const stagePart = Math.min(1, stages.length / 4) * 80;
      const hasRich = stages.some((s) => s.painPoints.length > 0 && s.opportunities.length > 0);
      return {
        percent: Math.min(100, Math.round(stagePart + (hasRich ? 20 : 0))),
        completedLabel: `${stages.length}/4 fases`,
        count: stages.length,
      };
    }
    case 'card_sorting': {
      const cats = project.cardCategories || [];
      const cards = project.cardItems || [];
      const catPart = Math.min(1, cats.length / 3) * 40;
      const assigned = cards.filter((c) => Boolean(c.assignedCategory)).length;
      const cardPart = Math.min(1, assigned / 8) * 60;
      return {
        percent: Math.min(100, Math.round(catPart + cardPart)),
        completedLabel: `${cards.length} tarjetas · ${cats.length} grupos`,
        count: cards.length,
      };
    }
    case 'wcag_audit': {
      const items = project.wcagItems || [];
      if (items.length === 0) return { percent: 0, completedLabel: '0 evaluados', count: 0 };
      const evaluated = items.filter((w) => w.status !== 'pending').length;
      const percent = Math.round((evaluated / items.length) * 100);
      return {
        percent,
        completedLabel: `${evaluated}/${items.length} criterios`,
        count: items.length,
      };
    }
    case 'impact_effort': {
      const items = project.impactEffortItems || [];
      if (items.length === 0) return { percent: 0, completedLabel: '0/4 iniciativas', count: 0 };
      const countPart = Math.min(1, items.length / 4) * 80;
      const voted = items.filter((i) => i.votes > 0).length;
      const votePart = (voted / items.length) * 20;
      return {
        percent: Math.min(100, Math.round(countPart + votePart)),
        completedLabel: `${items.length}/4 iniciativas`,
        count: items.length,
      };
    }
    case 'service_blueprint': {
      const steps = project.blueprintSteps || [];
      const completeSteps = steps.filter(
        (s) => s.customerAction.trim() && s.frontstageContact.trim() && s.backstageProcess.trim()
      ).length;
      const percent = Math.min(100, Math.round((completeSteps / 4) * 100));
      return {
        percent,
        completedLabel: `${steps.length}/4 pasos`,
        count: steps.length,
      };
    }
    case 'survey_feedback': {
      const qs = project.surveyQuestions || [];
      const resps = project.surveyResponses || [];
      const qPart = Math.min(1, qs.length / 3) * 40;
      const rPart = Math.min(1, resps.length / 5) * 60;
      return {
        percent: Math.min(100, Math.round(qPart + rPart)),
        completedLabel: `${qs.length} preg · ${resps.length} resp`,
        count: qs.length + resps.length,
      };
    }
  }
}

export function calculateProjectProgress(project: Project): {
  overallPercent: number;
  byMethod: Array<{
    methodId: EvaluationMethodId;
    percent: number;
    count: number;
    completedLabel: string;
  }>;
} {
  const methods = project.activeMethods || [];
  if (methods.length === 0) {
    return { overallPercent: 0, byMethod: [] };
  }

  const byMethod = methods.map((methodId) => ({
    methodId,
    ...calculateMethodProgress(project, methodId),
  }));

  const overallPercent = Math.round(
    byMethod.reduce((acc, m) => acc + m.percent, 0) / byMethod.length
  );

  return { overallPercent, byMethod };
}

export function extractProjectQuantitativeMetrics(project: Project): {
  avgSus: number | null;
  avgTaskSuccess: number | null;
  avgTaskTime: number | null;
  avgSeq: number | null;
  wcagRate: number | null;
  icebergDeepRatio: number | null;
  avgHeuristicSeverity: number | null;
  journeySentimentSeries: Array<{ label: string; score: number }>;
  avgSurveyRating: number | null;
  totalEvidenceCount: number;
  approvedFindingsCount: number;
  totalFindingsCount: number;
} {
  const susResps = project.susRespondents || [];
  const avgSus =
    susResps.length > 0
      ? Math.round((susResps.reduce((a, r) => a + r.susScore, 0) / susResps.length) * 10) / 10
      : null;

  const tasks = project.usabilityTasks || [];
  const avgTaskSuccess =
    tasks.length > 0
      ? Math.round(tasks.reduce((a, t) => a + t.successRate, 0) / tasks.length)
      : null;
  const avgTaskTime =
    tasks.length > 0
      ? Math.round(tasks.reduce((a, t) => a + t.avgTimeSeconds, 0) / tasks.length)
      : null;
  const avgSeq =
    tasks.length > 0
      ? Math.round((tasks.reduce((a, t) => a + t.seqScore, 0) / tasks.length) * 10) / 10
      : null;

  const wcagItems = project.wcagItems || [];
  const wcag = calculateWcagCompliance(wcagItems);
  const wcagRate = wcag.evaluatedCount > 0 ? wcag.complianceRate : null;

  const icebergItems = project.icebergItems || [];
  const iceberg = calculateIcebergDepthCoverage(icebergItems);
  const icebergDeepRatio = iceberg.total > 0 ? iceberg.deepRatio : null;

  const heuristicItems = project.heuristicItems || [];
  const avgHeuristicSeverity =
    heuristicItems.length > 0
      ? Math.round(
          (heuristicItems.reduce((a, h) => a + h.severity, 0) / heuristicItems.length) * 10
        ) / 10
      : null;

  const journeySentimentSeries = (project.journeyStages || []).map((s) => ({
    label: s.stageName,
    score: s.sentiment,
  }));

  const ratingQuestions = (project.surveyQuestions || []).filter(
    (q) => q.type === 'rating_scale'
  );
  const ratingValues: number[] = [];
  for (const resp of project.surveyResponses || []) {
    for (const q of ratingQuestions) {
      const val = Number(resp.answers[q.id]);
      if (!Number.isNaN(val) && val > 0) ratingValues.push(val);
    }
  }
  const avgSurveyRating =
    ratingValues.length > 0
      ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 10) / 10
      : null;

  const totalEvidenceCount =
    icebergItems.length +
    heuristicItems.length +
    (project.journeyStages || []).length +
    tasks.length +
    susResps.length +
    (project.cardItems || []).length +
    wcagItems.length +
    (project.impactEffortItems || []).length +
    (project.blueprintSteps || []).length +
    (project.surveyResponses || []).length;

  const findings = project.findings || [];
  const approvedFindingsCount = findings.filter((f) => f.status === 'aprobado').length;

  return {
    avgSus,
    avgTaskSuccess,
    avgTaskTime,
    avgSeq,
    wcagRate,
    icebergDeepRatio,
    avgHeuristicSeverity,
    journeySentimentSeries,
    avgSurveyRating,
    totalEvidenceCount,
    approvedFindingsCount,
    totalFindingsCount: findings.length,
  };
}

export function generateCsv(headers: string[], rows: Array<Array<string | number>>): string {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const headerLine = headers.map(escapeCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCell).join(','));
  return [headerLine, ...bodyLines].join('\n');
}

export function findUserByIp(users: User[], ip: string): User | undefined {
  const cleanIp = ip.trim();
  if (!cleanIp) return undefined;
  return users.find((u) => u.ipAddress.trim() === cleanIp);
}

export function getAccessibleProjects(
  projects: Project[],
  user: User | null | undefined,
  isAdminView: boolean
): Project[] {
  if (!user) return [];
  if (isAdminView && user.isAdmin) return projects;
  return projects.filter(
    (p) => p.leadId === user.id || p.collaboratorIds.includes(user.id)
  );
}

export function toggleProjectUserAccess(project: Project, userId: string): Project {
  const hasAccess = project.collaboratorIds.includes(userId);
  const nextCollaborators = hasAccess
    ? project.collaboratorIds.filter((id) => id !== userId)
    : [...project.collaboratorIds, userId];

  return {
    ...project,
    collaboratorIds: nextCollaborators,
  };
}
