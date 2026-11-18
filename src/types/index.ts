/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Core Domain Types
 */

export type EvaluationMethodId =
  | 'heuristic_evaluation'
  | 'usability_sus'
  | 'customer_journey'
  | 'card_sorting'
  | 'wcag_audit'
  | 'impact_effort'
  | 'service_blueprint'
  | 'iceberg_model'
  | 'survey_feedback';

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  ipAddress: string;
  isAdmin?: boolean;
}

export interface MethodMetadata {
  id: EvaluationMethodId;
  name: string;
  category: 'Usabilidad & UI' | 'Arquitectura & Flujos' | 'Accesibilidad & Sistemas' | 'Voz del Usuario';
  summary: string;
  durationEstimate: string;
  whenToUse: string;
  stepByStepGuide: string[];
  deliverables: string[];
}

export type IcebergLevel = 'events' | 'patterns' | 'structures' | 'mental_models';

export interface IcebergItem {
  id: string;
  level: IcebergLevel;
  title: string;
  description: string;
  evidence?: string;
  leveragePoint?: string;
  authorId: string;
  authorName: string;
  authorIp: string;
  createdAt: string;
}

export interface HeuristicItem {
  id: string;
  heuristicNumber: number;
  heuristicTitle: string;
  title: string;
  screenOrFlow: string;
  severity: 0 | 1 | 2 | 3 | 4;
  frequency: 1 | 2 | 3;
  description: string;
  recommendation: string;
  status: 'pendiente' | 'aprobado';
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface JourneyTouchpoint {
  id: string;
  stageName: string;
  userGoal: string;
  userAction: string;
  thoughts: string;
  sentiment: number;
  touchpointChannels: string[];
  painPoints: string[];
  opportunities: string[];
  authorId: string;
  authorName: string;
}

export interface UsabilityTask {
  id: string;
  title: string;
  scenario: string;
  successRate: number;
  avgTimeSeconds: number;
  seqScore: number;
  frictionNotes: string[];
}

export interface SusRespondent {
  id: string;
  respondentName: string;
  respondentRole: string;
  answers: number[];
  susScore: number;
  openFeedback?: string;
  submittedAt: string;
}

export interface CardCategory {
  id: string;
  name: string;
  color: string;
}

export interface CardSortItem {
  id: string;
  label: string;
  description: string;
  assignedCategory?: string;
}

export interface WcagCriterion {
  id: string;
  principle: 'Perceptible' | 'Operable' | 'Comprensible' | 'Robusto';
  code: string;
  name: string;
  level: 'A' | 'AA';
  status: 'pending' | 'pass' | 'fail' | 'not_applicable';
  elementSelectorOrLocation: string;
  observations: string;
  recommendation: string;
}

export interface ImpactEffortItem {
  id: string;
  title: string;
  description: string;
  impact: number;
  effort: number;
  category: string;
  votes: number;
  votedUserIds: string[];
  authorId: string;
  authorName: string;
  status: 'propuesto' | 'aprobado';
}

export interface BlueprintColumn {
  id: string;
  stepName: string;
  physicalEvidence: string;
  customerAction: string;
  frontstageContact: string;
  backstageProcess: string;
  supportSystems: string;
  painPoints: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'rating_scale' | 'multiple_choice' | 'yes_no' | 'text';
  title: string;
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  id: string;
  participantName: string;
  participantEmail?: string;
  answers: Record<string, string | number>;
  generalFeedback?: string;
  submittedAt: string;
}

export interface Finding {
  id: string;
  title: string;
  sourceMethod: EvaluationMethodId;
  severityOrImportance: 'Alta' | 'Media' | 'Baja';
  description: string;
  evidence: string;
  recommendation: string;
  status: 'borrador' | 'aprobado';
  authorName: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Project {
  id: string;
  companyId: string;
  title: string;
  objective: string;
  scope: string;
  productType: string;
  status: 'activo' | 'en_analisis' | 'finalizado';
  leadId: string;
  collaboratorIds: string[];
  activeMethods: EvaluationMethodId[];
  updatedAt: string;
  icebergItems: IcebergItem[];
  heuristicItems: HeuristicItem[];
  journeyStages: JourneyTouchpoint[];
  usabilityTasks: UsabilityTask[];
  susRespondents: SusRespondent[];
  cardCategories: CardCategory[];
  cardItems: CardSortItem[];
  wcagItems: WcagCriterion[];
  impactEffortItems: ImpactEffortItem[];
  blueprintSteps: BlueprintColumn[];
  surveyQuestions: SurveyQuestion[];
  surveyResponses: SurveyResponse[];
  findings: Finding[];
}
