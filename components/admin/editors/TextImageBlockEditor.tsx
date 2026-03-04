"use client";

import type { TextImageBlock, ContentBlock, ButtonConfig } from "@/types/section-v2";

/**
 * TextImageBlockEditor
 *
 * Admin editor for the Text + Image content block.
 * Allows editing heading, content (HTML), image source, layout, and buttons.
 */

interface TextImageBlockEditorProps {
  block: TextImageBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function TextImageBlockEditor({
  block,
  onChange,
}: TextImageBlockEditorProps) {
  const updateButton = (index: number, field: keyof ButtonConfig, value: string) => {
    const updatedButtons = [...(block.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    onChange({ buttons: updatedButtons });
  };

  const addButton = () => {
    const newButton: ButtonConfig = {
      text: "Button",
      href: "/",
      variant: "primary",
    };
    onChange({ buttons: [...(block.buttons || []), newButton] });
  };

  const removeButton = (index: number) => {
    const updatedButtons = (block.buttons || []).filter((_, i) => i !== index);
    onChange({ buttons: updatedButtons });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label small fw-semibold">Heading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">
          Content <span className="text-muted">(HTML supported)</span>
        </label>
        <textarea
          className="form-control form-control-sm"
          rows={6}
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </div>

      <div className="row g-2">
        <div className="col-8">
          <label className="form-label small fw-semibold">Image Source</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={block.imageSrc}
            onChange={(e) => onChange({ imageSrc: e.target.value })}
            placeholder="/images/section.jpg"
          />
        </div>
        <div className="col-4">
          <label className="form-label small fw-semibold">Image Position</label>
          <select
            className="form-select form-select-sm"
            value={block.layout}
            onChange={(e) =>
              onChange({ layout: e.target.value as "left" | "right" })
            }
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label small fw-semibold">Image Alt Text</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.imageAlt}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
        />
      </div>

      {/* Buttons */}
      <div>
        <label className="form-label small fw-semibold">Buttons</label>
        {(block.buttons || []).map((button, index) => (
          <div key={index} className="d-flex gap-2 mb-2">
            <input
              type="text"
              className="form-control form-control-sm"
              value={button.text}
              onChange={(e) => updateButton(index, "text", e.target.value)}
              placeholder="Button text"
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={button.href}
              onChange={(e) => updateButton(index, "href", e.target.value)}
              placeholder="/link"
            />
            <select
              className="form-select form-select-sm"
              value={button.variant || "primary"}
              onChange={(e) => updateButton(index, "variant", e.target.value)}
              style={{ maxWidth: "120px" }}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => removeButton(index)}
            >
              <i className="bi-trash" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={addButton}
        >
          <i className="bi-plus me-1" />
          Add Button
        </button>
      </div>
    </div>
  );
}
