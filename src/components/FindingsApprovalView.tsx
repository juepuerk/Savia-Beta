/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Findings Approval & Human Review View (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Finding, Project } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

export const FindingsApprovalView: React.FC<{ project: Project }> = ({ project }) => {
  const { approveFinding, updateFinding, deleteFinding } = useWorkspace();
  const [showAdd, setShowAdd] = useState(false);

  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<Finding['severityOrImportance']>('Alta');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    approveFinding(project.id, {
      title: title.trim(),
      sourceMethod: project.activeMethods[0] || 'iceberg_model',
      severityOrImportance: severity,
      description: description.trim() || title.trim(),
      evidence: evidence.trim() || 'Evidencia registrada en sesión de evaluación.',
      recommendation: recommendation.trim() || 'Definir plan de acción con producto.',
      status: 'borrador',
    });
    setTitle('');
    setDescription('');
    setEvidence('');
    setRecommendation('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F4F1FF]">Revisión y Aprobación</h3>
          <p className="text-xs font-mono text-[#7D71A4] mt-0.5">
            {project.findings.filter((f) => f.status === 'aprobado').length} aprobados ·{' '}
            {project.findings.filter((f) => f.status === 'borrador').length} borradores
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
          title={showAdd ? 'Cerrar' : 'Nuevo hallazgo'}
          aria-label={showAdd ? 'Cerrar formulario' : 'Nuevo hallazgo'}
        >
          {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#A89EC9] mb-1">Hallazgo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Impacto</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción..."
            className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Evidencia..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
            />
            <input
              type="text"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="Recomendación..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg"
              aria-label="Guardar hallazgo"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {project.findings.length === 0 ? (
          <div className="bg-[#120E24]/80 border border-[#2A2248] rounded-2xl p-10 text-center text-xs text-[#7D71A4]">
            Sin hallazgos aún
          </div>
        ) : (
          project.findings.map((f) => {
            const approved = f.status === 'aprobado';
            return (
              <div
                key={f.id}
                className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#7D71A4] mb-1">
                      <span
                        className={
                          f.severityOrImportance === 'Alta'
                            ? 'text-[#FF6B1A]'
                            : f.severityOrImportance === 'Media'
                            ? 'text-[#F472B6]'
                            : 'text-[#22D3EE]'
                        }
                      >
                        {f.severityOrImportance}
                      </span>
                      <span>·</span>
                      <span>{f.sourceMethod}</span>
                      {approved && (
                        <>
                          <span>·</span>
                          <span className="text-[#22D3EE]">Aprobado</span>
                        </>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#F4F1FF]">{f.title}</h4>
                    <p className="text-xs text-[#A89EC9] mt-1 leading-relaxed">{f.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!approved && (
                      <button
                        type="button"
                        onClick={() => updateFinding(project.id, f.id, { status: 'aprobado' })}
                        className="p-1.5 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-lg"
                        title="Aprobar hallazgo"
                        aria-label={`Aprobar "${f.title}"`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteFinding(project.id, f.id)}
                      className="p-1.5 text-[#7D71A4] hover:text-[#F472B6] rounded-lg"
                      title="Eliminar hallazgo"
                      aria-label={`Eliminar "${f.title}"`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#221A3D]">
                  <div className="bg-[#0E0A1D] border border-[#241D42] p-3 rounded-lg text-[#A89EC9]">
                    <span className="text-[11px] text-[#7D71A4] block mb-0.5">Evidencia</span>
                    {f.evidence}
                  </div>
                  <div className="bg-[#0F242C]/50 border border-[#22D3EE]/25 p-3 rounded-lg text-[#CFFAFE]">
                    <span className="text-[11px] text-[#22D3EE] block mb-0.5">Recomendación</span>
                    {f.recommendation}
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
