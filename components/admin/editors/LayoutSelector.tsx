"use client";

import type { LayoutTemplate } from "@/types/section-v2";
import {
  layoutTemplateInfo,
  LAYOUT_TEMPLATES,
} from "@/lib/layout-templates";

/**
 * LayoutSelector Component
 *
 * Visual grid of layout templates for section content arrangement.
 * Shows a preview thumbnail and name for each template.
 */

interface LayoutSelectorProps {
  layout: LayoutTemplate;
  onChange: (layout: LayoutTemplate) => void;
  customCSS?: string;
  onCustomCSSChange?: (css: string) => void;
}

/**
 * Simple visual preview of a layout template
 */
function LayoutPreview({ template }: { template: LayoutTemplate }) {
  const previewStyles: Record<LayoutTemplate, React.ReactNode> = {
    "single-column": (
      <div className="d-flex flex-column gap-1 p-1">
        <div
          className="bg-primary rounded"
          style={{ height: "8px", opacity: 0.6 }}
        />
        <div
          className="bg-primary rounded"
          style={{ height: "8px", opacity: 0.4 }}
        />
        <div
          className="bg-primary rounded"
          style={{ height: "8px", opacity: 0.3 }}
        />
      </div>
    ),
    "two-column-equal": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.5 }}
        />
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.5 }}
        />
      </div>
    ),
    "two-column-wide-left": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-primary rounded"
          style={{ height: "24px", flex: 2, opacity: 0.5 }}
        />
        <div
          className="bg-primary rounded"
          style={{ height: "24px", flex: 1, opacity: 0.3 }}
        />
      </div>
    ),
    "two-column-wide-right": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-primary rounded"
          style={{ height: "24px", flex: 1, opacity: 0.3 }}
        />
        <div
          className="bg-primary rounded"
          style={{ height: "24px", flex: 2, opacity: 0.5 }}
        />
      </div>
    ),
    "three-column": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.4 }}
        />
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.5 }}
        />
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.4 }}
        />
      </div>
    ),
    "sidebar-left": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-secondary rounded"
          style={{ height: "24px", width: "20%", opacity: 0.4 }}
        />
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.5 }}
        />
      </div>
    ),
    "sidebar-right": (
      <div className="d-flex gap-1 p-1">
        <div
          className="bg-primary rounded flex-fill"
          style={{ height: "24px", opacity: 0.5 }}
        />
        <div
          className="bg-secondary rounded"
          style={{ height: "24px", width: "20%", opacity: 0.4 }}
        />
      </div>
    ),
  };

  return <>{previewStyles[template]}</>;
}

export default function LayoutSelector({
  layout,
  onChange,
  customCSS,
  onCustomCSSChange,
}: LayoutSelectorProps) {
  return (
    <div className="d-flex flex-column gap-3">
      {/* Template Grid */}
      <div>
        <label className="form-label fw-semibold small">Layout Template</label>
        <div className="row g-2">
          {LAYOUT_TEMPLATES.map((template) => {
            const info = layoutTemplateInfo[template];
            const isActive = layout === template;

            return (
              <div key={template} className="col-6 col-md-4">
                <button
                  type="button"
                  className={`btn w-100 p-2 text-start ${
                    isActive
                      ? "btn-outline-primary border-2"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => onChange(template)}
                  style={{ minHeight: "72px" }}
                >
                  <div
                    className="border rounded mb-1"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(37, 99, 235, 0.05)"
                        : "#f8f9fa",
                    }}
                  >
                    <LayoutPreview template={template} />
                  </div>
                  <div className="small fw-medium">{info.name}</div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS */}
      {onCustomCSSChange && (
        <div>
          <label className="form-label small">
            Custom CSS{" "}
            <span className="text-muted">(scoped to this section)</span>
          </label>
          <textarea
            className="form-control form-control-sm font-monospace"
            rows={4}
            value={customCSS || ""}
            onChange={(e) => onCustomCSSChange(e.target.value)}
            placeholder={`.section-block {\n  /* Custom styles */\n}`}
          />
          <div className="form-text">
            CSS is automatically scoped to this section. Use
            <code>.section-block</code> to target individual blocks.
          </div>
        </div>
      )}
    </div>
  );
}
