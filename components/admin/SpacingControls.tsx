"use client";

import { useState } from "react";

interface SpacingControlsProps {
  paddingTop?: number;
  paddingBottom?: number;
  onPaddingTopChange: (value: number) => void;
  onPaddingBottomChange: (value: number) => void;
  min?: number; // Applies to both if minTop/minBottom not specified
  minTop?: number; // Specific minimum for top padding
  minBottom?: number; // Specific minimum for bottom padding
  max?: number;
  step?: number;
}

export default function SpacingControls({
  paddingTop = 100,
  paddingBottom = 80,
  onPaddingTopChange,
  onPaddingBottomChange,
  min = 0,
  minTop,
  minBottom,
  max = 200,
  step = 5,
}: SpacingControlsProps) {
  // Use specific minimums if provided, otherwise fall back to general min
  const topMin = minTop !== undefined ? minTop : min;
  const bottomMin = minBottom !== undefined ? minBottom : min;
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="card shadow-sm mb-3">
      <div
        className="card-header bg-light d-flex align-items-center justify-content-between"
        style={{ cursor: "pointer" }}
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: "1.2rem" }}>📏</span>
          <h6 className="mb-0">Section Spacing</h6>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={(e) => {
            e.stopPropagation();
            setShowAdvanced(!showAdvanced);
          }}
        >
          {showAdvanced ? "▼ Hide" : "▶ Show"}
        </button>
      </div>

      {showAdvanced && (
        <div className="card-body">
          <div className="alert alert-info small mb-3">
            <strong>Spacing Control:</strong> Adjust the internal padding at the top and
            bottom of this section. All spacing is controlled inside the section - no external
            margins are applied.
          </div>

          {/* Padding Top */}
          <div className="mb-4">
            <label className="form-label d-flex justify-content-between align-items-center">
              <span>
                <strong>Padding Top</strong>
                <span className="text-muted small ms-2">(Space above content)</span>
              </span>
              <span className="badge rounded-pill text-primary border border-primary-subtle" style={{ minWidth: "60px" }}>
                {paddingTop}px
              </span>
            </label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="range"
                className="form-range flex-grow-1"
                min={topMin}
                max={max}
                step={step}
                value={paddingTop}
                onChange={(e) => onPaddingTopChange(parseInt(e.target.value))}
              />
              <input
                type="number"
                className="form-control"
                style={{ width: "80px" }}
                min={topMin}
                max={max}
                step={step}
                value={paddingTop}
                onChange={(e) => onPaddingTopChange(parseInt(e.target.value) || topMin)}
              />
            </div>
            <div className="form-text">
              <div className="d-flex justify-content-between small text-muted">
                <span>{topMin}px (Minimal)</span>
                <span>{Math.floor((topMin + max) / 2)}px (Default)</span>
                <span>{max}px (Maximum)</span>
              </div>
            </div>
          </div>

          {/* Padding Bottom */}
          <div className="mb-3">
            <label className="form-label d-flex justify-content-between align-items-center">
              <span>
                <strong>Padding Bottom</strong>
                <span className="text-muted small ms-2">(Space below content)</span>
              </span>
              <span className="badge rounded-pill text-primary border border-primary-subtle" style={{ minWidth: "60px" }}>
                {paddingBottom}px
              </span>
            </label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="range"
                className="form-range flex-grow-1"
                min={bottomMin}
                max={max}
                step={step}
                value={paddingBottom}
                onChange={(e) => onPaddingBottomChange(parseInt(e.target.value))}
              />
              <input
                type="number"
                className="form-control"
                style={{ width: "80px" }}
                min={bottomMin}
                max={max}
                step={step}
                value={paddingBottom}
                onChange={(e) => onPaddingBottomChange(parseInt(e.target.value) || bottomMin)}
              />
            </div>
            <div className="form-text">
              <div className="d-flex justify-content-between small text-muted">
                <span>{bottomMin}px (Minimal)</span>
                <span>{Math.floor((bottomMin + max) / 2)}px (Default)</span>
                <span>{max}px (Maximum)</span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-3 pt-3 border-top">
            <label className="form-label small"><strong>Quick Presets:</strong></label>
            <div className="btn-group btn-group-sm w-100" role="group">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onPaddingTopChange(Math.max(topMin, 100)); // Compact
                  onPaddingBottomChange(20);
                }}
              >
                Compact
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onPaddingTopChange(Math.max(topMin, 120)); // Normal
                  onPaddingBottomChange(60);
                }}
              >
                Normal
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  onPaddingTopChange(Math.max(topMin, 150)); // Spacious
                  onPaddingBottomChange(100);
                }}
              >
                Spacious
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
