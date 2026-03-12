export interface ScrollStageZoneImageConfig {
  visualType: 'image';
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  /** 1.0 = static, 1.3 = default, 2.0 = fast */
  parallaxFactor?: number;
  parallaxDirection?: 'up' | 'down';
  transition?: 'fade' | 'slide' | 'scale';
  transitionDuration?: number;
  sideOverride?: 'left' | 'right' | null;
}

export interface ScrollStageZoneThreeConfig {
  visualType: 'threejs';
  /** Primitive shape to render */
  shape?: 'sphere' | 'torus' | 'box' | 'icosahedron' | 'torusKnot';
  /** Primary mesh colour (hex) */
  color?: string;
  /** Emissive glow colour (hex) */
  emissive?: string;
  /** Render as wireframe */
  wireframe?: boolean;
  /** Rotation speed multiplier (auto-rotate) */
  rotationSpeed?: number;
  /** Scroll-driven Y-axis spin sensitivity (radians per 100px) */
  scrollSpin?: number;
  /** Background colour — leave empty for transparent */
  bgColor?: string;
  /** Ambient light intensity 0–3 */
  ambientIntensity?: number;
  /** Point light intensity 0–5 */
  pointIntensity?: number;
  /** Transition duration between zones (ms) */
  transitionDuration?: number;
  sideOverride?: 'left' | 'right' | null;
}

export type ScrollStageZoneConfig = ScrollStageZoneImageConfig | ScrollStageZoneThreeConfig;

export interface ScrollStageConfig {
  enabled: boolean;
  /** Default side for the visual track */
  side: 'left' | 'right';
  /**
   * How the track transitions between zones as user scrolls:
   * - "snap"   (default) — image cross-fades only when zone boundary is crossed
   * - "smooth" — image continuously cross-fades based on scroll progress (gentler)
   */
  scrollMode?: 'snap' | 'smooth';
  /** One entry per multiLimit zone */
  zones: ScrollStageZoneConfig[];
}

export function defaultZone(): ScrollStageZoneImageConfig {
  return {
    visualType: 'image',
    src: '',
    alt: '',
    objectFit: 'cover',
    objectPosition: 'center',
    parallaxFactor: 1.3,
    parallaxDirection: 'up',
    transition: 'fade',
    transitionDuration: 400,
    sideOverride: null,
  };
}

export function defaultThreeZone(): ScrollStageZoneThreeConfig {
  return {
    visualType: 'threejs',
    shape: 'torusKnot',
    color: '#6366f1',
    emissive: '#1e1b4b',
    wireframe: false,
    rotationSpeed: 1,
    scrollSpin: 2,
    bgColor: '',
    ambientIntensity: 0.6,
    pointIntensity: 2.5,
    transitionDuration: 400,
    sideOverride: null,
  };
}

export function defaultScrollStage(multiLimit = 2): ScrollStageConfig {
  return {
    enabled: false,
    side: 'right',
    zones: Array.from({ length: multiLimit }, () => defaultZone()),
  };
}
