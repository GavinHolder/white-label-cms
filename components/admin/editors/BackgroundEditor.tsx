"use client";

import type {
  SectionBackground,
  BackgroundType,
  GradientDirection,
} from "@/types/section-v2";
import {
  GRADIENT_DIRECTION_LABELS,
  GRADIENT_DIRECTIONS,
} from "@/lib/background-utils";

/**
 * BackgroundEditor Component
 *
 * Admin UI for configuring section backgrounds.
 * Supports: solid color, image, gradient, gradient+image, video.
 */

interface BackgroundEditorProps {
  background: SectionBackground;
  onChange: (background: SectionBackground) => void;
}

const BACKGROUND_TYPE_OPTIONS: Array<{
  value: BackgroundType;
  label: string;
  icon: string;
}> = [
  { value: "solid", label: "Solid Color", icon: "bi-paint-bucket" },
  { value: "image", label: "Image", icon: "bi-image" },
  { value: "gradient", label: "Gradient", icon: "bi-rainbow" },
  {
    value: "gradient-image",
    label: "Gradient + Image",
    icon: "bi-layers",
  },
  { value: "video", label: "Video", icon: "bi-camera-video" },
];

const PRESET_COLORS = [
  "#ffffff",
  "#f8f9fa",
  "#e9ecef",
  "#dee2e6",
  "#dbeafe",
  "#000000",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
  "#2563eb",
];

export default function BackgroundEditor({
  background,
  onChange,
}: BackgroundEditorProps) {
  const updateField = <K extends keyof SectionBackground>(
    field: K,
    value: SectionBackground[K]
  ) => {
    onChange({ ...background, [field]: value });
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Background Type Selector */}
      <div>
        <label className="form-label fw-semibold small">Background Type</label>
        <div className="d-flex flex-wrap gap-2">
          {BACKGROUND_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`btn btn-sm ${
                background.type === option.value
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => updateField("type", option.value)}
            >
              <i className={`${option.icon} me-1`} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solid Color */}
      {background.type === "solid" && (
        <div>
          <label className="form-label small">Color</label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="color"
              className="form-control form-control-color"
              value={background.color || "#ffffff"}
              onChange={(e) => updateField("color", e.target.value)}
              style={{ width: "40px", height: "40px" }}
            />
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.color || "#ffffff"}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="#ffffff"
              style={{ maxWidth: "120px" }}
            />
          </div>
          <div className="d-flex flex-wrap gap-1 mt-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="btn btn-sm p-0 border"
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: color,
                  outline:
                    background.color === color
                      ? "2px solid #2563eb"
                      : "none",
                  outlineOffset: "1px",
                }}
                onClick={() => updateField("color", color)}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Settings */}
      {(background.type === "image" ||
        background.type === "gradient-image") && (
        <div className="d-flex flex-column gap-2">
          <div>
            <label className="form-label small">Image URL</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.imageSrc || ""}
              onChange={(e) => updateField("imageSrc", e.target.value)}
              placeholder="/images/background.jpg"
            />
          </div>
          <div>
            <label className="form-label small">Image Alt Text</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.imageAlt || ""}
              onChange={(e) => updateField("imageAlt", e.target.value)}
              placeholder="Background image description"
            />
          </div>
          <div>
            <label className="form-label small">
              Mobile Image URL{" "}
              <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.mobileImageSrc || ""}
              onChange={(e) => updateField("mobileImageSrc", e.target.value)}
              placeholder="/images/background-mobile.jpg"
            />
            <div className="form-text">
              Optimized image for mobile devices (&lt;768px)
            </div>
          </div>
        </div>
      )}

      {/* Gradient Settings */}
      {(background.type === "gradient" ||
        background.type === "gradient-image") && (
        <div className="d-flex flex-column gap-2">
          <div>
            <label className="form-label small">Gradient Color</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="color"
                className="form-control form-control-color"
                value={background.gradientColor || "#000000"}
                onChange={(e) =>
                  updateField("gradientColor", e.target.value)
                }
                style={{ width: "40px", height: "40px" }}
              />
              <input
                type="text"
                className="form-control form-control-sm"
                value={background.gradientColor || "#000000"}
                onChange={(e) =>
                  updateField("gradientColor", e.target.value)
                }
                style={{ maxWidth: "120px" }}
              />
            </div>
          </div>

          <div>
            <label className="form-label small">Gradient Direction</label>
            <select
              className="form-select form-select-sm"
              value={background.gradientDirection || "to-bottom"}
              onChange={(e) =>
                updateField(
                  "gradientDirection",
                  e.target.value as GradientDirection
                )
              }
            >
              {GRADIENT_DIRECTIONS.map((dir) => (
                <option key={dir} value={dir}>
                  {GRADIENT_DIRECTION_LABELS[dir]}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small">
                Start Opacity ({background.gradientOpacityStart ?? 100}%)
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="100"
                value={background.gradientOpacityStart ?? 100}
                onChange={(e) =>
                  updateField("gradientOpacityStart", Number(e.target.value))
                }
              />
            </div>
            <div className="col-6">
              <label className="form-label small">
                End Opacity ({background.gradientOpacityEnd ?? 0}%)
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="100"
                value={background.gradientOpacityEnd ?? 0}
                onChange={(e) =>
                  updateField("gradientOpacityEnd", Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Settings */}
      {background.type === "video" && (
        <div className="d-flex flex-column gap-2">
          <div>
            <label className="form-label small">Video URL</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.videoSrc || ""}
              onChange={(e) => updateField("videoSrc", e.target.value)}
              placeholder="/videos/background.mp4"
            />
          </div>
          <div>
            <label className="form-label small">
              Video Poster Image{" "}
              <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.videoPoster || ""}
              onChange={(e) => updateField("videoPoster", e.target.value)}
              placeholder="/images/video-poster.jpg"
            />
          </div>
          <div>
            <label className="form-label small">
              Mobile Fallback Image{" "}
              <span className="text-muted">(required for mobile)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={background.mobileImageFallback || ""}
              onChange={(e) =>
                updateField("mobileImageFallback", e.target.value)
              }
              placeholder="/images/video-fallback-mobile.jpg"
            />
            <div className="form-text">
              Video won&apos;t play on mobile. This image is shown instead.
            </div>
          </div>

          {/* Optional gradient overlay on video */}
          <div>
            <label className="form-label small">
              Gradient Overlay{" "}
              <span className="text-muted">(optional)</span>
            </label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="color"
                className="form-control form-control-color"
                value={background.gradientColor || "#000000"}
                onChange={(e) =>
                  updateField("gradientColor", e.target.value)
                }
                style={{ width: "40px", height: "40px" }}
              />
              <select
                className="form-select form-select-sm"
                value={background.gradientDirection || "to-bottom"}
                onChange={(e) =>
                  updateField(
                    "gradientDirection",
                    e.target.value as GradientDirection
                  )
                }
                style={{ maxWidth: "200px" }}
              >
                <option value="">No overlay</option>
                {GRADIENT_DIRECTIONS.map((dir) => (
                  <option key={dir} value={dir}>
                    {GRADIENT_DIRECTION_LABELS[dir]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
