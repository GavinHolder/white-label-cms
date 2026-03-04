/**
 * Shared types for triangle overlay system
 */

export type GradientType = "solid" | "linear" | "radial";
export type ImageSize = "cover" | "contain" | "auto";
export type ImageRepeat = "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
export type AnimationType = "slide" | "fade" | "scale" | "sweep";
export type TextStyle = 1 | 2; // 1 = inside triangle, 2 = outside triangle
export type TriangleSide = "left" | "right";
export type TriangleShape =
  | "classic"   // CSS border triangle (legacy)
  | "modern"    // SVG diagonal triangle
  | "steep"     // Narrow/steep triangle
  | "diagonal"  // Opposite diagonal
  | "convex"    // Convex / curve-out
  | "concave"   // Concave / curve-in
  | "wave"      // Wave edge
  | "arch"      // Arch / dome
  | "rhombus";  // Parallelogram

/**
 * Per-section gradient state
 */
export interface GradientConfig {
  type: GradientType;
  color1: string;
  color2: string;
  alpha1: number;
  alpha2: number;
  angle: number;
}

/**
 * Per-section triangle image state
 */
export interface TriangleImageConfig {
  url: string;
  size: ImageSize;
  position: string;
  opacity: number;
}

/**
 * Per-section background image state
 */
export interface BackgroundImageConfig {
  url: string;
  size: ImageSize;
  position: string;
  repeat: ImageRepeat;
  opacity: number;
  parallax: boolean;
}

/**
 * Scroll snap debug information
 */
export interface DebugInfo {
  scrollDirection: "up" | "down" | "none";
  isSnapping: boolean;
  targetSection: string;
  closestDistance: number;
  sectionsChecked: number;
  snapCheckRunning: boolean;
  allSections: Array<{
    id: string;
    distance: number;
    withinTolerance: boolean;
  }>;
}

/**
 * Scroll snap settings
 */
export interface SnapSettings {
  snapEnabled: boolean;
  autoSnapEnabled: boolean;
  snapThreshold: number;
  snapTolerance: number;
  snapDebounce: number;
  showThresholdIndicator: boolean;
  clickToSnapEnabled: boolean;
  scrollableSections: boolean;
}

/**
 * Hover text settings
 */
export interface HoverTextSettings {
  enabled: boolean;
  textStyle: TextStyle;
  fontSize: number;
  fontFamily: string;
  animationType: AnimationType;
  textFromBehind: boolean;
}
