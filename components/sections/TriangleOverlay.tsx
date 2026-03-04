/**
 * Reusable triangle overlay component with hover text animation.
 * "classic" shape uses CSS border triangles; all other shapes use inline SVG
 * with clip-masked gradient/image fill.
 */

"use client";

import { useId } from "react";
import type { TriangleSide, TriangleShape, AnimationType, TextStyle } from "@/types/triangle";
import { getTextTransform } from "@/lib/text-animation-utils";
import { scrollToSection } from "@/lib/navigation-utils";

interface TriangleOverlayProps {
  sectionId: string;
  side: TriangleSide;
  color: string;
  height: number;
  targetSectionId: string;
  triangleShape: TriangleShape;
  clickToSnapEnabled: boolean;
  // Gradient config
  gradientType: "solid" | "linear" | "radial";
  gradientColor1: string;
  gradientColor2: string;
  gradientAlpha1: number;
  gradientAlpha2: number;
  gradientAngle: number;
  // Triangle image config
  imageUrl: string;
  imageSize: "cover" | "contain" | "auto";
  imagePosition: string;
  imageOpacity: number;
  imageX?: number; // 0-100, image center X (default 50)
  imageY?: number; // 0-100, image center Y (default 50)
  imageScale?: number; // 50-300, scale % (default 100)
  // Hover text config
  hoverTextEnabled: boolean;
  hoverText: string;
  textStyle: TextStyle;
  fontSize: number;
  fontFamily: string;
  animationType: AnimationType;
  textFromBehind: boolean;
  offsetX: number;
  // Hover state
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  // Preview mode
  previewMode?: boolean;
  // Always show text
  alwaysShowText?: boolean;
}

/** SVG paths defined for RIGHT side (viewBox 0 0 200 100).
 *  Left side: SVG is flipped via scaleX(-1) transform. */
function getShapePath(shape: TriangleShape): string {
  switch (shape) {
    case "modern":   return "M 200 0 L 0 100 L 200 100 Z";
    case "steep":    return "M 200 0 L 130 100 L 200 100 Z";
    case "diagonal": return "M 0 0 L 0 100 L 200 100 Z";
    case "convex":   return "M 200 0 Q 0 0 0 100 L 200 100 Z";
    case "concave":  return "M 200 0 Q 200 100 0 100 L 200 100 Z";
    case "wave":     return "M 0 100 C 40 50 80 100 120 50 C 160 0 190 60 200 0 L 200 100 Z";
    case "arch":     return "M 0 100 Q 100 -30 200 100 Z";
    case "rhombus":  return "M 200 0 L 200 100 L 0 100 L 100 0 Z";
    default:         return "M 200 0 L 0 100 L 200 100 Z";
  }
}

