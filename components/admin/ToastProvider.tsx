"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, variant: Toast["variant"], duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, variant: Toast["variant"], duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newToast: Toast = { id, message, variant, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, duration?: number) => addToast(message, "success", duration);
  const error = (message: string, duration?: number) => addToast(message, "error", duration);
  const info = (message: string, duration?: number) => addToast(message, "info", duration);
  const warning = (message: string, duration?: number) => addToast(message, "warning", duration);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const variantStyles = {
    success: { bg: "#d1e7dd", border: "#198754", icon: "✓", color: "#0f5132" },
    error: { bg: "#f8d7da", border: "#dc3545", icon: "✕", color: "#842029" },
    info: { bg: "#cfe2ff", border: "#0d6efd", icon: "ℹ", color: "#084298" },
    warning: { bg: "#fff3cd", border: "#ffc107", icon: "⚠", color: "#664d03" },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant];
        return (
          <div
            key={toast.id}
            className="shadow-lg"
            style={{
              backgroundColor: style.bg,
              border: `2px solid ${style.border}`,
              borderRadius: "0.5rem",
              padding: "1rem",
              display: "flex",
              alignItems: "start",
              gap: "0.75rem",
              animation: "slideInRight 0.3s ease-out",
              color: style.color,
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: style.border,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              {style.icon}
            </div>
            <div className="flex-grow-1" style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>
              {toast.message}
            </div>
            <button
              onClick={() => onClose(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: style.color,
                fontSize: "1.25rem",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                opacity: 0.6,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              ×
            </button>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
