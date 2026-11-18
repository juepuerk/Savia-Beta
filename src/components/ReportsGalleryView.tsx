/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet Reports Gallery View
 */

import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { calculateProjectProgress } from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';

interface ReportsGalleryViewProps {
  onOpenReport: (projectId: string) => void;
  onOpenProject: (projectId: string) => void;
}

export const ReportsGalleryView: React.FC<ReportsGalleryViewProps> = ({
  onOpenReport,
  onOpenProject,
}) => {
  const { projects } = useWorkspace();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F1FF]">
          Informes Ejecutivos
        </h1>
        <p className="text-xs text-[#958AC0] font-mono mt-0.5">
          {projects.length} proyectos accesibles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const approvedCount = project.findings.filter((f) => f.status === 'aprobado').length;
          const progress = calculateProjectProgress(project);
          return (
            <div
              key={project.id}
              className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] hover:border-[#463578] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#22D3EE]">{project.productType}</span>
                <h2 className="text-sm font-semibold text-[#F4F1FF]">{project.title}</h2>
                <p className="text-xs font-mono text-[#B892FF]">
                  {approvedCount} hallazgos aprobados
                </p>
                <MethodProgressBar percent={progress.overallPercent} label="Completitud" size="xs" />
              </div>

              <div className="pt-3 border-t border-[#221A3D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProject(project.id)}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] hover:text-[#F4F1FF] rounded-xl transition-colors"
                  title="Abrir proyecto"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Abrir proyecto</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReport(project.id)}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
                  title="Ver informe PDF"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver informe</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
