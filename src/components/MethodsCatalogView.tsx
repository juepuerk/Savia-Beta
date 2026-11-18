/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dark Violet Methods Catalog View
 */

import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { METHODS_CATALOG } from '../data/initialData';
import { MethodIcon } from './MethodIcon';

interface MethodsCatalogViewProps {
  onStartProjectWithMethod: (methodId: any) => void;
}

export const MethodsCatalogView: React.FC<MethodsCatalogViewProps> = ({
  onStartProjectWithMethod,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold text-[#F4F1FF]">
          Métodos de Evaluación
        </h1>
        <p className="text-xs text-[#958AC0] mt-0.5 font-mono">
          {METHODS_CATALOG.length} herramientas interactivas con barras de avance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {METHODS_CATALOG.map((method) => (
          <div
            key={method.id}
            className="bg-[#120E24]/80 backdrop-blur-xl border border-[#2A2248] hover:border-[#463578] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <MethodIcon methodId={method.id} variant="badge" />
                <span className="text-xs font-mono text-[#22D3EE] text-right">
                  {method.category}
                </span>
              </div>

              <div>
                <h2 className="text-base sm:text-[17px] font-bold text-[#F4F1FF] leading-snug">
                  {method.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B4FE] mt-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#B892FF] shrink-0" />
                  <span>{method.durationEstimate}</span>
                </div>
              </div>

              <p className="text-xs text-[#A89EC9] leading-relaxed">{method.summary}</p>
            </div>

            <div className="pt-3 border-t border-[#221A3D] flex items-center justify-between">
              <span className="text-xs text-[#958AC0] truncate pr-2">
                {method.deliverables.join(' · ')}
              </span>
              <button
                type="button"
                onClick={() => onStartProjectWithMethod(method.id)}
                className="inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-3 py-2 bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] hover:text-[#F4F1FF] rounded-xl transition-colors shrink-0"
                title={`Crear proyecto con ${method.name}`}
              >
                <Plus className="w-4 h-4" />
                <span>Usar en proyecto</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
