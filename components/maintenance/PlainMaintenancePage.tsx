"use client";

import React from "react";
import type { MaintenanceTheme } from "@/components/MaintenancePage";

export default function PlainMaintenancePage({ theme = {} }: { theme?: MaintenanceTheme }) {
  const { logoUrl, companyName = "" } = theme;

  return (
    <div className="pmm-root">
      <style>{css}</style>

      <div className="pmm-card">
        {logoUrl && (
          <div className="pmm-logo-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt={companyName || "Logo"} className="pmm-logo" />
          </div>
        )}

        {/* Icon */}
        <div className="pmm-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" opacity="0.15"/>
            <path d="M20 32 C20 25.4 25.4 20 32 20 C38.6 20 44 25.4 44 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="2s" repeatCount="indefinite"/>
            </path>
            <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.7"/>
          </svg>
        </div>

        <div className="pmm-badge">
          <span className="pmm-dot" aria-hidden="true" />
          Maintenance Mode
        </div>

        <h1 className="pmm-heading">We&rsquo;ll Be Right Back</h1>
        <p className="pmm-sub">
          We&rsquo;re making things awesome &mdash; back shortly.
        </p>

        <div className="pmm-bar-wrap">
          <div className="pmm-bar">
            <div className="pmm-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

const css = `
.pmm-root {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: #0d1117;
  font-family: -apple-system, 'Segoe UI', system-ui, sans-serif;
}
.pmm-card {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 48px 40px;
  max-width: 440px; width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  backdrop-filter: blur(8px);
}
.pmm-logo-wrap {
  margin-bottom: 24px;
  padding: 8px 18px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
}
.pmm-logo {
  display: block;
  max-width: 180px; max-height: 52px;
  width: auto; height: auto; object-fit: contain;
}
.pmm-icon {
  color: #4d9fff;
  margin-bottom: 16px;
}
.pmm-badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: #4d9fff; margin-bottom: 12px;
}
.pmm-dot {
  width: 6px; height: 6px; background: #4d9fff;
  border-radius: 50%;
  animation: pmm-blink 1.4s step-start infinite;
}
@keyframes pmm-blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
.pmm-heading {
  font-size: clamp(1.6rem, 5vw, 2.6rem);
  font-weight: 800; letter-spacing: -0.01em;
  color: #f0f0f0; margin: 0 0 12px; line-height: 1.1;
}
.pmm-sub {
  font-size: 0.95rem; color: #6e7681;
  margin: 0 0 28px; line-height: 1.7;
}
.pmm-bar-wrap { width: 100%; max-width: 280px; }
.pmm-bar {
  width: 100%; height: 3px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px; overflow: hidden;
}
.pmm-fill {
  height: 100%;
  background: linear-gradient(90deg, #1a5eaf, #4d9fff, #7bc5ff);
  border-radius: 2px;
  animation: pmm-slide 2.8s ease-in-out infinite;
}
@keyframes pmm-slide {
  0%,100% { width: 15%; margin-left: 0; }
  50%      { width: 55%; margin-left: 30%; }
}
`;
