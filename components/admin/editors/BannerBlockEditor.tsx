"use client";

import type { BannerBlock, ContentBlock } from "@/types/section-v2";

/**
 * BannerBlockEditor
 *
 * Admin editor for the Banner content block.
 * Allows editing content (HTML), variant, and dismissible setting.
 */

interface BannerBlockEditorProps {
  block: BannerBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function BannerBlockEditor({
  block,
  onChange,
}: BannerBlockEditorProps) {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label small fw-semibold">
          Content <span className="text-muted">(HTML supported)</span>
        </label>
        <textarea
          className="form-control form-control-sm"
          rows={3}
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="<strong>Notice:</strong> Important information here."
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Variant</label>
        <select
          className="form-select form-select-sm"
          value={block.variant}
          onChange={(e) =>
            onChange({
              variant: e.target.value as "info" | "success" | "warning" | "error",
            })
          }
          style={{ maxWidth: "200px" }}
        >
          <option value="info">Info (Blue)</option>
          <option value="success">Success (Green)</option>
          <option value="warning">Warning (Yellow)</option>
          <option value="error">Error (Red)</option>
        </select>
      </div>

      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="banner-dismissible"
          checked={block.dismissible || false}
          onChange={(e) => onChange({ dismissible: e.target.checked })}
        />
        <label className="form-check-label small" htmlFor="banner-dismissible">
          Dismissible
        </label>
      </div>
    </div>
  );
}
