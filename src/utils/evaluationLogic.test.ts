import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSusScore,
  classifyImpactEffort,
  calculateWcagCompliance,
  calculateIcebergDepthCoverage,
  calculateMethodProgress,
  calculateProjectProgress,
  extractProjectQuantitativeMetrics,
  generateCsv,
  findUserByIp,
  getAccessibleProjects,
  toggleProjectUserAccess,
} from './evaluationLogic';
import { Project, User } from '../types';

function makeBaseProject(partial?: Partial<Project>): Project {
  return {
    id: 'p_test',
    companyId: 'comp_savia',
    title: 'Proyecto Test',
    objective: 'Obj',
    scope: 'Scope',
    productType: 'Web',
    status: 'activo',
    leadId: 'u1',
    collaboratorIds: ['u1'],
    activeMethods: ['iceberg_model', 'wcag_audit'],
    updatedAt: 'Ahora',
    icebergItems: [],
    heuristicItems: [],
    journeyStages: [],
    usabilityTasks: [],
    susRespondents: [],
    cardCategories: [],
    cardItems: [],
    wcagItems: [],
    impactEffortItems: [],
    blueprintSteps: [],
    surveyQuestions: [],
    surveyResponses: [],
    findings: [],
    ...partial,
  };
}

test('SUS calculation produces 100 for ideal scores', () => {
  const res = calculateSusScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]);
  assert.equal(res.score, 100);
  assert.equal(res.grade, 'A');
});

test('SUS calculation handles neutral 3 across all items as 50', () => {
  const res = calculateSusScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  assert.equal(res.score, 50);
  assert.equal(res.grade, 'F');
});

test('Impact vs effort classification routes into 4 quadrants accurately', () => {
  assert.equal(classifyImpactEffort(8, 3), 'quick_win');
  assert.equal(classifyImpactEffort(9, 8), 'major_project');
  assert.equal(classifyImpactEffort(4, 2), 'fill_in');
  assert.equal(classifyImpactEffort(3, 9), 'thankless_task');
});

test('WCAG compliance ignores not_applicable items', () => {
  const res = calculateWcagCompliance([
    {
      id: '1',
      principle: 'Perceptible',
      code: '1.1.1',
      name: 'Alt',
      level: 'A',
      status: 'pass',
      elementSelectorOrLocation: '',
      observations: '',
      recommendation: '',
    },
    {
      id: '2',
      principle: 'Operable',
      code: '2.1.1',
      name: 'Keyboard',
      level: 'A',
      status: 'fail',
      elementSelectorOrLocation: '',
      observations: '',
      recommendation: '',
    },
    {
      id: '3',
      principle: 'Robusto',
      code: '4.1.2',
      name: 'ARIA',
      level: 'AA',
      status: 'not_applicable',
      elementSelectorOrLocation: '',
      observations: '',
      recommendation: '',
    },
  ]);
  assert.equal(res.complianceRate, 50);
  assert.equal(res.evaluatedCount, 2);
});

test('Iceberg depth coverage counts strata and deep ratio accurately', () => {
  const res = calculateIcebergDepthCoverage([
    {
      id: 'a',
      level: 'events',
      title: 'Abandono',
      description: '',
      authorId: 'u1',
      authorName: 'Ana',
      authorIp: '10.0.0.1',
      createdAt: '',
    },
    {
      id: 'b',
      level: 'structures',
      title: 'Arquitectura',
      description: '',
      authorId: 'u1',
      authorName: 'Ana',
      authorIp: '10.0.0.1',
      createdAt: '',
    },
    {
      id: 'c',
      level: 'mental_models',
      title: 'Supuesto',
      description: '',
      authorId: 'u1',
      authorName: 'Ana',
      authorIp: '10.0.0.1',
      createdAt: '',
    },
  ]);
  assert.equal(res.levelsCovered, 3);
  assert.equal(res.deepCount, 2);
  assert.equal(res.deepRatio, 67);
});

