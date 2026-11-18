/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Top navigation (desktop) and bottom tab bar (mobile)
 */

import React from 'react';
import { BookOpen, FileText, FolderKanban, LayoutDashboard, LogOut, Plus, Shield } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { SectionName } from '../hooks/useRoute';

interface HeaderProps {
  activeSection: SectionName;
  onNavigate: (section: SectionName) => void;
  onOpenNewProject: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: SectionName; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'projects', label: 'Proyectos', icon: FolderKanban },
  { id: 'methods', label: 'Métodos', icon: BookOpen },
  { id: 'reports', label: 'Informes', icon: FileText },
  { id: 'admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onOpenNewProject, onLogout }) => {
  const { currentUser, logout } = useWorkspace();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || currentUser.isAdmin);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B071A]/85 backdrop-blur-xl border-b border-[#2A2248] print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 shrink-0"
              aria-label="Savia, ir al panel"
            >
              <span className="w-7 h-7 rounded-lg bg-[#FF6B1A] text-[#090616] flex items-center justify-center font-bold text-sm shadow-[0_0_14px_rgba(255,107,26,0.35)]">
                S
              </span>
              <span className="text-sm font-semibold tracking-tight">Savia</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#241B46] text-[#D8B4FE] border border-[#463578]">
                Beta
              </span>
            </button>

            <nav aria-label="Navegación principal" className="hidden sm:flex items-center gap-1">
              {items.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onNavigate(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-[#241B46] text-[#F4F1FF] border border-[#B892FF]/45 font-medium'
                        : 'text-[#A89EC9] hover:text-[#F4F1FF] hover:bg-[#1E1638] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#120E24] border border-[#2A2248] text-xs"
              title={`Perfil activo · IP ${currentUser.ipAddress}`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentUser.avatarColor }} aria-hidden="true" />
              <span className="text-[#F4F1FF] font-medium">{currentUser.name}</span>
            </div>

            <button
              type="button"
              onClick={onOpenNewProject}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg transition-colors shadow-[0_0_16px_rgba(255,107,26,0.3)]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Nuevo proyecto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#C4B5FD] hover:text-[#F4F1FF] rounded-lg transition-colors text-sm"
              title={`Salir de ${currentUser.name}`}
              aria-label="Salir"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar: reachable with the thumb, always visible */}
      <nav
        aria-label="Navegación principal"
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0B071A]/95 backdrop-blur-xl border-t border-[#2A2248] print:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors ${
                  active ? 'text-[#FF823A] font-semibold' : 'text-[#A89EC9]'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
