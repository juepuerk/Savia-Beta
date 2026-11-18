/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Compact Method Completion Progress Bar
 */

import React from 'react';

interface MethodProgressBarProps {
  percent: number;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  showPercent?: boolean;
}

export const MethodProgressBar: React.FC<MethodProgressBarProps> = ({
  percent,
  label,
  size = 'sm',
  showPercent = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const heightClass = size === 'xs' ? 'h-1' : size === 'md' ? 'h-2.5' : 'h-1.5';

  return (
    <div className="w-full space-y-1">
      {(label || showPercent) && (
        <div className="flex items-center justify-between gap-2 text-[11px]">
          {label && <span className="text-[#A89EC9] truncate">{label}</span>}
          {showPercent && (
            <span className="font-mono tabular-nums font-semibold text-[#F4F1FF] shrink-0">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightClass} rounded-full bg-[#1B1435] border border-[#2A2248]/60 overflow-hidden`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            background:
              clamped >= 80
                ? 'linear-gradient(90deg, #22D3EE 0%, #B892FF 55%, #FF6B1A 100%)'
                : clamped >= 40
                ? 'linear-gradient(90deg, #B892FF 0%, #EC4899 55%, #FF6B1A 100%)'
                : 'linear-gradient(90deg, #8B5CF6 0%, #FF6B1A 100%)',
          }}
        />
      </div>
    </div>
  );
};
