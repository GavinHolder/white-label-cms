/**
 * Navigation utility functions for smooth scrolling between sections
 */

// Global flag to prevent useScrollSnap from interfering during programmatic navigation
let isNavigating = false;

/**
 * Check if programmatic navigation is in progress
 */
export const getIsNavigating = (): boolean => isNavigating;

/**
 * Scroll to a specific section by ID
 * Uses #snap-container as the scroll container (matches the snap system).
 * Falls back to window.scrollTo for non-snap pages (admin, etc.).
 */
export const scrollToSection = (sectionId: string): void => {
  const element = document.getElementById(sectionId);
  if (!element) return;

  isNavigating = true;

  const container = document.getElementById("snap-container");

  if (container) {
    // Snap container mode: scroll within the container
    const elementTop = (element as HTMLElement).offsetTop;
    container.scrollTo({ top: elementTop, behavior: "smooth" });
  } else {
    // Fallback: standard window scroll
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementTop, behavior: "smooth" });
  }

  // Clear navigation flag after scroll completes
  setTimeout(() => {
    isNavigating = false;
  }, 1000);
};

/**
 * Scroll to the top of the page (hero section)
 */
export const scrollToTop = (): void => {
  const container = document.getElementById("snap-container");
  if (container) {
    container.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

/**
 * Scroll up one section
 */
export const scrollUpOneSection = (
  currentSection: number,
  sections: string[],
): void => {
  if (currentSection > 0) {
    scrollToSection(sections[currentSection - 1]);
  }
};