export default function TriangleOverlay({
  sectionId,
  side,
  color,
  height,
  targetSectionId,
  triangleShape,
  clickToSnapEnabled,
  gradientType,
  gradientColor1,
  gradientColor2,
  gradientAlpha1,
  gradientAlpha2,
  gradientAngle,
  imageUrl,
  imageSize,
  imagePosition,
  imageOpacity,
  imageX = 50,
  imageY = 50,
  imageScale = 100,
  hoverTextEnabled,
  hoverText,
  textStyle,
  fontSize,
  fontFamily,
  animationType,
  textFromBehind,
  offsetX,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  previewMode = false,
  alwaysShowText = false,
}: TriangleOverlayProps) {
  const uid = useId().replace(/:/g, "");
  const isRight = side === "right";

  // ── Classic CSS-border triangle ────────────────────────────
  const classicStyle = isRight
    ? {
        position: "absolute" as const,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeft: `${height}px solid transparent`,
        borderRight: `${height}px solid ${color}`,
        borderBottom: `${height}px solid ${color}`,
        pointerEvents: "none" as const,
        filter: isHovered
          ? "drop-shadow(0px 0px 20px rgba(0,0,0,0.5)) drop-shadow(0px 0px 40px rgba(255,255,255,0.3))"
          : "drop-shadow(0px 0px 0px rgba(0,0,0,0))",
        transition: "filter 0.3s ease-out",
      }
    : {
        position: "absolute" as const,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
        borderLeft: `${height}px solid ${color}`,
        borderRight: `${height}px solid transparent`,
        borderBottom: `${height}px solid ${color}`,
        pointerEvents: "none" as const,
        filter: isHovered
          ? "drop-shadow(0px 0px 20px rgba(0,0,0,0.5)) drop-shadow(0px 0px 40px rgba(255,255,255,0.3))"
          : "drop-shadow(0px 0px 0px rgba(0,0,0,0))",
        transition: "filter 0.3s ease-out",
      };

  // ── SVG shape fill helpers ─────────────────────────────────
  // For gradient fill, build SVG defs and fill reference
  const gradId = `grad-${uid}`;
  const clipId = `clip-${uid}`;
  const shapePath = getShapePath(triangleShape);

  // Solid fill colour (with alpha)
  const solidFill = gradientColor1;
  const solidOpacity = gradientAlpha1 / 100;

  // Image positioning (SVG viewBox 0 0 200 100)
  const imgScaleFactor = imageScale / 100;
  const scaledW = 200 * imgScaleFactor;
  const scaledH = 100 * imgScaleFactor;
  const imgX = (imageX / 100) * 200 - scaledW / 2;
  const imgY = (imageY / 100) * 100 - scaledH / 2;

  // Drop-shadow filter for SVG
  const svgFilter = isHovered
    ? "drop-shadow(0px 0px 20px rgba(0,0,0,0.5)) drop-shadow(0px 0px 40px rgba(255,255,255,0.3))"
    : "drop-shadow(0px 0px 0px rgba(0,0,0,0))";

  // ── Text positioning ────────────────────────────────────────
  const baseOutsideOffset = 100;
  const textPosition =
    textStyle === 1
      ? isRight
        ? { top: "50%", left: `calc(50% + ${offsetX}px)`, transform: "translate(-50%, -50%)" }
        : { top: "50%", right: `calc(50% - ${offsetX}px)`, transform: "translate(50%, -50%)" }
      : isRight
      ? {
          top: "50%",
          left: `-${baseOutsideOffset + Math.abs(offsetX)}px`,
          transform: getTextTransform("right", isHovered, animationType, textStyle),
        }
      : {
          top: "50%",
          right: `-${baseOutsideOffset + Math.abs(offsetX)}px`,
          transform: getTextTransform("left", isHovered, animationType, textStyle),
        };

  return (
    <div
      className="triangle-overlay-wrapper"
      style={{
        position: "absolute",
        top: `-${height - 1}px`,
        ...(isRight ? { right: 0 } : { left: 0 }),
        width: `${height * 2}px`,
        height: `${height}px`,
        zIndex: 1000,
        cursor: clickToSnapEnabled ? "pointer" : "default",
        transformOrigin: isRight ? "bottom right" : "bottom left",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (clickToSnapEnabled) scrollToSection(targetSectionId);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Classic CSS shape ─────────────────────────────── */}
      {triangleShape === "classic" && <div style={classicStyle} />}

      {/* ── SVG shapes (all except classic) ──────────────── */}
      {triangleShape !== "classic" && (
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            // Mirror for left side
            transform: isRight ? "none" : "scaleX(-1)",
            transformOrigin: "center",
            filter: svgFilter,
            transition: "filter 0.3s ease-out",
          }}
        >
          <defs>
            {/* Clip path for image fill */}
            {imageUrl && (
              <clipPath id={clipId}>
                <path d={shapePath} />
              </clipPath>
            )}

            {/* Linear gradient */}
            {gradientType === "linear" && (
              <linearGradient
                id={gradId}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="50"
                x2="200"
                y2="50"
                gradientTransform={`rotate(${gradientAngle}, 100, 50)`}
              >
                <stop offset="0%" stopColor={gradientColor1} stopOpacity={gradientAlpha1 / 100} />
                <stop offset="100%" stopColor={gradientColor2} stopOpacity={gradientAlpha2 / 100} />
              </linearGradient>
            )}

            {/* Radial gradient */}
            {gradientType === "radial" && (
              <radialGradient id={gradId} cx="100" cy="50" r="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={gradientColor1} stopOpacity={gradientAlpha1 / 100} />
                <stop offset="100%" stopColor={gradientColor2} stopOpacity={gradientAlpha2 / 100} />
              </radialGradient>
            )}
          </defs>

          {/* Base shape fill (color or gradient) */}
          {!imageUrl && (
            <path
              d={shapePath}
              fill={gradientType !== "solid" ? `url(#${gradId})` : solidFill}
              opacity={gradientType === "solid" ? solidOpacity : 1}
            />
          )}

          {/* Image fill with clip-mask */}
          {imageUrl && (
            <>
              {/* Gradient/color layer behind image (optional tint) */}
              <path
                d={shapePath}
                fill={gradientType !== "solid" ? `url(#${gradId})` : solidFill}
                opacity={gradientType === "solid" ? solidOpacity * 0.3 : 0.3}
              />
              {/* Clipped image */}
              <image
                href={imageUrl}
                x={imgX}
                y={imgY}
                width={scaledW}
                height={scaledH}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${clipId})`}
                opacity={imageOpacity / 100}
              />
            </>
          )}
        </svg>
      )}

      {/* ── Hover text ────────────────────────────────────── */}
      {hoverTextEnabled && (
        <div
          style={{
            position: "absolute",
            ...textPosition,
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
            fontWeight: 700,
            color: "white",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            opacity: isHovered || previewMode || alwaysShowText ? 1 : 0,
            transition: `all 0.3s ${
              animationType === "sweep"
                ? "cubic-bezier(0.68,-0.55,0.265,1.55)"
                : "ease-out"
            }`,
            zIndex: 10,
          }}
        >
          {hoverText}
        </div>
      )}
    </div>
  );
}
