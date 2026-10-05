---
name: oke3d-frontend-quality
description: >-
  OKE3D frontend quality bar: React architecture, performance, accessibility,
  responsive composition, asset optimization, SEO foundation, and mandatory
  Browser QA loops. Use when building components, reviewing sections, shipping
  milestones, or optimizing the Vite/React/Cloudflare OKE3D site.
---

# OKE3D Frontend Quality

## Stack constraints

- Vite + React 19 + TypeScript + Cloudflare Workers
- No Tailwind unless explicitly approved later
- No tsparticles
- No R3F/Three unless approved
- `react-router` only when shop/product routes are real

## Architecture

- Clear component boundaries; no mega-files
- Motion helpers in `src/lib/animations/`
- Tokens in `src/styles/tokens.css`
- Mock `Product` types ready for Shopify/Medusa/Stripe later
- Dynamic-import heavy motion sections when useful

## Performance

Target smooth 60fps where possible.

- Modern image formats; responsive sizes; lazy-load below fold
- Hero image prioritized; thumbnails never full-res
- GPU-friendly transforms; careful `will-change`
- Cleanup GSAP + listeners
- Avoid layout shift (fonts, image dimensions)

## Accessibility

- Semantic HTML + heading hierarchy
- Alt text for products
- Keyboard nav + visible focus
- Contrast on dark UI
- Reduced-motion path always usable

## Responsive

Compose for 375 / 390 / 430 / 768 / 1024 / 1440 / 1920 — not just collapse columns.

Mobile = deliberate alternate composition, fewer layers, shorter timelines.

## Browser QA loop (required after major visuals)

1. Dev server  
2. Open Browser  
3. Desktop scroll through scenes  
4. Screenshots of key states  
5. Console check  
6. Mobile viewport  
7. Reduced motion  
8. Fix → retest  

Technically working but visually mediocre = **not done**.

## Section shipping order

Foundation → tokens/motion → navbar → **hero (QA until premium)** → rest of homepage → mobile polish → performance → a11y/SEO → final polish.

Do not ship 10 sections half-finished.
