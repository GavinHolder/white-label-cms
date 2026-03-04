/**
 * Text animation utility for triangle hover effects
 */

/**
 * Get text animation transform based on settings
 * @param side - Which side the triangle is on (left or right)
 * @param isHovered - Whether the triangle is currently hovered
 * @param animationType - Type of animation (slide, fade, scale, sweep)
 * @param textStyle - Text positioning style (1 = inside, 2 = outside)
 * @returns CSS transform string
 */
export const getTextTransform = (
  side: "left" | "right",
  isHovered: boolean,
  animationType: "slide" | "fade" | "scale" | "sweep" = "slide",
  textStyle: 1 | 2 = 1,
): string => {
  const baseTransform = "translateY(-50%)";

  // For outside mode, text slides FROM the triangle
  // Right triangle: text is on LEFT, slides from right (from triangle) to left
  // Left triangle: text is on RIGHT, slides from left (from triangle) to right
  const slideDistance = textStyle === 2 ? 100 : 50;

  if (!isHovered) {
    // Hidden state - different based on animation type
    switch (animationType) {
      case "slide":
        // Outside mode: slide FROM triangle direction
        return side === "right"
          ? `${baseTransform} translateX(${slideDistance}px)` // Text on left, slide from right
          : `${baseTransform} translateX(-${slideDistance}px)`; // Text on right, slide from left
      case "fade":
        return baseTransform;
      case "scale":
        return `${baseTransform} scale(0)`;
      case "sweep":
        return side === "right"
          ? `${baseTransform} translateX(${slideDistance}px) rotate(-10deg)`
          : `${baseTransform} translateX(-${slideDistance}px) rotate(10deg)`;
      default:
        return `${baseTransform} translateX(${side === "right" ? slideDistance : -slideDistance}px)`;
    }
  }

  // Visible state
  return animationType === "scale"
    ? `${baseTransform} scale(1)`
    : `${baseTransform} translateX(0) rotate(0deg)`;
};
