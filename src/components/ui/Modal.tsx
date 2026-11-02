"use client";

import { Fragment, ReactNode } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && closeOnEscape) {
      onClose();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/50 animate-fade-in"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          className={clsx(
            "w-full bg-[var(--bg-secondary)] rounded-2xl shadow-[var(--shadow-2xl)] animate-scale-in",
            sizes[size]
          )}
        >
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--border-primary)]">
              <div>
                {title && (
                  <h2 id="modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-sm text-[var(--text-secondary)] mt-1">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="btn-ghost btn-icon-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

export type { ModalProps };