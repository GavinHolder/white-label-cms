"use client";

import { useState } from "react";
import type { SectionHeroConfig, SectionHeroHeight } from "@/types/section-v2";
import type {
  CarouselItem,
  CarouselItemType,
  OverlayAnimation,
} from "@/types/carousel";

/**
 * HeroEditor Component
 *
 * Admin UI for configuring a section's optional hero carousel.
 * Allows enabling/disabling the hero, configuring height, autoplay,
 * and managing carousel items (image/video with overlays).
 */

interface HeroEditorProps {
  hero: SectionHeroConfig;
  onChange: (hero: SectionHeroConfig) => void;
}

const HEIGHT_OPTIONS: Array<{ value: SectionHeroHeight; label: string }> = [
  { value: "full", label: "Full (100vh)" },
  { value: "half", label: "Half (50vh)" },
  { value: "third", label: "Third (33vh)" },
];

const ANIMATION_OPTIONS: Array<{ value: OverlayAnimation; label: string }> = [
  { value: "fade-in", label: "Fade In" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom-in", label: "Zoom In" },
  { value: "none", label: "None" },
];

const POSITION_OPTIONS: Array<{
  value: "center" | "left" | "right";
  label: string;
}> = [
  { value: "center", label: "Center" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export default function HeroEditor({ hero, onChange }: HeroEditorProps) {
  const updateHero = <K extends keyof SectionHeroConfig>(
    field: K,
    value: SectionHeroConfig[K]
  ) => {
    onChange({ ...hero, [field]: value });
  };

  const updateItem = (index: number, updates: Partial<CarouselItem>) => {
    const updatedItems = hero.items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    updateHero("items", updatedItems);
  };

  const addItem = (type: CarouselItemType) => {
    const newItem: CarouselItem = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      src: type === "video" ? "/videos/hero.mp4" : "/images/hero.jpg",
      alt: `Hero ${type} ${hero.items.length + 1}`,
      overlay: {
        heading: "Hero Heading",
        subheading: "Hero subheading text",
        position: "center",
        animation: "fade-in",
        animationDuration: 800,
        animationDelay: 200,
      },
    };
    updateHero("items", [...hero.items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = hero.items.filter((_, i) => i !== index);
    updateHero("items", updatedItems);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= hero.items.length) return;

    const updatedItems = [...hero.items];
    [updatedItems[index], updatedItems[newIndex]] = [
      updatedItems[newIndex],
      updatedItems[index],
    ];
    updateHero("items", updatedItems);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Enable/Disable Toggle */}
      <div className="form-check form-switch">
        <input
          type="checkbox"
          className="form-check-input"
          id="hero-enabled"
          checked={hero.enabled}
          onChange={(e) => updateHero("enabled", e.target.checked)}
        />
        <label className="form-check-label fw-semibold" htmlFor="hero-enabled">
          Enable Section Hero Carousel
        </label>
      </div>

      {!hero.enabled && (
        <div className="alert alert-light small mb-0">
          <i className="bi bi-info-circle me-1" />
          Enable the hero to add a carousel above this section&apos;s content
          blocks.
        </div>
      )}

      {/* Hero Settings (only shown when enabled) */}
      {hero.enabled && (
        <>
          {/* Height & AutoPlay */}
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small">Height</label>
              <select
                className="form-select form-select-sm"
                value={hero.height || "half"}
                onChange={(e) =>
                  updateHero("height", e.target.value as SectionHeroHeight)
                }
              >
                {HEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label small">
                Auto-play Interval (ms)
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={hero.autoPlayInterval || 5000}
                onChange={(e) =>
                  updateHero("autoPlayInterval", Number(e.target.value))
                }
                min={1000}
                max={30000}
                step={500}
              />
            </div>
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="hero-dots"
              checked={hero.showDots !== false}
              onChange={(e) => updateHero("showDots", e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="hero-dots">
              Show Dot Indicators
            </label>
          </div>

          {/* Carousel Items */}
          <div>
            <label className="form-label fw-semibold small">
              Slides ({hero.items.length})
            </label>

            {hero.items.length === 0 && (
              <div className="alert alert-light small">
                <i className="bi bi-info-circle me-1" />
                No slides added yet. Add an image or video slide below.
              </div>
            )}

            {/* Item List */}
            <div className="d-flex flex-column gap-3">
              {hero.items.map((item, index) => (
                <CarouselItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  total={hero.items.length}
                  onChange={(updates) => updateItem(index, updates)}
                  onRemove={() => removeItem(index)}
                  onMove={(dir) => moveItem(index, dir)}
                />
              ))}
            </div>

            {/* Add Slide Buttons */}
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addItem("image")}
              >
                <i className="bi bi-image me-1" />
                Add Image Slide
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addItem("video")}
              >
                <i className="bi bi-camera-video me-1" />
                Add Video Slide
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Carousel Item Editor ───────────────────────────────────────────────────

interface CarouselItemEditorProps {
  item: CarouselItem;
  index: number;
  total: number;
  onChange: (updates: Partial<CarouselItem>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

function CarouselItemEditor({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: CarouselItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateOverlay = (updates: Partial<CarouselItem["overlay"]>) => {
    onChange({
      overlay: {
        ...item.overlay,
        ...updates,
      },
    });
  };

  return (
    <div className="border rounded p-2">
      {/* Item Header */}
      <div className="d-flex align-items-center gap-2">
        <span className="badge rounded-pill text-secondary border border-secondary-subtle">{index + 1}</span>
        <i
          className={`bi ${
            item.type === "video" ? "bi-camera-video" : "bi-image"
          }`}
        />
        <span className="small fw-medium flex-grow-1">
          {item.type === "video" ? "Video" : "Image"} Slide
          {item.overlay?.heading && (
            <span className="text-muted ms-1">
              — {item.overlay.heading.substring(0, 30)}
              {item.overlay.heading.length > 30 ? "..." : ""}
            </span>
          )}
        </span>

        {/* Move/Expand/Remove */}
        <div className="btn-group btn-group-sm">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onMove("up")}
            disabled={index === 0}
            title="Move up"
          >
            <i className="bi bi-chevron-up" />
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            title="Move down"
          >
            <i className="bi bi-chevron-down" />
          </button>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <i className={`bi bi-chevron-${isExpanded ? "up" : "down"}`} />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={onRemove}
          title="Remove slide"
        >
          <i className="bi bi-trash" />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 d-flex flex-column gap-2">
          {/* Media Source */}
          <div className="row g-2">
            <div className="col-8">
              <label className="form-label small">
                {item.type === "video" ? "Video" : "Image"} URL
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={item.src}
                onChange={(e) => onChange({ src: e.target.value })}
                placeholder={
                  item.type === "video"
                    ? "/videos/hero.mp4"
                    : "/images/hero.jpg"
                }
              />
            </div>
            <div className="col-4">
              <label className="form-label small">Type</label>
              <select
                className="form-select form-select-sm"
                value={item.type}
                onChange={(e) =>
                  onChange({ type: e.target.value as CarouselItemType })
                }
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          {/* Mobile Source */}
          <div>
            <label className="form-label small">
              Mobile Source <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={item.mobileSrc || ""}
              onChange={(e) =>
                onChange({ mobileSrc: e.target.value || undefined })
              }
              placeholder="Portrait-optimized image/video for mobile"
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="form-label small">Alt Text</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={item.alt || ""}
              onChange={(e) => onChange({ alt: e.target.value })}
              placeholder="Describe the image for accessibility"
            />
          </div>

          {/* Video Poster (only for video) */}
          {item.type === "video" && (
            <div>
              <label className="form-label small">
                Video Poster <span className="text-muted">(optional)</span>
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={item.poster || ""}
                onChange={(e) =>
                  onChange({ poster: e.target.value || undefined })
                }
                placeholder="/images/video-poster.jpg"
              />
            </div>
          )}

          {/* Overlay Settings */}
          <div className="border-top pt-2 mt-1">
            <label className="form-label small fw-semibold">
              Text Overlay
            </label>

            <div className="d-flex flex-column gap-2">
              {/* Heading */}
              <div>
                <label className="form-label small">Heading</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.overlay?.heading || ""}
                  onChange={(e) => updateOverlay({ heading: e.target.value })}
                  placeholder="Hero heading text"
                />
              </div>

              {/* Mobile Heading */}
              <div>
                <label className="form-label small">
                  Mobile Heading{" "}
                  <span className="text-muted">(shorter, optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.overlay?.mobileHeading || ""}
                  onChange={(e) =>
                    updateOverlay({ mobileHeading: e.target.value || undefined })
                  }
                  placeholder="Shorter heading for mobile"
                />
              </div>

              {/* Subheading */}
              <div>
                <label className="form-label small">Subheading</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={item.overlay?.subheading || ""}
                  onChange={(e) =>
                    updateOverlay({ subheading: e.target.value || undefined })
                  }
                  placeholder="Optional subheading"
                />
              </div>

              {/* Position & Animation */}
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label small">Position</label>
                  <select
                    className="form-select form-select-sm"
                    value={item.overlay?.position || "center"}
                    onChange={(e) =>
                      updateOverlay({
                        position: e.target.value as "center" | "left" | "right",
                      })
                    }
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label small">Animation</label>
                  <select
                    className="form-select form-select-sm"
                    value={item.overlay?.animation || "fade-in"}
                    onChange={(e) =>
                      updateOverlay({
                        animation: e.target.value as OverlayAnimation,
                      })
                    }
                  >
                    {ANIMATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-4">
                  <label className="form-label small">Delay (ms)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.overlay?.animationDelay ?? 200}
                    onChange={(e) =>
                      updateOverlay({
                        animationDelay: Number(e.target.value),
                      })
                    }
                    min={0}
                    max={5000}
                    step={100}
                  />
                </div>
              </div>

              {/* Button */}
              <div className="border-top pt-2 mt-1">
                <label className="form-label small fw-medium">
                  Button{" "}
                  <span className="text-muted">(optional)</span>
                </label>
                {item.overlay?.button ? (
                  <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                      <input
                        type="text"
                        className="form-control form-control-sm mb-1"
                        value={item.overlay.button.text}
                        onChange={(e) =>
                          updateOverlay({
                            button: {
                              ...item.overlay!.button!,
                              text: e.target.value,
                            },
                          })
                        }
                        placeholder="Button text"
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={item.overlay.button.href}
                        onChange={(e) =>
                          updateOverlay({
                            button: {
                              ...item.overlay!.button!,
                              href: e.target.value,
                            },
                          })
                        }
                        placeholder="/link"
                      />
                    </div>
                    <select
                      className="form-select form-select-sm"
                      value={item.overlay.button.variant || "primary"}
                      onChange={(e) =>
                        updateOverlay({
                          button: {
                            ...item.overlay!.button!,
                            variant: e.target.value as
                              | "primary"
                              | "secondary"
                              | "outline",
                          },
                        })
                      }
                      style={{ maxWidth: "110px" }}
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="outline">Outline</option>
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => updateOverlay({ button: undefined })}
                      title="Remove button"
                    >
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      updateOverlay({
                        button: {
                          text: "Learn More",
                          href: "/",
                          variant: "primary",
                        },
                      })
                    }
                  >
                    <i className="bi bi-plus me-1" />
                    Add Button
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

