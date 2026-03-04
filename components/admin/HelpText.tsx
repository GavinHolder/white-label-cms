"use client";

import { useState } from "react";

interface HelpTextProps {
  children: React.ReactNode;
  tooltip?: string;
  variant?: "info" | "warning" | "tip";
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function HelpText({
  children,
  tooltip,
  variant = "info",
  collapsible = false,
  defaultExpanded = true,
}: HelpTextProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showTooltip, setShowTooltip] = useState(false);

  const variantStyles = {
    info: {
      bg: "#e7f3ff",
      border: "#0d6efd",
      iconClass: "bi-info-circle-fill",
      color: "#084298",
    },
    warning: {
      bg: "#fff3cd",
      border: "#ffc107",
      iconClass: "bi-exclamation-triangle-fill",
      color: "#664d03",
    },
    tip: {
      bg: "#d1e7dd",
      border: "#198754",
      iconClass: "bi-lightbulb-fill",
      color: "#0f5132",
    },
  };

  const style = variantStyles[variant];

  if (collapsible) {
    return (
      <div
        className="mb-3"
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: "0.375rem",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          className="btn w-100 text-start d-flex align-items-center justify-content-between p-3"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: style.color,
            fontSize: "0.875rem",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${style.iconClass}`} style={{ fontSize: "1rem" }}></i>
            <span className="fw-semibold">Help & Tips</span>
          </div>
          <i className={`bi bi-chevron-${isExpanded ? "down" : "right"}`} style={{ fontSize: "0.75rem" }}></i>
        </button>

        {isExpanded && (
          <div
            className="px-3 pb-3"
            style={{
              fontSize: "0.8125rem",
              color: style.color,
              lineHeight: "1.5",
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="d-flex align-items-start gap-2 p-3 mb-3"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "0.375rem",
        fontSize: "0.8125rem",
        color: style.color,
        lineHeight: "1.5",
        position: "relative",
      }}
    >
      <i className={`bi ${style.iconClass}`} style={{ fontSize: "1rem", flexShrink: 0 }}></i>
      <div className="flex-grow-1">{children}</div>
      {tooltip && (
        <>
          <button
            type="button"
            className="btn btn-sm p-0"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: style.border,
              color: "white",
              fontSize: "0.75rem",
              border: "none",
              flexShrink: 0,
            }}
          >
            ?
          </button>
          {showTooltip && (
            <div
              className="position-absolute bg-dark text-white p-2 rounded shadow"
              style={{
                top: "100%",
                right: "0",
                marginTop: "0.5rem",
                maxWidth: "300px",
                fontSize: "0.75rem",
                zIndex: 1000,
              }}
            >
              {tooltip}
              <div
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "10px",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#212529",
                  transform: "rotate(45deg)",
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
