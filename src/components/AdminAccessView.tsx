/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Admin Project Access & IP Matrix View (Dark Violet Theme)
 */

import React, { useState } from 'react';
import { ArrowUpRight, Check, Lock, Plus, Shield, UserPlus, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { calculateProjectProgress } from '../utils/evaluationLogic';
import { MethodProgressBar } from './MethodProgressBar';

interface AdminAccessViewProps {
  onEnterProject: (projectId: string) => void;
}

export const AdminAccessView: React.FC<AdminAccessViewProps> = ({ onEnterProject }) => {
  const {
    allProjects,
    members,
    currentUser,
    toggleProjectPermission,
    toggleUserAdmin,
    inviteMember,
  } = useWorkspace();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  if (!currentUser.isAdmin) {
    return null;
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ipAddress.trim()) return;
    inviteMember(
      name,
      role || 'Investigador',
      email || `${name.toLowerCase().replace(/\s+/g, '.')}@savia.studio`,
      ipAddress
    );
    setName('');
    setRole('');
    setEmail('');
    setIpAddress('');
    setShowInviteForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Admin Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F1FF] flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#B892FF] shrink-0" />
            <span>Control de Accesos y Proyectos</span>
          </h1>
          <p className="text-xs text-[#958AC0] mt-0.5 font-mono">
            {allProjects.length} proyectos totales · {members.length} identidades IP
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shadow-[0_0_20px_rgba(255,107,26,0.3)]"
          title={showInviteForm ? 'Cerrar' : 'Registrar usuario por IP'}
        >
          {showInviteForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showInviteForm ? 'Cerrar' : 'Registrar usuario'}</span>
        </button>
      </div>

      {/* Add IP Member Form */}
      {showInviteForm && (
        <form
          onSubmit={handleInvite}
          className="bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej. Sofía Castro"
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">IP *</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                required
                placeholder="190.85.14.22"
                className="w-full px-3 py-2 text-xs font-mono bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A89EC9] mb-1">Rol</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="UX Designer"
                className="w-full px-3 py-2 text-xs bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] focus:outline-none focus:border-[#B892FF]"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg"
                title="Guardar usuario IP"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* All Projects Permission Matrix */}
      <div className="space-y-3">
        {allProjects.map((project) => {
          const prog = calculateProjectProgress(project);
          return (
            <div
              key={project.id}
              data-project-id={project.id}
              className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#958AC0]">
                    <span className="text-[#22D3EE]">{project.productType}</span>
                    <span>·</span>
                    <span>{project.collaboratorIds.length} con acceso</span>
                    <span>·</span>
                    <span className="text-[#B892FF]">{prog.overallPercent}% avance</span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#F4F1FF] truncate">
                    {project.title}
                  </h2>
                  <div className="max-w-xs">
                    <MethodProgressBar percent={prog.overallPercent} showPercent={false} size="xs" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onEnterProject(project.id)}
                  className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] hover:text-[#F4F1FF] rounded-xl transition-colors shrink-0"
                  title={`Entrar a ${project.title}`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Entrar</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#221A3D]">
                {members.map((member) => {
                  const hasAccess = project.collaboratorIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleProjectPermission(project.id, member.id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                        hasAccess
                          ? 'bg-[#241B46] border-[#B892FF]/65 text-[#D8B4FE]'
                          : 'bg-[#0E0A1D] border-[#241D42] text-[#958AC0] hover:text-[#A89EC9]'
                      }`}
                      title={
                        hasAccess
                          ? `Revocar acceso de ${member.name} (${member.ipAddress})`
                          : `Permitir acceso a ${member.name} (${member.ipAddress})`
                      }
                      aria-label={`${hasAccess ? 'Revocar' : 'Permitir'} acceso de ${member.name} en ${project.title}`}
                      aria-pressed={hasAccess}
                    >
                      {hasAccess ? <Check className="w-3 h-3 text-[#22D3EE]" /> : <Lock className="w-3 h-3" />}
                      <span>{member.name.split(' ')[0]}</span>
                      <span className="font-mono text-xs opacity-75">{member.ipAddress}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* IP Users & Admin Roles */}
      <div className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-monor text-[#958AC0]">
          Roles de Administrador por IP
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#F4F1FF] truncate">{m.name}</div>
                <div className="text-xs font-mono text-[#958AC0]">{m.ipAddress}</div>
              </div>
              <button
                type="button"
                disabled={m.id === currentUser.id}
                onClick={() => toggleUserAdmin(m.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  m.isAdmin
                    ? 'bg-[#241B46] border-[#B892FF]/65 text-[#D8B4FE]'
                    : 'bg-[#1E1638] border-[#463578] text-[#958AC0] hover:text-[#F4F1FF]'
                } disabled:opacity-50`}
                title={m.isAdmin ? 'Admin activo' : 'Hacer Admin'}
                aria-label={`Alternar rol Admin para ${m.name}`}
              >
                <Shield className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
