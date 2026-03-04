/**
 * Triangle Overlay Configuration Editor
 * Reusable component for configuring triangle overlays, hover text, and backgrounds
 * Can be embedded in any section editor
 */

"use client";

import { useState } from "react";
import GoogleFontPicker from "@/components/admin/GoogleFontPicker";

/** All preset shapes for the Section Into overlay */
const SHAPE_PRESETS: Array<{ id: string; label: string; path: string }> = [
  { id: "modern",   label: "Triangle",  path: "M 200 0 L 0 100 L 200 100 Z" },
  { id: "steep",    label: "Steep",     path: "M 200 0 L 130 100 L 200 100 Z" },
  { id: "diagonal", label: "Diagonal",  path: "M 0 0 L 0 100 L 200 100 Z" },
  { id: "rhombus",  label: "Rhombus",   path: "M 200 0 L 200 100 L 0 100 L 100 0 Z" },
  { id: "convex",   label: "Curve Out", path: "M 200 0 Q 0 0 0 100 L 200 100 Z" },
  { id: "concave",  label: "Curve In",  path: "M 200 0 Q 200 100 0 100 L 200 100 Z" },
  { id: "wave",     label: "Wave",      path: "M 0 100 C 40 50 80 100 120 50 C 160 0 190 60 200 0 L 200 100 Z" },
  { id: "arch",     label: "Arch",      path: "M 0 100 Q 100 -30 200 100 Z" },
  { id: "classic",  label: "Classic",   path: "M 200 0 L 0 100 L 200 100 Z" }, // classic shown as triangle thumbnail
];

interface TriangleConfig {
  // Triangle configuration
  triangleEnabled?: boolean;
  triangleSide?: string;
  triangleShape?: string;
  triangleHeight?: number;
  triangleTargetId?: string;

  // Triangle styling
  triangleGradientType?: string;
  triangleColor1?: string;
  triangleColor2?: string;
  triangleAlpha1?: number;
  triangleAlpha2?: number;
  triangleAngle?: number;

  // Triangle image
  triangleImageUrl?: string;
  triangleImageSize?: string;
  triangleImagePos?: string;
  triangleImageX?: number;
  triangleImageY?: number;
  triangleImageScale?: number;
  triangleImageOpacity?: number;

  // Hover text
  hoverTextEnabled?: boolean;
  hoverText?: string;
  hoverTextStyle?: number;
  hoverFontSize?: number;
  hoverFontFamily?: string;
  hoverAnimationType?: string;
  hoverAnimateBehind?: boolean;
  hoverAlwaysShow?: boolean;
  hoverOffsetX?: number;

  // Background
  bgImageUrl?: string;
  bgImageSize?: string;
  bgImagePosition?: string;
  bgImageRepeat?: string;
  bgImageOpacity?: number;
  bgParallax?: boolean;
}

interface TriangleConfigEditorProps {
  config: TriangleConfig;
  onChange: (config: TriangleConfig) => void;
  availableSections: Array<{ id: string; displayName: string }>;
}

