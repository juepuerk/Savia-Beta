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
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

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
  const toast = useToast();

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
    toast(`Proyecto "${proj.title}" creado`);
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]';

  return (
    <Modal onClose={onClose} labelledBy="new-project-title" as="form" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4 border-b border-[#221A3D] pb-4">
        <div>
          <h2 id="new-project-title" className="text-lg font-semibold text-[#F4F1FF]">
            Nuevo proyecto
          </h2>
          <p className="text-sm text-[#A89EC9] mt-0.5">
            Define qué quieres investigar y elige los métodos. Podrás cambiarlos después.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="np-title" className="block text-sm text-[#D8D0F5] mb-1.5">
            Nombre del proyecto <span className="text-[#FF823A]" aria-hidden="true">*</span>
          </label>
          <input
            id="np-title"
            data-autofocus
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Checkout de la app móvil"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="np-product" className="block text-sm text-[#D8D0F5] mb-1.5">
            Tipo de producto o servicio
          </label>
          <input
            id="np-product"
            type="text"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="np-objective" className="block text-sm text-[#D8D0F5] mb-1.5">
          ¿Qué quieres investigar? <span className="text-[#FF823A]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="np-objective"
          rows={2}
          required
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Ej. Entender por qué los usuarios abandonan el pago en el paso 2"
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className="flex items-baseline justify-between w-full text-sm text-[#D8D0F5] mb-2">
          <span>Métodos</span>
          <span className="text-xs text-[#958AC0]">
            {selectedMethods.length} seleccionado{selectedMethods.length === 1 ? '' : 's'}
          </span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {METHODS_CATALOG.map((m) => {
            const active = selectedMethods.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMethod(m.id)}
                aria-pressed={active}
                className={`p-3 rounded-xl border text-left transition-colors flex items-start justify-between gap-2.5 ${
                  active
                    ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF]'
                    : 'bg-[#0E0A1D] border-[#241D42] text-[#A89EC9] hover:border-[#463578]'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <MethodIcon methodId={m.id} variant="inline" size="md" className="mt-0.5" />
                  <div className="min-w-0 space-y-1">
                    <span className="block text-sm font-semibold text-[#F4F1FF]">{m.name.split(' (')[0]}</span>
                    <span className="block text-xs text-[#A89EC9] leading-snug line-clamp-2">{m.summary}</span>
                    <span className="flex items-center gap-1 text-xs font-mono text-[#958AC0]">
                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span>{m.durationEstimate}</span>
                    </span>
                  </div>
                </div>
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    active ? 'bg-[#22D3EE] border-[#22D3EE] text-[#090616]' : 'border-[#463578]'
                  }`}
                  aria-hidden="true"
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm text-[#D8D0F5] mb-1">Equipo con acceso</legend>
        <p className="text-xs text-[#958AC0] mb-2">Solo estas personas verán el proyecto.</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const active = selectedCollaborators.includes(m.id);
            const isMe = m.id === currentUser.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleCollaborator(m.id)}
                aria-pressed={active}
                disabled={isMe}
                title={isMe ? 'Siempre tienes acceso a tus proyectos' : `IP ${m.ipAddress}`}
                className={`px-3 py-1.5 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-[#241B46] border-[#B892FF]/70 text-[#F4F1FF]'
                    : 'bg-[#0E0A1D] border-[#241D42] text-[#A89EC9] hover:border-[#463578]'
                } disabled:cursor-default`}
              >
                {active && <Check className="w-3.5 h-3.5 text-[#22D3EE]" aria-hidden="true" />}
                <span>{isMe ? `${m.name.split(' ')[0]} (tú)` : m.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-[#221A3D]">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-xl"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl shadow-[0_0_20px_rgba(255,107,26,0.3)]"
        >
          <Check className="w-4 h-4" aria-hidden="true" />
          Crear proyecto
        </button>
      </div>
    </Modal>
  );
};
