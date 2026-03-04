"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number; // Auto-dismiss duration in milliseconds
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeClasses = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-dark",
    info: "bg-info text-white",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`toast show ${typeClasses[type]}`}
      role="alert"
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1100,
        minWidth: "300px",
      }}
    >
      <div className="toast-header">
        <strong className="me-auto">
          <span className="me-2">{icons[type]}</span>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </strong>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      </div>
      <div className="toast-body">{message}</div>
    </div>
  );
}

// Toast Container Component - for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1100,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}
