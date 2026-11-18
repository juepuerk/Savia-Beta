/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Dismissible beta notice explaining where data is stored
 */

import React, { useState } from 'react';
import { FlaskConical, X } from 'lucide-react';

const STORAGE_KEY = 'savia_beta_notice_dismissed_v1';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export const BetaNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(readDismissed);
  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable: the notice simply shows again next visit.
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 print:hidden">
      <div className="flex items-start gap-3 bg-[#1A1430] border border-[#463578] rounded-xl px-4 py-3">
        <FlaskConical className="w-4 h-4 text-[#FF823A] shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-[#D8D0F5] flex-1">
          <strong className="text-[#F4F1FF]">Versión beta.</strong> Tus proyectos se guardan solo en este
          navegador: no se comparten con otras personas ni con otros dispositivos.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="p-1 text-[#A89EC9] hover:text-[#F4F1FF] rounded-lg shrink-0"
          aria-label="Cerrar aviso de beta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
