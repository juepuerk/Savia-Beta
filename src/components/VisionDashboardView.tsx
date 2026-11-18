/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Vision UI Inspired Project Analytics & Quantitative Dashboard
 */

import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ChevronDown,
  Clock,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { EvaluationMethodId, Project } from '../types';
import { METHODS_CATALOG } from '../data/initialData';
import {
  calculateProjectProgress,
  extractProjectQuantitativeMetrics,
} from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';
import { MethodIcon } from './MethodIcon';

interface VisionDashboardViewProps {
  projects: Project[];
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onOpenMethod: (projectId: string, methodId: EvaluationMethodId) => void;
  embeddedInStudio?: boolean;
}

type ChartMode = 'methods' | 'journey' | 'tasks';

export const VisionDashboardView: React.FC<VisionDashboardViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenMethod,
  embeddedInStudio = false,
}) => {
  const [internalProjectId, setInternalProjectId] = useState<string>(
    selectedProjectId || projects[0]?.id || ''
  );
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeProject = useMemo(() => {
    const targetId = selectedProjectId || internalProjectId;
    return projects.find((p) => p.id === targetId) || projects[0] || null;
  }, [projects, selectedProjectId, internalProjectId]);

  const [chartMode, setChartMode] = useState<ChartMode>('methods');

  if (!activeProject) {
    return (
      <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-12 text-center space-y-2">
        <Activity className="w-6 h-6 text-[#B892FF] mx-auto" />
        <p className="text-sm text-[#A89EC9]">
          No hay proyectos asignados a tu IP todavía.
        </p>
      </div>
    );
  }

  const progress = calculateProjectProgress(activeProject);
  const metrics = extractProjectQuantitativeMetrics(activeProject);

  const hasJourney = metrics.journeySentimentSeries.length > 0;
  const hasTasks = activeProject.usabilityTasks.length > 0;

  const effectiveMode: ChartMode =
    chartMode === 'journey' && !hasJourney
      ? 'methods'
      : chartMode === 'tasks' && !hasTasks
      ? 'methods'
      : chartMode;

  const splineData = useMemo(() => {
    if (effectiveMode === 'journey') {
      return metrics.journeySentimentSeries.map((s) => ({
        label: s.label.replace(/^\d+\.\s*/, ''),
        value: Math.round(((s.score + 2) / 4) * 100),
        display: `${s.score > 0 ? `+${s.score}` : s.score} emoción`,
      }));
    }
    if (effectiveMode === 'tasks') {
      return activeProject.usabilityTasks.map((t) => ({
        label: t.title.replace(/^Tarea\s*\d+:\s*/i, ''),
        value: t.successRate,
        display: `${t.successRate}% éxito · ${t.avgTimeSeconds}s`,
      }));
    }
    return progress.byMethod.map((m) => {
      const meta = METHODS_CATALOG.find((c) => c.id === m.methodId);
      return {
        label: meta ? meta.name.split(' (')[0] : m.methodId,
        value: m.percent,
        display: `${m.percent}% (${m.completedLabel})`,
      };
    });
  }, [effectiveMode, metrics.journeySentimentSeries, activeProject.usabilityTasks, progress.byMethod]);

  const statusMeta =
    activeProject.status === 'finalizado'
      ? { label: 'Finalizado', cls: 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]' }
      : activeProject.status === 'en_analisis'
      ? { label: 'En análisis', cls: 'bg-[#241B46] border-[#B892FF]/45 text-[#D8B4FE]' }
      : { label: 'Activo', cls: 'bg-[#2B1710] border-[#FF6B1A]/45 text-[#FF823A]' };

  // SVG Gauge Geometry (270 deg arc)
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75;
  const maxArc = circumference * arcFraction;
  const filledArc = maxArc * (progress.overallPercent / 100);

  // SVG Spline Geometry
  const svgW = 540;
  const svgH = 190;
  const padX = 28;
  const padY = 22;
  const plotW = svgW - padX * 2;
  const plotH = svgH - padY * 2;

  const points = splineData.map((d, idx) => {
    const x =
      splineData.length <= 1
        ? padX + plotW / 2
        : padX + (idx / (splineData.length - 1)) * plotW;
    const y = padY + plotH - (Math.max(0, Math.min(100, d.value)) / 100) * plotH;
    return { x, y, ...d };
  });

  const buildSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${padX} ${pts[0].y} L ${svgW - padX} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${svgH - padY} L ${points[0].x} ${svgH - padY} Z`
      : '';

  const quantitativeRows = [
    {
      label: 'Puntaje SUS promedio',
      value: metrics.avgSus !== null ? `${metrics.avgSus} / 100` : '—',
      ref: 'Meta ≥ 68',
      accent: '#22D3EE',
    },
    {
      label: 'Tasa de éxito en tareas',
      value: metrics.avgTaskSuccess !== null ? `${metrics.avgTaskSuccess}%` : '—',
      ref: metrics.avgTaskTime !== null ? `${metrics.avgTaskTime}s prom.` : 'Sin sesiones',
      accent: '#FF6B1A',
    },
    {
      label: 'Facilidad percibida (SEQ)',
      value: metrics.avgSeq !== null ? `${metrics.avgSeq} / 7` : '—',
      ref: 'Escala 1–7',
      accent: '#B892FF',
    },
    {
      label: 'Conformidad WCAG 2.2 AA',
      value: metrics.wcagRate !== null ? `${metrics.wcagRate}%` : '—',
      ref: 'Nivel AA',
      accent: '#22D3EE',
    },
    {
      label: 'Profundidad Iceberg (90%)',
      value: metrics.icebergDeepRatio !== null ? `${metrics.icebergDeepRatio}%` : '—',
      ref: 'Estructuras + Modelos',
      accent: '#B892FF',
    },
    {
      label: 'Severidad heurística prom.',
      value: metrics.avgHeuristicSeverity !== null ? `${metrics.avgHeuristicSeverity} / 4` : '—',
      ref: 'Nielsen 0–4',
      accent: '#EC4899',
    },
    {
      label: 'Calificación encuesta ext.',
      value: metrics.avgSurveyRating !== null ? `${metrics.avgSurveyRating} / 10` : '—',
      ref: `${activeProject.surveyResponses.length} resp.`,
      accent: '#FF6B1A',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Project Switcher (when rendered at workspace level) */}
      {!embeddedInStudio && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F1FF]">
              Panel Analítico de Proyectos
            </h1>
            <p className="text-xs text-[#958AC0] font-mono mt-0.5">
              Estado, avance metodológico y vista previa cuantitativa
            </p>
          </div>

          {projects.length <= 2 ? (
            <div className="flex flex-wrap items-center gap-2">
              {projects.map((p) => {
                const selected = p.id === activeProject.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setInternalProjectId(p.id);
                      setHoveredIdx(null);
                      onSelectProject?.(p.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                      selected
                        ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF] font-medium shadow-[0_0_16px_rgba(184,146,255,0.18)]'
                        : 'bg-[#120E24]/80 border-[#2A2248] text-[#A89EC9] hover:border-[#B892FF]/45 hover:text-[#F4F1FF]'
                    }`}
                  >
                    {p.title.split(':')[0]}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <span className="text-xs font-mono text-[#B892FF] shrink-0 hidden sm:inline">
                {projects.length} proyectos
              </span>
              <div className="relative flex-1 md:w-[340px]">
                <select
                  aria-label="Seleccionar proyecto"
                  value={activeProject.id}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setInternalProjectId(nextId);
                    setHoveredIdx(null);
                    onSelectProject?.(nextId);
                  }}
                  className="w-full appearance-none bg-[#0E0A1D] border border-[#463578] hover:border-[#B892FF] focus:border-[#B892FF] focus:outline-none text-[#F4F1FF] rounded-xl pl-3.5 pr-9 py-2 text-xs font-medium cursor-pointer transition-colors shadow-[0_0_16px_rgba(184,146,255,0.12)]"
                >
                  {projects.map((p) => {
                    const pct = calculateProjectProgress(p).overallPercent;
                    return (
                      <option key={p.id} value={p.id} className="bg-[#120E24] text-[#F4F1FF]">
                        {p.title.split(':')[0]} ({pct}%)
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-[#B892FF] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 1: 4 Vision UI KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
              Avance Total
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {progress.overallPercent}%
              </span>
              <span className="text-xs font-mono text-[#22D3EE]">
                {progress.byMethod.length} métodos
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FF6B1A] text-[#090616] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,107,26,0.35)]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
              Escala SUS / Éxito
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {metrics.avgSus !== null ? metrics.avgSus : metrics.avgTaskSuccess !== null ? `${metrics.avgTaskSuccess}%` : '—'}
              </span>
              <span className="text-xs font-mono text-[#B892FF]">
                {metrics.avgSus !== null ? '/ 100 pts' : metrics.avgTaskSuccess !== null ? 'éxito' : 'sin datos'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1E1638] border border-[#463578] text-[#B892FF] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
              {metrics.wcagRate !== null ? 'Conformidad WCAG' : metrics.icebergDeepRatio !== null ? 'Profundidad Sistémica' : 'Severidad Prom.'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {metrics.wcagRate !== null
                  ? `${metrics.wcagRate}%`
                  : metrics.icebergDeepRatio !== null
                  ? `${metrics.icebergDeepRatio}%`
                  : metrics.avgHeuristicSeverity !== null
                  ? metrics.avgHeuristicSeverity
                  : '—'}
              </span>
              <span className="text-xs font-mono text-[#22D3EE]">
                {metrics.wcagRate !== null ? 'AA' : metrics.icebergDeepRatio !== null ? '90% base' : '0–4'}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0F242C] border border-[#22D3EE]/35 text-[#22D3EE] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
              Evidencia & Hallazgos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {metrics.totalEvidenceCount}
              </span>
              <span className="text-xs font-mono text-[#EC4899]">
                {metrics.approvedFindingsCount}/{metrics.totalFindingsCount} aprob.
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#2B1228] border border-[#EC4899]/40 text-[#F472B6] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Hero Bento — Radial Gauge ("Estado del Proyecto") + Smooth Gradient Spline ("Preview Cuantitativo") */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Vision UI Radial Gauge Card */}
        <div className="lg:col-span-4 bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
                Estado del Proyecto
              </span>
              <h2 className="text-sm font-semibold text-[#F4F1FF] mt-0.5 truncate">
                {activeProject.title}
              </h2>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg border text-xs font-mono shrink-0 ${statusMeta.cls}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <svg width="160" height="150" viewBox="0 0 160 150" aria-label={`Avance global ${progress.overallPercent}%`}>
              <defs>
                <linearGradient id="saviaGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="50%" stopColor="#B892FF" />
                  <stop offset="100%" stopColor="#FF6B1A" />
                </linearGradient>
              </defs>
              <g transform="translate(80,82) rotate(135)">
                <circle
                  r={radius}
                  cx={0}
                  cy={0}
                  fill="none"
                  stroke="#1D163A"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${maxArc} ${circumference}`}
                />
                <circle
                  r={radius}
                  cx={0}
                  cy={0}
                  fill="none"
                  stroke="url(#saviaGaugeGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${filledArc} ${circumference}`}
                />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-3xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {progress.overallPercent}%
              </span>
              <span className="text-xs text-[#A89EC9]">Diligenciado</span>
            </div>
          </div>

          <div className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-[#A89EC9] truncate pr-2">{activeProject.productType}</span>
            <span className="font-mono text-[#B892FF] shrink-0">
              {activeProject.updatedAt}
            </span>
          </div>
        </div>

        {/* Right: Smooth Gradient Spline Area Chart */}
        <div className="lg:col-span-8 bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
                Preview de Data Cuantitativa
              </span>
              <h2 className="text-sm font-semibold text-[#F4F1FF] mt-0.5">
                {effectiveMode === 'journey'
                  ? 'Curva Emocional de Experiencia (Journey)'
                  : effectiveMode === 'tasks'
                  ? 'Tasa de Éxito por Tarea de Usabilidad (%)'
                  : 'Índice de Avance por Metodología (%)'}
              </h2>
            </div>

            {/* Lilac Secondary Interactive Series Switcher */}
            <div className="flex items-center gap-1 bg-[#0E0A1D] p-1 rounded-xl border border-[#241D42]">
              <button
                type="button"
                onClick={() => {
                  setChartMode('methods');
                  setHoveredIdx(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  effectiveMode === 'methods'
                    ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/50 font-medium'
                    : 'text-[#A89EC9] hover:text-[#F4F1FF]'
                }`}
              >
                Métodos
              </button>
              <button
                type="button"
                disabled={!hasJourney}
                onClick={() => {
                  setChartMode('journey');
                  setHoveredIdx(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors disabled:opacity-40 ${
                  effectiveMode === 'journey'
                    ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/50 font-medium'
                    : 'text-[#A89EC9] hover:text-[#F4F1FF]'
                }`}
              >
                Journey
              </button>
              <button
                type="button"
                disabled={!hasTasks}
                onClick={() => {
                  setChartMode('tasks');
                  setHoveredIdx(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors disabled:opacity-40 ${
                  effectiveMode === 'tasks'
                    ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/50 font-medium'
                    : 'text-[#A89EC9] hover:text-[#F4F1FF]'
                }`}
              >
                Tareas
              </button>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative w-full overflow-hidden">
            {points.length === 0 ? (
              <div className="h-[190px] flex items-center justify-center text-xs text-[#958AC0] bg-[#0E0A1D]/60 rounded-xl border border-[#241D42]">
                Registra datos en los métodos activos para visualizar la curva.
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                className="w-full h-[195px] overflow-visible"
                role="img"
                aria-label="Gráfico cuantitativo de avance y desempeño"
              >
                <defs>
                  <linearGradient id="saviaAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.34" />
                    <stop offset="55%" stopColor="#B892FF" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="saviaStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="50%" stopColor="#B892FF" />
                    <stop offset="100%" stopColor="#FF6B1A" />
                  </linearGradient>
                </defs>

                {/* Subtle Horizontal Dashed Grid */}
                {[0, 25, 50, 75, 100].map((tick) => {
                  const y = padY + plotH - (tick / 100) * plotH;
                  return (
                    <g key={tick}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgW - padX}
                        y2={y}
                        stroke="#241D42"
                        strokeDasharray="3 4"
                      />
                      <text
                        x={6}
                        y={y + 3}
                        fill="#7D71A4"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                <path d={areaPath} fill="url(#saviaAreaFill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#saviaStrokeGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {points.map((pt, idx) => {
                  const isHover = hoveredIdx === idx;
                  return (
                    <g
                      key={idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHover ? 7 : 4.5}
                        fill={isHover ? '#FF6B1A' : '#22D3EE'}
                        stroke="#090616"
                        strokeWidth="2"
                      />
                      <text
                        x={pt.x}
                        y={svgH - 4}
                        textAnchor="middle"
                        fill={isHover ? '#F4F1FF' : '#7D71A4'}
                        fontSize="9.5"
                      >
                        {pt.label.length > 13 ? pt.label.slice(0, 12) + '…' : pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {hoveredIdx !== null && points[hoveredIdx] && (
              <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#0E0A1D] border border-[#463578] text-xs flex items-center justify-between">
                <span className="text-[#F4F1FF] font-medium">{points[hoveredIdx].label}</span>
                <span className="font-mono text-[#22D3EE]">{points[hoveredIdx].display}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Methodologies Progress Bars & Bar Chart + Quantitative Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Methodologies & Progress Bars */}
        <div className="lg:col-span-7 bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
                Metodologías Activas
              </span>
              <h3 className="text-sm font-semibold text-[#F4F1FF]">
                Diligenciamiento por Herramienta
              </h3>
            </div>
            <Layers className="w-4 h-4 text-[#B892FF]" />
          </div>

          {/* Vision UI Gradient Bar Preview */}
          <div className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-4">
            <div className="flex items-end justify-around gap-3 h-28 pt-2">
              {progress.byMethod.map((m) => {
                const meta = METHODS_CATALOG.find((c) => c.id === m.methodId);
                const shortName = meta ? meta.name.split(' (')[0].split(' ')[0] : m.methodId;
                return (
                  <div key={m.methodId} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-xs font-mono tabular-nums text-[#A89EC9]">
                      {m.percent}%
                    </span>
                    <div className="w-full max-w-[34px] h-full bg-[#191234] rounded-lg flex items-end overflow-hidden p-0.5">
                      <div
                        className="w-full rounded-md transition-all duration-500"
                        style={{
                          height: `${Math.max(8, m.percent)}%`,
                          background: 'linear-gradient(180deg, #22D3EE 0%, #B892FF 55%, #FF6B1A 100%)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#958AC0] truncate max-w-[72px]">
                      {shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Horizontal Progress Bars */}
          <div className="space-y-3">
            {progress.byMethod.map((m) => {
              const meta = METHODS_CATALOG.find((c) => c.id === m.methodId);
              const name = meta ? meta.name.split(' (')[0] : m.methodId;
              return (
                <div
                  key={m.methodId}
                  className="bg-[#0E0A1D]/80 border border-[#241D42] hover:border-[#463578] rounded-xl p-3.5 flex items-center justify-between gap-4 transition-colors"
                >
                  <MethodIcon methodId={m.methodId} variant="badge" size="sm" />

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="block text-[14px] font-bold text-[#F4F1FF] truncate">
                          {name}
                        </span>
                        {meta && (
                          <span className="flex items-center gap-1 text-xs font-mono text-[#D8B4FE] mt-0.5">
                            <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
                            <span>{meta.durationEstimate}</span>
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#958AC0] shrink-0">
                        {m.completedLabel}
                      </span>
                    </div>
                    <MethodProgressBar percent={m.percent} showPercent size="sm" />
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenMethod(activeProject.id, m.methodId)}
                    className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-xl transition-colors shrink-0"
                    title={`Abrir ${name}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Abrir</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quantitative Indicators Summary Table */}
        <div className="lg:col-span-5 bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#958AC0] block">
              Indicadores Cuantitativos
            </span>
            <h3 className="text-sm font-semibold text-[#F4F1FF]">
              Vista Previa Consolidada
            </h3>
          </div>

          <div className="divide-y divide-[#221A3D] bg-[#0E0A1D] border border-[#241D42] rounded-xl px-4">
            {quantitativeRows.map((row) => (
              <div
                key={row.label}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: row.accent }}
                    />
                    <span className="text-[#F4F1FF] truncate">{row.label}</span>
                  </div>
                  <span className="text-xs font-mono text-[#958AC0] pl-4 block">
                    {row.ref}
                  </span>
                </div>

                <span className="font-mono tabular-nums font-bold text-[#F4F1FF] shrink-0">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {!embeddedInStudio && (
            <button
              type="button"
              onClick={() =>
                onOpenMethod(
                  activeProject.id,
                  activeProject.activeMethods[0] || 'iceberg_model'
                )
              }
              className="w-full py-2.5 px-4 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,26,0.28)]"
            >
              <span>Continuar Evaluación</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
