/**
 * Color Harmony Generator
 *
 * Generates color palettes using color theory algorithms.
 * Inspired by Coolors.co but fully self-contained - no external dependencies.
 *
 * Supports: Complementary, Analogous, Triadic, Split-Complementary,
 * Tetradic, Monochromatic harmony types.
 */

export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "tetradic"
  | "monochromatic";

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorPalette {
  colors: string[]; // Array of hex colors
  harmonyType: HarmonyType;
  baseColor: string; // The seed hex color
}

// ─── Conversion Utilities ────────────────────────────────────────────

export function hexToHSL(hex: string): HSL {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(hsl: HSL): string {
  const { h, s: sRaw, l: lRaw } = hsl;
  const s = sRaw / 100;
  const l = lRaw / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v: number) => {
    const hex = Math.round((v + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Generate a color palette based on a base color and harmony type.
 * Always returns 5 colors for consistent palette visualization.
 *
 * Each palette spans a range of lightness values so colors are visually
 * distinct and usable for backgrounds, text, accents, and borders.
 */
export function generatePalette(baseHex: string, harmony: HarmonyType, randomize = false): ColorPalette {
  const base = hexToHSL(baseHex);

  // For near-neutral base colors (low saturation) boost saturation so harmony
  // hues produce visually distinct, useful palette colors instead of grays.
  const s = base.s < 8 ? 65 : base.s;
  // Keep lightness in a productive range: avoid near-white or near-black bases
  // that collapse all shades into the same perceptual band.
  const l = Math.max(Math.min(base.l, 72), 28);
  // Optional: small random hue jitter so repeated calls with the same inputs
  // produce fresh palette variations (like pressing Space in Coolors.co).
  const jitter = randomize ? Math.floor(Math.random() * 50) - 25 : 0;
  const wb: HSL = { h: normalizeHue(base.h + jitter), s, l }; // working base

  const h0 = wb.h;
  const h1 = normalizeHue(h0 + 180);
  const h2 = normalizeHue(h0 + 120);
  const h3 = normalizeHue(h0 + 240);
  const h4 = normalizeHue(h0 + 90);
  const h5 = normalizeHue(h0 + 270);

  let colors: HSL[];

  switch (harmony) {
    case "complementary":
      colors = [
        { h: h0, s: Math.min(wb.s + 10, 92), l: Math.max(wb.l - 22, 12) },           // dark primary
        { h: h0, s: wb.s, l: wb.l },                                                    // primary
        { h: h1, s: Math.min(wb.s + 5, 88), l: Math.max(Math.min(wb.l + 2, 62), 38) }, // complement (vivid)
        { h: h1, s: Math.max(wb.s - 18, 28), l: Math.min(wb.l + 26, 84) },            // complement light
        { h: h0, s: Math.max(wb.s - 38, 8),  l: Math.min(wb.l + 46, 96) },            // near-white tint
      ];
      break;

    case "analogous":
      colors = [
        { h: normalizeHue(h0 - 30), s: wb.s, l: Math.max(wb.l - 15, 18) },              // left hue, dark
        { h: h0, s: Math.min(wb.s + 8, 90), l: wb.l },                                   // primary
        { h: normalizeHue(h0 + 30), s: wb.s, l: Math.max(Math.min(wb.l + 5, 68), 38) }, // right hue
        { h: normalizeHue(h0 + 60), s: Math.max(wb.s - 15, 25), l: Math.min(wb.l + 22, 82) }, // far right, light
        { h: h0, s: Math.max(wb.s - 35, 8), l: Math.min(wb.l + 44, 96) },               // near-white tint
      ];
      break;

    case "triadic":
      colors = [
        { h: h0, s: Math.min(wb.s + 10, 90), l: Math.max(wb.l - 18, 14) },             // dark primary
        { h: h0, s: wb.s, l: wb.l },                                                     // primary
        { h: h2, s: Math.min(wb.s + 5, 86), l: Math.max(Math.min(wb.l + 4, 64), 36) }, // triad 2
        { h: h3, s: wb.s, l: Math.max(Math.min(wb.l + 4, 64), 36) },                   // triad 3
        { h: h0, s: Math.max(wb.s - 38, 8), l: Math.min(wb.l + 44, 96) },              // near-white tint
      ];
      break;

    case "split-complementary":
      colors = [
        { h: h0, s: Math.min(wb.s + 10, 90), l: Math.max(wb.l - 18, 14) },                      // dark primary
        { h: h0, s: wb.s, l: wb.l },                                                              // primary
        { h: normalizeHue(h0 + 150), s: Math.min(wb.s + 5, 86), l: Math.max(Math.min(wb.l + 3, 62), 36) }, // split 1
        { h: normalizeHue(h0 + 210), s: wb.s, l: Math.max(Math.min(wb.l + 3, 62), 36) },        // split 2
        { h: h0, s: Math.max(wb.s - 38, 8), l: Math.min(wb.l + 44, 96) },                       // near-white tint
      ];
      break;

    case "tetradic":
      colors = [
        { h: h0, s: wb.s, l: Math.max(wb.l - 15, 16) },                                // dark primary
        { h: h0, s: wb.s, l: wb.l },                                                     // primary
        { h: h4, s: Math.min(wb.s + 5, 86), l: Math.max(Math.min(wb.l + 3, 62), 36) }, // +90°
        { h: h1, s: wb.s, l: Math.max(Math.min(wb.l + 3, 62), 36) },                   // +180°
        { h: h5, s: Math.max(wb.s - 15, 28), l: Math.min(wb.l + 28, 88) },             // +270°, light
      ];
      break;

    case "monochromatic":
    default:
      colors = [
        { h: h0, s: Math.min(wb.s + 12, 92), l: Math.max(wb.l - 28, 10) },   // darkest
        { h: h0, s: Math.min(wb.s + 6, 90),  l: Math.max(wb.l - 12, 22) },   // dark
        { h: h0, s: wb.s, l: wb.l },                                            // base
        { h: h0, s: Math.max(wb.s - 14, 22), l: Math.min(wb.l + 20, 86) },   // light
        { h: h0, s: Math.max(wb.s - 30, 8),  l: Math.min(wb.l + 40, 96) },   // lightest
      ];
      break;
  }

  return {
    colors: colors.map(hslToHex),
    harmonyType: harmony,
    baseColor: baseHex,
  };
}

/**
 * Get a human-readable label for a harmony type
 */
export function getHarmonyLabel(type: HarmonyType): string {
  const labels: Record<HarmonyType, string> = {
    complementary: "Complementary",
    analogous: "Analogous",
    triadic: "Triadic",
    "split-complementary": "Split-Complementary",
    tetradic: "Tetradic (Square)",
    monochromatic: "Monochromatic",
  };
  return labels[type];
}

/**
 * Get a short description of what a harmony type does
 */
export function getHarmonyDescription(type: HarmonyType): string {
  const descriptions: Record<HarmonyType, string> = {
    complementary: "Opposite colors on the wheel - high contrast",
    analogous: "Neighboring colors - harmonious and natural",
    triadic: "Three evenly spaced colors - vibrant and balanced",
    "split-complementary": "Base + two adjacent to complement - softer contrast",
    tetradic: "Four colors in rectangle - rich and diverse",
    monochromatic: "Shades of one color - elegant and unified",
  };
  return descriptions[type];
}

/**
 * Calculate perceived luminance of a hex color (0 = dark, 1 = light)
 */
export function getLuminance(hex: string): number {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Determine if text on this background should be white or dark
 */
export function getContrastTextColor(bgHex: string): string {
  return getLuminance(bgHex) > 0.5 ? "#1a1a1a" : "#ffffff";
}

/**
 * Validate a hex color string
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// ─── Preset Color Swatches ───────────────────────────────────────────

export interface PresetColor {
  hex: string;
  name: string;
  group: string;
}

export const PRESET_COLORS: PresetColor[] = [
  // Neutrals
  { hex: "#ffffff", name: "White", group: "Neutrals" },
  { hex: "#f8f9fa", name: "Light Gray", group: "Neutrals" },
  { hex: "#e9ecef", name: "Gray 200", group: "Neutrals" },
  { hex: "#dee2e6", name: "Gray 300", group: "Neutrals" },
  { hex: "#adb5bd", name: "Gray 500", group: "Neutrals" },
  { hex: "#6c757d", name: "Gray 600", group: "Neutrals" },
  { hex: "#495057", name: "Gray 700", group: "Neutrals" },
  { hex: "#343a40", name: "Dark Gray", group: "Neutrals" },
  { hex: "#212529", name: "Near Black", group: "Neutrals" },
  { hex: "#000000", name: "Black", group: "Neutrals" },

  // Blues
  { hex: "#dbeafe", name: "Light Blue", group: "Blues" },
  { hex: "#93c5fd", name: "Sky Blue", group: "Blues" },
  { hex: "#3b82f6", name: "Blue", group: "Blues" },
  { hex: "#2563eb", name: "Royal Blue", group: "Blues" },
  { hex: "#1d4ed8", name: "Dark Blue", group: "Blues" },
  { hex: "#1e3a5f", name: "Navy", group: "Blues" },

  // Greens
  { hex: "#d1fae5", name: "Mint", group: "Greens" },
  { hex: "#6ee7b7", name: "Emerald Light", group: "Greens" },
  { hex: "#10b981", name: "Emerald", group: "Greens" },
  { hex: "#059669", name: "Green", group: "Greens" },
  { hex: "#047857", name: "Dark Green", group: "Greens" },

  // Reds & Warm
  { hex: "#fee2e2", name: "Rose Light", group: "Warm" },
  { hex: "#fca5a5", name: "Coral", group: "Warm" },
  { hex: "#ef4444", name: "Red", group: "Warm" },
  { hex: "#f97316", name: "Orange", group: "Warm" },
  { hex: "#f59e0b", name: "Amber", group: "Warm" },
  { hex: "#eab308", name: "Yellow", group: "Warm" },

  // Purples & Pinks
  { hex: "#ede9fe", name: "Lavender", group: "Purple" },
  { hex: "#a78bfa", name: "Violet", group: "Purple" },
  { hex: "#7c3aed", name: "Purple", group: "Purple" },
  { hex: "#ec4899", name: "Pink", group: "Purple" },
  { hex: "#f472b6", name: "Hot Pink", group: "Purple" },

  // Teals
  { hex: "#ccfbf1", name: "Teal Light", group: "Teal" },
  { hex: "#5eead4", name: "Teal", group: "Teal" },
  { hex: "#14b8a6", name: "Teal Dark", group: "Teal" },
  { hex: "#0d9488", name: "Cyan", group: "Teal" },
];

/**
 * Open Coolors.co in a new tab with the given palette colors
 * URL format: coolors.co/{hex1}-{hex2}-{hex3}-{hex4}-{hex5}
 */
export function openInCoolors(colors: string[]): void {
  const hexCodes = colors.map((c) => c.replace("#", "")).join("-");
  window.open(`https://coolors.co/${hexCodes}`, "_blank");
}

/**
 * Open Coolors.co Visualizer with the given palette colors
 */
export function openInCoolorsVisualizer(colors: string[]): void {
  const hexCodes = colors.map((c) => c.replace("#", "")).join("-");
  window.open(`https://coolors.co/visualizer/${hexCodes}`, "_blank");
}
