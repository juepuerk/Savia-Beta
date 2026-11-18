/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Usability Tasks & SUS Benchmark Tool (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Plus, X, Check, Clock } from 'lucide-react';
import { Project, UsabilityTask } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

const SUS_QUESTIONS = [
  '1. Creo que me gustaría utilizar este sistema con frecuencia.',
  '2. Encontré el sistema innecesariamente complejo.',
  '3. Pensé que el sistema era fácil de usar.',
  '4. Creo que necesitaría el apoyo de un técnico para poder utilizar este sistema.',
  '5. Encontré que las diversas funciones de este sistema estaban bien integradas.',
  '6. Pensé que había demasiada inconsistencia en este sistema.',
  '7. Imagino que la mayoría de las personas aprenderían a utilizar este sistema con mucha rapidez.',
  '8. Encontré el sistema muy engorroso/pesado de usar.',
  '9. Me sentí muy seguro/confiado utilizando el sistema.',
  '10. Necesité aprender muchas cosas antes de poder empezar a utilizar este sistema.',
];

export const UsabilitySusTool: React.FC<{ project: Project }> = ({ project }) => {
  const { addSusResponse, updateProject } = useWorkspace();
  const [showSusForm, setShowSusForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskScenario, setTaskScenario] = useState('');
  const [taskSuccess, setTaskSuccess] = useState(80);
  const [taskTime, setTaskTime] = useState(45);
  const [taskSeq, setTaskSeq] = useState(5.5);
  const [taskNotes, setTaskNotes] = useState('');

  const [respondentName, setRespondentName] = useState('');
  const [respondentRole, setRespondentRole] = useState('Usuario evaluador');
  const [susAnswers, setSusAnswers] = useState<number[]>([4, 2, 4, 2, 4, 2, 4, 2, 4, 2]);
  const [openFeedback, setOpenFeedback] = useState('');

  const tasks = project.usabilityTasks || [];
  const respondents = project.susRespondents || [];
  const prog = calculateMethodProgress(project, 'usability_sus');

  const avgSus =
    respondents.length > 0
      ? Math.round(
          (respondents.reduce((acc, r) => acc + r.susScore, 0) / respondents.length) * 10
        ) / 10
      : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: UsabilityTask = {
      id: 'tsk_' + Math.random().toString(36).substring(2, 9),
      title: taskTitle,
      scenario: taskScenario,
      successRate: taskSuccess,
      avgTimeSeconds: taskTime,
      seqScore: taskSeq,
      frictionNotes: taskNotes ? taskNotes.split('\n').filter(Boolean) : [],
    };

    updateProject(project.id, {
      usabilityTasks: [...tasks, newTask],
    });

    setTaskTitle('');
    setTaskScenario('');
    setTaskNotes('');
    setShowTaskForm(false);
  };

  const handleAnswerChange = (qIndex: number, value: number) => {
    const updated = [...susAnswers];
    updated[qIndex] = value;
    setSusAnswers(updated);
  };

  const handleSubmitSus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentName.trim()) return;

    addSusResponse(project.id, respondentName, respondentRole, susAnswers, openFeedback);

    setRespondentName('');
    setOpenFeedback('');
    setShowSusForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-5 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="usability_sus" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Pruebas de Usabilidad & Escala SUS</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'usability_sus')?.durationEstimate}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F4F1FF]">
                {respondents.length > 0 ? avgSus : '—'}
              </span>
              {respondents.length > 0 && (
                <span className="text-xs font-semibold text-[#22D3EE]">
                  / 100 · Grado {avgSus >= 80 ? 'A' : avgSus >= 68 ? 'C' : 'D'}
                </span>
              )}
              <span className="text-xs text-[#7D71A4]">
                · {respondents.length} respuestas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-36">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>
          <button
            onClick={() => setShowSusForm(!showSusForm)}
            className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title={showSusForm ? 'Cerrar escala SUS' : 'Responder escala SUS'}
            aria-label={showSusForm ? 'Cerrar escala SUS' : 'Responder escala SUS'}
          >
            {showSusForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showSusForm && (
        <form onSubmit={handleSubmitSus} className="bg-[#120E24]/85 backdrop-blur-xl p-5 rounded-2xl border border-[#2A2248] space-y-5">
          <div className="border-b border-[#221A3D] pb-3">
            <h4 className="text-sm font-semibold text-[#F4F1FF]">Cuestionario SUS (1 a 5)</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Evaluador *</label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Ej. Valeria Gómez"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Rol</label>
              <input
                type="text"
                value={respondentRole}
                onChange={(e) => setRespondentRole(e.target.value)}
                placeholder="Usuario final, Diseñador..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {SUS_QUESTIONS.map((q, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#0E0A1D] rounded-lg border border-[#241D42] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <span className="text-[#F4F1FF] max-w-xl">{q}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => handleAnswerChange(idx, val)}
                      className={`w-7 h-7 text-xs font-mono font-semibold rounded-md border transition-colors ${
                        susAnswers[idx] === val
                          ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF]'
                          : 'bg-[#120E24] text-[#A89EC9] border-[#2A2248] hover:border-[#463578]'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-[#A89EC9] mb-1">Comentarios</label>
            <textarea
              rows={2}
              value={openFeedback}
              onChange={(e) => setOpenFeedback(e.target.value)}
              placeholder="Dudas o fricciones observadas..."
              className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSusForm(false)}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg"
              title="Cancelar"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg"
              title="Guardar SUS"
              aria-label="Guardar respuesta SUS"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-[#120E24]/80 p-4 rounded-2xl border border-[#2A2248]">
          <div>
            <h4 className="text-sm font-semibold text-[#F4F1FF]">Tareas Evaluadas</h4>
            <p className="text-xs text-[#7D71A4]">Éxito %, tiempo y esfuerzo (SEQ 1-7)</p>
          </div>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="p-2 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-lg transition-colors"
            title={showTaskForm ? 'Cerrar' : 'Añadir tarea'}
            aria-label={showTaskForm ? 'Cerrar formulario de tarea' : 'Añadir tarea de usabilidad'}
          >
            {showTaskForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Tarea *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej. Descargar certificado"
                  required
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Escenario</label>
                <input
                  type="text"
                  value={taskScenario}
                  onChange={(e) => setTaskScenario(e.target.value)}
                  placeholder="Contexto de la tarea..."
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Éxito (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taskSuccess}
                  onChange={(e) => setTaskSuccess(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Segundos</label>
                <input
                  type="number"
                  min="1"
                  value={taskTime}
                  onChange={(e) => setTaskTime(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">SEQ (1-7)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="7"
                  value={taskSeq}
                  onChange={(e) => setTaskSeq(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Fricciones (líneas)</label>
              <textarea
                rows={2}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Observaciones..."
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
                title="Cancelar"
                aria-label="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="p-2 bg-[#FF6B1A] text-[#090616] rounded-lg"
                title="Guardar tarea"
                aria-label="Guardar tarea"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((t) => (
            <div key={t.id} className="bg-[#120E24]/80 p-4 rounded-2xl border border-[#2A2248] space-y-3">
              <h5 className="font-semibold text-xs text-[#F4F1FF]">{t.title}</h5>
              <p className="text-xs text-[#A89EC9] italic">"{t.scenario}"</p>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#221A3D] text-center text-xs">
                <div>
                  <span className="block text-[10px] text-[#7D71A4]">Éxito</span>
                  <span className="font-mono font-bold text-[#22D3EE]">{t.successRate}%</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#7D71A4]">Tiempo</span>
                  <span className="font-mono font-bold text-[#F4F1FF]">{t.avgTimeSeconds}s</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#7D71A4]">SEQ</span>
                  <span className="font-mono font-bold text-[#FF6B1A]">{t.seqScore}</span>
                </div>
              </div>

              {t.frictionNotes.length > 0 && (
                <ul className="text-xs text-[#A89EC9] space-y-1">
                  {t.frictionNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#EC4899]">·</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
