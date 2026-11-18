/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Service Blueprint Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, Check, X, Clock } from 'lucide-react';
import { BlueprintColumn, Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

const DEFAULT_BLUEPRINT_STEPS: BlueprintColumn[] = [
  {
    id: 'bp_1',
    stepName: '1. Solicitud de Registro',
    physicalEvidence: 'Bienvenida, SMS de 6 dígitos',
    customerAction: 'Ingresa número e introduce código OTP',
    frontstageContact: 'UI móvil con temporizador de reintento',
    backstageProcess: 'Envío OTP mediante proveedor SMS',
    supportSystems: 'Base antifraude',
    painPoints: 'Latencia de 15s en red congestionada',
  },
  {
    id: 'bp_2',
    stepName: '2. Escaneo de Documento',
    physicalEvidence: 'Documento físico, visor de cámara',
    customerAction: 'Captura frente y reverso',
    frontstageContact: 'Marco automático y disparo',
    backstageProcess: 'Procesamiento OCR y recorte',
    supportSystems: 'API Identificación Nacional',
    painPoints: 'Reflejo de luz genera rechazo (ERR_4022)',
  },
  {
    id: 'bp_3',
    stepName: '3. Activación',
    physicalEvidence: 'Push y PDF de bienvenida',
    customerAction: 'Revisa resumen y confirma apertura',
    frontstageContact: 'Pantalla de confirmación',
    backstageProcess: 'Creación en Core Bancario',
    supportSystems: 'Ledger financiero y generador PDF',
    painPoints: 'Correo cae en spam',
  },
];

export const ServiceBlueprintTool: React.FC<{ project: Project }> = ({ project }) => {
  const { updateProject, approveFinding } = useWorkspace();
  const [steps, setSteps] = useState<BlueprintColumn[]>(
    project.blueprintSteps && project.blueprintSteps.length > 0
      ? project.blueprintSteps
      : DEFAULT_BLUEPRINT_STEPS
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [stepName, setStepName] = useState('');
  const [physicalEvidence, setPhysicalEvidence] = useState('');
  const [customerAction, setCustomerAction] = useState('');
  const [frontstageContact, setFrontstageContact] = useState('');
  const [backstageProcess, setBackstageProcess] = useState('');
  const [supportSystems, setSupportSystems] = useState('');
  const [painPoints, setPainPoints] = useState('');

  const prog = calculateMethodProgress(project, 'service_blueprint');

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepName.trim()) return;

    const newStep: BlueprintColumn = {
      id: 'bp_' + Math.random().toString(36).substring(2, 9),
      stepName,
      physicalEvidence,
      customerAction,
      frontstageContact,
      backstageProcess,
      supportSystems,
      painPoints,
    };

    const updated = [...steps, newStep];
    setSteps(updated);
    updateProject(project.id, { blueprintSteps: updated });

    setStepName('');
    setPhysicalEvidence('');
    setCustomerAction('');
    setFrontstageContact('');
    setBackstageProcess('');
    setSupportSystems('');
    setPainPoints('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="service_blueprint" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Service Blueprint (5 Capas)</h3>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'service_blueprint')?.durationEstimate}</span>
              <span className="text-[#958AC0]">· {steps.length} pasos · 5 capas</span>
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
            title={showAddForm ? 'Cerrar' : 'Añadir paso'}
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cerrar' : 'Añadir paso'}</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddStep} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Paso *</label>
              <input
                type="text"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Evidencia Física</label>
              <input
                type="text"
                value={physicalEvidence}
                onChange={(e) => setPhysicalEvidence(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Acción del Cliente</label>
              <input
                type="text"
                value={customerAction}
                onChange={(e) => setCustomerAction(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Frontstage</label>
              <input
                type="text"
                value={frontstageContact}
                onChange={(e) => setFrontstageContact(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Backstage</label>
              <input
                type="text"
                value={backstageProcess}
                onChange={(e) => setBackstageProcess(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Sistemas</label>
              <input
                type="text"
                value={supportSystems}
                onChange={(e) => setSupportSystems(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Punto de Quiebre</label>
            <input
              type="text"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
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
              title="Guardar paso"
            >
              <Check className="w-4 h-4" />
              <span>Guardar paso</span>
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] p-4">
        <table className="w-full border-collapse text-xs min-w-[760px]">
          <thead>
            <tr>
              <th className="w-44 p-3 text-left font-mono text-[#958AC0] uppercase text-xs bg-[#0E0A1D] border-b border-[#2A2248]">
                Capa
              </th>
              {steps.map((s) => (
                <th
                  key={s.id}
                  className="p-3 text-left font-semibold text-[#F4F1FF] bg-[#0E0A1D] border-b border-[#2A2248]"
                >
                  {s.stepName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#221A3D]">
            <tr>
              <td className="p-3 font-medium text-[#22D3EE] bg-[#0F242C]/50">1. Evidencia</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 text-[#A89EC9] align-top">
                  {s.physicalEvidence || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-medium text-[#F4F1FF] bg-[#0E0A1D]">2. Cliente</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 text-[#F4F1FF] align-top">
                  {s.customerAction || '—'}
                </td>
              ))}
            </tr>

            <tr className="bg-[#241B46]/60">
              <td colSpan={steps.length + 1} className="py-1 px-3 text-xs font-mono text-[#D8B4FE] uppercase tracking-widest text-center">
                Línea de Interacción
              </td>
            </tr>

            <tr>
              <td className="p-3 font-medium text-[#B892FF] bg-[#1E1638]/50">3. Frontstage</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 text-[#A89EC9] align-top">
                  {s.frontstageContact || '—'}
                </td>
              ))}
            </tr>

            <tr className="bg-[#241B46]/60">
              <td colSpan={steps.length + 1} className="py-1 px-3 text-xs font-mono text-[#FF823A] uppercase tracking-widest text-center">
                Línea de Visibilidad
              </td>
            </tr>

            <tr>
              <td className="p-3 font-medium text-[#FF823A] bg-[#2B1710]/40">4. Backstage</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 text-[#A89EC9] align-top">
                  {s.backstageProcess || '—'}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-medium text-[#38BDF8] bg-[#0E1E32]/50">5. Sistemas</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 font-mono text-xs text-[#A89EC9] align-top">
                  {s.supportSystems || '—'}
                </td>
              ))}
            </tr>

            <tr className="bg-[#2B1228]/55">
              <td className="p-3 font-medium text-[#F472B6]">Quiebre</td>
              {steps.map((s) => (
                <td key={s.id} className="p-3 text-xs text-[#FBCFE8] align-top">
                  {s.painPoints ? (
                    <div className="flex items-start justify-between gap-2">
                      <span>{s.painPoints}</span>
                      <button
                        onClick={() => {
                          approveFinding(project.id, {
                            title: `Falla de proceso en ${s.stepName}`,
                            sourceMethod: 'service_blueprint',
                            severityOrImportance: 'Alta',
                            description: `Punto de quiebre: ${s.painPoints}`,
                            evidence: `Sistemas: ${s.supportSystems}`,
                            recommendation: `Optimizar ${s.frontstageContact} y ${s.backstageProcess}.`,
                            status: 'aprobado',
                          });
                        }}
                        className="p-1 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] rounded shrink-0"
                        title="Aprobar como hallazgo"
                        aria-label={`Aprobar falla en ${s.stepName}`}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
