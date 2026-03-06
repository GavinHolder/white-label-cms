"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useClientFeature } from "@/lib/hooks/useClientFeature";
import {
  calculateConcrete,
  DEFAULT_CONCRETE_SETTINGS,
  type CalcType,
  type CalcResult,
} from "@/lib/concrete-calculator";

const ConcreteViz3D = dynamic(() => import("@/components/calculator/ConcreteViz3D"), { ssr: false });

// ─── Calc type definitions ─────────────────────────────────────────────────────

const CALC_TYPES: {
  id: CalcType;
  label: string;
  icon: string;
  inputs: { id: string; label: string; unit: string; defaultVal: number }[];
}[] = [
  {
    id: "slab",
    label: "Slab / Floor",
    icon: "bi-square",
    inputs: [
      { id: "length", label: "Length", unit: "mm", defaultVal: 5000 },
      { id: "width", label: "Width", unit: "mm", defaultVal: 4000 },
      { id: "depth", label: "Thickness", unit: "mm", defaultVal: 100 },
    ],
  },
  {
    id: "column",
    label: "Column / Cylinder",
    icon: "bi-circle",
    inputs: [
      { id: "diameter", label: "Diameter", unit: "mm", defaultVal: 300 },
      { id: "height", label: "Height", unit: "mm", defaultVal: 3000 },
    ],
  },
  {
    id: "footing",
    label: "Footing / Strip",
    icon: "bi-layout-text-window",
    inputs: [
      { id: "length", label: "Length", unit: "mm", defaultVal: 6000 },
      { id: "width", label: "Width", unit: "mm", defaultVal: 500 },
      { id: "depth", label: "Depth", unit: "mm", defaultVal: 400 },
    ],
  },
  {
    id: "staircase",
    label: "Staircase",
    icon: "bi-ladder",
    inputs: [
      { id: "steps", label: "Number of Steps", unit: "", defaultVal: 12 },
      { id: "rise", label: "Rise per Step", unit: "mm", defaultVal: 180 },
      { id: "run", label: "Run per Step", unit: "mm", defaultVal: 250 },
      { id: "width", label: "Width", unit: "mm", defaultVal: 1200 },
    ],
  },
];

function initInputs(calcType: CalcType): Record<string, number> {
  const t = CALC_TYPES.find((x) => x.id === calcType)!;
  return Object.fromEntries(t.inputs.map((i) => [i.id, i.defaultVal]));
}

// ─── Inner calculator (rendered only when feature is enabled) ─────────────────

interface CalculatorInnerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}

function CalculatorInner({ config }: CalculatorInnerProps) {
  const [calcType, setCalcType] = useState<CalcType>("slab");
  const [inputs, setInputs] = useState<Record<string, number>>(initInputs("slab"));
  const [strength, setStrength] = useState("25MPa");
  const [result, setResult] = useState<CalcResult | null>(null);

  const settings = { ...DEFAULT_CONCRETE_SETTINGS, ...config };
  const currentType = CALC_TYPES.find((t) => t.id === calcType)!;

  const handleCalcTypeChange = (type: CalcType) => {
    setCalcType(type);
    setInputs(initInputs(type));
    setResult(null);
  };

  const handleCalculate = async () => {
    const res = calculateConcrete(calcType, inputs, strength, settings);
    setResult(res);
    // Trigger Anime.js counter animation after render
    setTimeout(async () => {
      const { animate, stagger } = await import("animejs");
      animate(".result-value", {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(80),
        duration: 500,
        ease: "outCubic",
      });
    }, 50);
  };

  return (
    <>
      {/* Calc type selector */}
      <div className="btn-group mb-4 flex-wrap" role="group" aria-label="Calculator type">
        {CALC_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn ${calcType === t.id ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => handleCalcTypeChange(t.id)}
          >
            <i className={`${t.icon} me-1`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {/* Inputs */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title fw-semibold mb-3">{currentType.label}</h5>
              {currentType.inputs.map((inp) => (
                <div key={inp.id} className="mb-3">
                  <label className="form-label">
                    {inp.label}{" "}
                    {inp.unit && <span className="text-muted small">({inp.unit})</span>}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={inputs[inp.id] ?? inp.defaultVal}
                    min={0}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [inp.id]: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              ))}
              <div className="mb-4">
                <label className="form-label">Concrete Strength</label>
                <select
                  className="form-select"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                >
                  {Object.keys(settings.mixRatios).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-lg w-100" onClick={handleCalculate}>
                <i className="bi bi-calculator me-2" />
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* 3D Viz + Results */}
        <div className="col-md-7">
          <ConcreteViz3D calcType={calcType} dimensions={inputs} result={result} />

          {result && (
            <div className="row g-3 mt-2">
              {[
                {
                  label: "Volume",
                  value: `${result.volumeM3} m³`,
                  sub: `${result.volumeCM3.toLocaleString()} cm³`,
                  icon: "bi-box",
                  color: "primary",
                },
                {
                  label: "Weight",
                  value: `${result.weightKg.toLocaleString()} kg`,
                  sub: `~${Math.round(result.weightKg / 1000)} ton`,
                  icon: "bi-speedometer2",
                  color: "info",
                },
                {
                  label: "Cement Bags",
                  value: `${result.cementBags} bags`,
                  sub: `${result.strengthLabel} mix`,
                  icon: "bi-bag",
                  color: "warning",
                },
                {
                  label: "Est. Cost",
                  value: `${settings.currencySymbol}${result.estimatedCost.toLocaleString()}`,
                  sub: "incl. delivery",
                  icon: "bi-cash-coin",
                  color: "success",
                },
              ].map((card) => (
                <div key={card.label} className="col-6">
                  <div
                    className={`card border-0 shadow-sm p-3 border-start border-4 border-${card.color}`}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className={`${card.icon} text-${card.color} fs-4`} />
                      <div>
                        <div className="fw-bold fs-5 result-value">{card.value}</div>
                        <div className="text-muted small">
                          {card.label} — {card.sub}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const { enabled, config, loading } = useClientFeature("concrete-calculator");

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="container py-5 text-center">
        <h2>Page Not Found</h2>
        <p className="text-muted">This calculator is not available.</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: "960px" }}>
      <div className="mb-4">
        <h1 className="fw-bold mb-1">
          <i className="bi bi-calculator me-2 text-primary" />
          Concrete Calculator
        </h1>
        <p className="text-muted">
          Calculate concrete quantities, cement bags, and estimated costs for your project.
        </p>
      </div>
      <CalculatorInner config={config} />
    </div>
  );
}
