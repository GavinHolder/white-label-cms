/**
 * Layout Template Definitions
 *
 * Defines available layout templates for section content blocks.
 * Each template specifies CSS Grid column configuration.
 */

import type { LayoutTemplate } from "@/types/section-v2";

export interface LayoutTemplateInfo {
  name: string;
  description: string;
  icon: string; // Bootstrap icon class
  gridColumns: string; // CSS grid-template-columns value (desktop)
  mobileColumns: string; // CSS grid-template-columns value (mobile)
}

/**
 * Layout template definitions with CSS Grid configurations
 */
export const layoutTemplateInfo: Record<LayoutTemplate, LayoutTemplateInfo> = {
  "single-column": {
    name: "Single Column",
    description: "Blocks stacked vertically (default)",
    icon: "bi-layout-three-columns",
    gridColumns: "1fr",
    mobileColumns: "1fr",
  },
  "two-column-equal": {
    name: "Two Columns (Equal)",
    description: "Two equal-width columns",
    icon: "bi-layout-split",
    gridColumns: "1fr 1fr",
    mobileColumns: "1fr",
  },
  "two-column-wide-left": {
    name: "Wide Left",
    description: "Wide left column, narrow right",
    icon: "bi-layout-sidebar-reverse",
    gridColumns: "2fr 1fr",
    mobileColumns: "1fr",
  },
  "two-column-wide-right": {
    name: "Wide Right",
    description: "Narrow left, wide right column",
    icon: "bi-layout-sidebar",
    gridColumns: "1fr 2fr",
    mobileColumns: "1fr",
  },
  "three-column": {
    name: "Three Columns",
    description: "Three equal-width columns",
    icon: "bi-layout-three-columns",
    gridColumns: "1fr 1fr 1fr",
    mobileColumns: "1fr",
  },
  "sidebar-left": {
    name: "Sidebar Left",
    description: "Fixed sidebar on the left",
    icon: "bi-layout-sidebar-inset",
    gridColumns: "280px 1fr",
    mobileColumns: "1fr",
  },
  "sidebar-right": {
    name: "Sidebar Right",
    description: "Fixed sidebar on the right",
    icon: "bi-layout-sidebar-inset-reverse",
    gridColumns: "1fr 280px",
    mobileColumns: "1fr",
  },
};

/**
 * Get CSS Grid styles for a layout template
 *
 * Returns React.CSSProperties for the grid container.
 * Mobile breakpoint (< 768px) collapses to single column.
 */
export function getGridStyles(template: LayoutTemplate): React.CSSProperties {
  const info = layoutTemplateInfo[template];

  return {
    display: "grid",
    gridTemplateColumns: info.gridColumns,
    gap: "2rem",
    width: "100%",
  };
}

/**
 * Get mobile grid styles (single column collapse)
 */
export function getMobileGridStyles(): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1.5rem",
    width: "100%",
  };
}

/**
 * All available layout templates for dropdowns
 */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  "single-column",
  "two-column-equal",
  "two-column-wide-left",
  "two-column-wide-right",
  "three-column",
  "sidebar-left",
  "sidebar-right",
];
