/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - IP-Bound Dark Violet Glass Sign-In Screen
 */

import React, { useState } from 'react';
import { ArrowRight, Shield, Globe } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const IpLoginScreen: React.FC = () => {
  const { members, detectedClientIp, loginWithIp } = useWorkspace();
  const [ipInput, setIpInput] = useState(detectedClientIp || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginWithIp(ipInput || detectedClientIp);
    if (!res.ok) {
      setError(res.error || 'IP no autorizada.');
    } else {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen relative text-[#F4F1FF] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient Blurred Cyan & Magenta Glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-28 -left-24 w-[480px] h-[480px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.16) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-24 w-[500px] h-[500px] rounded-full blur-[135px]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.16) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-md bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(9,6,22,0.75)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B1A] text-[#090616] flex items-center justify-center font-bold text-sm shadow-[0_0_18px_rgba(255,107,26,0.4)]">
              S
            </div>
            <span className="text-base font-semibold tracking-tight text-[#F4F1FF]">Savia</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D8B4FE] bg-[#1E1638] border border-[#463578] px-2.5 py-1 rounded-lg">
            <Globe className="w-3 h-3 text-[#22D3EE]" />
            <span>{detectedClientIp}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#F4F1FF]">Acceso por IP</h1>
          <p className="text-xs text-[#A89EC9] mt-1">
            Solo verás los proyectos asignados a tu dirección IP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="login-ip-input" className="block text-xs text-[#A89EC9] mb-1.5">
              Dirección IP
            </label>
            <div className="flex items-center gap-2">
              <input
                id="login-ip-input"
                type="text"
                value={ipInput}
                onChange={(e) => {
                  setIpInput(e.target.value);
                  setError(null);
                }}
                placeholder={detectedClientIp}
                className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-[#0E0A1D] border border-[#241D42] rounded-xl text-[#F4F1FF] placeholder-[#7D71A4] focus:outline-none focus:border-[#B892FF]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#FF6B1A] hover:bg-[#FF823A] text-[#090616] rounded-xl transition-colors shrink-0 shadow-[0_0_20px_rgba(255,107,26,0.35)]"
                title="Ingresar con IP"
                aria-label="Ingresar con IP"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-[#F472B6] bg-[#2B1228] border border-[#EC4899]/40 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </form>

        <div className="pt-4 border-t border-[#221A3D] space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#7D71A4] block">
            Identidades IP registradas
          </span>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => loginWithIp(m.id)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0E0A1D]/90 border border-[#241D42] hover:border-[#B892FF]/60 hover:bg-[#191234] transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-[#090616] shrink-0"
                    style={{ backgroundColor: m.avatarColor }}
                  >
                    {m.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[#F4F1FF] truncate">{m.name}</span>
                      {m.isAdmin && (
                        <Shield className="w-3 h-3 text-[#B892FF] shrink-0" aria-label="Administrador" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#7D71A4] block truncate">{m.role}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#A89EC9] shrink-0">
                  {m.ipAddress}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
