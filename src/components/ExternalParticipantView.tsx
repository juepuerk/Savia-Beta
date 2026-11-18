/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet External Participant Survey Portal
 */

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

interface ExternalParticipantViewProps {
  projectId: string;
  onExit: () => void;
}

export const ExternalParticipantView: React.FC<ExternalParticipantViewProps> = ({
  projectId,
  onExit,
}) => {
  const { allProjects, submitSurveyResponse } = useWorkspace();
  const project = allProjects.find((p) => p.id === projectId) || allProjects[0];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    submitSurveyResponse(project.id, {
      participantName: name.trim(),
      participantEmail: email.trim() || undefined,
      answers,
      generalFeedback: feedback.trim() || undefined,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen relative text-[#F4F1FF] p-4 sm:p-8 flex items-center justify-center overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.14) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-2xl bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#221A3D] pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExit}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-xl"
              title="Salir del portal"
              aria-label="Salir de vista de participante"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[11px] font-mono text-[#22D3EE] uppercase">Actividad Externa</span>
              <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#F4F1FF]">
                {project.title}
              </h1>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#22D3EE] mx-auto" />
            <h2 className="text-base font-semibold text-[#F4F1FF]">Respuesta registrada</h2>
            <p className="text-xs text-[#A89EC9]">Gracias por aportar tu experiencia.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A89EC9] mb-1">Correo (opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {project.surveyQuestions.map((q) => (
                <div key={q.id} className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-4 space-y-2.5">
                  <label className="block text-xs font-medium text-[#F4F1FF]">{q.title}</label>

                  {q.type === 'rating_scale' && (
                    <div className="flex flex-wrap gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: num })}
                          className={`w-8 h-8 rounded-lg text-xs font-mono border transition-colors ${
                            answers[q.id] === num
                              ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF] font-bold'
                              : 'bg-[#120E24] text-[#A89EC9] border-[#2A2248] hover:border-[#463578]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'yes_no' && (
                    <div className="flex gap-2">
                      {['Sí', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`px-4 py-1.5 rounded-lg text-xs border transition-colors ${
                            answers[q.id] === opt
                              ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF] font-semibold'
                              : 'bg-[#120E24] text-[#A89EC9] border-[#2A2248]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'multiple_choice' && (
                    <div className="flex flex-wrap gap-2">
                      {(q.options || []).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                            answers[q.id] === opt
                              ? 'bg-[#241B46] text-[#F4F1FF] border-[#B892FF] font-semibold'
                              : 'bg-[#120E24] text-[#A89EC9] border-[#2A2248]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <textarea
                      rows={2}
                      value={String(answers[q.id] || '')}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#120E24] border border-[#2A2248] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Comentarios adicionales</label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,26,0.3)]"
                title="Enviar respuesta"
                aria-label="Enviar respuesta"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
