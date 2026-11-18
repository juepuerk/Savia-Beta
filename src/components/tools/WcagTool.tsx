/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Accessibility Audit (WCAG 2.2 AA) Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, ThumbsUp, X, Check, Clock } from 'lucide-react';
import { Project, WcagCriterion } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress, calculateWcagCompliance } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

export const WcagTool: React.FC<{ project: Project }> = ({ project }) => {
  const { updateWcagItem, updateProject, approveFinding } = useWorkspace();
  const [filterPrinciple, setFilterPrinciple] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [principle, setPrinciple] = useState<WcagCriterion['principle']>('Perceptible');
  const [code, setCode] = useState('1.4.11');
  const [name, setName] = useState('Contraste sin Texto');
  const [level] = useState<'A' | 'AA'>('AA');
  const [elementLocation, setElementLocation] = useState('');
  const [observations, setObservations] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const items = project.wcagItems || [];
  const compliance = calculateWcagCompliance(items);
  const prog = calculateMethodProgress(project, 'wcag_audit');

  const filteredItems =
    filterPrinciple === 'all' ? items : items.filter((i) => i.principle === filterPrinciple);

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: WcagCriterion = {
      id: 'wcag_' + Math.random().toString(36).substring(2, 9),
      principle,
      code,
      name,
      level,
      status: 'pending',
      elementSelectorOrLocation: elementLocation,
      observations,
      recommendation,
    };

    updateProject(project.id, {
      wcagItems: [...items, newItem],
    });

    setName('');
    setElementLocation('');
    setObservations('');
    setRecommendation('');
    setShowAddModal(false);
  };

  const handleStatusChange = (id: string, status: WcagCriterion['status']) => {
    updateWcagItem(project.id, id, { status });
  };

  const handleApproveFinding = (item: WcagCriterion) => {
    approveFinding(project.id, {
      title: `Incumplimiento WCAG ${item.code} (${item.name})`,
      sourceMethod: 'wcag_audit',
      severityOrImportance: item.status === 'fail' ? 'Alta' : 'Media',
      description: item.observations || 'Falla de accesibilidad detectada.',
      evidence: `Ubicación: ${item.elementSelectorOrLocation}. Nivel: ${item.level}`,
      recommendation: item.recommendation || 'Corregir criterio WCAG 2.2 AA.',
      status: 'aprobado',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-5 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="wcag_audit" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Auditoría de Accesibilidad (WCAG 2.2 AA)</h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'wcag_audit')?.durationEstimate}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {compliance.complianceRate}%
              </span>
              <span className="text-xs text-[#22D3EE]">conformidad</span>
              <span className="text-xs text-[#958AC0] font-mono">
                · {compliance.passCount} ok · {compliance.failCount} fallas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title={showAddModal ? 'Cerrar' : 'Añadir criterio'}
          >
            {showAddModal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddModal ? 'Cerrar' : 'Añadir criterio'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#120E24]/80 p-2.5 rounded-2xl border border-[#2A2248]">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0E0A1D] rounded-xl text-xs">
          {['all', 'Perceptible', 'Operable', 'Comprensible', 'Robusto'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPrinciple(p)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterPrinciple === p
                  ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/50 font-medium'
                  : 'text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
            >
              {p === 'all' ? 'Todos' : p}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-[#958AC0] pr-2">{filteredItems.length}</span>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddCriterion} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Principio</label>
              <select
                value={principle}
                onChange={(e) => setPrinciple(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              >
                <option value="Perceptible">Perceptible</option>
                <option value="Operable">Operable</option>
                <option value="Comprensible">Comprensible</option>
                <option value="Robusto">Robusto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Código</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-[#A89EC9] mb-1">Criterio *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Ubicación</label>
              <input
                type="text"
                value={elementLocation}
                onChange={(e) => setElementLocation(e.target.value)}
                placeholder="Selector o vista..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Observación</label>
              <input
                type="text"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Barrera encontrada..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Remediación</label>
            <input
              type="text"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Solución técnica..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] text-[#090616] rounded-lg"
              title="Guardar criterio"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248] hover:border-[#463578] transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#958AC0]">
                  <span className="font-medium text-[#A89EC9]">{item.principle}</span>
                  <span>·</span>
                  <span className="font-mono text-[#22D3EE]">
                    {item.code} ({item.level})
                  </span>
                </div>
                <h4 className="text-sm font-medium text-[#F4F1FF] mt-0.5">{item.name}</h4>
              </div>

              <div className="flex items-center gap-1 bg-[#0E0A1D] p-1 rounded-lg border border-[#241D42]">
                <button
                  onClick={() => handleStatusChange(item.id, 'pass')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    item.status === 'pass'
                      ? 'bg-[#22D3EE] text-[#090616] font-semibold'
                      : 'text-[#958AC0] hover:text-[#F4F1FF]'
                  }`}
                >
                  Pass
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'fail')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    item.status === 'fail'
                      ? 'bg-[#EC4899] text-[#090616] font-semibold'
                      : 'text-[#958AC0] hover:text-[#F4F1FF]'
                  }`}
                >
                  Fail
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'not_applicable')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    item.status === 'not_applicable'
                      ? 'bg-[#241B46] text-[#D8B4FE] font-semibold'
                      : 'text-[#958AC0] hover:text-[#F4F1FF]'
                  }`}
                >
                  N/A
                </button>
              </div>
            </div>

            {item.observations && (
              <div className="text-xs text-[#A89EC9] bg-[#0E0A1D] p-3 rounded-lg border border-[#241D42]">
                {item.elementSelectorOrLocation && (
                  <code className="text-xs font-mono text-[#958AC0] block mb-1">
                    {item.elementSelectorOrLocation}
                  </code>
                )}
                {item.observations}
              </div>
            )}

            {item.recommendation && (
              <div className="text-xs text-[#22D3EE]">
                <strong className="font-medium">Remediación:</strong> {item.recommendation}
              </div>
            )}

            {item.status === 'fail' && (
              <div className="pt-2 border-t border-[#221A3D] flex justify-end">
                <button
                  onClick={() => handleApproveFinding(item)}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-2.5 py-1.5 bg-[#2B1228] border border-[#EC4899]/40 text-[#F472B6] hover:bg-[#3A1735] rounded-lg transition-colors"
                  title="Aprobar falla como hallazgo"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Aprobar</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
