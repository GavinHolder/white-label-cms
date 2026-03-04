"use client";

import type { StatsGridBlock, ContentBlock } from "@/types/section-v2";

/**
 * StatsGridBlockEditor
 *
 * Admin editor for the Statistics Grid content block.
 * Allows editing heading, subheading, column count, and individual stats.
 */

interface StatsGridBlockEditorProps {
  block: StatsGridBlock;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export default function StatsGridBlockEditor({
  block,
  onChange,
}: StatsGridBlockEditorProps) {
  const updateStat = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedStats = [...block.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    onChange({ stats: updatedStats });
  };

  const addStat = () => {
    const newStat = {
      id: `stat-${Date.now()}`,
      value: "0",
      label: "New Stat",
    };
    onChange({ stats: [...block.stats, newStat] });
  };

  const removeStat = (index: number) => {
    const updatedStats = block.stats.filter((_, i) => i !== index);
    onChange({ stats: updatedStats });
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <label className="form-label small fw-semibold">Heading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.heading || ""}
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Subheading</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={block.subheading || ""}
          onChange={(e) => onChange({ subheading: e.target.value })}
        />
      </div>

      <div>
        <label className="form-label small fw-semibold">Columns</label>
        <select
          className="form-select form-select-sm"
          value={block.columns}
          onChange={(e) =>
            onChange({ columns: Number(e.target.value) as 2 | 3 | 4 })
          }
          style={{ maxWidth: "120px" }}
        >
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      {/* Stats List */}
      <div>
        <label className="form-label small fw-semibold">
          Statistics ({block.stats.length})
        </label>
        {block.stats.map((stat, index) => (
          <div
            key={stat.id}
            className="card card-body p-2 mb-2 bg-light"
          >
            <div className="d-flex gap-2 mb-1">
              <input
                type="text"
                className="form-control form-control-sm"
                value={stat.value}
                onChange={(e) => updateStat(index, "value", e.target.value)}
                placeholder="Value"
                style={{ maxWidth: "100px" }}
              />
              <input
                type="text"
                className="form-control form-control-sm"
                value={stat.suffix || ""}
                onChange={(e) => updateStat(index, "suffix", e.target.value)}
                placeholder="Suffix"
                style={{ maxWidth: "80px" }}
              />
              <input
                type="text"
                className="form-control form-control-sm flex-fill"
                value={stat.label}
                onChange={(e) => updateStat(index, "label", e.target.value)}
                placeholder="Label"
              />
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => removeStat(index)}
              >
                <i className="bi-trash" />
              </button>
            </div>
            <input
              type="text"
              className="form-control form-control-sm"
              value={stat.description || ""}
              onChange={(e) =>
                updateStat(index, "description", e.target.value)
              }
              placeholder="Description (optional)"
            />
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={addStat}
        >
          <i className="bi-plus me-1" />
          Add Stat
        </button>
      </div>
    </div>
  );
}
