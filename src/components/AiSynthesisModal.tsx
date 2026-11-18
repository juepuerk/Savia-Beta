/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet AI Synthesis Modal (Human Review Required)
 */

import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, X } from 'lucide-react';
import { Project } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';

interface DraftFinding {
  title: string;
  severityOrImportance: 'Alta' | 'Media' | 'Baja';
  description: string;
  evidence: string;
  recommendation: string;
}

export const AiSynthesisModal: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const { approveFinding } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [drafts, setDrafts] = useState<DraftFinding[]>([]);
  const [approvedIndices, setApprovedIndices] = useState<number[]>([]);

  const handleSynthesize = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.title,
          objective: project.objective,
          evidencePayload: {
            iceberg: project.icebergItems,
            heuristics: project.heuristicItems,
            journeys: project.journeyStages,
            wcag: project.wcagItems,
            surveys: project.surveyResponses,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo generar la síntesis.');
      }
      setSummary(data.executiveSummary || '');
      setDrafts(Array.isArray(data.draftFindings) ? data.draftFindings : []);
      setApprovedIndices([]);
    } catch (err: any) {
      setError(err?.message || 'Error al conectar con el servicio de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDraft = (idx: number, draft: DraftFinding) => {
    approveFinding(project.id, {
      title: draft.title,
      sourceMethod: project.activeMethods[0] || 'iceberg_model',
      severityOrImportance: draft.severityOrImportance || 'Media',
      description: draft.description,
      evidence: draft.evidence,
      recommendation: draft.recommendation,
      status: 'aprobado',
    });
    setApprovedIndices((prev) => [...prev, idx]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#05030E]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#120E24] border border-[#2A2248] rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-[#221A3D] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B892FF]" />
            <h2 className="text-sm font-semibold text-[#F4F1FF]">Síntesis Asistida</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={loading}
              className="p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg disabled:opacity-50"
              title="Generar síntesis"
              aria-label="Generar síntesis con IA"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] rounded-lg"
              title="Cerrar"
              aria-label="Cerrar síntesis"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#2B1228] border border-[#EC4899]/40 text-[#F472B6] text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {!summary && drafts.length === 0 && !loading && !error && (
          <p className="text-xs text-[#A89EC9] py-6 text-center">
            Pulsa el botón de síntesis para analizar la evidencia recopilada y revisar propuestas antes de aprobarlas.
          </p>
        )}

        {summary && (
          <div className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-4 text-xs text-[#F4F1FF] leading-relaxed">
            {summary}
          </div>
        )}

        <div className="space-y-3">
          {drafts.map((draft, idx) => {
            const approved = approvedIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F4F1FF]">{draft.title}</h4>
                    <p className="text-xs text-[#A89EC9] mt-1">{draft.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={approved}
                    onClick={() => handleApproveDraft(idx, draft)}
                    className={`p-1.5 rounded-lg border shrink-0 ${
                      approved
                        ? 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]'
                        : 'bg-[#1E1638] border-[#463578] text-[#D8B4FE] hover:border-[#B892FF]'
                    }`}
                    title={approved ? 'Aprobado' : 'Aprobar hallazgo'}
                    aria-label={`Aprobar "${draft.title}"`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#22D3EE]">{draft.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
