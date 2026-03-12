export interface ScrollStageZoneConfig {
  /** Phase 1: image only */
  visualType: 'image';
  /** Image URL */
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  /** 1.0 = static, 1.3 = default, 2.0 = fast */
  parallaxFactor?: number;
  /** Which direction the visual drifts as user scrolls down */
  parallaxDirection?: 'up' | 'down';
  transition?: 'fade' | 'slide' | 'scale';
  transitionDuration?: number;
  /** Override the parent section side for this zone only */
  sideOverride?: 'left' | 'right' | null;
}

export interface ScrollStageConfig {
  enabled: boolean;
  /** Default side for the visual track */
  side: 'left' | 'right';
  /** One entry per multiLimit zone */
  zones: ScrollStageZoneConfig[];
}

export function defaultZone(): ScrollStageZoneConfig {
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

export function defaultScrollStage(multiLimit = 2): ScrollStageConfig {
  return {
    enabled: false,
    side: 'right',
    zones: Array.from({ length: multiLimit }, () => defaultZone()),
  };
}
