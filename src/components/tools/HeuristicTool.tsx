/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Heuristic Evaluation Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Trash2, ThumbsUp, X, Check, Clock } from 'lucide-react';
import { HeuristicItem, Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress, getSeverityLabel } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

const NIELSEN_HEURISTICS = [
  { id: 1, name: '1. Visibilidad del estado del sistema' },
  { id: 2, name: '2. Coincidencia entre el sistema y el mundo real' },
  { id: 3, name: '3. Control y libertad del usuario' },
  { id: 4, name: '4. Consistencia y estándares' },
  { id: 5, name: '5. Prevención de errores' },
  { id: 6, name: '6. Reconocimiento antes que recuerdo' },
  { id: 7, name: '7. Flexibilidad y eficiencia de uso' },
  { id: 8, name: '8. Estética y diseño minimalista' },
  { id: 9, name: '9. Ayudar a reconocer, diagnosticar y recuperarse de errores' },
  { id: 10, name: '10. Ayuda y documentación' },
];

export const HeuristicTool: React.FC<{ project: Project }> = ({ project }) => {
  const { addHeuristicItem, updateHeuristicItem, deleteHeuristicItem, approveFinding } = useWorkspace();
  const [showAddForm, setShowAddForm] = useState(false);

  const [heuristicNumber, setHeuristicNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [screenOrFlow, setScreenOrFlow] = useState('');
  const [severity, setSeverity] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [frequency, setFrequency] = useState<1 | 2 | 3>(2);
  const [description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const items = project.heuristicItems || [];
  const prog = calculateMethodProgress(project, 'heuristic_evaluation');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const heurObj = NIELSEN_HEURISTICS.find((h) => h.id === heuristicNumber);

    addHeuristicItem(project.id, {
      heuristicNumber,
      heuristicTitle: heurObj ? heurObj.name.substring(3) : 'Principio General',
      title,
      screenOrFlow: screenOrFlow || 'Flujo principal',
      severity,
      frequency,
      description,
      recommendation,
      status: 'pendiente',
    });

    setTitle('');
    setScreenOrFlow('');
    setDescription('');
    setRecommendation('');
    setShowAddForm(false);
  };

  const handleApprove = (item: HeuristicItem) => {
    updateHeuristicItem(project.id, item.id, { status: 'aprobado' });
    approveFinding(project.id, {
      title: item.title,
      sourceMethod: 'heuristic_evaluation',
      severityOrImportance: item.severity >= 3 ? 'Alta' : item.severity === 2 ? 'Media' : 'Baja',
      description: item.description,
      evidence: `Ubicación: ${item.screenOrFlow}. Heurística: #${item.heuristicNumber} (${item.heuristicTitle})`,
      recommendation: item.recommendation,
      status: 'aprobado',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248]">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="heuristic_evaluation" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Evaluación Heurística</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'heuristic_evaluation')?.durationEstimate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7D71A4] font-mono mt-1">
              <span>{items.length} registros</span>
              <span>·</span>
              <span>{items.filter((i) => i.status === 'aprobado').length} aprobados</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title={showAddForm ? 'Cerrar formulario' : 'Nueva observación heurística'}
            aria-label={showAddForm ? 'Cerrar formulario' : 'Nueva observación heurística'}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-[#120E24]/85 backdrop-blur-xl p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Heurística (Nielsen) *</label>
              <select
                value={heuristicNumber}
                onChange={(e) => setHeuristicNumber(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              >
                {NIELSEN_HEURISTICS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Pantalla o Flujo *</label>
              <input
                type="text"
                value={screenOrFlow}
                onChange={(e) => setScreenOrFlow(e.target.value)}
                placeholder="Ej. Paso 2: Escaneo"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Problema *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Código de error incomprensible ERR_4022"
              required
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Severidad (0-4)</label>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((sev) => {
                  const meta = getSeverityLabel(sev);
                  return (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev as any)}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-colors ${
                        severity === sev
                          ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF]'
                          : 'bg-[#0E0A1D] text-[#A89EC9] border-[#241D42] hover:border-[#463578]'
                      }`}
                    >
                      {sev} · {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Frecuencia</label>
              <div className="flex items-center gap-1.5">
                {[
                  { val: 1, label: 'Raro' },
                  { val: 2, label: 'Común' },
                  { val: 3, label: 'Constante' },
                ].map((f) => (
                  <button
                    type="button"
                    key={f.val}
                    onClick={() => setFrequency(f.val as any)}
                    className={`flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-colors ${
                      frequency === f.val
                        ? 'bg-[#241B46] text-[#D8B4FE] border-[#B892FF]'
                        : 'bg-[#0E0A1D] text-[#A89EC9] border-[#241D42] hover:border-[#463578]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Descripción e Impacto *</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qué ocurrió y cómo afectó al usuario..."
              required
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Recomendación</label>
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Propuesta de mejora..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg transition-colors"
              title="Cancelar"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg transition-colors"
              title="Guardar observación"
              aria-label="Guardar observación"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="bg-[#120E24]/80 p-10 text-center rounded-2xl border border-[#2A2248]">
            <AlertCircle className="w-7 h-7 text-[#B892FF] mx-auto mb-2" />
            <p className="text-xs text-[#A89EC9] mb-4">Sin observaciones registradas</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl inline-flex"
              title="Registrar primera observación"
              aria-label="Registrar primera observación"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          items.map((item) => {
            const sevMeta = getSeverityLabel(item.severity);
            const isApproved = item.status === 'aprobado';

            return (
              <div
                key={item.id}
                className="bg-[#120E24]/80 backdrop-blur-xl p-5 rounded-2xl border border-[#2A2248] hover:border-[#463578] transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7D71A4]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#F4F1FF]">
                      H{item.heuristicNumber} · {item.heuristicTitle}
                    </span>
                    <span>·</span>
                    <span>{item.screenOrFlow}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span style={{ color: sevMeta.color }}>
                      Sev {item.severity} ({sevMeta.label})
                    </span>
                    <span>·</span>
                    <span>{item.authorName}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#F4F1FF] mb-1">{item.title}</h4>
                  <p className="text-xs text-[#A89EC9] leading-relaxed">{item.description}</p>
                </div>

                {item.recommendation && (
                  <div className="bg-[#0E0A1D] p-3 rounded-lg border border-[#241D42] text-xs text-[#A89EC9]">
                    <span className="font-medium text-[#F4F1FF] block mb-0.5">Solución:</span>
                    {item.recommendation}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#221A3D] text-xs">
                  <div className="flex items-center gap-1.5 text-[#7D71A4]">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[#22D3EE]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Aprobado</span>
                      </span>
                    ) : (
                      <span>Pendiente</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isApproved && (
                      <button
                        onClick={() => handleApprove(item)}
                        className="p-1.5 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-lg transition-colors"
                        title="Aprobar hallazgo"
                        aria-label={`Aprobar "${item.title}"`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteHeuristicItem(project.id, item.id)}
                      className="p-1.5 text-[#7D71A4] hover:text-[#F472B6] rounded-lg transition-colors"
                      title="Eliminar observación"
                      aria-label={`Eliminar "${item.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
