/**
 * Gradient utility functions for triangles and section backgrounds
 */

import { CSSProperties } from "react";

/**
 * Convert hex color to rgba with alpha channel
 */
const hexToRgba = (hex: string | undefined, alpha: number): string => {
  // Default to white if hex is undefined
  if (!hex) {
    hex = "#ffffff";
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};

/**
 * Generate gradient CSS for triangles (per-section)
 */
export const getTriangleGradient = (
  fallbackColor: string,
  gradientType: "solid" | "linear" | "radial",
  color1: string | undefined,
  color2: string | undefined,
  alpha1: number,
  alpha2: number,
  angle: number,
): string => {
  if (gradientType === "solid") {
    return fallbackColor; // Use original section color
  }

  const rgba1 = hexToRgba(color1, alpha1);
  const rgba2 = hexToRgba(color2, alpha2);

  if (gradientType === "linear") {
    return `linear-gradient(${angle}deg, ${rgba1}, ${rgba2})`;
  } else {
    return `radial-gradient(circle, ${rgba1}, ${rgba2})`;
  }
};

/**
 * Generate complete background (image + gradient overlay) for triangles
 */
export const getTriangleBackground = (
  fallbackColor: string,
  gradientType: "solid" | "linear" | "radial",
  color1: string | undefined,
  color2: string | undefined,
  alpha1: number,
  alpha2: number,
  angle: number,
  imageUrl: string,
  imageSize: "cover" | "contain" | "auto",
  imagePosition: string,
  imageOpacity: number,
): string => {
  if (!imageUrl) {
    return getTriangleGradient(
      fallbackColor,
      gradientType,
      color1,
      color2,
      alpha1,
      alpha2,
      angle,
    );
  }

  let gradientOverlay = "";
  if (gradientType !== "solid") {
    const rgba1 = hexToRgba(color1, alpha1);
    const rgba2 = hexToRgba(color2, alpha2);
    if (gradientType === "linear") {
      gradientOverlay = `linear-gradient(${angle}deg, ${rgba1}, ${rgba2})`;
    } else {
      gradientOverlay = `radial-gradient(circle, ${rgba1}, ${rgba2})`;
    }
  }

  const opacityOverlay =
    imageOpacity < 100
      ? `rgba(255, 255, 255, ${1 - imageOpacity / 100})`
      : "";
  const layers = [
    gradientOverlay,
    opacityOverlay
      ? `linear-gradient(${opacityOverlay}, ${opacityOverlay})`
      : "",
    `url(${imageUrl})`,
  ]
    .filter(Boolean)
    .join(", ");

  return layers;
};

/**
 * Generate section background styles with optional image and opacity
 */
export const getSectionBackgroundStyle = (
  fallbackColor: string,
  imageUrl: string,
  imageSize: "cover" | "contain" | "auto",
  imagePosition: string,
  imageRepeat: "no-repeat" | "repeat" | "repeat-x" | "repeat-y",
  imageOpacity: number,
  parallax: boolean,
): CSSProperties => {
  if (!imageUrl) {
    return { background: fallbackColor };
  }

  const opacityOverlay =
    imageOpacity < 100
      ? `rgba(255, 255, 255, ${1 - imageOpacity / 100})`
      : "";
  const layers = [
    opacityOverlay
      ? `linear-gradient(${opacityOverlay}, ${opacityOverlay})`
      : "",
    `url(${imageUrl})`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    background: layers,
    backgroundSize: imageSize,
    backgroundPosition: imagePosition,
    backgroundRepeat: imageRepeat,
    backgroundAttachment: parallax ? "fixed" : "scroll",
  };
};
