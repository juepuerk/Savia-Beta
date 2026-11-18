/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Toast notifications with optional action (e.g. "Deshacer")
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'info';

interface ToastOptions {
  tone?: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastItem extends Required<Pick<ToastOptions, 'tone' | 'durationMs'>> {
  id: number;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

type ShowToast = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

const MAX_VISIBLE = 3;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>((message, options = {}) => {
    const item: ToastItem = {
      id: nextId.current++,
      message,
      tone: options.tone ?? 'success',
      durationMs: options.durationMs ?? (options.onAction ? 7000 : 4000),
      actionLabel: options.actionLabel,
      onAction: options.onAction,
    };
    setToasts((prev) => [...prev, item].slice(-MAX_VISIBLE));
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className="fixed bottom-24 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-[60] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none print:hidden"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastView: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [paused, setPaused] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => dismissRef.current(), toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [paused, toast.durationMs]);

  const Icon = toast.tone === 'success' ? CheckCircle2 : Info;

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 sm:min-w-[300px] max-w-md bg-[#1E1638] border border-[#463578] rounded-xl pl-3.5 pr-2 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] savia-toast-in"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon className="w-4 h-4 shrink-0 text-[#22D3EE]" aria-hidden="true" />
      <span className="text-sm text-[#F4F1FF] flex-1">{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            onDismiss();
          }}
          className="text-sm font-semibold text-[#FF823A] hover:text-[#FFA366] px-2 py-1 rounded-lg"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="p-1.5 text-[#A89EC9] hover:text-[#F4F1FF] rounded-lg"
        aria-label="Cerrar aviso"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export function useToast(): ShowToast {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
