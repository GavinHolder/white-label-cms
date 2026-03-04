"use client";

/** Preset shapes for the Section Into overlay */
export const SECTION_INTO_SHAPES = [
  { id: "modern",   label: "Triangle",  path: "M 200 0 L 0 100 L 200 100 Z" },
  { id: "steep",    label: "Steep",     path: "M 200 0 L 130 100 L 200 100 Z" },
  { id: "diagonal", label: "Diagonal",  path: "M 0 0 L 0 100 L 200 100 Z" },
  { id: "rhombus",  label: "Rhombus",   path: "M 200 0 L 200 100 L 0 100 L 100 0 Z" },
  { id: "convex",   label: "Curve Out", path: "M 200 0 Q 0 0 0 100 L 200 100 Z" },
  { id: "concave",  label: "Curve In",  path: "M 200 0 Q 200 100 0 100 L 200 100 Z" },
  { id: "wave",     label: "Wave",      path: "M 0 100 C 40 50 80 100 120 50 C 160 0 190 60 200 0 L 200 100 Z" },
  { id: "arch",     label: "Arch",      path: "M 0 100 Q 100 -30 200 100 Z" },
  { id: "classic",  label: "Classic",   path: "M 200 0 L 0 100 L 200 100 Z" },
];

interface SectionIntoShapePickerProps {
  value: string;
  onChange: (shape: string) => void;
}

export default function SectionIntoShapePicker({ value, onChange }: SectionIntoShapePickerProps) {
  const active = value || "modern";
  return (
    <div>
      <label className="form-label fw-semibold">Shape</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {SECTION_INTO_SHAPES.map((preset) => {
          const isActive = active === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.label}
              onClick={() => onChange(preset.id)}
              style={{
                border: isActive ? "2px solid #0d6efd" : "2px solid #dee2e6",
                borderRadius: "6px",
                background: isActive ? "#e8f0fe" : "#f8f9fa",
                padding: "6px 4px 2px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ width: 56, height: 28 }}>
                <path d={preset.path} fill={isActive ? "#0d6efd" : "#6c757d"} />
              </svg>
              <span style={{ fontSize: 10, color: isActive ? "#0d6efd" : "#495057", fontWeight: isActive ? 700 : 400 }}>
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
