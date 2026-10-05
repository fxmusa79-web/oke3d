# OKE3D Hero — Implementation Plan & Storyboard

**Status:** implemented — Browser QA in `docs/references/hero-state-0*.png`  
**Hero product:** `/products/oke-collection/mint-streetwear-hoodie.png`  
**Brand:** `/brand/logo.png` + `/brand/logo-icon.png`  
**Motion:** one pinned GSAP timeline + ScrollTrigger scrub (`matchMedia` desktop/mobile)

## Technical approach (when approved)

1. `HeroScene` pinned section (~4–4.5× viewport scroll on desktop; ~2.5× on mobile)
2. Single `gsap.timeline({ scrollTrigger: { scrub: true, pin: true }})` with labels
3. Layers: `bgGlow` · `figure` · `typePrimary` · `typeMeta` · `typeStatement` · `railGhosts`
4. Transforms/opacity/clip-path only; cleanup via `useGSAP`
5. Reduced motion: static intro composition + readable copy, no pin scrub

---

## STATE 01 — INTRO

| Field | Spec |
|--------|------|
| **Viewport** | Full viewport, near-black stage (`--oke-bg`). Soft radial charcoal lift behind figure only — **no blue blob**. |
| **Product** | Mint streetwear figure, ~55–62% viewport height. Position: optical center-right (~54% X), slightly low. Asymmetric, not math-centered. |
| **Typography** | Left third: oversized split display **OKE** / **3D** (3D gets thin electric accent stroke or last letter only). Below: meta `01 / COLLECTIBLE` + `3D PRINTED FIGURES` (tracked uppercase). Logo mark small in nav, not competing with type. |
| **Background** | Flat deep charcoal; micro grain optional (CSS, static). Single cool edge-light kiss on figure silhouette (very low opacity accent). |
| **Primary animation** | None on scroll yet. Idle ambient: figure Y ±4px + rotateZ ±1.2° over 6–8s (yoyo). |
| **Secondary** | Meta opacity breathe 0.85↔1. Type locked. |
| **Scroll range** | Progress `0 → 0.08` (hold / settle). |
| **→ next** | Ambient continues; scroll unlocks Discovery layers. |

---

## STATE 02 — DISCOVERY

| Field | Spec |
|--------|------|
| **Viewport** | Still fullscreen; depth becomes readable. |
| **Product** | Moves left ~6–8vw, rotates Y **+6° to +10°** (desktop), slight scale **1 → 1.06**. Feels like camera orbit, not spin. |
| **Typography** | Primary display drifts opposite (~+4vw X, −3vh Y) slower than figure. Meta tracks with slight lag. |
| **Background** | Background light layer shifts opposite to figure (parallax lag). Accent filament line may draw 0→40% width under meta — accent, not glow flood. |
| **Primary animation** | Multi-layer parallax: figure / type / bg light at different rates. |
| **Secondary** | Soft shadow expands under base; meta swaps to `02 / DISCOVERY`. |
| **Scroll range** | Progress `0.08 → 0.28`. |
| **→ next** | Continuity into scale-up Reveal — no cut. |

---

## STATE 03 — PRODUCT REVEAL

| Field | Spec |
|--------|------|
| **Viewport** | Figure dominates; type yields space. |
| **Product** | Scale **~1.06 → 1.18**, moves toward true center-left. Crop may clip feet slightly (editorial). |
| **Typography** | Large display exits up/left via clip-path or y+opacity. New editorial stack appears mid-right: `3D PRINTED` / `COLLECTIBLE` / thin rule / `OKE. SIGNATURE`. No fake “hand finished” unless confirmed. |
| **Background** | Stage darkens 4–6%; edge light intensifies on hoodie plane only. |
| **Primary animation** | Figure scale + ownership of frame. |
| **Secondary** | Metadata reveal stagger (80–120ms). Accent rule draws. |
| **Scroll range** | Progress `0.28 → 0.48`. |
| **→ next** | Figure begins lateral exit to free statement side. |

---

## STATE 04 — STATEMENT

| Field | Spec |
|--------|------|
| **Viewport** | Split composition: object vs language. |
| **Product** | Anchored **right ~62–70% X**, scale eases to ~1.05–1.1, yaw settles ~4°. Remains fully visible. |
| **Typography** | Left: monumental statement (2 lines): **MADE TO EXIST** / **OUTSIDE THE SCREEN.** Display size = graphic element (clamp ~12–18vw line). |
| **Background** | Near void; optional vertical hairline between type and figure. |
| **Primary animation** | Statement reveal (clip-path wipe or masked rise) + figure lateral settle. |
| **Secondary** | Tiny meta `04 / MANIFESTO` above statement. |
| **Scroll range** | Progress `0.48 → 0.68`. |
| **→ next** | Statement holds, then both systems begin Transform morph. |

---

## STATE 05 — TRANSFORM → COLLECTION

| Field | Spec |
|--------|------|
| **Viewport** | Hero unlocks into homepage flow; pin releases near end. |
| **Product** | Hero figure scales down (~0.72) and docks as **first rail item** (left of emerging collection). |
| **Typography** | Statement compresses/fades; rail title emerges: **SIGNATURE FORMS** (or similar). |
| **Background** | Stage lifts slightly toward `--oke-bg-elevated`; other figures enter from right with staggered x. |
| **Primary animation** | Continuity morph: one figure becomes collection lead. |
| **Secondary** | 2–3 supporting products fade/slide in (mint + black OKE pieces). Rail scrub may continue in next section. |
| **Scroll range** | Progress `0.68 → 1.0` (pin end ~0.92–1.0). |
| **→ next** | Lands in Collection Rail section with shared figure node — **no hard section break**. |

---

## Mobile alternate (matchMedia)

- Scroll length ~2.5× VH; max yaw **4°**; less lateral travel  
- Type stacks above figure in Intro; Statement stacks under figure  
- Transform: figure shrinks upward, rail becomes vertical peek — not horizontal docking  
- Idle ambient on or reduced; scrub timeline shorter  

## Reduced motion

Static State 01 composition + visible statement + skip-link to collection. No pin scrub.

## Acceptance (reminder)

Not done until Browser screenshots pass the 12 hero criteria — especially “not a template” and continuous transform into collection.
