/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Project list: whole card is clickable, clear empty state
 */

import React from 'react';
import { ArrowUpRight, FolderPlus, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { calculateProjectProgress } from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject, onOpenNewProject }) => {
  const { projects } = useWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F1FF]">Proyectos</h1>
          <p className="text-sm text-[#A89EC9] mt-1">
            {projects.length === 1 ? '1 proyecto con acceso' : `${projects.length} proyectos con acceso`}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,26,0.3)]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nuevo proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#120E24]/80 backdrop-blur-xl border border-dashed border-[#463578] rounded-2xl p-10 sm:p-12 text-center space-y-4">
          <FolderPlus className="w-8 h-8 text-[#B892FF] mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold">Aún no tienes proyectos</h2>
            <p className="text-sm text-[#A89EC9] max-w-sm mx-auto">
              Crea uno para empezar a registrar evidencia con métodos guiados, o pide a un administrador que te dé
              acceso a un proyecto existente.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Crear mi primer proyecto
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const progress = calculateProjectProgress(project);
            const approved = project.findings.filter((f) => f.status === 'aprobado').length;
            return (
              <li key={project.id} className="flex">
                <button
                  type="button"
                  data-project-card={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="group w-full text-left bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] hover:border-[#B892FF]/60 hover:bg-[#161030] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#958AC0]">
                      <span className="text-[#22D3EE] truncate">{project.productType}</span>
                      <span className="shrink-0">Actualizado: {project.updatedAt}</span>
                    </div>
                    <h2 className="text-base font-semibold text-[#F4F1FF] leading-snug">{project.title}</h2>
                    <p className="text-sm text-[#A89EC9] line-clamp-2 leading-relaxed">{project.objective}</p>
                  </div>

                  <div className="space-y-3 w-full">
                    <MethodProgressBar percent={progress.overallPercent} label="Avance" size="sm" />
                    <div className="flex items-center justify-between pt-3 border-t border-[#221A3D] text-xs text-[#958AC0]">
                      <span>
                        {project.activeMethods.length} métodos · {approved} hallazgo{approved === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#D8B4FE] group-hover:text-[#F4F1FF] font-medium">
                        Abrir
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
