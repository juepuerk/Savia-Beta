/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Impact vs. Effort Prioritization Matrix (2x2, Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, ThumbsUp, Check, X, Clock } from 'lucide-react';
import { Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress, classifyImpactEffort } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

export const ImpactEffortTool: React.FC<{ project: Project }> = ({ project }) => {
  const { addImpactEffortItem, voteImpactEffortItem, approveFinding, currentUser } = useWorkspace();
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState(8);
  const [effort, setEffort] = useState(3);
  const [category, setCategory] = useState('Diseño UI');

  const items = project.impactEffortItems || [];
  const prog = calculateMethodProgress(project, 'impact_effort');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addImpactEffortItem(project.id, {
      title,
      description,
      impact,
      effort,
      category,
      status: 'propuesto',
    });

    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const quadrants = {
    quick_win: {
      name: 'Quick Wins',
      subtitle: 'Alto Impacto · Bajo Esfuerzo',
      color: '#22D3EE',
      advice: 'Priorizar de inmediato.',
      items: items.filter((i) => classifyImpactEffort(i.impact, i.effort) === 'quick_win'),
    },
    major_project: {
      name: 'Estratégicos',
      subtitle: 'Alto Impacto · Alto Esfuerzo',
      color: '#B892FF',
      advice: 'Planificar por fases.',
      items: items.filter((i) => classifyImpactEffort(i.impact, i.effort) === 'major_project'),
    },
    fill_in: {
      name: 'Secundarios',
      subtitle: 'Bajo Impacto · Bajo Esfuerzo',
      color: '#FF6B1A',
      advice: 'Ejecutar según disponibilidad.',
      items: items.filter((i) => classifyImpactEffort(i.impact, i.effort) === 'fill_in'),
    },
    thankless_task: {
      name: 'Descartar',
      subtitle: 'Bajo Impacto · Alto Esfuerzo',
      color: '#EC4899',
      advice: 'Evitar o replantear.',
      items: items.filter((i) => classifyImpactEffort(i.impact, i.effort) === 'thankless_task'),
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="impact_effort" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Matriz de Priorización (Impacto vs. Esfuerzo)</h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'impact_effort')?.durationEstimate}</span>
              <span className="text-[#958AC0]">· {items.length} iniciativas</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title={showAddForm ? 'Cerrar' : 'Proponer iniciativa'}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cerrar' : 'Proponer iniciativa'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Iniciativa *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Guía visual en cámara KYC"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              >
                <option value="Diseño UI">Diseño UI</option>
                <option value="Microcopia / Contenido">Microcopia</option>
                <option value="Arquitectura Frontend">Frontend</option>
                <option value="Proceso Operativo">Operación</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0E0A1D] p-4 rounded-xl border border-[#241D42]">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A89EC9] mb-1">
                <span>Impacto</span>
                <span className="font-mono font-bold text-[#22D3EE]">{impact}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={impact}
                onChange={(e) => setImpact(parseInt(e.target.value, 10))}
                className="w-full accent-[#22D3EE]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-[#A89EC9] mb-1">
                <span>Esfuerzo</span>
                <span className="font-mono font-bold text-[#FF6B1A]">{effort}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={effort}
                onChange={(e) => setEffort(parseInt(e.target.value, 10))}
                className="w-full accent-[#FF6B1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Fundamento</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Justificación..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] text-[#090616] rounded-lg"
              title="Guardar iniciativa"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(quadrants).map(([key, quad]) => (
          <div
            key={key}
            className="bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] p-4 flex flex-col justify-between min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#221A3D]">
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F1FF] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: quad.color }} />
                    {quad.name}
                  </h4>
                  <span className="text-xs text-[#958AC0]">{quad.subtitle}</span>
                </div>
                <span className="text-xs font-mono text-[#D8B4FE] bg-[#0E0A1D] border border-[#241D42] px-2 py-0.5 rounded">
                  {quad.items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {quad.items.length === 0 ? (
                  <p className="text-xs text-[#958AC0] py-6 text-center">Vacío</p>
                ) : (
                  quad.items.map((it) => {
                    const hasVoted = it.votedUserIds.includes(currentUser.id);

                    return (
                      <div
                        key={it.id}
                        className="bg-[#0E0A1D] p-3.5 rounded-xl border border-[#241D42] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-medium text-[#F4F1FF] block">{it.title}</span>
                            <span className="text-xs font-mono text-[#958AC0]">
                              I:{it.impact} · E:{it.effort} · {it.category}
                            </span>
                          </div>

                          <button
                            onClick={() => voteImpactEffortItem(project.id, it.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border transition-colors ${
                              hasVoted
                                ? 'bg-[#241B46] border-[#B892FF]/65 text-[#D8B4FE]'
                                : 'bg-[#1E1638] text-[#A89EC9] border-[#463578] hover:border-[#B892FF]'
                            }`}
                            title="Votar iniciativa"
                            aria-label={`Votar "${it.title}"`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{it.votes}</span>
                          </button>
                        </div>

                        {it.description && (
                          <p className="text-xs text-[#A89EC9] leading-relaxed">{it.description}</p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#221A3D] text-xs text-[#958AC0]">
                          <span>{it.authorName}</span>
                          <button
                            onClick={() => {
                              approveFinding(project.id, {
                                title: `Priorización: ${it.title}`,
                                sourceMethod: 'impact_effort',
                                severityOrImportance: it.impact >= 7 ? 'Alta' : 'Media',
                                description: `${it.description || it.title}. Cuadrante: ${quad.name} (${it.votes} votos).`,
                                evidence: `Impacto ${it.impact}/10 · Esfuerzo ${it.effort}/10.`,
                                recommendation: quad.advice,
                                status: 'aprobado',
                              });
                            }}
                            className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-2.5 py-1.5 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-lg transition-colors"
                            title="Aprobar para informe"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprobar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#221A3D] text-xs text-[#958AC0] mt-3">
              {quad.advice}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
