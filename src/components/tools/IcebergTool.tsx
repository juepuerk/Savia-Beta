/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Interactive Systems Thinking Iceberg Model Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, Check, Trash2, Waves, ArrowDown, Compass, Layers, Clock } from 'lucide-react';
import { IcebergItem, IcebergLevel, Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  calculateIcebergDepthCoverage,
  calculateMethodProgress,
} from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

interface LevelConfig {
  id: IcebergLevel;
  order: string;
  label: string;
  zone: 'above' | 'below';
  question: string;
  guideHint: string;
  placeholderTitle: string;
  placeholderLeverage: string;
  accentColor: string;
}

const ICEBERG_LEVELS: LevelConfig[] = [
  {
    id: 'events',
    order: '01',
    label: 'Eventos',
    zone: 'above',
    question: '¿Qué acaba de suceder o qué síntoma observamos?',
    guideHint:
      'Punta visible del iceberg (10%). Describe incidentes concretos o quejas recientes sin asumir aún la causa.',
    placeholderTitle: 'Ej. Los usuarios abandonan el formulario al llegar al pago',
    placeholderLeverage: 'Ej. Mostrar resumen de pasos antes de iniciar',
    accentColor: '#FF6B1A',
  },
  {
    id: 'patterns',
    order: '02',
    label: 'Patrones',
    zone: 'below',
    question: '¿Qué se repite a lo largo del tiempo o en qué momentos ocurre?',
    guideHint:
      'Mira semanas o meses atrás: horarios, dispositivos, perfiles o etapas donde se repite el comportamiento.',
    placeholderTitle: 'Ej. El abandono se duplica en Android los viernes por la tarde',
    placeholderLeverage: 'Ej. Optimizar validación en redes móviles lentas',
    accentColor: '#B892FF',
  },
  {
    id: 'structures',
    order: '03',
    label: 'Estructuras',
    zone: 'below',
    question: '¿Qué reglas, flujos, incentivos o arquitectura causan ese patrón?',
    guideHint:
      'Analiza dependencias entre áreas, políticas legales, orden de pasos, métricas o arquitectura técnica.',
    placeholderTitle: 'Ej. El cálculo de costos solo se consulta al final del flujo',
    placeholderLeverage: 'Ej. Integrar la consulta de tarifa desde el primer paso',
    accentColor: '#22D3EE',
  },
  {
    id: 'mental_models',
    order: '04',
    label: 'Modelos Mentales',
    zone: 'below',
    question: '¿Qué creencias, supuestos o cultura mantienen intacto el problema?',
    guideHint:
      'Nivel de mayor apalancamiento sistémico. Cuestiona supuestos implícitos del equipo, negocio o industria.',
    placeholderTitle: 'Ej. Creemos que mostrar términos técnicos genera más confianza',
    placeholderLeverage: 'Ej. Adoptar lenguaje ciudadano antes del anexo legal',
    accentColor: '#EC4899',
  },
];

