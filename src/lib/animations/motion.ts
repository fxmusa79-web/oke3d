/**
 * GSAP motion constants for OKE3D.
 * Prefer these over magic numbers in timelines.
 */

export const MOTION = {
  micro: 0.18,
  small: 0.36,
  medium: 0.7,
  cinematic: 1.4,
  /** Hero scroll distance in viewport heights (desktop) */
  heroScrollVh: 420,
  /** Subtle ambient figure idle */
  idleRotateDeg: 2.5,
  /** Max scroll-linked figure yaw (desktop) */
  scrollYawDeg: 10,
  ease: {
    out: 'power3.out',
    inOut: 'power2.inOut',
    product: 'power3.inOut',
    text: 'power4.out',
  },
} as const

export const HERO_LABELS = [
  'intro',
  'discovery',
  'reveal',
  'statement',
  'transform',
] as const

export type HeroLabel = (typeof HERO_LABELS)[number]
