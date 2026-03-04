/**
 * Scroll Detection Utilities
 *
 * Provides utilities for detecting scroll direction, section position,
 * and scroll state for smart navigation UI.
 */

export type ScrollDirection = 'up' | 'down' | 'idle';

export type SectionPosition =
  | 'hero'           // First viewport (hero section)
  | 'early'          // Sections 2-3 after hero
  | 'middle'         // Middle sections
  | 'late'           // Second-to-last section
  | 'last'           // Last section before footer
  | 'footer';        // Footer section

export interface ScrollState {
  direction: ScrollDirection;
  position: SectionPosition;
  scrollY: number;
  isScrolling: boolean;
}

/**
 * Detect scroll direction based on previous and current scroll position
 */
export function detectScrollDirection(
  currentScrollY: number,
  previousScrollY: number,
  threshold: number = 5
): ScrollDirection {
  const delta = currentScrollY - previousScrollY;

  if (Math.abs(delta) < threshold) {
    return 'idle';
  }

  return delta > 0 ? 'down' : 'up';
}

/**
 * Detect which section position the user is currently in
 */
export function detectSectionPosition(
  scrollY: number,
  windowHeight: number,
  documentHeight: number,
  totalSections: number,
  currentSectionIndex: number
): SectionPosition {
  // Hero section: First 80% of first viewport
  if (scrollY < windowHeight * 0.8) {
    return 'hero';
  }

  // Footer section: Last 30% of document
  if (scrollY + windowHeight >= documentHeight - windowHeight * 0.3) {
    return 'footer';
  }

  // If we have section index information, use it
  if (totalSections > 0) {
    // Early sections (2-3 after hero)
    if (currentSectionIndex <= 1) {
      return 'early';
    }

    // Last section before footer
    if (currentSectionIndex === totalSections - 1) {
      return 'last';
    }

    // Second-to-last section
    if (currentSectionIndex === totalSections - 2) {
      return 'late';
    }

    // Middle sections
    return 'middle';
  }

  // Fallback: Use scroll percentage if no section info
  const scrollPercentage = scrollY / (documentHeight - windowHeight);

  if (scrollPercentage < 0.25) {
    return 'early';
  } else if (scrollPercentage > 0.85) {
    return 'last';
  } else if (scrollPercentage > 0.7) {
    return 'late';
  } else {
    return 'middle';
  }
}

/**
 * Hook-like class for tracking scroll state
 * Use this in React components with useState/useEffect
 */
export class ScrollStateTracker {
  private lastScrollY: number = 0;
  private scrollTimeout: NodeJS.Timeout | null = null;
  private listeners: Array<(state: ScrollState) => void> = [];

  constructor(
    private idleDelay: number = 150
  ) {
    this.lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
  }

  /**
   * Get current scroll state
   */
  getCurrentState(
    totalSections: number = 0,
    currentSectionIndex: number = 0
  ): ScrollState {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const documentHeight = typeof document !== 'undefined'
      ? document.documentElement.scrollHeight
      : 0;

    const direction = detectScrollDirection(scrollY, this.lastScrollY);
    const position = detectSectionPosition(
      scrollY,
      windowHeight,
      documentHeight,
      totalSections,
      currentSectionIndex
    );

    return {
      direction,
      position,
      scrollY,
      isScrolling: this.scrollTimeout !== null,
    };
  }

  /**
   * Handle scroll event
   */
  handleScroll(
    totalSections: number = 0,
    currentSectionIndex: number = 0,
    onUpdate: (state: ScrollState) => void
  ): void {
    const currentScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Get current state
    const state = this.getCurrentState(totalSections, currentSectionIndex);
    onUpdate(state);

    // Set timeout to detect when scrolling stops
    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
      const idleState = this.getCurrentState(totalSections, currentSectionIndex);
      onUpdate({ ...idleState, direction: 'idle', isScrolling: false });
    }, this.idleDelay);

    // Update last scroll position
    this.lastScrollY = currentScrollY;
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = null;
    }
    this.listeners = [];
  }
}

/**
 * Determine which navigation buttons should be visible
 * based on scroll state
 */
export interface NavigationButtonVisibility {
  showUpButton: boolean;
  showDownButton: boolean;
  showHomeButton: boolean;
}

export function getButtonVisibility(
  position: SectionPosition,
  direction: ScrollDirection,
  isFirstSection: boolean,
  isLastSection: boolean
): NavigationButtonVisibility {
  // Hero section: No buttons
  if (position === 'hero') {
    return {
      showUpButton: false,
      showDownButton: false,
      showHomeButton: false,
    };
  }

  // Footer section: No buttons
  if (position === 'footer') {
    return {
      showUpButton: false,
      showDownButton: false,
      showHomeButton: false,
    };
  }

  // Early sections (2-3): Only down button
  if (position === 'early') {
    return {
      showUpButton: false,
      showDownButton: !isLastSection,
      showHomeButton: false,
    };
  }

  // Middle sections: Up and Down buttons
  if (position === 'middle') {
    return {
      showUpButton: !isFirstSection,
      showDownButton: !isLastSection,
      showHomeButton: false,
    };
  }

  // Second-to-last section: All buttons
  if (position === 'late') {
    return {
      showUpButton: !isFirstSection,
      showDownButton: !isLastSection,
      showHomeButton: true,
    };
  }

  // Last section before footer: Up and Home buttons
  if (position === 'last') {
    return {
      showUpButton: !isFirstSection,
      showDownButton: false,
      showHomeButton: true,
    };
  }

  // Default: Show directional buttons based on position
  return {
    showUpButton: !isFirstSection,
    showDownButton: !isLastSection,
    showHomeButton: false,
  };
}
