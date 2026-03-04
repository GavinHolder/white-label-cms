/**
 * Hook to track which section is currently in view based on scroll position.
 * Uses the midpoint of the viewport to determine the active section.
 */

import { useState, useEffect, useMemo } from "react";

const SECTION_IDS = [
  "hero",
  "section1",
  "section2",
  "section3",
  "section4",
  "section5",
  "footer",
] as const;

export function useSectionTracker() {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = useMemo(() => [...SECTION_IDS], []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setCurrentSection(i);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return { currentSection, sections };
}
