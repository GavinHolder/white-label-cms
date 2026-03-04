/**
 * Background Utility Functions
 *
 * Generates CSS gradient strings and background styles
 * for the SectionBackground component.
 */

import type {
  SectionBackground,
  GradientDirection,
} from "@/types/section-v2";

/**
 * Map gradient direction tokens to CSS linear-gradient direction strings
 */
const GRADIENT_DIRECTION_MAP: Record<GradientDirection, string> = {
  "to-bottom": "to bottom",
  "to-top": "to top",
  "to-right": "to right",
  "to-left": "to left",
  "to-bottom-right": "to bottom right",
  "to-bottom-left": "to bottom left",
  "to-top-right": "to top right",
  "to-top-left": "to top left",
};

/**
 * Convert an opacity value (0-100) to CSS rgba alpha string
 */
function opacityToAlpha(opacity: number): number {
  return Math.max(0, Math.min(1, opacity / 100));
}

/**
 * Parse a hex color to RGB components
 * Supports #RGB, #RRGGBB formats
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");

  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }

  if (cleaned.length === 6) {
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    return { r, g, b };
  }

  return null;
}

/**
 * Build a CSS gradient string from background configuration
 *
 * Returns a CSS `linear-gradient(...)` string, or empty string if gradient
 * cannot be constructed (missing color/direction).
 */
export function buildGradientCSS(bg: SectionBackground): string {
  const color = bg.gradientColor || "#000000";
  const direction = bg.gradientDirection || "to-bottom";
  const opacityStart = bg.gradientOpacityStart ?? 100;
  const opacityEnd = bg.gradientOpacityEnd ?? 0;

  const rgb = hexToRgb(color);
  if (!rgb) {
    // Fallback: use the color directly with opacity
    return `linear-gradient(${GRADIENT_DIRECTION_MAP[direction]}, ${color}, transparent)`;
  }

  const alphaStart = opacityToAlpha(opacityStart);
  const alphaEnd = opacityToAlpha(opacityEnd);

  const colorStart = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaStart})`;
  const colorEnd = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaEnd})`;

  return `linear-gradient(${GRADIENT_DIRECTION_MAP[direction]}, ${colorStart}, ${colorEnd})`;
}

/**
 * Get background inline styles for a SectionBackground config
 *
 * Returns React.CSSProperties for the background container.
 * Used for the "solid" and "gradient" background types.
 * Image and video types need separate rendering (handled by SectionBackground component).
 */
export function getBackgroundStyle(
  bg: SectionBackground
): React.CSSProperties {
  switch (bg.type) {
    case "solid":
      return {
        backgroundColor: bg.color || "#ffffff",
      };

    case "gradient":
      return {
        background: buildGradientCSS(bg),
      };

    case "image":
    case "gradient-image":
    case "video":
      // These types render via child elements (Image, video tags)
      // The parent container style is transparent
      return {
        position: "relative" as const,
        overflow: "hidden",
      };

    default:
      return {
        backgroundColor: "#ffffff",
      };
  }
}

/**
 * Get the CSS gradient direction display label
 * Used in admin UI for gradient direction dropdown
 */
export const GRADIENT_DIRECTION_LABELS: Record<GradientDirection, string> = {
  "to-bottom": "Top to Bottom",
  "to-top": "Bottom to Top",
  "to-right": "Left to Right",
  "to-left": "Right to Left",
  "to-bottom-right": "Top-Left to Bottom-Right",
  "to-bottom-left": "Top-Right to Bottom-Left",
  "to-top-right": "Bottom-Left to Top-Right",
  "to-top-left": "Bottom-Right to Top-Left",
};

/**
 * All available gradient directions for dropdowns
 */
export const GRADIENT_DIRECTIONS: GradientDirection[] = [
  "to-bottom",
  "to-top",
  "to-right",
  "to-left",
  "to-bottom-right",
  "to-bottom-left",
  "to-top-right",
  "to-top-left",
];
