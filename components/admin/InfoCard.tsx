"use client";

interface InfoCardProps {
  title: string;
  value: string | number;
  icon?: string;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  href?: string;
}

export default function InfoCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = "primary",
  href,
}: InfoCardProps) {
  const variantColors = {
    primary: { bg: "#0d6efd15", text: "#0d6efd", border: "#0d6efd30" },
    success: { bg: "#19875415", text: "#198754", border: "#19875430" },
    warning: { bg: "#ffc10715", text: "#ffc107", border: "#ffc10730" },
    danger: { bg: "#dc354515", text: "#dc3545", border: "#dc354530" },
    info: { bg: "#0dcaf015", text: "#0dcaf0", border: "#0dcaf030" },
  };

  const colors = variantColors[variant];

  const CardContent = () => (
    <div
      className="card shadow-sm h-100"
      style={{
        border: `2px solid ${colors.border}`,
        transition: "all 0.2s",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        if (href) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (href) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="flex-grow-1">
            <div className="text-muted small mb-1">{title}</div>
            <div className="h2 mb-0 fw-bold" style={{ color: colors.text }}>
              {value}
            </div>
          </div>
          {icon && (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: colors.bg,
                borderRadius: "0.75rem",
                fontSize: "1.5rem",
                color: colors.text,
              }}
            >
              {icon.startsWith("bi-") ? (
                <i className={`bi ${icon}`}></i>
              ) : (
                icon
              )}
            </div>
          )}
        </div>

        {(description || trend) && (
          <div className="d-flex align-items-center justify-content-between">
            {description && (
              <div className="text-muted small">{description}</div>
            )}
            {trend && (
              <div
                className={`small fw-semibold ${
                  trend.direction === "up" ? "text-success" : "text-danger"
                }`}
              >
                {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="text-decoration-none">
        <CardContent />
      </a>
    );
  }

  return <CardContent />;
}
