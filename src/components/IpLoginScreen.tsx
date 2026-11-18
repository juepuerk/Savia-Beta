/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Sign-in: recognized profile first, other profiles next, manual IP as an advanced option
 */

import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Shield } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { findUserByIp } from '../utils/evaluationLogic';
import type { User } from '../types';

const Avatar: React.FC<{ user: User; size?: 'sm' | 'md' }> = ({ user, size = 'sm' }) => (
  <span
    className={`${size === 'md' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'} rounded-lg flex items-center justify-center font-bold text-[#090616] shrink-0`}
    style={{ backgroundColor: user.avatarColor }}
    aria-hidden="true"
  >
    {user.name.charAt(0)}
  </span>
);

export const IpLoginScreen: React.FC = () => {
  const { members, detectedClientIp, loginWithIp } = useWorkspace();
  const [ipInput, setIpInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognized = findUserByIp(members, detectedClientIp);
  const others = members.filter((m) => m.id !== recognized?.id);

  const handleIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginWithIp(ipInput || detectedClientIp);
    setError(res.ok ? null : res.error || 'No hay ningún perfil con esa IP.');
  };

  return (
    <div className="min-h-screen relative text-[#F4F1FF] flex items-center justify-center p-4 overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.16) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[540px] h-[540px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.16) 0%, transparent 70%)' }}
        />
      </div>

      <main className="w-full max-w-md bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(9,6,22,0.75)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B1A] text-[#090616] flex items-center justify-center font-bold text-sm shadow-[0_0_18px_rgba(255,107,26,0.4)]">
            S
          </div>
          <span className="text-base font-semibold tracking-tight">Savia</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#241B46] text-[#D8B4FE] border border-[#463578]">
            Beta
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold">Entrar a Savia</h1>
          <p className="text-sm text-[#A89EC9]">
            Investigación UX y diseño de servicios con métodos guiados. Elige tu perfil para ver los proyectos que
            tienes asignados.
          </p>
        </div>

        {recognized && (
          <button
            type="button"
            onClick={() => loginWithIp(recognized.id)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#241B46] border border-[#B892FF]/60 hover:border-[#B892FF] transition-colors text-left"
          >
            <Avatar user={recognized} size="md" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-[#22D3EE]">Reconocimos este equipo</span>
              <span className="block text-base font-semibold break-words">Continuar como {recognized.name}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#FF823A] shrink-0" aria-hidden="true" />
          </button>
        )}

        <section aria-labelledby="profiles-heading" className="space-y-2.5">
          <h2 id="profiles-heading" className="text-sm font-medium text-[#D8D0F5]">
            {recognized ? '¿No eres tú? Elige otro perfil' : 'Elige tu perfil'}
          </h2>
          <ul className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {others.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => loginWithIp(m.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#0E0A1D]/90 border border-[#241D42] hover:border-[#B892FF]/60 hover:bg-[#191234] transition-colors text-left"
                >
                  <Avatar user={m} />
                  <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium truncate">
                      {m.name}
                      {m.isAdmin && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-[#B892FF]">
                          <Shield className="w-3 h-3" aria-hidden="true" />
                          Admin
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-[#958AC0] block truncate">{m.role}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#958AC0] shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <details className="group border-t border-[#221A3D] pt-4">
          <summary className="flex items-center justify-between cursor-pointer text-sm text-[#A89EC9] hover:text-[#F4F1FF] list-none">
            Entrar con una dirección IP
            <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <form onSubmit={handleIpSubmit} className="mt-3 space-y-2">
            <label htmlFor="login-ip-input" className="block text-xs text-[#A89EC9]">
              Dirección IP registrada (la de este equipo es {detectedClientIp})
            </label>
            <div className="flex items-center gap-2">
              <input
                id="login-ip-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={ipInput}
                onChange={(e) => {
                  setIpInput(e.target.value);
                  setError(null);
                }}
                placeholder={detectedClientIp}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'login-ip-error' : undefined}
                className="flex-1 min-w-0 px-3 py-2.5 text-sm font-mono bg-[#0E0A1D] border border-[#241D42] rounded-lg text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-lg"
              >
                Entrar
              </button>
            </div>
            {error && (
              <p id="login-ip-error" role="alert" className="text-sm text-[#F472B6]">
                {error}
              </p>
            )}
          </form>
        </details>

        <p className="text-xs text-[#958AC0]">
          Versión beta: los proyectos se guardan en este navegador y no se comparten entre dispositivos.
        </p>
      </main>
    </div>
  );
};