export const IcebergTool: React.FC<{ project: Project }> = ({ project }) => {
  const { addIcebergItem, deleteIcebergItem, approveFinding, currentUser } = useWorkspace();

  const items = project.icebergItems || [];
  const coverage = calculateIcebergDepthCoverage(items);
  const methodProgress = calculateMethodProgress(project, 'iceberg_model');

  const [selectedLevel, setSelectedLevel] = useState<IcebergLevel>('events');
  const [filterMode, setFilterMode] = useState<'all' | IcebergLevel>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [leveragePoint, setLeveragePoint] = useState('');
  const [promotedIds, setPromotedIds] = useState<string[]>([]);

  const activeConfig =
    ICEBERG_LEVELS.find((l) => l.id === selectedLevel) || ICEBERG_LEVELS[0];

  const handleSelectStratum = (level: IcebergLevel) => {
    setSelectedLevel(level);
    setFilterMode(level);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addIcebergItem(project.id, {
      level: selectedLevel,
      title: title.trim(),
      description:
        description.trim() ||
        'Observación registrada colaborativamente dentro del análisis sistémico.',
      evidence: evidence.trim() || undefined,
      leveragePoint: leveragePoint.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setEvidence('');
    setLeveragePoint('');
  };

  const handlePromoteToFinding = (item: IcebergItem) => {
    const levelLabel = ICEBERG_LEVELS.find((l) => l.id === item.level)?.label || item.level;
    approveFinding(project.id, {
      title: item.title,
      sourceMethod: 'iceberg_model',
      severityOrImportance:
        item.level === 'structures' || item.level === 'mental_models' ? 'Alta' : 'Media',
      description: `${item.description} (Nivel sistémico: ${levelLabel})`,
      evidence: item.evidence || `Aportado por ${item.authorName} · IP ${item.authorIp}`,
      recommendation:
        item.leveragePoint ||
        'Intervenir en este nivel del sistema y validar con el equipo de producto.',
      status: 'aprobado',
    });
    setPromotedIds((prev) => [...prev, item.id]);
  };

  const visibleLevels =
    filterMode === 'all'
      ? ICEBERG_LEVELS
      : ICEBERG_LEVELS.filter((l) => l.id === filterMode);

  return (
    <div className="space-y-6">
      {/* Compact Systemic Balance & Progress Bar */}
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-[#2A2248] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="iceberg_model" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Modelo Iceberg</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'iceberg_model')?.durationEstimate}</span>
            </div>
            <p className="text-xs text-[#A89EC9] mt-1">
              Selecciona un estrato para explorar o registrar desde síntomas hacia causas raíz.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs shrink-0">
          <div className="w-40">
            <MethodProgressBar
              percent={methodProgress.percent}
              label={methodProgress.completedLabel}
              size="sm"
            />
          </div>
          <div className="h-7 w-px bg-[#2A2248]" />
          <div>
            <span className="text-[#7D71A4] block text-[11px]">Niveles</span>
            <span className="font-mono tabular-nums font-bold text-[#F4F1FF] text-sm">
              {coverage.levelsCovered} / 4
            </span>
          </div>
          <div>
            <span className="text-[#7D71A4] block text-[11px]">Profundidad</span>
            <span className="font-mono tabular-nums font-bold text-[#22D3EE] text-sm">
              {coverage.deepRatio}%
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Interactive Dark Violet Iceberg Cross-Section */}
        <div className="lg:col-span-5 bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#221A3D] flex items-center justify-between">
            <span className="text-xs font-medium text-[#A89EC9]">Estratos</span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 text-[11px] font-mono ${
                filterMode === 'all'
                  ? 'bg-[#241B46] border-[#B892FF]/65 text-[#D8B4FE]'
                  : 'bg-[#1E1638] border-[#463578] text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
              title="Ver todos los niveles"
              aria-label="Ver todos los niveles del iceberg"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{items.length}</span>
            </button>
          </div>

          <div className="relative">
            {/* Above Water Zone (10% tip) */}
            <div className="bg-gradient-to-b from-[#171130] to-[#120D26] px-5 pt-5 pb-4">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#7D71A4] mb-2">
                <span>SUPERFICIE</span>
                <span>10%</span>
              </div>

              {(() => {
                const lvl = ICEBERG_LEVELS[0];
                const count = coverage.counts[lvl.id];
                const isSelected = selectedLevel === lvl.id;
                return (
                  <button
                    type="button"
                    onClick={() => handleSelectStratum(lvl.id)}
                    className={`w-full text-left mx-auto max-w-[240px] block rounded-t-3xl rounded-b-lg p-3.5 border transition-all ${
                      isSelected
                        ? 'bg-[#241418] border-[#FF6B1A] ring-1 ring-[#FF6B1A]/45'
                        : 'bg-[#141028] border-[#2A2248] hover:border-[#463578]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#FF6B1A]">01 · Eventos</span>
                      <span className="font-mono tabular-nums text-[11px] text-[#A89EC9]">
                        {count}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A89EC9] leading-snug">
                      Síntomas visibles
                    </p>
                  </button>
                );
              })()}
            </div>

            {/* Waterline Divider */}
            <div className="relative flex items-center justify-center py-2 bg-[#0F242C] border-y border-[#22D3EE]/35 text-[11px] font-medium text-[#22D3EE]">
              <Waves className="w-3.5 h-3.5 mr-1.5" />
              <span>Línea de superficie</span>
            </div>

            {/* Submerged Iceberg Zone (90%) */}
            <div className="bg-gradient-to-b from-[#100E26] via-[#0D0A20] to-[#090616] px-5 py-4 space-y-2.5">
              {ICEBERG_LEVELS.slice(1).map((lvl, index) => {
                const count = coverage.counts[lvl.id];
                const isSelected = selectedLevel === lvl.id;
                const widthClass =
                  index === 0 ? 'max-w-[290px]' : index === 1 ? 'max-w-[340px]' : 'w-full';

                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleSelectStratum(lvl.id)}
                    className={`${widthClass} mx-auto block w-full text-left rounded-xl p-3.5 border transition-all ${
                      isSelected
                        ? 'bg-[#1A1436]'
                        : 'bg-[#110D24] border-[#241D42] hover:border-[#463578]'
                    }`}
                    style={{
                      borderColor: isSelected ? lvl.accentColor : undefined,
                      boxShadow: isSelected ? `0 0 0 1px ${lvl.accentColor}55` : undefined,
                    }}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold" style={{ color: lvl.accentColor }}>
                        {lvl.order} · {lvl.label}
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-[#A89EC9]">
                        {count}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D71A4] leading-snug">{lvl.question}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#0E0A1D] border-t border-[#221A3D] flex items-center gap-2 text-[11px] text-[#7D71A4]">
            <ArrowDown className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
            <span>Mayor profundidad = mayor impacto sistémico.</span>
          </div>
        </div>

        {/* RIGHT: Entry Form + Level Items */}
        <div className="lg:col-span-7 space-y-5">
          <form
            onSubmit={handleSubmit}
            className="bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#221A3D]">
              <div>
                <span
                  className="text-[11px] font-mono uppercase tracking-wider block"
                  style={{ color: activeConfig.accentColor }}
                >
                  {activeConfig.order} · {activeConfig.label}
                </span>
                <h4 className="text-sm font-semibold text-[#F4F1FF] mt-0.5">
                  {activeConfig.question}
                </h4>
              </div>

              <select
                aria-label="Seleccionar nivel del Modelo Iceberg"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as IcebergLevel)}
                className="px-3 py-1.5 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg font-medium text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              >
                {ICEBERG_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.order}. {l.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-[#A89EC9] bg-[#0E0A1D] border border-[#241D42] p-3 rounded-xl leading-relaxed">
              {activeConfig.guideHint}
            </p>

            <div>
              <label htmlFor="iceberg-title" className="block text-xs text-[#A89EC9] mb-1">
                Observación *
              </label>
              <input
                id="iceberg-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={activeConfig.placeholderTitle}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>

            <div>
              <label htmlFor="iceberg-desc" className="block text-xs text-[#A89EC9] mb-1">
                Contexto
              </label>
              <textarea
                id="iceberg-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Por qué ocurre y cómo afecta al sistema?"
                className="w-full px-3.5 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="iceberg-evidence" className="block text-xs text-[#A89EC9] mb-1">
                  Evidencia
                </label>
                <input
                  id="iceberg-evidence"
                  type="text"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Ej. 5 entrevistas, tickets..."
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
                />
              </div>
              <div>
                <label htmlFor="iceberg-leverage" className="block text-xs text-[#A89EC9] mb-1">
                  Punto de palanca
                </label>
                <input
                  id="iceberg-leverage"
                  type="text"
                  value={leveragePoint}
                  onChange={(e) => setLeveragePoint(e.target.value)}
                  placeholder={activeConfig.placeholderLeverage}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#7D71A4] font-mono">
                {currentUser.name} · {currentUser.ipAddress}
              </span>
              <button
                type="submit"
                className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
                title={`Guardar en ${activeConfig.label}`}
                aria-label={`Guardar observación en ${activeConfig.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Items Feed */}
          <div className="space-y-4">
            {visibleLevels.map((lvl) => {
              const lvlItems = items.filter((i) => i.level === lvl.id);
              return (
                <div key={lvl.id} className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-xs font-semibold text-[#F4F1FF] flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lvl.accentColor }}
                      />
                      <span>
                        {lvl.order}. {lvl.label} ({lvlItems.length})
                      </span>
                    </h4>
                    {filterMode !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setFilterMode('all')}
                        className="p-1 text-[#A89EC9] hover:text-[#D8B4FE] rounded-lg transition-colors"
                        title="Mostrar todos los niveles"
                        aria-label="Mostrar todos los niveles"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {lvlItems.length === 0 ? (
                    <div className="bg-[#120E24]/60 border border-dashed border-[#2A2248] rounded-xl p-4 text-xs text-[#7D71A4] flex items-center justify-between">
                      <span>Sin aportes en este nivel</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLevel(lvl.id)}
                        className="p-1.5 text-[#D8B4FE] hover:bg-[#1E1638] rounded-lg transition-colors"
                        title={`Agregar en ${lvl.label}`}
                        aria-label={`Agregar observación en ${lvl.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    lvlItems.map((item) => {
                      const isPromoted = promotedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-[#120E24]/80 backdrop-blur-xl rounded-xl border border-[#2A2248] p-4 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h5 className="text-sm font-medium text-[#F4F1FF] leading-snug">
                                {item.title}
                              </h5>
                              <p className="text-xs text-[#A89EC9] mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => deleteIcebergItem(project.id, item.id)}
                              className="p-1.5 text-[#7D71A4] hover:text-[#F472B6] rounded-lg transition-colors shrink-0"
                              aria-label={`Eliminar "${item.title}"`}
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {(item.evidence || item.leveragePoint) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {item.evidence && (
                                <div className="bg-[#0E0A1D] border border-[#241D42] px-3 py-2 rounded-lg text-[#A89EC9]">
                                  <strong className="text-[#F4F1FF] font-medium block text-[11px]">
                                    Evidencia
                                  </strong>
                                  {item.evidence}
                                </div>
                              )}
                              {item.leveragePoint && (
                                <div className="bg-[#0F242C]/60 border border-[#22D3EE]/30 px-3 py-2 rounded-lg text-[#CFFAFE]">
                                  <strong className="text-[#22D3EE] font-medium flex items-center gap-1 text-[11px]">
                                    <Compass className="w-3 h-3" />
                                    <span>Palanca</span>
                                  </strong>
                                  {item.leveragePoint}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#221A3D] text-[11px] text-[#7D71A4]">
                            <span className="font-mono tabular-nums">
                              {item.authorName} · {item.authorIp}
                            </span>

                            <button
                              type="button"
                              disabled={isPromoted}
                              onClick={() => handlePromoteToFinding(item)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isPromoted
                                  ? 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE] cursor-default'
                                  : 'bg-[#1E1638] border-[#463578] text-[#D8B4FE] hover:border-[#B892FF]'
                              }`}
                              title={isPromoted ? 'Aprobado en Hallazgos' : 'Aprobar como hallazgo'}
                              aria-label={
                                isPromoted ? 'Aprobado en Hallazgos' : `Aprobar "${item.title}" como hallazgo`
                              }
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
