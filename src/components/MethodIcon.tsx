/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Representative Icons for Each Evaluation Methodology
 */

import React from 'react';
import {
  Accessibility,
  ClipboardList,
  Gauge,
  GitBranch,
  LayoutGrid,
  Mountain,
  Route,
  ScanSearch,
  Target,
} from 'lucide-react';
import { EvaluationMethodId } from '../types';

interface MethodIconConfig {
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  badgeClass: string;
}

const METHOD_ICON_MAP: Record<EvaluationMethodId, MethodIconConfig> = {
  iceberg_model: {
    Icon: Mountain,
    colorClass: 'text-[#22D3EE]',
    badgeClass: 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]',
  },
  heuristic_evaluation: {
    Icon: ScanSearch,
    colorClass: 'text-[#B892FF]',
    badgeClass: 'bg-[#241B46] border-[#B892FF]/45 text-[#D8B4FE]',
  },
  usability_sus: {
    Icon: Gauge,
    colorClass: 'text-[#FF6B1A]',
    badgeClass: 'bg-[#2B1710] border-[#FF6B1A]/45 text-[#FF823A]',
  },
  customer_journey: {
    Icon: Route,
    colorClass: 'text-[#22D3EE]',
    badgeClass: 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]',
  },
  card_sorting: {
    Icon: LayoutGrid,
    colorClass: 'text-[#D8B4FE]',
    badgeClass: 'bg-[#1E1638] border-[#B892FF]/45 text-[#D8B4FE]',
  },
  wcag_audit: {
    Icon: Accessibility,
    colorClass: 'text-[#22D3EE]',
    badgeClass: 'bg-[#0F242C] border-[#22D3EE]/40 text-[#22D3EE]',
  },
  impact_effort: {
    Icon: Target,
    colorClass: 'text-[#FF6B1A]',
    badgeClass: 'bg-[#2B1710] border-[#FF6B1A]/45 text-[#FF823A]',
  },
  service_blueprint: {
    Icon: GitBranch,
    colorClass: 'text-[#B892FF]',
    badgeClass: 'bg-[#241B46] border-[#B892FF]/45 text-[#D8B4FE]',
  },
  survey_feedback: {
    Icon: ClipboardList,
    colorClass: 'text-[#F472B6]',
    badgeClass: 'bg-[#2B1228] border-[#EC4899]/45 text-[#F472B6]',
  },
};

interface MethodIconProps {
  methodId: EvaluationMethodId;
  variant?: 'badge' | 'inline';
  size?: 'sm' | 'md';
  className?: string;
}

export const MethodIcon: React.FC<MethodIconProps> = ({
  methodId,
  variant = 'inline',
  size = 'md',
  className = '',
}) => {
  const cfg = METHOD_ICON_MAP[methodId] || METHOD_ICON_MAP.iceberg_model;
  const { Icon } = cfg;

  if (variant === 'badge') {
    const boxSize = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl';
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <span
        className={`${boxSize} border flex items-center justify-center shrink-0 ${cfg.badgeClass} ${className}`}
        aria-hidden="true"
      >
        <Icon className={iconSize} />
      </span>
    );
  }

  const inlineSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return <Icon className={`${inlineSize} shrink-0 ${cfg.colorClass} ${className}`} aria-hidden="true" />;
};