export default function TriangleConfigEditor({
  config,
  onChange,
  availableSections,
}: TriangleConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<"triangle" | "hover" | "background">("triangle");

  const updateConfig = (updates: Partial<TriangleConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b bg-gray-50">
        <button
          onClick={() => setActiveTab("triangle")}
          className={`flex-1 px-4 py-3 font-medium transition-colors ${
            activeTab === "triangle"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <i className="bi-triangle me-2"></i>
          Section Into
        </button>
        <button
          onClick={() => setActiveTab("hover")}
          className={`flex-1 px-4 py-3 font-medium transition-colors ${
            activeTab === "hover"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <i className="bi-cursor-text me-2"></i>
          Hover Text
        </button>
        <button
          onClick={() => setActiveTab("background")}
          className={`flex-1 px-4 py-3 font-medium transition-colors ${
            activeTab === "background"
              ? "bg-white border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <i className="bi-image me-2"></i>
          Background
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-white">
        {/* TRIANGLE TAB */}
        {activeTab === "triangle" && (
          <div className="space-y-4">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="triangleEnabled"
                checked={config.triangleEnabled || false}
                onChange={(e) => updateConfig({ triangleEnabled: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="triangleEnabled">
                Enable Section Into
              </label>
            </div>

            {config.triangleEnabled && (
              <>
                <div className="mb-3">
                  <label className="form-label">Side</label>
                  <select
                    className="form-select"
                    value={config.triangleSide === "left" ? "left" : "right"}
                    onChange={(e) => updateConfig({ triangleSide: e.target.value })}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                {/* ── Visual Shape Picker ── */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Shape</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {SHAPE_PRESETS.map((preset) => {
                      const isActive = (config.triangleShape || "modern") === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          title={preset.label}
                          onClick={() => updateConfig({ triangleShape: preset.id })}
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
                            transition: "border-color 0.15s",
                          }}
                        >
                          <svg
                            viewBox="0 0 200 100"
                            preserveAspectRatio="none"
                            style={{ width: 60, height: 30 }}
                          >
                            <path
                              d={preset.path}
                              fill={isActive ? "#0d6efd" : "#6c757d"}
                            />
                          </svg>
                          <span style={{ fontSize: 10, color: isActive ? "#0d6efd" : "#495057", fontWeight: isActive ? 700 : 400 }}>
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">
                      Triangle Height: {config.triangleHeight || 200}px
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="400"
                      step="10"
                      value={config.triangleHeight || 200}
                      onChange={(e) => updateConfig({ triangleHeight: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Navigate to Section</label>
                    <select
                      className="form-select"
                      value={config.triangleTargetId || ""}
                      onChange={(e) => updateConfig({ triangleTargetId: e.target.value })}
                    >
                      <option value="">Select section...</option>
                      {availableSections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.displayName || section.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr />
                <h6 className="fw-bold">Triangle Gradient</h6>

                <div>
                  <label className="form-label">Gradient Type</label>
                  <select
                    className="form-select"
                    value={config.triangleGradientType || "solid"}
                    onChange={(e) => updateConfig({ triangleGradientType: e.target.value })}
                  >
                    <option value="solid">Solid Color</option>
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Color 1</label>
                    <input
                      type="color"
                      className="form-control form-control-color w-100"
                      value={config.triangleColor1 || "#4ecdc4"}
                      onChange={(e) => updateConfig({ triangleColor1: e.target.value })}
                    />
                  </div>

                  {config.triangleGradientType !== "solid" && (
                    <div className="col-md-6">
                      <label className="form-label">Color 2</label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={config.triangleColor2 || "#6a82fb"}
                        onChange={(e) => updateConfig({ triangleColor2: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {config.triangleGradientType !== "solid" && (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">
                          Alpha 1: {config.triangleAlpha1 || 100}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={config.triangleAlpha1 || 100}
                          onChange={(e) => updateConfig({ triangleAlpha1: parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">
                          Alpha 2: {config.triangleAlpha2 || 100}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={config.triangleAlpha2 || 100}
                          onChange={(e) => updateConfig({ triangleAlpha2: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    {config.triangleGradientType === "linear" && (
                      <div>
                        <label className="form-label">
                          Gradient Angle: {config.triangleAngle || 45}°
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="360"
                          value={config.triangleAngle || 45}
                          onChange={(e) => updateConfig({ triangleAngle: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </>
                )}

                <hr />
                <h6 className="fw-bold">Image Fill</h6>

                <div>
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={config.triangleImageUrl || ""}
                    onChange={(e) => updateConfig({ triangleImageUrl: e.target.value })}
                  />
                  <small className="text-muted">Clips image to the shape using a mask</small>
                </div>

                {config.triangleImageUrl && (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">
                          X Position: {config.triangleImageX ?? 50}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={config.triangleImageX ?? 50}
                          onChange={(e) => updateConfig({ triangleImageX: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Y Position: {config.triangleImageY ?? 50}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={config.triangleImageY ?? 50}
                          onChange={(e) => updateConfig({ triangleImageY: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">
                          Scale: {config.triangleImageScale ?? 100}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="50"
                          max="300"
                          step="5"
                          value={config.triangleImageScale ?? 100}
                          onChange={(e) => updateConfig({ triangleImageScale: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Opacity: {config.triangleImageOpacity ?? 100}%
                        </label>
                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          value={config.triangleImageOpacity ?? 100}
                          onChange={(e) => updateConfig({ triangleImageOpacity: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* HOVER TEXT TAB */}
        {activeTab === "hover" && (
          <div className="space-y-4">
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="hoverTextEnabled"
                checked={config.hoverTextEnabled || false}
                onChange={(e) => updateConfig({ hoverTextEnabled: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="hoverTextEnabled">
                Enable Hover Text
              </label>
            </div>

            {config.hoverTextEnabled && (
              <>
                <div>
                  <label className="form-label">Hover Text</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., NEXT SECTION"
                    maxLength={50}
                    value={config.hoverText || ""}
                    onChange={(e) => updateConfig({ hoverText: e.target.value })}
                  />
                  <small className="text-muted">
                    {(config.hoverText || "").length}/50 characters
                  </small>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Text Style</label>
                    <select
                      className="form-select"
                      value={config.hoverTextStyle || 1}
                      onChange={(e) => updateConfig({ hoverTextStyle: parseInt(e.target.value) })}
                    >
                      <option value={1}>Inside Triangle</option>
                      <option value={2}>Outside Triangle</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Font Size: {config.hoverFontSize || 18}px
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="12"
                      max={config.hoverTextStyle === 1 ? 32 : 64}
                      value={config.hoverFontSize || 18}
                      onChange={(e) => updateConfig({ hoverFontSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Font Family</label>
                    <GoogleFontPicker
                      value={config.hoverFontFamily || "Arial"}
                      onChange={(v) => updateConfig({ hoverFontFamily: v })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Animation Type</label>
                    <select
                      className="form-select"
                      value={config.hoverAnimationType || "slide"}
                      onChange={(e) => updateConfig({ hoverAnimationType: e.target.value })}
                    >
                      <option value="slide">Slide</option>
                      <option value="fade">Fade</option>
                      <option value="scale">Scale</option>
                      <option value="sweep">Sweep</option>
                    </select>
                  </div>
                </div>

                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="hoverAnimateBehind"
                    checked={config.hoverAnimateBehind !== false}
                    onChange={(e) => updateConfig({ hoverAnimateBehind: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="hoverAnimateBehind">
                    Animate From Behind
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="hoverAlwaysShow"
                    checked={config.hoverAlwaysShow || false}
                    onChange={(e) => updateConfig({ hoverAlwaysShow: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="hoverAlwaysShow">
                    Always Show Text (No Hover Required)
                  </label>
                </div>

                <div>
                  <label className="form-label">
                    {config.hoverTextStyle === 1
                      ? `Horizontal Offset: ${config.hoverOffsetX || 0}px`
                      : `Distance Offset: ${config.hoverOffsetX || 0}px`}
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min={config.hoverTextStyle === 1 ? -50 : 0}
                    max={config.hoverTextStyle === 1 ? 50 : 200}
                    value={config.hoverOffsetX || 0}
                    onChange={(e) => updateConfig({ hoverOffsetX: parseInt(e.target.value) })}
                  />
                  <small className="text-muted">
                    {config.hoverTextStyle === 1
                      ? "Adjust horizontal position within triangle"
                      : "Adjust distance from triangle edge"}
                  </small>
                </div>
              </>
            )}
          </div>
        )}

        {/* BACKGROUND TAB */}
        {activeTab === "background" && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Background Image URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://example.com/background.jpg"
                value={config.bgImageUrl || ""}
                onChange={(e) => updateConfig({ bgImageUrl: e.target.value })}
              />
            </div>

            {config.bgImageUrl && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Background Size</label>
                    <select
                      className="form-select"
                      value={config.bgImageSize || "cover"}
                      onChange={(e) => updateConfig({ bgImageSize: e.target.value })}
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Background Position</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="center, top left, 50% 50%"
                      value={config.bgImagePosition || "center"}
                      onChange={(e) => updateConfig({ bgImagePosition: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Background Repeat</label>
                    <select
                      className="form-select"
                      value={config.bgImageRepeat || "no-repeat"}
                      onChange={(e) => updateConfig({ bgImageRepeat: e.target.value })}
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat Horizontally</option>
                      <option value="repeat-y">Repeat Vertically</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Image Opacity: {config.bgImageOpacity || 100}%
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={config.bgImageOpacity || 100}
                      onChange={(e) => updateConfig({ bgImageOpacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="bgParallax"
                    checked={config.bgParallax || false}
                    onChange={(e) => updateConfig({ bgParallax: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="bgParallax">
                    Enable Parallax Effect
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
