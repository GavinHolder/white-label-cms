"use client";

import { useState } from "react";
import type { MotionElement, MotionEntranceDirection, MotionIdleType } from "@/types/section";

const DIRECTION_OPTIONS: MotionEntranceDirection[] = ["top", "bottom", "left", "right"];
const IDLE_OPTIONS: MotionIdleType[] = ["float", "bob", "rotate", "pulse", "sway"];
const EASING_OPTIONS = [
  "easeOutCubic", "easeOutQuart", "easeOutBack",
  "easeInOutSine", "easeInOutCubic", "linear",
];

export function createDefaultMotionElement(): MotionElement {
  return {
    id: `me-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    src: "",
    alt: "",
    top: "20%",
    left: undefined,
    right: "5%",
    bottom: undefined,
    width: "200px",
    zIndex: 20,
    parallax: { enabled: false, speed: 0.3 },
    entrance: {
      enabled: true,
      direction: "right",
      distance: 200,
      duration: 800,
      delay: 0,
      easing: "easeOutCubic",
    },
    exit: { enabled: false, direction: "right", distance: 200, duration: 600 },
    idle: { enabled: false, type: "float", speed: 1, amplitude: 15 },
  };
}

interface MotionElementEditorProps {
  element: MotionElement;
  onChange: (el: MotionElement) => void;
  onDelete: () => void;
}

export default function MotionElementEditor({ element, onChange, onDelete }: MotionElementEditorProps) {
  const [openPanel, setOpenPanel] = useState<string | null>("position");
  const set = (patch: Partial<MotionElement>) => onChange({ ...element, ...patch });

  const togglePanel = (panel: string) => setOpenPanel(prev => prev === panel ? null : panel);

  return (
    <div className="border rounded mb-3">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 p-2 bg-light border-bottom">
        <span className="fw-semibold small text-truncate flex-grow-1">
          {element.src ? element.src.split("/").pop() : "New Motion Element"}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger py-0 px-1"
          onClick={onDelete}
          title="Remove element"
        >
          <i className="bi bi-trash" />
        </button>
      </div>

      <div className="accordion accordion-flush" id={`me-acc-${element.id}`}>

        {/* Position & Image */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button py-2 small ${openPanel !== "position" ? "collapsed" : ""}`}
              type="button"
              onClick={() => togglePanel("position")}
            >
              Image & Position
            </button>
          </h2>
          {openPanel === "position" && (
            <div className="accordion-collapse collapse show">
              <div className="accordion-body py-2">
                <div className="mb-2">
                  <label className="form-label small mb-1">Image URL</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={element.src}
                    onChange={(e) => set({ src: e.target.value })}
                    placeholder="/images/uploads/element.png"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small mb-1">Alt Text</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={element.alt}
                    onChange={(e) => set({ alt: e.target.value })}
                    placeholder="Decorative element"
                  />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small mb-1">Width</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={element.width}
                      onChange={(e) => set({ width: e.target.value })}
                      placeholder="200px or 25%"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small mb-1">Z-Index</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={element.zIndex}
                      onChange={(e) => set({ zIndex: parseInt(e.target.value) || 20 })}
                    />
                  </div>
                </div>
                <div className="row g-2">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side} className="col-6">
                      <label className="form-label small mb-1 text-capitalize">{side}</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={element[side] ?? ""}
                        onChange={(e) => set({ [side]: e.target.value || undefined })}
                        placeholder="e.g. 20%"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Parallax */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button py-2 small ${openPanel !== "parallax" ? "collapsed" : ""}`}
              type="button"
              onClick={() => togglePanel("parallax")}
            >
              <span className="me-2">Parallax Depth</span>
              {element.parallax.enabled && <span className="badge bg-success">ON</span>}
            </button>
          </h2>
          {openPanel === "parallax" && (
            <div className="accordion-collapse collapse show">
              <div className="accordion-body py-2">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    id={`par-en-${element.id}`}
                    checked={element.parallax.enabled}
                    onChange={(e) => set({ parallax: { ...element.parallax, enabled: e.target.checked } })}
                  />
                  <label className="form-check-label small" htmlFor={`par-en-${element.id}`}>Enable</label>
                </div>
                {element.parallax.enabled && (
                  <div>
                    <label className="form-label small">Speed: {element.parallax.speed.toFixed(2)} (-1 to 1)</label>
                    <input
                      type="range"
                      className="form-range"
                      min={-1} max={1} step={0.05}
                      value={element.parallax.speed}
                      onChange={(e) => set({ parallax: { ...element.parallax, speed: parseFloat(e.target.value) } })}
                    />
                    <small className="text-muted">Positive = slower scroll. Negative = counter-scroll.</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Entrance */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button py-2 small ${openPanel !== "entrance" ? "collapsed" : ""}`}
              type="button"
              onClick={() => togglePanel("entrance")}
            >
              <span className="me-2">Scroll Entrance</span>
              {element.entrance.enabled && <span className="badge bg-success">ON</span>}
            </button>
          </h2>
          {openPanel === "entrance" && (
            <div className="accordion-collapse collapse show">
              <div className="accordion-body py-2">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    id={`ent-en-${element.id}`}
                    checked={element.entrance.enabled}
                    onChange={(e) => set({ entrance: { ...element.entrance, enabled: e.target.checked } })}
                  />
                  <label className="form-check-label small" htmlFor={`ent-en-${element.id}`}>Enable</label>
                </div>
                {element.entrance.enabled && (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small mb-1">Direction</label>
                      <select
                        className="form-select form-select-sm"
                        value={element.entrance.direction}
                        onChange={(e) => set({ entrance: { ...element.entrance, direction: e.target.value as MotionEntranceDirection } })}
                      >
                        {DIRECTION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Distance (px)</label>
                      <input type="number" className="form-control form-control-sm" value={element.entrance.distance}
                        onChange={(e) => set({ entrance: { ...element.entrance, distance: parseInt(e.target.value) || 200 } })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Duration (ms)</label>
                      <input type="number" className="form-control form-control-sm" value={element.entrance.duration}
                        onChange={(e) => set({ entrance: { ...element.entrance, duration: parseInt(e.target.value) || 800 } })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Delay (ms)</label>
                      <input type="number" className="form-control form-control-sm" value={element.entrance.delay}
                        onChange={(e) => set({ entrance: { ...element.entrance, delay: parseInt(e.target.value) || 0 } })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small mb-1">Easing</label>
                      <select className="form-select form-select-sm" value={element.entrance.easing}
                        onChange={(e) => set({ entrance: { ...element.entrance, easing: e.target.value } })}>
                        {EASING_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Exit */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button py-2 small ${openPanel !== "exit" ? "collapsed" : ""}`}
              type="button"
              onClick={() => togglePanel("exit")}
            >
              <span className="me-2">Scroll Exit</span>
              {element.exit.enabled && <span className="badge bg-success">ON</span>}
            </button>
          </h2>
          {openPanel === "exit" && (
            <div className="accordion-collapse collapse show">
              <div className="accordion-body py-2">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    id={`exit-en-${element.id}`}
                    checked={element.exit.enabled}
                    onChange={(e) => set({ exit: { ...element.exit, enabled: e.target.checked } })}
                  />
                  <label className="form-check-label small" htmlFor={`exit-en-${element.id}`}>Enable</label>
                </div>
                {element.exit.enabled && (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small mb-1">Direction</label>
                      <select className="form-select form-select-sm" value={element.exit.direction}
                        onChange={(e) => set({ exit: { ...element.exit, direction: e.target.value as MotionEntranceDirection } })}>
                        {DIRECTION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Distance (px)</label>
                      <input type="number" className="form-control form-control-sm" value={element.exit.distance}
                        onChange={(e) => set({ exit: { ...element.exit, distance: parseInt(e.target.value) || 200 } })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small mb-1">Duration (ms)</label>
                      <input type="number" className="form-control form-control-sm" value={element.exit.duration}
                        onChange={(e) => set({ exit: { ...element.exit, duration: parseInt(e.target.value) || 600 } })} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Idle */}
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button py-2 small ${openPanel !== "idle" ? "collapsed" : ""}`}
              type="button"
              onClick={() => togglePanel("idle")}
            >
              <span className="me-2">Idle Loop</span>
              {element.idle.enabled && <span className="badge bg-success">ON</span>}
            </button>
          </h2>
          {openPanel === "idle" && (
            <div className="accordion-collapse collapse show">
              <div className="accordion-body py-2">
                <div className="form-check form-switch mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    id={`idle-en-${element.id}`}
                    checked={element.idle.enabled}
                    onChange={(e) => set({ idle: { ...element.idle, enabled: e.target.checked } })}
                  />
                  <label className="form-check-label small" htmlFor={`idle-en-${element.id}`}>Enable</label>
                </div>
                {element.idle.enabled && (
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small mb-1">Type</label>
                      <select className="form-select form-select-sm" value={element.idle.type}
                        onChange={(e) => set({ idle: { ...element.idle, type: e.target.value as MotionIdleType } })}>
                        {IDLE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1">Amplitude</label>
                      <input type="number" className="form-control form-control-sm" value={element.idle.amplitude}
                        onChange={(e) => set({ idle: { ...element.idle, amplitude: parseInt(e.target.value) || 15 } })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Speed: {element.idle.speed.toFixed(1)}x</label>
                      <input type="range" className="form-range" min={0.5} max={3} step={0.1}
                        value={element.idle.speed}
                        onChange={(e) => set({ idle: { ...element.idle, speed: parseFloat(e.target.value) } })} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
