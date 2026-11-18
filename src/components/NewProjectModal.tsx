/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet New Project Modal
 */

import React, { useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import { EvaluationMethodId } from '../types';
import { METHODS_CATALOG } from '../data/initialData';
import { useWorkspace } from '../context/WorkspaceContext';
import { MethodIcon } from './MethodIcon';

interface NewProjectModalProps {
  initialMethod?: EvaluationMethodId;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  initialMethod,
  onClose,
  onCreated,
}) => {
  const { createProject, members, currentUser } = useWorkspace();

  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState('');
  const [productType, setProductType] = useState('Aplicación Web / SaaS');
  const [selectedMethods, setSelectedMethods] = useState<EvaluationMethodId[]>(
    initialMethod ? [initialMethod] : ['iceberg_model', 'heuristic_evaluation']
  );
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([currentUser.id]);

  const toggleMethod = (id: EvaluationMethodId) => {
    setSelectedMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleCollaborator = (id: string) => {
    if (id === currentUser.id) return;
    setSelectedCollaborators((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !objective.trim()) return;

    const proj = createProject({
      title: title.trim(),
      objective: objective.trim(),
      scope: scope.trim() || 'Flujo principal',
      productType: productType.trim(),
      activeMethods: selectedMethods.length > 0 ? selectedMethods : ['iceberg_model'],
      collaboratorIds: selectedCollaborators,
    });

    onCreated(proj.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05030E]/80 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-[#120E24] border border-[#2A2248] rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div className="flex items-center justify-between border-b border-[#221A3D] pb-3">
          <h2 className="text-sm font-semibold text-[#F4F1FF]">Nuevo Proyecto</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg"
            title="Cerrar"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Flujo de Checkout Móvil"
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Producto</label>
            <input
              type="text"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A89EC9] mb-1">¿Qué se quiere investigar? *</label>
          <textarea
            rows={2}
            required
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Objetivo principal..."
            className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
          />
        </div>

        <div>
          <label className="block text-xs text-[#A89EC9] mb-1.5">Métodos</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {METHODS_CATALOG.map((m) => {
              const active = selectedMethods.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMethod(m.id)}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between gap-2.5 ${
                    active
                      ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF]'
                      : 'bg-[#0E0A1D] border-[#241D42] text-[#A89EC9] hover:border-[#463578]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MethodIcon methodId={m.id} variant="inline" size="md" className="mt-0.5" />
                    <div className="min-w-0">
                      <span className="block text-[13px] font-bold text-[#F4F1FF] truncate">
                        {m.name.split(' (')[0]}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#7D71A4] mt-0.5">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span>{m.durationEstimate}</span>
                      </span>
                    </div>
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#A89EC9] mb-1.5">Permisos por IP</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const active = selectedCollaborators.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleCollaborator(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-[#241B46] border-[#B892FF]/70 text-[#D8B4FE]'
                      : 'bg-[#0E0A1D] border-[#241D42] text-[#7D71A4]'
                  }`}
                >
                  <span>{m.name.split(' ')[0]}</span>
                  <span className="font-mono text-[10px] opacity-75">{m.ipAddress}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#221A3D]">
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-xl"
            aria-label="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="submit"
            className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl shadow-[0_0_20px_rgba(255,107,26,0.3)]"
            title="Crear proyecto"
            aria-label="Crear proyecto"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
