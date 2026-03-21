"use client";

import React from "react";
import type { MaintenanceTheme } from "@/components/MaintenancePage";

/**
 * Custom template — user-supplied full-screen background image with dark overlay.
 * Falls back to plain dark background if no image set.
 */
export default function CustomMaintenancePage({ theme = {} }: { theme?: MaintenanceTheme }) {
  const { logoUrl, companyName = "", customImage } = theme;

  return (
    <div
      className="cmm-root"
      style={customImage ? { backgroundImage: `url(${customImage})` } : undefined}
    >
      <style>{css}</style>

      <div className="cmm-overlay" />

      <div className="cmm-content">
        {logoUrl && (
          <div className="cmm-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={companyName || "Logo"} className="cmm-logo" />
          </div>
        )}

        <div className="cmm-badge">
          <span className="cmm-dot" aria-hidden="true" />
          Maintenance Mode
        </div>

        <h1 className="cmm-heading">Be Back Soon</h1>
        <p className="cmm-sub">
          We&rsquo;re making things awesome &mdash; back shortly.
        </p>

        <div className="cmm-bar-wrap">
          <div className="cmm-bar">
            <div className="cmm-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
.cmm-root {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background-color: #0d1117;
  background-size: cover;
  background-position: center;
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
}
.cmm-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.62);
  backdrop-filter: blur(2px);
}
.cmm-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 48px 32px;
  max-width: 460px; width: 100%;
}
.cmm-logo-wrap {
  margin-bottom: 24px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  backdrop-filter: blur(6px);
}
.cmm-logo {
  display: block;
  max-width: 200px; max-height: 56px;
  width: auto; height: auto; object-fit: contain;
}
.cmm-badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(255,255,255,0.55); margin-bottom: 12px;
}
.cmm-dot {
  width: 6px; height: 6px;
  background: rgba(255,255,255,0.55);
  border-radius: 50%;
  animation: cmm-blink 1.4s step-start infinite;
}
@keyframes cmm-blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
.cmm-heading {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900; letter-spacing: -0.01em;
  color: #ffffff; margin: 0 0 12px; line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0,0,0,0.6);
}
.cmm-sub {
  font-size: 1rem; color: rgba(255,255,255,0.65);
  margin: 0 0 28px; line-height: 1.7;
}
.cmm-bar-wrap { width: 100%; max-width: 280px; }
.cmm-bar {
  width: 100%; height: 3px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px; overflow: hidden;
}
.cmm-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.9), rgba(255,255,255,0.3));
  border-radius: 2px;
  animation: cmm-slide 2.8s ease-in-out infinite;
}
@keyframes cmm-slide {
  0%,100% { width: 15%; margin-left: 0; }
  50%      { width: 55%; margin-left: 30%; }
}
`;
