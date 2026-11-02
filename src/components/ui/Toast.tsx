"use client";

import { useState, useEffect, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { clsx } from "clsx";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastToast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastToast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration ?? 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const variants = {
    default: "bg-[var(--bg-secondary)] border-[var(--border-primary)]",
    success: "bg-success-light border-success/30",
    error: "bg-error-light border-error/30",
    warning: "bg-warning-light border-warning/30",
    info: "bg-primary-light border-primary/30",
  };

  const icons = {
    default: null,
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary" />,
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-start gap-3 p-4 min-w-[300px] max-w-md rounded-xl border shadow-[var(--shadow-xl)] animate-slide-in",
        variants[toast.variant || "default"]
      )}
      role="alert"
    >
      {icons[toast.variant || "default"] && (
        <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
          {icons[toast.variant || "default"]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)]">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg p-1 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

import { createContext, useContext } from "react";

export type { Toast };