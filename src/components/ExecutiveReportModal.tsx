/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Executive PDF Print Report Modal (Dark Violet Screen / Clean White Print)
 */

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Project } from '../types';
import { Modal } from './ui/Modal';

export const ExecutiveReportModal: React.FC<{
  project: Project;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const approvedFindings = project.findings.filter((f) => f.status === 'aprobado');

  return (
    <Modal onClose={onClose} labelledBy="report-title" overlayClassName="fixed inset-0 z-50 bg-[#05030E]/85 backdrop-blur-md flex items-center justify-center p-4 print:static print:bg-white print:p-0" panelClassName="w-full max-w-3xl bg-[#120E24] border border-[#2A2248] rounded-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto print:max-h-none print:border-0 print:bg-white print:text-black print:p-0 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-[#221A3D] pb-4 print:border-neutral-300">
          <div>
            <span className="text-xs font-mono text-[#22D3EE] uppercase print:text-neutral-600">
              Informe Ejecutivo · Savia
            </span>
            <h2 id="report-title" className="text-lg font-semibold text-[#F4F1FF] print:text-black mt-0.5">
              {project.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl shadow-[0_0_18px_rgba(255,107,26,0.3)]"
              title="Imprimir / Exportar PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir o guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 bg-[#1E1638] border border-[#463578] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-xl"
              title="Cerrar"
              aria-label="Cerrar informe"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-xs text-[#A89EC9] print:text-neutral-700">
          <p>
            <strong className="text-[#F4F1FF] print:text-black">Objetivo:</strong> {project.objective}
          </p>
          <p>
            <strong className="text-[#F4F1FF] print:text-black">Alcance:</strong> {project.scope}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-monor text-[#958AC0] print:text-neutral-600">
            Hallazgos Aprobados ({approvedFindings.length})
          </h3>

          {approvedFindings.length === 0 ? (
            <p className="text-xs text-[#958AC0]">No hay hallazgos aprobados aún.</p>
          ) : (
            approvedFindings.map((f, i) => (
              <div
                key={f.id}
                className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-4 space-y-2 print:bg-neutral-50 print:border-neutral-300"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#F4F1FF] print:text-black">
                    {i + 1}. {f.title}
                  </span>
                  <span className="font-mono text-xs text-[#B892FF] print:text-neutral-700">
                    {f.severityOrImportance}
                  </span>
                </div>
                <p className="text-xs text-[#A89EC9] print:text-neutral-700">{f.description}</p>
                <p className="text-xs text-[#22D3EE] print:text-black">
                  <strong>Recomendación:</strong> {f.recommendation}
                </p>
              </div>
            ))
          )}
        </div>
    </Modal>
  );
};
