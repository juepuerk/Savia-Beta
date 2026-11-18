/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Customer Journey Map Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, Trash2, Smile, Frown, Meh, Check, X, Clock } from 'lucide-react';
import { Project } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

export const JourneyMapTool: React.FC<{ project: Project }> = ({ project }) => {
  const { addJourneyStage, deleteJourneyStage, approveFinding } = useWorkspace();
  const [showAddModal, setShowAddModal] = useState(false);

  const [stageName, setStageName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [userAction, setUserAction] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [sentiment, setSentiment] = useState<number>(0);
  const [touchpointChannels, setTouchpointChannels] = useState('Web Móvil, SMS');
  const [painPoints, setPainPoints] = useState('');
  const [opportunities, setOpportunities] = useState('');

  const stages = project.journeyStages || [];
  const prog = calculateMethodProgress(project, 'customer_journey');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim() || !userGoal.trim()) return;

    addJourneyStage(project.id, {
      stageName,
      userGoal,
      userAction,
      thoughts,
      sentiment,
      touchpointChannels: touchpointChannels.split(',').map((c) => c.trim()).filter(Boolean),
      painPoints: painPoints ? painPoints.split('\n').filter(Boolean) : [],
      opportunities: opportunities ? opportunities.split('\n').filter(Boolean) : [],
    });

    setStageName('');
    setUserGoal('');
    setUserAction('');
    setThoughts('');
    setSentiment(0);
    setPainPoints('');
    setOpportunities('');
    setShowAddModal(false);
  };

  const getSentimentVisual = (score: number) => {
    if (score >= 1) {
      return {
        label: score === 2 ? 'Deleite (+2)' : 'Positivo (+1)',
        color: '#22D3EE',
        bg: '#0F242C',
        border: 'rgba(34,211,238,0.35)',
        icon: <Smile className="w-4 h-4 text-[#22D3EE]" />,
      };
    }
    if (score <= -1) {
      return {
        label: score === -2 ? 'Crítico (-2)' : 'Fricción (-1)',
        color: '#F472B6',
        bg: '#2B1228',
        border: 'rgba(236,72,153,0.4)',
        icon: <Frown className="w-4 h-4 text-[#F472B6]" />,
      };
    }
    return {
      label: 'Neutral (0)',
      color: '#D8B4FE',
      bg: '#1E1638',
      border: '#463578',
      icon: <Meh className="w-4 h-4 text-[#D8B4FE]" />,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248]">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="customer_journey" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Customer Journey Map</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'customer_journey')?.durationEstimate}</span>
              <span className="text-[#7D71A4]">· {stages.length} fases</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title={showAddModal ? 'Cerrar' : 'Añadir fase'}
            aria-label={showAddModal ? 'Cerrar formulario' : 'Añadir fase al journey map'}
          >
            {showAddModal ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showAddModal && (
        <form onSubmit={handleAdd} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Fase *</label>
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Ej. 3. Pago"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Meta *</label>
              <input
                type="text"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="¿Qué busca lograr?"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Acción</label>
              <textarea
                rows={2}
                value={userAction}
                onChange={(e) => setUserAction(e.target.value)}
                placeholder="Paso físico o digital..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Pensamientos</label>
              <textarea
                rows={2}
                value={thoughts}
                onChange={(e) => setThoughts(e.target.value)}
                placeholder='"¿Habrá quedado guardado?"'
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Emoción (-2 a +2)</label>
              <div className="flex items-center gap-1.5">
                {[-2, -1, 0, 1, 2].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setSentiment(val)}
                    className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                      sentiment === val
                        ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF] font-bold'
                        : 'bg-[#0E0A1D] text-[#A89EC9] border-[#241D42]'
                    }`}
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Canales</label>
              <input
                type="text"
                value={touchpointChannels}
                onChange={(e) => setTouchpointChannels(e.target.value)}
                placeholder="App, Email, Mostrador"
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Fricciones (líneas)</label>
              <textarea
                rows={2}
                value={painPoints}
                onChange={(e) => setPainPoints(e.target.value)}
                placeholder="Espera excesiva..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Oportunidades (líneas)</label>
              <textarea
                rows={2}
                value={opportunities}
                onChange={(e) => setOpportunities(e.target.value)}
                placeholder="Barra de progreso..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg"
              title="Cancelar"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg"
              title="Guardar fase"
              aria-label="Guardar fase"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage, idx) => {
          const sent = getSentimentVisual(stage.sentiment);

          return (
            <div
              key={stage.id}
              className="bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] p-4 flex flex-col justify-between hover:border-[#463578] transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#7D71A4] mb-1">
                  <span className="font-mono">0{idx + 1}</span>
                  <button
                    onClick={() => deleteJourneyStage(project.id, stage.id)}
                    className="p-1 text-[#7D71A4] hover:text-[#F472B6] transition-colors"
                    title="Eliminar fase"
                    aria-label={`Eliminar fase ${stage.stageName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-[#F4F1FF] mb-1">{stage.stageName}</h4>

                <div
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium my-2"
                  style={{ backgroundColor: sent.bg, color: sent.color, borderColor: sent.border }}
                >
                  {sent.icon}
                  <span>{sent.label}</span>
                </div>

                <div className="text-xs text-[#A89EC9] mb-3">
                  <span className="font-medium text-[#F4F1FF] block">Meta:</span>
                  {stage.userGoal}
                </div>

                <div className="space-y-2 text-xs text-[#A89EC9] bg-[#0E0A1D] p-3 rounded-lg border border-[#241D42]">
                  <div>
                    <span className="font-medium text-[#F4F1FF]">Acción:</span> {stage.userAction}
                  </div>
                  {stage.thoughts && <div className="italic text-[#7D71A4]">"{stage.thoughts}"</div>}
                </div>

                <div className="mt-3">
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {stage.touchpointChannels.map((c, i) => (
                      <span
                        key={i}
                        className="bg-[#1E1638] border border-[#463578] px-2 py-0.5 rounded text-[#D8B4FE]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {stage.painPoints.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-[#F472B6] block mb-1">Fricciones</span>
                    <ul className="text-xs text-[#A89EC9] space-y-1">
                      {stage.painPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#F472B6]">·</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stage.opportunities.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-medium text-[#22D3EE] block mb-1">Oportunidades</span>
                    <ul className="text-xs text-[#A89EC9] space-y-1">
                      {stage.opportunities.map((op, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#22D3EE]">→</span>
                          <span>{op}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#221A3D] flex items-center justify-between text-[11px] text-[#7D71A4]">
                <span>{stage.authorName}</span>
                <button
                  onClick={() => {
                    approveFinding(project.id, {
                      title: `Oportunidad en ${stage.stageName}: ${stage.opportunities[0] || stage.userGoal}`,
                      sourceMethod: 'customer_journey',
                      severityOrImportance: stage.sentiment <= -1 ? 'Alta' : 'Media',
                      description: `Fricción detectada: ${stage.painPoints.join(', ') || 'Ansiedad en la espera'}. Sentimiento: ${stage.sentiment}`,
                      evidence: `Puntos de contacto: ${stage.touchpointChannels.join(', ')}`,
                      recommendation: stage.opportunities.join('. ') || 'Diseñar retroalimentación inmediata.',
                      status: 'aprobado',
                    });
                  }}
                  className="p-1.5 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-lg transition-colors"
                  title="Aprobar como hallazgo"
                  aria-label={`Convertir ${stage.stageName} en hallazgo`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
