/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Accessible modal dialog: Escape and backdrop close, focus trap, focus restore, scroll lock
 */

import React, { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  onClose: () => void;
  /** id of the element that names the dialog (usually its h2). */
  labelledBy: string;
  children: React.ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  /** Render the panel as a <form> so Enter submits. */
  as?: 'div' | 'form';
  onSubmit?: (e: React.FormEvent) => void;
}

export const Modal: React.FC<ModalProps> = ({
  onClose,
  labelledBy,
  children,
  overlayClassName = 'fixed inset-0 z-50 bg-[#05030E]/80 backdrop-blur-md flex items-center justify-center p-4',
  panelClassName = 'w-full max-w-2xl bg-[#120E24] border border-[#2A2248] rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.65)]',
  as = 'div',
  onSubmit,
}) => {
  const panelRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const autofocus = panel?.querySelector<HTMLElement>('[data-autofocus]');
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (autofocus || first || panel)?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const Panel = as as any;

  return (
    <div
      className={overlayClassName}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`${panelClassName} focus:outline-none`}
        onSubmit={onSubmit}
      >
        {children}
      </Panel>
    </div>
  );
};
