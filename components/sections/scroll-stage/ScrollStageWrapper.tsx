"use client";

import { useEffect, useRef, useState } from "react";
import ScrollStageTrack from "./ScrollStageTrack";
import type { ScrollStageConfig } from "./types";

interface Props {
  config: ScrollStageConfig;
  multiLimit: number;
  children: React.ReactNode;
}

export default function ScrollStageWrapper({ config, multiLimit, children }: Props) {
  const [activeZone, setActiveZone] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Store section top offset so ScrollStageTrack can compute parallax
  const sectionTopRef = useRef<number>(0);

  // Mobile detection via matchMedia — avoids SSR mismatch
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Record the section's top offset once mounted (stable unless page reflows)
  useEffect(() => {
    if (!wrapperRef.current) return;
    const update = () => {
      sectionTopRef.current = (wrapperRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  // Zone detection via scroll position — avoids IntersectionObserver threshold edge cases
  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      const sectionTop = sectionTopRef.current;
      const zoneH = window.innerHeight;
      const scrollY = window.scrollY;
      const relScroll = scrollY - sectionTop;
      // Active zone = which 100vh screen the user's viewport midpoint is in
      const mid = relScroll + zoneH * 0.5;
      const zone = Math.max(0, Math.min(multiLimit - 1, Math.floor(mid / zoneH)));
      setActiveZone(zone);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, multiLimit]);

  const side = config.side || 'right';
  const zones = config.zones || [];

  // On mobile — render children only, no scroll stage
  if (isMobile) {
    return <>{children}</>;
  }

  const contentCol = (
    <div style={{ flex: '0 0 60%', minWidth: 0, position: 'relative' }}>
      {children}
    </div>
  );

  const trackCol = (
    <div style={{ flex: '0 0 40%', minWidth: 0, position: 'relative' }}>
      <ScrollStageTrack
        zones={zones}
        activeZone={activeZone}
        sectionTopRef={sectionTopRef}
      />
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}
    >
      {side === 'right'
        ? <>{contentCol}{trackCol}</>
        : <>{trackCol}{contentCol}</>
      }
    </div>
  );
}
