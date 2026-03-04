export type CarouselItemType = "image" | "video";

export type OverlayAnimation =
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "none";

export interface CarouselOverlay {
  heading?: string;
  mobileHeading?: string; // Optional shorter heading for mobile devices
  subheading?: string; // Optional
  button?: {
    // Optional - single button
    text: string;
    href: string;
    variant?: "primary" | "secondary" | "outline";
  };
  position?: "center" | "left" | "right";
  animation?: OverlayAnimation; // Animation type for text overlay
  animationDuration?: number; // Duration in milliseconds (default: 800)
  animationDelay?: number; // Delay before animation starts in ms (default: 200)
}

export interface CarouselItem {
  id: string;
  type: CarouselItemType;
  src: string; // Desktop/default media source
  mobileSrc?: string; // Optional mobile-specific media source (e.g., portrait for mobile)
  alt?: string;
  overlay?: CarouselOverlay; // Optional - controlled by backend
  poster?: string; // For videos
}

export interface HeroCarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number; // For images only (milliseconds)
  showDots?: boolean;
  className?: string;
}
