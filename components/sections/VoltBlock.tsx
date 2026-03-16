"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { VoltElementData, VoltSlots } from "@/types/volt";

const VoltRenderer = dynamic(() => import("@/components/volt/VoltRenderer"), { ssr: false });

interface VoltBlockProps {
  voltId: string;
  slots?: VoltSlots;
  /** Fit behaviour inside the block cell. "contain" (default) or "fill" */
  fitMode?: "contain" | "fill";
}

export default function VoltBlock({ voltId, slots = {}, fitMode = "contain" }: VoltBlockProps) {
  const [volt, setVolt] = useState<VoltElementData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!voltId) return;
    fetch(`/api/public/volt/${voltId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setVolt(data.volt as VoltElementData))
      .catch(() => setError(true));
  }, [voltId]);

  if (error) {
    return (
      <div style={{ padding: "20px", color: "#6c757d", fontSize: "12px", textAlign: "center" }}>
        Volt element unavailable
      </div>
    );
  }

  if (!volt) {
    return (
      <div style={{ width: "100%", aspectRatio: "4/3", background: "rgba(0,0,0,0.06)", borderRadius: "8px" }}
        aria-hidden="true"
      />
    );
  }

  const containerStyle: React.CSSProperties =
    fitMode === "fill"
      ? { width: "100%", height: "100%" }
      : { width: "100%", maxWidth: "100%" };

  return (
    <div style={containerStyle}>
      <VoltRenderer voltElement={volt} slots={slots} style={{ borderRadius: "inherit" }} />
    </div>
  );
}
