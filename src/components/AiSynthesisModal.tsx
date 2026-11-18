/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet AI Synthesis Modal (Human Review Required)
 */

import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, X } from 'lucide-react';
import { Project } from '../types';
import { Modal } from './ui/Modal';
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
    <Modal onClose={onClose} labelledBy="ai-title">
        <div className="flex items-center justify-between border-b border-[#221A3D] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B892FF]" />
            <h2 id="ai-title" className="text-base font-semibold text-[#F4F1FF]">Síntesis con IA</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              {loading ? 'Analizando…' : summary || drafts.length > 0 ? 'Volver a generar' : 'Generar síntesis'}
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

        {loading && (
          <p className="text-sm text-[#A89EC9] py-6 text-center" role="status">
            Analizando la evidencia del proyecto. Suele tardar entre 5 y 20 segundos.
          </p>
        )}

        {error && (
          <div role="alert" className="bg-[#2B1228] border border-[#EC4899]/40 text-[#F472B6] text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {!summary && drafts.length === 0 && !loading && !error && (
          <p className="text-xs text-[#A89EC9] py-6 text-center">
            La IA lee la evidencia de todos los métodos del proyecto y propone hallazgos. Nada se guarda hasta que apruebes cada uno.
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
                    className={`inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-2.5 py-1.5 rounded-lg border shrink-0 ${
                      approved
                        ? 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]'
                        : 'bg-[#1E1638] border-[#463578] text-[#D8B4FE] hover:border-[#B892FF]'
                    }`}
                    title={approved ? 'Aprobado' : 'Aprobar hallazgo'}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{approved ? 'Aprobado' : 'Aprobar'}</span>
                  </button>
                </div>
                <p className="text-xs text-[#22D3EE]">{draft.recommendation}</p>
              </div>
            );
          })}
        </div>
    </Modal>
  );
};
