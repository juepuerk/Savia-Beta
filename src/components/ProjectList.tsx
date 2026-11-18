/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Minimal Permission-Filtered Project List with Overall Progress Bars
 */

import React from 'react';
import { ArrowUpRight, Plus, Lock } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { calculateProjectProgress } from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onSelectProject,
  onOpenNewProject,
}) => {
  const { projects, currentUser } = useWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold uppercase tracking-wide text-[#F4F1FF]">
            Proyectos
          </h1>
          <p className="text-xs text-[#7D71A4] font-mono mt-0.5">
            {projects.length} disponibles para {currentUser.ipAddress}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,26,0.3)]"
          title="Crear proyecto"
          aria-label="Crear proyecto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-12 text-center space-y-3">
          <Lock className="w-6 h-6 text-[#B892FF] mx-auto" />
          <p className="text-sm text-[#A89EC9]">
            Tu IP ({currentUser.ipAddress}) aún no tiene proyectos asignados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project);
            return (
              <div
                key={project.id}
                data-project-card={project.id}
                className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] hover:border-[#463578] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#7D71A4]">
                    <span className="text-[#22D3EE]">{project.productType}</span>
                    <span>{project.updatedAt}</span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#F4F1FF] leading-snug">
                    {project.title}
                  </h2>
                  <p className="text-xs text-[#A89EC9] line-clamp-2 leading-relaxed">
                    {project.objective}
                  </p>
                </div>

                <div className="space-y-3">
                  <MethodProgressBar
                    percent={progress.overallPercent}
                    label="Progreso del proyecto"
                    size="sm"
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-[#221A3D]">
                    <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#7D71A4]">
                      <span>{project.activeMethods.length} métodos</span>
                      <span>·</span>
                      <span>{project.findings.filter((f) => f.status === 'aprobado').length} hallazgos</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className="p-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] hover:text-[#F4F1FF] rounded-xl transition-colors"
                      title={`Abrir ${project.title}`}
                      aria-label={`Abrir ${project.title}`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
