/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet Glass Header with Fiery Orange & Lilac Accents
 */

import React from 'react';
import { Plus, LogOut, Shield } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export type NavTab = 'dashboard' | 'projects' | 'methods' | 'reports' | 'admin';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewProject,
}) => {
  const { currentUser, logout, setCurrentProjectId } = useWorkspace();

  const handleNav = (tab: NavTab) => {
    setCurrentProjectId(null);
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B071A]/85 backdrop-blur-xl border-b border-[#2A2248] print:hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand + Minimal Nav */}
        <div className="flex items-center gap-1.5 sm:gap-5 min-w-0">
          <button
            type="button"
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 shrink-0"
            aria-label="Savia Inicio"
          >
            <span className="w-7 h-7 rounded-lg bg-[#FF6B1A] text-[#090616] flex items-center justify-center font-bold text-xs shadow-[0_0_16px_rgba(255,107,26,0.35)]">
              S
            </span>
            <span className="font-semibold text-sm text-[#F4F1FF] hidden sm:inline">Savia</span>
          </button>

          <nav aria-label="Navegación principal" className="flex items-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/45 font-medium'
                  : 'text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
            >
              Panel
            </button>
            <button
              type="button"
              onClick={() => handleNav('projects')}
              className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'projects'
                  ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/45 font-medium'
                  : 'text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
            >
              Proyectos
            </button>
            <button
              type="button"
              onClick={() => handleNav('methods')}
              className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'methods'
                  ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/45 font-medium'
                  : 'text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
            >
              Métodos
            </button>
            <button
              type="button"
              onClick={() => handleNav('reports')}
              className={`px-1.5 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/45 font-medium'
                  : 'text-[#A89EC9] hover:text-[#F4F1FF]'
              }`}
            >
              Informes
            </button>
            {currentUser.isAdmin && (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                aria-label="Admin"
                title="Admin"
                className={`px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 ${
                  activeTab === 'admin'
                    ? 'bg-[#241B46] text-[#D8B4FE] border border-[#B892FF]/60 font-medium'
                    : 'text-[#B892FF] hover:text-[#F4F1FF]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: User IP badge + Icon-only Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#120E24] border border-[#2A2248] text-[11px]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentUser.avatarColor }}
            />
            <span className="text-[#F4F1FF] font-medium">{currentUser.name}</span>
            <span className="font-mono text-[#7D71A4]">{currentUser.ipAddress}</span>
          </div>

          <button
            type="button"
            onClick={onOpenNewProject}
            className="p-1.5 sm:p-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            title="Nuevo proyecto"
            aria-label="Nuevo proyecto"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={logout}
            className="p-1.5 sm:p-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg transition-colors"
            title="Cerrar sesión o cambiar IP"
            aria-label="Cerrar sesión o cambiar IP"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
