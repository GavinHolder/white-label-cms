"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollStageZoneConfig, ScrollStageZoneImageConfig, ScrollStageZoneThreeConfig } from "./types";
import ScrollStageThreeScene from "./ScrollStageThreeScene";

interface Props {
  zones: ScrollStageZoneConfig[];
  activeZone: number;
  sectionTopRef: React.RefObject<number>;
  /** "snap" = cross-fade only at zone boundary; "smooth" = continuous cross-fade based on scroll */
  scrollMode?: 'snap' | 'smooth';
}

export default function ScrollStageTrack({ zones, activeZone, sectionTopRef, scrollMode = 'snap' }: Props) {
  const [visibleZone, setVisibleZone] = useState(activeZone);
  const [opacity, setOpacity] = useState(1);
  const prevZone = useRef(activeZone);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // --- SNAP MODE: Cross-fade only when active zone crosses a boundary ---
  useEffect(() => {
    if (scrollMode !== 'snap') return;
    if (activeZone === prevZone.current) return;
    const visual = zones[activeZone];
    const duration = (visual?.transitionDuration ?? 400) / 2;

    setOpacity(0);
    const timer = setTimeout(() => {
      setVisibleZone(activeZone);
      prevZone.current = activeZone;
      setOpacity(1);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeZone, zones, scrollMode]);

  // --- SMOOTH MODE: Continuously interpolate opacity based on scroll progress ---
  const [smoothProgress, setSmoothProgress] = useState(0);

  useEffect(() => {
    if (scrollMode !== 'smooth') return;
    const scroller = document.getElementById('snap-container');
    const getScrollTop = () => scroller ? scroller.scrollTop : window.scrollY;

    const handleScroll = () => {
      const sectionTop = sectionTopRef.current ?? 0;
      const zoneH = window.innerHeight;
      const scrollTop = getScrollTop();
      const relScroll = scrollTop - sectionTop;
      const rawZone = relScroll / zoneH;
      const clampedZone = Math.max(0, Math.min(zones.length - 1, rawZone));

      const fromZone = Math.floor(clampedZone);
      const progress = clampedZone - fromZone;

      const BLEND_START = 0.7;
      if (progress >= BLEND_START) {
        const blendProgress = (progress - BLEND_START) / (1 - BLEND_START);
        const toZone = Math.min(zones.length - 1, fromZone + 1);
        setVisibleZone(fromZone);
        prevZone.current = toZone;
        setSmoothProgress(blendProgress);
      } else {
        setVisibleZone(fromZone);
        prevZone.current = fromZone;
        setSmoothProgress(0);
      }
    };

    const target: EventTarget = scroller ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollMode, zones, sectionTopRef]);

  // Parallax scroll handler (image zones only)
  useEffect(() => {
    const currentConfig = zones[visibleZone];
    if (currentConfig?.visualType !== 'image') return;

    const scroller = document.getElementById('snap-container');
    const getScrollTop = () => scroller ? scroller.scrollTop : window.scrollY;

    const handleScroll = () => {
      const sectionTop = sectionTopRef.current ?? 0;
      const zoneH = window.innerHeight;
      const scrollTop = getScrollTop();
      const zoneTop = sectionTop + visibleZone * zoneH;
      const progress = (scrollTop - zoneTop) / zoneH;

      const config = zones[visibleZone] as ScrollStageZoneImageConfig;
      const factor = config?.parallaxFactor ?? 1.3;
      const dir = config?.parallaxDirection ?? 'up';
      const maxOffset = 50;
      const rawOffset = (progress - 0.5) * factor * maxOffset;
      setParallaxOffset(dir === 'up' ? -rawOffset : rawOffset);
    };

    const target: EventTarget = scroller ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => target.removeEventListener('scroll', handleScroll);
  }, [visibleZone, zones, sectionTopRef, scrollMode]);

  const currentZone = zones[visibleZone];
  const nextZone = scrollMode === 'smooth' ? zones[prevZone.current] : null;
  const snapDuration = (zones[activeZone]?.transitionDuration ?? 400) / 2;

  // Image style factory
  const imgStyle = (zone: ScrollStageZoneImageConfig, extraOpacity: number, offset: number): React.CSSProperties => ({
    position: 'absolute',
    inset: `-${50 + 10}px`,
    width: `calc(100% + ${(50 + 10) * 2}px)`,
    height: `calc(100% + ${(50 + 10) * 2}px)`,
    objectFit: zone.objectFit ?? 'cover',
    objectPosition: zone.objectPosition ?? 'center',
    transform: `translateY(${offset}px)`,
    opacity: extraOpacity,
    transition: scrollMode === 'snap' ? `opacity ${snapDuration}ms ease` : 'none',
    willChange: 'transform, opacity',
  });

  const placeholder = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', gap: 8 }}>
      <i className="bi bi-image" style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)' }} />
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'system-ui' }}>
        Zone {visibleZone + 1} — no image set
      </span>
    </div>
  );

  const renderZone = (zone: ScrollStageZoneConfig | null, extraOpacity: number, offset: number, key: string) => {
    if (!zone) return null;
    if (zone.visualType === 'threejs') {
      return (
        <ScrollStageThreeScene
          key={key}
          zone={zone as ScrollStageZoneThreeConfig}
          opacity={extraOpacity}
          sectionTopRef={sectionTopRef}
        />
      );
    }
    const imgZone = zone as ScrollStageZoneImageConfig;
    if (!imgZone.src) return placeholder;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={key} src={imgZone.src} alt={imgZone.alt ?? ''} style={imgStyle(imgZone, extraOpacity, offset)} />
    );
  };

  return (
    <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden', alignSelf: 'flex-start' }}>
      {/* Current / departing zone */}
      {renderZone(currentZone ?? null, scrollMode === 'smooth' ? 1 - smoothProgress : opacity, parallaxOffset, `zone-${visibleZone}`)}

      {/* Arriving zone (smooth mode only) */}
      {scrollMode === 'smooth' && nextZone && smoothProgress > 0 &&
        renderZone(nextZone, smoothProgress, parallaxOffset, `zone-next-${prevZone.current}`)
      }

    </div>
  );
}
