/**
 * Hook for viewport-based scroll snapping with bidirectional support.
 * Detects when user stops scrolling and snaps to the nearest section
 * based on configurable threshold and tolerance.
 */

import { useEffect, Dispatch, SetStateAction } from "react";
import type { DebugInfo } from "@/types/triangle";
import { getIsNavigating } from "@/lib/navigation-utils";

interface UseScrollSnapOptions {
  snapEnabled: boolean;
  autoSnapEnabled: boolean;
  snapThreshold: number;
  snapTolerance: number;
  snapDebounce: number;
  scrollableSections: boolean;
  sections: string[];
  setDebugInfo: Dispatch<SetStateAction<DebugInfo>>;
}

export function useScrollSnap({
  snapEnabled,
  autoSnapEnabled,
  snapThreshold,
  snapTolerance,
  snapDebounce,
  scrollableSections,
  sections,
  setDebugInfo,
}: UseScrollSnapOptions) {
  useEffect(() => {
    if (!snapEnabled || !autoSnapEnabled) {
      return;
    }

    let scrollTimeout: NodeJS.Timeout;
    let isSnapping = false;
    let lastScrollY = window.scrollY;
    let currentDirection: "down" | "up" = "down";

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      currentDirection = currentScrollY > lastScrollY ? "down" : "up";
      lastScrollY = currentScrollY;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        // Don't interfere with programmatic navigation from triangles
        if (getIsNavigating()) {
          return;
        }

        setDebugInfo((prev) => ({ ...prev, snapCheckRunning: true }));

        if (isSnapping) {
          setDebugInfo((prev) => ({ ...prev, snapCheckRunning: false }));
          return;
        }

        const viewportHeight = window.innerHeight;
        const scrollDirection = currentDirection;

        const downThresholdPosition =
          (viewportHeight * (100 - snapThreshold)) / 100;
        const upThresholdPosition =
          (viewportHeight * snapThreshold) / 100;

        const sectionElements = sections
          .map((id) => document.getElementById(id))
          .filter(Boolean) as HTMLElement[];

        // Check if user is scrolling within a section's content
        if (scrollableSections) {
          for (const section of sectionElements) {
            const scrollTop = section.scrollTop;
            const scrollHeight = section.scrollHeight;
            const clientHeight = section.clientHeight;
            const hasScrollableContent = scrollHeight > clientHeight;

            if (hasScrollableContent) {
              const atTop = scrollTop <= 5;
              const atBottom =
                scrollTop >= scrollHeight - clientHeight - 5;

              if (!atTop && !atBottom) {
                const scrollPercentage = Math.round(
                  (scrollTop / (scrollHeight - clientHeight)) * 100,
                );
                setDebugInfo({
                  scrollDirection,
                  isSnapping: false,
                  targetSection: `Scrolling in ${section.id}`,
                  closestDistance: 0,
                  sectionsChecked: sectionElements.length,
                  snapCheckRunning: false,
                  allSections: [
                    {
                      id: `${section.id} (${scrollPercentage}%)`,
                      distance: 0,
                      withinTolerance: false,
                    },
                  ],
                });
                return;
              }
            }
          }
        }

        // Normal snap logic
        let targetSection: HTMLElement | null = null;
        let closestDistance = Infinity;
        const sectionDebugInfo: Array<{
          id: string;
          distance: number;
          withinTolerance: boolean;
        }> = [];

        for (const section of sectionElements) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top;
          const sectionBottom = rect.bottom;

          let distanceFromThreshold: number;

          if (scrollDirection === "down") {
            distanceFromThreshold = Math.abs(
              sectionTop - downThresholdPosition,
            );
          } else {
            distanceFromThreshold = Math.abs(
              sectionBottom - upThresholdPosition,
            );
          }

          sectionDebugInfo.push({
            id: section.id,
            distance: Math.round(distanceFromThreshold),
            withinTolerance: distanceFromThreshold <= snapTolerance,
          });

          if (distanceFromThreshold < closestDistance) {
            closestDistance = distanceFromThreshold;
            targetSection = section;
          }
        }

        setDebugInfo({
          scrollDirection,
          isSnapping: false,
          targetSection: targetSection?.id || "none",
          closestDistance: Math.round(closestDistance),
          sectionsChecked: sectionElements.length,
          snapCheckRunning: false,
          allSections: sectionDebugInfo,
        });

        if (targetSection) {
          isSnapping = true;
          setDebugInfo((prev) => ({ ...prev, isSnapping: true }));

          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          setTimeout(() => {
            isSnapping = false;
            setDebugInfo((prev) => ({ ...prev, isSnapping: false }));
          }, 1000);
        }
      }, snapDebounce);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [
    snapEnabled,
    autoSnapEnabled,
    snapThreshold,
    snapTolerance,
    snapDebounce,
    sections,
    scrollableSections,
    setDebugInfo,
  ]);
}
