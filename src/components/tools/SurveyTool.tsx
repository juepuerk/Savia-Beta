/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - External Survey & Feedback Tool with CSV Export (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { Download, Plus, CheckCircle, ExternalLink, Copy, X, Check, Clock } from 'lucide-react';
import { Project, SurveyQuestion } from '../../types';
import { METHODS_CATALOG } from '../../data/initialData';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateMethodProgress, generateCsv } from '../../utils/evaluationLogic';
import { MethodProgressBar } from '../MethodProgressBar';
import { MethodIcon } from '../MethodIcon';

export const SurveyTool: React.FC<{
  project: Project;
  onOpenParticipantPortal: () => void;
}> = ({ project, onOpenParticipantPortal }) => {
  const { updateProject } = useWorkspace();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const [questionTitle, setQuestionTitle] = useState('');
  const [questionType, setQuestionType] = useState<SurveyQuestion['type']>('rating_scale');
  const [questionOptions, setQuestionOptions] = useState('Opción 1, Opción 2, Opción 3');

  const questions = project.surveyQuestions || [];
  const responses = project.surveyResponses || [];
  const prog = calculateMethodProgress(project, 'survey_feedback');

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim()) return;

    const newQ: SurveyQuestion = {
      id: 'q_' + Math.random().toString(36).substring(2, 9),
      type: questionType,
      title: questionTitle,
      options:
        questionType === 'multiple_choice'
          ? questionOptions.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
      required: true,
    };

    updateProject(project.id, {
      surveyQuestions: [...questions, newQ],
    });

    setQuestionTitle('');
    setShowAddQuestion(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?participante=true&proyecto=${project.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadCsv = () => {
    if (responses.length === 0) return;

    const headers = [
      'ID Respuesta',
      'Nombre Participante',
      'Correo Electrónico',
      'Fecha de Envío',
      ...questions.map((q) => q.title),
      'Feedback General',
    ];

    const rows = responses.map((r) => [
      r.id,
      r.participantName,
      r.participantEmail || 'No provisto',
      new Date(r.submittedAt).toLocaleString('es-CO'),
      ...questions.map((q) => r.answers[q.id] || ''),
      r.generalFeedback || '',
    ]);

    const csvContent = generateCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `savia_encuesta_${project.title.substring(0, 25).replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#120E24]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#2A2248] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <MethodIcon methodId="survey_feedback" variant="badge" size="sm" />
          <div>
            <h3 className="text-base font-bold text-[#F4F1FF]">Encuestas y Actividades Externas</h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] mt-0.5">
              <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
              <span>{METHODS_CATALOG.find((m) => m.id === 'survey_feedback')?.durationEstimate}</span>
            </div>
            <p className="text-xs text-[#A89EC9] mt-1">
              Enlace aislado sin acceso al resto del espacio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-32 hidden md:block">
            <MethodProgressBar percent={prog.percent} label={prog.completedLabel} size="xs" />
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2.5 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-xl transition-colors"
            title={copiedLink ? 'Enlace copiado' : 'Copiar enlace público'}
            aria-label={copiedLink ? 'Enlace copiado' : 'Copiar enlace público'}
          >
            {copiedLink ? <CheckCircle className="w-4 h-4 text-[#22D3EE]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenParticipantPortal}
            className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title="Abrir vista del participante"
            aria-label="Abrir vista del participante"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#120E24]/80 p-4 rounded-2xl border border-[#2A2248] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#7D71A4] font-mono">
          <span>{questions.length} preguntas</span>
          <span>·</span>
          <span className="text-[#F4F1FF] font-semibold">{responses.length} respuestas</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            disabled={responses.length === 0}
            className={`p-2.5 rounded-xl border transition-colors ${
              responses.length > 0
                ? 'bg-[#1E1638] border-[#463578] text-[#D8B4FE] hover:border-[#B892FF]'
                : 'bg-[#0E0A1D] border-[#241D42] text-[#4C436E] cursor-not-allowed'
            }`}
            title="Exportar CSV"
            aria-label="Exportar respuestas a CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="p-2.5 bg-[#1E1638] border border-[#463578] text-[#D8B4FE] hover:border-[#B892FF] rounded-xl transition-colors"
            title={showAddQuestion ? 'Cerrar' : 'Añadir pregunta'}
            aria-label={showAddQuestion ? 'Cerrar formulario' : 'Añadir pregunta'}
          >
            {showAddQuestion ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showAddQuestion && (
        <form onSubmit={handleAddQuestion} className="bg-[#120E24]/85 p-5 rounded-2xl border border-[#2A2248] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#A89EC9] mb-1">Pregunta *</label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="Ej. ¿Qué tan fácil fue completar el flujo?"
                required
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Tipo</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              >
                <option value="rating_scale">Escala (1-10)</option>
                <option value="multiple_choice">Opción Múltiple</option>
                <option value="yes_no">Sí / No</option>
                <option value="text">Texto</option>
              </select>
            </div>
          </div>

          {questionType === 'multiple_choice' && (
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Opciones (coma)</label>
              <input
                type="text"
                value={questionOptions}
                onChange={(e) => setQuestionOptions(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF]"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddQuestion(false)}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
              title="Cancelar"
              aria-label="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="submit"
              className="p-2 bg-[#FF6B1A] text-[#090616] rounded-lg"
              title="Guardar pregunta"
              aria-label="Guardar pregunta"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#120E24]/80 backdrop-blur-xl rounded-2xl border border-[#2A2248] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0E0A1D] text-[#7D71A4] border-b border-[#2A2248]">
              <tr>
                <th className="px-4 py-3 font-medium">Participante</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                {questions.map((q) => (
                  <th key={q.id} className="px-4 py-3 font-medium min-w-[160px] truncate">
                    {q.title}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221A3D]">
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={questions.length + 3} className="px-4 py-8 text-center text-xs text-[#7D71A4]">
                    Sin respuestas todavía
                  </td>
                </tr>
              ) : (
                responses.map((r) => (
                  <tr key={r.id} className="hover:bg-[#191234] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#F4F1FF]">{r.participantName}</div>
                      <div className="text-[11px] text-[#7D71A4]">{r.participantEmail || 'Anónimo'}</div>
                    </td>
                    <td className="px-4 py-3 text-[#7D71A4] font-mono whitespace-nowrap">
                      {new Date(r.submittedAt).toLocaleDateString('es-CO')}
                    </td>
                    {questions.map((q) => (
                      <td key={q.id} className="px-4 py-3 text-[#A89EC9]">
                        {r.answers[q.id] !== undefined ? String(r.answers[q.id]) : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-[#A89EC9] italic max-w-xs truncate">
                      {r.generalFeedback || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
