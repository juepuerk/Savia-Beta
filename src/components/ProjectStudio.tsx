/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet Project Evaluation Studio with Live Method Progress Bars
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  BookOpen,
  CheckSquare,
  BarChart3,
} from 'lucide-react';
import { EvaluationMethodId, Project } from '../types';
import { METHODS_CATALOG } from '../data/initialData';
import { calculateMethodProgress, calculateProjectProgress } from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';
import { MethodIcon } from './MethodIcon';
import { VisionDashboardView } from './VisionDashboardView';
import { PedagogicalGuide } from './PedagogicalGuide';
import { FindingsApprovalView } from './FindingsApprovalView';
import { IcebergTool } from './tools/IcebergTool';
import { HeuristicTool } from './tools/HeuristicTool';
import { JourneyMapTool } from './tools/JourneyMapTool';
import { UsabilitySusTool } from './tools/UsabilitySusTool';
import { CardSortingTool } from './tools/CardSortingTool';
import { WcagTool } from './tools/WcagTool';
import { ImpactEffortTool } from './tools/ImpactEffortTool';
import { ServiceBlueprintTool } from './tools/ServiceBlueprintTool';
import { SurveyTool } from './tools/SurveyTool';

interface ProjectStudioProps {
  project: Project;
  initialTool?: EvaluationMethodId | 'summary';
  onBack: () => void;
  onOpenAiSynthesis: () => void;
  onOpenReportModal: () => void;
  onOpenParticipantPortal: (projectId: string) => void;
}

export const ProjectStudio: React.FC<ProjectStudioProps> = ({
  project,
  initialTool,
  onBack,
  onOpenAiSynthesis,
  onOpenReportModal,
  onOpenParticipantPortal,
}) => {
  const availableMethods =
    project.activeMethods.length > 0
      ? project.activeMethods
      : (['iceberg_model'] as EvaluationMethodId[]);

  const [activeTool, setActiveTool] = useState<EvaluationMethodId | 'findings' | 'summary'>(
    initialTool || availableMethods[0]
  );
  const [showGuide, setShowGuide] = useState(false);

  const activeMethodMeta = METHODS_CATALOG.find((m) => m.id === activeTool);
  const projectProgress = calculateProjectProgress(project);

  const renderTool = () => {
    if (activeTool === 'summary') {
      return (
        <VisionDashboardView
          embeddedInStudio
          projects={[project]}
          selectedProjectId={project.id}
          onOpenMethod={(_, m) => setActiveTool(m)}
        />
      );
    }

    if (activeTool === 'findings') {
      return <FindingsApprovalView project={project} />;
    }

    switch (activeTool) {
      case 'iceberg_model':
        return <IcebergTool project={project} />;
      case 'heuristic_evaluation':
        return <HeuristicTool project={project} />;
      case 'customer_journey':
        return <JourneyMapTool project={project} />;
      case 'usability_sus':
        return <UsabilitySusTool project={project} />;
      case 'card_sorting':
        return <CardSortingTool project={project} />;
      case 'wcag_audit':
        return <WcagTool project={project} />;
      case 'impact_effort':
        return <ImpactEffortTool project={project} />;
      case 'service_blueprint':
        return <ServiceBlueprintTool project={project} />;
      case 'survey_feedback':
        return (
          <SurveyTool
            project={project}
            onOpenParticipantPortal={() => onOpenParticipantPortal(project.id)}
          />
        );
      default:
        return <IcebergTool project={project} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Top Bar */}
      <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] hover:text-[#F4F1FF] rounded-xl transition-colors shrink-0"
            title="Volver a proyectos"
            aria-label="Volver a proyectos"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#F4F1FF] truncate">
              {project.title}
            </h1>
            <p className="text-xs text-[#A89EC9] truncate">{project.objective}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block w-36">
            <MethodProgressBar
              percent={projectProgress.overallPercent}
              label="Total"
              size="xs"
            />
          </div>

          {activeMethodMeta && (
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className={`p-2 rounded-xl border transition-colors ${
                showGuide
                  ? 'bg-[#241B46] border-[#B892FF] text-[#D8B4FE]'
                  : 'bg-[#1E1638] border-[#463578] text-[#C4B5FD] hover:border-[#B892FF]'
              }`}
              title="Guía metodológica"
              aria-label="Mostrar guía metodológica"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAiSynthesis}
            className="p-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-xl transition-colors"
            title="Sintetizar evidencia con IA"
            aria-label="Sintetizar evidencia con IA"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title="Generar informe ejecutivo"
            aria-label="Generar informe ejecutivo"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Method Selector Bar with Individual Method Progress Bars */}
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTool('summary')}
          className={`px-3 py-2 text-xs rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTool === 'summary'
              ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF] font-medium shadow-[0_0_14px_rgba(184,146,255,0.18)]'
              : 'bg-[#120E24]/80 border-[#2A2248] text-[#A89EC9] hover:text-[#F4F1FF] hover:border-[#463578]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>Resumen ({projectProgress.overallPercent}%)</span>
        </button>

        {availableMethods.map((methodId) => {
          const meta = METHODS_CATALOG.find((m) => m.id === methodId);
          const shortName = meta ? meta.name.split(' (')[0] : methodId;
          const isActive = activeTool === methodId;
          const prog = calculateMethodProgress(project, methodId);

          return (
            <button
              key={methodId}
              type="button"
              onClick={() => setActiveTool(methodId)}
              className={`min-w-[168px] px-3 py-2 text-xs rounded-xl border transition-all whitespace-nowrap text-left space-y-1.5 ${
                isActive
                  ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF] font-medium shadow-[0_0_14px_rgba(184,146,255,0.18)]'
                  : 'bg-[#120E24]/80 border-[#2A2248] text-[#A89EC9] hover:text-[#F4F1FF] hover:border-[#463578]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MethodIcon methodId={methodId} variant="inline" size="sm" />
                  <span className="truncate font-bold">{shortName}</span>
                </div>
                <span className="font-mono tabular-nums text-[10px] text-[#22D3EE] shrink-0">
                  {prog.percent}%
                </span>
              </div>
              <MethodProgressBar percent={prog.percent} showPercent={false} size="xs" />
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setActiveTool('findings')}
          className={`px-3 py-2 text-xs rounded-xl border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTool === 'findings'
              ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF] font-medium'
              : 'bg-[#120E24]/80 border-[#2A2248] text-[#A89EC9] hover:text-[#F4F1FF] hover:border-[#463578]'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-[#FF6B1A]" />
          <span>Hallazgos ({project.findings.length})</span>
        </button>
      </div>

      {/* Optional Pedagogical Guide */}
      {showGuide && activeMethodMeta && <PedagogicalGuide method={activeMethodMeta} />}

      {/* Active Tool */}
      {renderTool()}
    </div>
  );
};
