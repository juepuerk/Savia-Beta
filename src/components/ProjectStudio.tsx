/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Project studio: breadcrumb, actions, method tabs and active tool
 */

import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, BookOpen, CheckSquare, ChevronRight, FileText, Sparkles } from 'lucide-react';
import { EvaluationMethodId, Project } from '../types';
import { METHODS_CATALOG } from '../data/initialData';
import { calculateMethodProgress, calculateProjectProgress } from '../utils/evaluationLogic';
import { useAiStatus } from '../hooks/useAiStatus';
import type { StudioTool } from '../hooks/useRoute';
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

const SEEN_GUIDES_KEY = 'savia_seen_guides_v1';

function readSeenGuides(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_GUIDES_KEY) || '[]');
  } catch {
    return [];
  }
}

function markGuideSeen(methodId: string) {
  try {
    const seen = new Set(readSeenGuides());
    seen.add(methodId);
    localStorage.setItem(SEEN_GUIDES_KEY, JSON.stringify([...seen]));
  } catch {
    // Storage unavailable: the guide will open again next time, which is harmless.
  }
}

interface ProjectStudioProps {
  project: Project;
  activeTool?: StudioTool;
  onChangeTool: (tool: StudioTool) => void;
  onBack: () => void;
  onOpenAiSynthesis: () => void;
  onOpenReportModal: () => void;
  onOpenParticipantPortal: (projectId: string) => void;
}

const tabClass = (active: boolean) =>
  `rounded-xl border transition-colors shrink-0 ${
    active
      ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF] font-medium shadow-[0_0_14px_rgba(184,146,255,0.18)]'
      : 'bg-[#120E24]/80 border-[#2A2248] text-[#A89EC9] hover:text-[#F4F1FF] hover:border-[#463578]'
  }`;

export const ProjectStudio: React.FC<ProjectStudioProps> = ({
  project,
  activeTool: requestedTool,
  onChangeTool,
  onBack,
  onOpenAiSynthesis,
  onOpenReportModal,
  onOpenParticipantPortal,
}) => {
  const availableMethods =
    project.activeMethods.length > 0
      ? project.activeMethods
      : (['iceberg_model'] as EvaluationMethodId[]);

  const isValidTool =
    requestedTool === 'summary' ||
    requestedTool === 'findings' ||
    (requestedTool !== undefined && availableMethods.includes(requestedTool));
  const activeTool: StudioTool = isValidTool ? requestedTool! : availableMethods[0];

  const activeMethodMeta = METHODS_CATALOG.find((m) => m.id === activeTool);
  const projectProgress = calculateProjectProgress(project);
  const aiAvailable = useAiStatus();

  // Open the method guide automatically the first time someone uses each method.
  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => {
    if (!activeMethodMeta) {
      setShowGuide(false);
      return;
    }
    const firstTime = !readSeenGuides().includes(activeMethodMeta.id);
    setShowGuide(firstTime);
    if (firstTime) markGuideSeen(activeMethodMeta.id);
  }, [activeMethodMeta?.id]);

  // Keep the active tab visible in the horizontally scrolling bar.
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTool]);

  const aiTitle =
    aiAvailable === false
      ? 'La IA no está disponible en esta versión beta'
      : 'Proponer hallazgos a partir de la evidencia recopilada';

  const renderTool = () => {
    if (activeTool === 'summary') {
      return (
        <VisionDashboardView
          embeddedInStudio
          projects={[project]}
          selectedProjectId={project.id}
          onOpenMethod={(_, m) => onChangeTool(m)}
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
      {/* Studio header: breadcrumb, title and actions */}
      <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 sm:p-5 space-y-4">
        <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-sm text-[#A89EC9] min-w-0">
          <button type="button" onClick={onBack} className="hover:text-[#F4F1FF] hover:underline underline-offset-4 shrink-0">
            Proyectos
          </button>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="text-[#F4F1FF] truncate">
            {project.title}
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#F4F1FF] leading-tight">{project.title}</h1>
            <p className="text-sm text-[#A89EC9] line-clamp-2">{project.objective}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="w-full sm:w-36 order-last sm:order-none">
              <MethodProgressBar percent={projectProgress.overallPercent} label="Avance total" size="xs" />
            </div>

            {activeMethodMeta && (
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                aria-pressed={showGuide}
                aria-controls="method-guide"
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
                  showGuide
                    ? 'bg-[#241B46] border-[#B892FF] text-[#F4F1FF]'
                    : 'bg-[#1E1638] border-[#463578] text-[#C4B5FD] hover:border-[#B892FF]'
                }`}
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                Guía
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAiSynthesis}
              disabled={aiAvailable === false}
              title={aiTitle}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-xl transition-colors disabled:opacity-50 disabled:hover:border-[#463578]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Síntesis IA
            </button>

            <button
              type="button"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              Informe
            </button>
          </div>
        </div>
      </div>

      {/* Method tabs with individual progress */}
      <nav aria-label="Herramientas del proyecto" className="flex items-stretch gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          ref={activeTool === 'summary' ? activeTabRef : undefined}
          type="button"
          onClick={() => onChangeTool('summary')}
          aria-current={activeTool === 'summary' ? 'page' : undefined}
          className={`${tabClass(activeTool === 'summary')} px-3 py-2 text-sm flex items-center gap-1.5 whitespace-nowrap`}
        >
          <BarChart3 className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
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
              ref={isActive ? activeTabRef : undefined}
              type="button"
              onClick={() => onChangeTool(methodId)}
              aria-current={isActive ? 'page' : undefined}
              className={`${tabClass(isActive)} min-w-[176px] px-3 py-2 text-sm whitespace-nowrap text-left space-y-1.5`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MethodIcon methodId={methodId} variant="inline" size="sm" />
                  <span className="truncate font-semibold">{shortName}</span>
                </div>
                <span className="font-mono tabular-nums text-xs text-[#22D3EE] shrink-0">{prog.percent}%</span>
              </div>
              <MethodProgressBar percent={prog.percent} showPercent={false} size="xs" />
            </button>
          );
        })}

        <button
          ref={activeTool === 'findings' ? activeTabRef : undefined}
          type="button"
          onClick={() => onChangeTool('findings')}
          aria-current={activeTool === 'findings' ? 'page' : undefined}
          className={`${tabClass(activeTool === 'findings')} px-3 py-2 text-sm flex items-center gap-1.5 whitespace-nowrap`}
        >
          <CheckSquare className="w-4 h-4 text-[#FF6B1A]" aria-hidden="true" />
          <span>Hallazgos ({project.findings.length})</span>
        </button>
      </nav>

      {showGuide && activeMethodMeta && (
        <div id="method-guide">
          <PedagogicalGuide method={activeMethodMeta} onClose={() => setShowGuide(false)} />
        </div>
      )}

      {renderTool()}
    </div>
  );
};
