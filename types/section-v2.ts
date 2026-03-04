/**
 * Section V2 Configuration Types
 *
 * Unified section model where each section is a container that holds:
 * 1. Optional Section Hero (full carousel with video/image/text overlays)
 * 2. Advanced Background (solid, image, gradient, gradient+image blend, video)
 * 3. Multiple Content Blocks arranged via layout templates
 *
 * This replaces the old "one section = one type" architecture.
 */

import type { CarouselItem } from "@/types/carousel";

// ─── Shared Types ──────────────────────────────────────────────────────────

export interface ButtonConfig {
  text: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
}

// ─── Background System ─────────────────────────────────────────────────────

export type BackgroundType =
  | "solid"
  | "image"
  | "gradient"
  | "gradient-image"
  | "video";

export type GradientDirection =
  | "to-bottom"
  | "to-top"
  | "to-right"
  | "to-left"
  | "to-bottom-right"
  | "to-bottom-left"
  | "to-top-right"
  | "to-top-left";

export interface SectionBackground {
  type: BackgroundType;

  // Solid color (hex or CSS color name)
  color?: string;

  // Image background
  imageSrc?: string;
  imageAlt?: string;
  mobileImageSrc?: string;

  // Gradient settings
  gradientColor?: string;
  gradientDirection?: GradientDirection;
  gradientOpacityStart?: number; // 0-100 (default 100 = fully opaque)
  gradientOpacityEnd?: number; // 0-100 (default 0 = fully transparent)

  // Video background
  videoSrc?: string;
  videoPoster?: string;
  mobileImageFallback?: string; // Image shown on mobile instead of video
}

// ─── Section Hero ──────────────────────────────────────────────────────────

export type SectionHeroHeight = "full" | "half" | "third";

export interface SectionHeroConfig {
  enabled: boolean;
  items: CarouselItem[];
  autoPlayInterval?: number;
  showDots?: boolean;
  height?: SectionHeroHeight; // "full" = 100vh, "half" = 50vh, "third" = 33vh
}

// ─── Layout System ─────────────────────────────────────────────────────────

export type LayoutTemplate =
  | "single-column"
  | "two-column-equal"
  | "two-column-wide-left"
  | "two-column-wide-right"
  | "three-column"
  | "sidebar-left"
  | "sidebar-right";

// ─── Content Block Types ───────────────────────────────────────────────────

export type ContentBlockType =
  | "text-image"
  | "stats-grid"
  | "card-grid"
  | "banner"
  | "table";

/**
 * Base content block — all blocks share these fields
 */
export interface BaseContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
}

/**
 * Text + Image block
 * Side-by-side text and image content with configurable layout
 */
export interface TextImageBlock extends BaseContentBlock {
  type: "text-image";
  heading: string;
  content: string; // HTML string
  imageSrc: string;
  imageAlt: string;
  layout: "left" | "right"; // Image position
  buttons?: ButtonConfig[];
  textAlign?: "left" | "center" | "right";
}

/**
 * Statistics Grid block
 * Display statistics in grid format
 */
export interface StatsGridBlock extends BaseContentBlock {
  type: "stats-grid";
  heading?: string;
  subheading?: string;
  stats: Array<{
    id: string;
    value: string;
    prefix?: string;
    suffix?: string;
    label: string;
    description?: string;
  }>;
  columns: 2 | 3 | 4;
  textAlign?: "left" | "center" | "right";
}

/**
 * Card Grid block
 * Cards (services, products, features) in grid layout
 */
export interface CardGridBlock extends BaseContentBlock {
  type: "card-grid";
  heading?: string;
  subheading?: string;
  cards: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
    imageSrc?: string;
    color?: string; // Hex color for title/accent
    badge?: string;
    buttons?: ButtonConfig[];
  }>;
  columns: 2 | 3 | 4;
}

/**
 * Banner block
 * Alert/notification banner
 */
export interface BannerBlock extends BaseContentBlock {
  type: "banner";
  content: string;
  variant: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
}

/**
 * Table block
 * Tabular data (pricing, comparisons, etc.)
 */
export interface TableBlock extends BaseContentBlock {
  type: "table";
  heading?: string;
  subheading?: string;
  headers: string[];
  rows: Array<{
    id: string;
    cells: string[]; // HTML strings for cell content
  }>;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
}

/**
 * Union type of all content blocks
 */
export type ContentBlock =
  | TextImageBlock
  | StatsGridBlock
  | CardGridBlock
  | BannerBlock
  | TableBlock;

// ─── Section Configuration ─────────────────────────────────────────────────

/**
 * Unified Section Configuration (V2)
 *
 * A section is a container with:
 * - Advanced background (solid, image, gradient, gradient+image, video)
 * - Optional hero carousel
 * - Multiple content blocks arranged via layout templates
 */
export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  displayName?: string;

  // Background system
  background: SectionBackground;

  // Optional section hero
  hero?: SectionHeroConfig;

  // Content blocks
  blocks: ContentBlock[];

  // Layout
  layout: LayoutTemplate;
  customCSS?: string; // Isolated CSS scoped to this section

  // Spacing & display
  paddingTop?: number; // Top padding in pixels
  paddingBottom?: number; // Bottom padding in pixels
  fullScreen?: boolean; // Enable full-screen mode (min-height: 100vh)
}

// ─── Page Configuration ────────────────────────────────────────────────────

/**
 * Page Configuration
 * Returned by backend API for a complete page
 */
export interface PageConfig {
  id: string;
  slug: string;
  title: string;
  metaDescription?: string;
  sections: SectionConfig[];
}

// ─── Default Values ────────────────────────────────────────────────────────

export const DEFAULT_BACKGROUND: SectionBackground = {
  type: "solid",
  color: "#ffffff",
};

export const DEFAULT_LAYOUT: LayoutTemplate = "single-column";

export const DEFAULT_HERO_HEIGHT: SectionHeroHeight = "half";

export const DEFAULT_GRADIENT_DIRECTION: GradientDirection = "to-bottom";
