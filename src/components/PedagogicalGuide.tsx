/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet Pedagogical Guide
 */

import React from 'react';
import { Clock, X } from 'lucide-react';
import { MethodMetadata } from '../types';
import { MethodIcon } from './MethodIcon';

export const PedagogicalGuide: React.FC<{ method: MethodMetadata; onClose?: () => void }> = ({
  method,
  onClose,
}) => {
  return (
    <div className="bg-[#120E24]/85 backdrop-blur-xl border border-[#2A2248] rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3 border-b border-[#221A3D] pb-3">
        <MethodIcon methodId={method.id} variant="badge" size="sm" />
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#22D3EE]">Cómo aplicar este método</span>
          <h2 className="text-base font-bold text-[#F4F1FF] leading-snug">{method.name}</h2>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B4FE] mt-1">
            <Clock className="w-3 h-3 text-[#B892FF] shrink-0" />
            <span>{method.durationEstimate}</span>
          </div>
          <p className="text-sm text-[#A89EC9] mt-1.5">{method.whenToUse}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 text-xs text-[#A89EC9] hover:text-[#F4F1FF] border border-transparent hover:border-[#463578] rounded-lg shrink-0"
            aria-label="Ocultar guía"
          >
            <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Ocultar guía</span>
          </button>
        )}
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        {method.stepByStepGuide.map((step, idx) => (
          <li
            key={idx}
            className="bg-[#0E0A1D] border border-[#241D42] rounded-xl p-3 text-[#A89EC9] leading-relaxed"
          >
            <span className="font-mono text-[#22D3EE] block text-xs mb-1">
              Paso {idx + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
};
