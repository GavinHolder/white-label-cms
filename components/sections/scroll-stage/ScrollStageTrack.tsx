"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollStageZoneConfig } from "./types";

interface Props {
  zones: ScrollStageZoneConfig[];
  activeZone: number;
  sectionTopRef: React.RefObject<number>;
}

export default function ScrollStageTrack({ zones, activeZone, sectionTopRef }: Props) {
  const [visibleZone, setVisibleZone] = useState(activeZone);
  const [opacity, setOpacity] = useState(1);
  const prevZone = useRef(activeZone);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Cross-fade when active zone changes
  useEffect(() => {
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
  }, [activeZone, zones]);

  // Parallax scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const sectionTop = sectionTopRef.current ?? 0;
      const zoneH = window.innerHeight;
      const scrollY = window.scrollY;
      const zoneTop = sectionTop + visibleZone * zoneH;
      const progress = (scrollY - zoneTop) / zoneH; // 0 → 1

      const config = zones[visibleZone];
      const factor = config?.parallaxFactor ?? 1.3;
      const dir = config?.parallaxDirection ?? 'up';
      const maxOffset = 50; // px — image oversized by 2× this
      const rawOffset = (progress - 0.5) * factor * maxOffset;
      setParallaxOffset(dir === 'up' ? -rawOffset : rawOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once on mount / zone change
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleZone, zones, sectionTopRef]);

  const visual = zones[visibleZone];
  const duration = (zones[activeZone]?.transitionDuration ?? 400) / 2;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}
    >
      {visual?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={visual.src}
          alt={visual.alt ?? ''}
          style={{
            position: 'absolute',
            // Oversized so parallax movement doesn't show edges
            inset: `-${50 + 10}px`,
            width: `calc(100% + ${(50 + 10) * 2}px)`,
            height: `calc(100% + ${(50 + 10) * 2}px)`,
            objectFit: visual.objectFit ?? 'cover',
            objectPosition: visual.objectPosition ?? 'center',
            transform: `translateY(${parallaxOffset}px)`,
            opacity,
            transition: `opacity ${duration}ms ease`,
            willChange: 'transform, opacity',
          }}
        />
      ) : (
        /* Empty state placeholder */
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            gap: 8,
          }}
        >
          <i className="bi bi-image" style={{ fontSize: 32, color: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'system-ui' }}>
            Zone {visibleZone + 1} — no image set
          </span>
        </div>
      )}

      {/* Zone indicator dots */}
      {zones.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            zIndex: 2,
          }}
        >
          {zones.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === visibleZone ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === visibleZone ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