test('Method and project completion progress compute accurately across active methods', () => {
  const proj = makeBaseProject({
    activeMethods: ['iceberg_model', 'wcag_audit'],
    icebergItems: [
      { id: '1', level: 'events', title: 'E', description: '', authorId: 'u1', authorName: 'A', authorIp: '1.1.1.1', createdAt: '' },
      { id: '2', level: 'patterns', title: 'P', description: '', authorId: 'u1', authorName: 'A', authorIp: '1.1.1.1', createdAt: '' },
    ],
    wcagItems: [
      { id: 'w1', principle: 'Perceptible', code: '1.4.3', name: 'C', level: 'AA', status: 'pass', elementSelectorOrLocation: '', observations: '', recommendation: '' },
      { id: 'w2', principle: 'Operable', code: '2.1.1', name: 'K', level: 'A', status: 'pending', elementSelectorOrLocation: '', observations: '', recommendation: '' },
    ],
  });

  const iceProg = calculateMethodProgress(proj, 'iceberg_model');
  assert.equal(iceProg.percent, 50);

  const wcagProg = calculateMethodProgress(proj, 'wcag_audit');
  assert.equal(wcagProg.percent, 50);

  const projProg = calculateProjectProgress(proj);
  assert.equal(projProg.overallPercent, 50);
  assert.equal(projProg.byMethod.length, 2);
});

test('Quantitative metrics extractor summarizes SUS, WCAG, survey ratings, and evidence count', () => {
  const proj = makeBaseProject({
    susRespondents: [
      { id: 's1', respondentName: 'P1', respondentRole: 'U', answers: [5, 1, 5, 1, 5, 1, 5, 1, 5, 1], susScore: 100, submittedAt: '' },
      { id: 's2', respondentName: 'P2', respondentRole: 'U', answers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3], susScore: 50, submittedAt: '' },
    ],
    surveyQuestions: [{ id: 'q1', type: 'rating_scale', title: 'Claridad', required: true }],
    surveyResponses: [
      { id: 'r1', participantName: 'M', answers: { q1: 8 }, submittedAt: '' },
      { id: 'r2', participantName: 'J', answers: { q1: 10 }, submittedAt: '' },
    ],
    findings: [
      { id: 'f1', title: 'F1', sourceMethod: 'usability_sus', severityOrImportance: 'Alta', description: '', evidence: '', recommendation: '', status: 'aprobado', authorName: 'A' },
    ],
  });

  const metrics = extractProjectQuantitativeMetrics(proj);
  assert.equal(metrics.avgSus, 75);
  assert.equal(metrics.avgSurveyRating, 9);
  assert.equal(metrics.totalEvidenceCount, 4);
  assert.equal(metrics.approvedFindingsCount, 1);
});

test('CSV generation escapes quotes and commas cleanly', () => {
  const csv = generateCsv(['Nombre', 'Comentario'], [['Ana', 'Rápido, claro y "útil"']]);
  assert.equal(csv, 'Nombre,Comentario\nAna,"Rápido, claro y ""útil"""');
});

test('findUserByIp locates matching IP-bound user and returns undefined otherwise', () => {
  const users: User[] = [
    { id: 'u1', name: 'Admin', role: 'Lead', email: 'a@s.co', avatarColor: '#78A68E', ipAddress: '127.0.0.1', isAdmin: true },
    { id: 'u2', name: 'Laura', role: 'UX', email: 'l@s.co', avatarColor: '#A194BF', ipAddress: '181.53.194.72', isAdmin: false },
  ];
  assert.equal(findUserByIp(users, ' 181.53.194.72 ')?.id, 'u2');
  assert.equal(findUserByIp(users, '10.0.0.99'), undefined);
});

test('getAccessibleProjects restricts regular users and shows all in Admin view', () => {
  const admin: User = { id: 'u1', name: 'Admin', role: 'Lead', email: '', avatarColor: '', ipAddress: '127.0.0.1', isAdmin: true };
  const member: User = { id: 'u2', name: 'Laura', role: 'UX', email: '', avatarColor: '', ipAddress: '181.53.194.72', isAdmin: false };
  const list = [
    makeBaseProject({ id: 'p1', leadId: 'u1', collaboratorIds: ['u1', 'u2'] }),
    makeBaseProject({ id: 'p2', leadId: 'u1', collaboratorIds: ['u1'] }),
  ];

  assert.equal(getAccessibleProjects(list, member, false).map((p) => p.id).join(','), 'p1');
  assert.equal(getAccessibleProjects(list, member, true).map((p) => p.id).join(','), 'p1');
  assert.equal(getAccessibleProjects(list, admin, true).length, 2);
});

test('toggleProjectUserAccess grants and revokes collaborator access cleanly', () => {
  const base = makeBaseProject({ id: 'p2', leadId: 'u1', collaboratorIds: ['u1'] });
  const granted = toggleProjectUserAccess(base, 'u2');
  assert.deepEqual(granted.collaboratorIds, ['u1', 'u2']);
  const revoked = toggleProjectUserAccess(granted, 'u2');
  assert.deepEqual(revoked.collaboratorIds, ['u1']);
});
