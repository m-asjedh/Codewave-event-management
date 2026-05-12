"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-cw-text/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-cw border border-cw-border bg-cw-surface shadow-cw"
      >
        <div className="flex items-start justify-between gap-4 border-b border-cw-border px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-cw-text">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-cw-muted">{description}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" className="shrink-0 px-2 py-1" onClick={onClose}>
            Close
          </Button>
        </div>
        {children ? <div className="px-6 py-5">{children}</div> : null}
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-cw-border bg-cw-surface-2 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
