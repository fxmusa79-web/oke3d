---
name: oke3d-motion-design
description: >-
  OKE3D motion system using GSAP + ScrollTrigger: cinematic scroll
  choreography, primary/secondary/ambient hierarchy, responsive matchMedia,
  reduced motion, and performance. Use when implementing or reviewing hero
  animations, scroll storytelling, timelines, parallax, pins, or transitions.
---

# OKE3D Motion Design

## Stack

- GSAP + ScrollTrigger (official skills are authoritative)
- `@gsap/react` (`useGSAP`) for React lifecycle/cleanup
- Lenis only if it improves desktop feel without hurting mobile
- No Three.js/R3F unless later proven necessary

Read official skills when implementing: `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-react`, `gsap-performance`.

## Choreography hierarchy

Every scene needs:

1. **PRIMARY** — what the eye follows
2. **SECONDARY** — supporting layers
3. **AMBIENT** — near-unconscious motion

If everything is primary, nothing is.

## Principles

- Motion tells a story; no animation checklist of fade-ins
- Weight: products ≠ buttons; headlines ≠ toasts
- Prefer transform/opacity; avoid layout thrashing
- Conscious easing and staggered layer timings
- Parallax only when it communicates depth
- **No infinite product spin** — rotation subtle, scroll-linked, or slow ambient with purpose
- Pin/scrub only when compositional
- `gsap.matchMedia()` for desktop vs mobile compositions (do not clone desktop motion to mobile)
- Respect `prefers-reduced-motion`: no scroll hijack, no required info only in animation

## Timing tokens

- micro: 150–250ms
- small: 300–500ms
- medium: 500–900ms
- cinematic: 1s+
- Scroll timelines: longer, scrubbed

## Hero requirement

Hero = short interactive product film via scroll (not a banner).

States must transform composition (product + type + depth), then morph into the next section — not hard-cut to whitespace blocks.

## Cleanup

Always revert GSAP contexts / ScrollTriggers on unmount. Call `ScrollTrigger.refresh()` after fonts/images that affect layout.
