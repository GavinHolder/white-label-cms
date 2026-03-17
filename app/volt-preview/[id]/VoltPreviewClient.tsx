"use client";

import dynamic from "next/dynamic";
import type { VoltSlots, VoltInstanceOverrides } from "@/types/volt";

const VoltBlock = dynamic(() => import("@/components/sections/VoltBlock"), { ssr: false });

interface Props {
  voltId: string;
  slots: VoltSlots;
  instanceOverrides?: VoltInstanceOverrides;
}

export default function VoltPreviewClient({ voltId, slots, instanceOverrides }: Props) {
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
      overflow: "hidden",
    }}>
      <VoltBlock voltId={voltId} slots={slots} instanceOverrides={instanceOverrides} fitMode="contain" />
    </div>
  );
}
