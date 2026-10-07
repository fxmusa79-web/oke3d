# OKE3D — Complete Website / UI / UX Audit

**Datum:** 2026-10-07  
**Scope:** Lokale codebase (`okstore`) + live preview (`localhost:5173`)  
**Methode:** Code reverse-engineering + browser snapshot (geen codewijzigingen)  
**Stack:** Vite + React 19 + TypeScript + Cloudflare Workers · geen Tailwind · GSAP + Swiper + Lenis · i18n NL/EN

---

## 1. Executive Summary

OKE3D is een **premium collectible SPA** met een sterke merkkern (Syne/Outfit, charcoal + cream, electric blue accent) en een duidelijk productverhaal: 3D-geprinte figuren, edities, prints op aanvraag. De homepage-hero (`src/components/Hero.tsx`) is het sterkste merkvlak: full-bleed, figure carousel, background switcher, optionele WebGL shader.

Tegelijkertijd is de site **architectonisch hybride**: een nieuw SiteShell-systeem draait naast legacy/unused componenten (`HomeHero`, `HeroScene`, `HeroViewer`, `Navbar`, `WhatWeMake`, `FeaturedProducts`). Visuele tokens bestaan in `src/styles/tokens.css`, maar pagina’s en componenten hardcoden vaak eigen hex, radii en spacing. Dat levert **inconsistentie tussen light shop-grids, dark product-cards, cream custom-CTA, en charcoal hero**.

**Kernoordeel:** Merkpotentieel 8/10, uitvoering 5–6/10. De site voelt nog als *meerdere iteraties naast elkaar* in plaats van één design system. Conversion hangt te zwaar op “aanvraag” zonder prijzen, social proof of duidelijke next-step trust. Accessibility is deels goed (skip link, reduced motion, drawer dialog), deels zwak (focus rings inconsistently, filter `role="tab"` zonder tabpanel, sticky CTA overlap).

**Top-conclusies vóór implementatie:**

1. Consolideer design tokens en elimineer hardcoded kleuren buiten tokens.
2. Unify product presentation (light vs dark card systems → één product surface language).
3. Kill of archiveer dead UI paths; één hero, één nav, één card.
4. Strength conversion path: collectie → product → aanvraag met trust + pricing clarity.
5. Fix a11y P0’s (focus, tabs, sticky CTA, modal focus trap completeness).

---

## 2. Sitemap

| URL | Page component | Doel | Primary CTA | Status |
|-----|----------------|------|-------------|--------|
| `/` | `HomePage.tsx` | Merk + discover + convert | Collectie / Aanvraag / Custom | Live, primary |
| `/collectie` | `CollectionPage.tsx` | Browse & filter products | Product card → PDP | Live |
| `/product/:slug` | `ProductPage.tsx` | Product detail + gallery | Naar aanvraag | Live |
| `/aanvraag` | `RequestPage.tsx` | Custom request form → Worker API | Submit | Live |
| `/edities` | `PlaceholderPage.tsx` | Editions narrative | — | Placeholder |
| `/prints` | `PlaceholderPage.tsx` | On-demand prints | — | Placeholder |
| `/over` | `PlaceholderPage.tsx` | About | — | Placeholder |
| `/faq` | `PlaceholderPage.tsx` | FAQ | — | Placeholder |
| `/contact` | `PlaceholderPage.tsx` | Contact | — | Placeholder |
| `/privacy` | `PlaceholderPage.tsx` | Privacy | — | Placeholder |
| `/voorwaarden` | `PlaceholderPage.tsx` | Terms | — | Placeholder |
| `*` | → `/` | Fallback | — | Redirect |

**Layout shell (alle routes behalve redirect):** `SiteShell` → `AnnouncementBar` + `SiteHeader` + `<Outlet />` + `SiteFooter` + `StickyMobileCta` + `MobileDrawer`.

**API (niet UI):** `POST /api/custom-request` (Worker + D1 + R2) — used by `RequestPage` + `CustomDesignModal`.

---

## 3. Page-by-page Audit

### 3.1 `/` — Home (`src/pages/HomePage.tsx`)

**Doel:** Eerste indruk, merksignaal, doorsturen naar collectie/aanvraag.  
**User task:** Begrijpen wat OKE3D is → iets willen → klikken.  
**CTA’s:** Hero CTAs (collectie/aanvraag), CustomDesignSection CTA, sticky mobile CTA.

**Component stack (live):**
1. `Hero` — full viewport cinematic
2. `section.homeAbout` — about blurb + mint mascotte
3. `HorizontalScroller` ×2 — edities + fitness
4. `CustomDesignSection` — light custom-print CTA
5. `section.homeClosing` — closing CTA strip

**Desktop layout:** Hero 100svh edge-to-edge; below: cream/light sections with `--layout-max` (~1200px) containers; horizontal scroll rows; custom band; closing.

**Mobile:** Hero reflows (copy stack, figure smaller, bg switcher position changes); sticky CTA appears; announcement + header compress.

**Opvallende problemen:**
- About section + HorizontalScroller + CustomDesign + Closing = **veel secundaire marketing** na een sterke hero → hierarchy dilution.
- `FeaturedProducts` / `WhatWeMake` / `HomeHero` bestaan maar zijn **niet wired** → conceptual debt.
- Dual CTA systems: Hero buttons vs `Button` primitive vs sticky CTA vs custom section own buttons.
- Fitness scroller vs dark ProductCards: surface language clash (cream page vs near-black cards).

---

### 3.2 `/collectie` — Collection (`CollectionPage.tsx` + `CollectionPage.css`)

**Doel:** Catalogus browsen met serie-filters.  
**User task:** Filter → scan → open product.  
**CTA:** Implicit — card click (no explicit “koop” / “aanvraag” on card face beyond “Op aanvraag” meta).

**Layout:** Page header (H1 + lead) → filter chips (`role="tablist"`) → CSS grid of `ProductCard`.  
**Breakpoints (code):** grid columns via media queries; filters wrap.

**Problems:**
- Filter tabs miss matching `tabpanel` / keyboard arrow pattern (ARIA incomplete).
- All products priced as “Op aanvraag” → conversion friction (no price anchor).
- Card image treatment differs by series (dark whitelist via `imagePolice` → different visual weight).
- Empty filter state: not strongly designed (if any).

---

### 3.3 `/product/:slug` — Product (`ProductPage.tsx` + `ProductPage.css` + `ProductGallery`)

**Doel:** Product overtuigen → door naar aanvraag.  
**User task:** Beoordelen craft/look → actie.  
**CTA:** Link/button naar `/aanvraag` (and related).

**Layout:** Gallery + info column (desktop); stacked (mobile).  
**Problems:**
- Limited trust content (materials, lead time, size, edition size often thin or i18n-only).
- Gallery quality depends on asset completeness per product.
- No sticky buy bar on mobile PDP (sticky CTA is global “aanvraag”, not product-scoped).

---

### 3.4 `/aanvraag` — Request (`RequestPage.tsx` + `RequestPage.css`)

**Doel:** Lead capture / custom request.  
**User task:** Formulier invullen + optioneel upload.  
**CTA:** Submit → Worker.

**Problems:**
- Form styling is page-local, not shared with `CustomDesignModal` → two request UIs.
- Success/error states exist but visual system not unified with tokens.
- Long form cognitive load for first-time visitors who landed from hero without product context.

---

### 3.5 Placeholder routes (`PlaceholderPage.tsx`)

**Edities, Prints, Over, FAQ, Contact, Privacy, Voorwaarden** — thin stubs.  
**Impact:** Footer/nav promises pages that don’t deliver → trust & SEO leak.  
**Priority:** P1 for Over/FAQ/Contact/Edities; P2 for legal.

---

### 3.6 Legacy / unused (in repo, not on live routes)

| Component | Path | Note |
|-----------|------|------|
| `HomeHero` | `components/home/HomeHero.tsx` | Superseded by `Hero` |
| `HeroScene` | `components/hero/HeroScene.tsx` | Legacy 3D/scene path |
| `HeroViewer` | `components/HeroViewer.tsx` | Unused viewer |
| `Navbar` | `components/nav/Navbar.tsx` | Replaced by `SiteHeader` |
| `WhatWeMake` | `components/home/WhatWeMake.tsx` | Not on HomePage |
| `FeaturedProducts` | `components/home/FeaturedProducts.tsx` | Not on HomePage |
| `BbqEdition` | `components/bbq/BbqEdition.tsx` | Standalone BBQ story; not confirmed on HomePage wire |

These inflate cognitive load for maintainers and risk accidental reintroduction of conflicting visuals.

---

## 4. Visual System

### 4.1 Brand intent (from rules + skills)

- Dark charcoal / near-black + off-white cream
- Electric blue **accent only**
- Editorial display typography + clean body
- Asymmetry, negative space, edge-to-edge hero
- **Forbidden:** blue gradient blob hero, glassmorphism, infinite spin, particle soup

### 4.2 What actually ships

| Surface | Dominant look | Source |
|---------|---------------|--------|
| Hero | Charcoal/cream shader + figure | `Hero.css`, Hero-Shader |
| Site chrome | Light frosted header on cream | `SiteHeader.css`, `tokens.css` |
| Collection / cards | Mixed: light page + **dark ProductCards** | `ProductCard.css`, `imagePolice` |
| Custom CTA | Light `#FAFAF6`-ish editorial band | `CustomCTA.css` |
| Modal | Light panel | `CustomDesignModal.css` |
| Announcement | Accent blue bar | `AnnouncementBar.css` |

**Verdict:** Brand rules are clear; **implementation is multi-theme without a documented light/dark surface matrix**. Dark cards on light pages read as “two products” rather than one system.

### 4.3 Layout metrics (from code — not estimates)

| Token / rule | Value | File |
|--------------|-------|------|
| `--oke-max-editorial` | `72rem` (~1152px) | `tokens.css` |
| `--oke-max-page` | `92rem` (~1472px) | `tokens.css` |
| `--oke-gutter` | `clamp(1rem, 3vw, 2.5rem)` | `tokens.css` |
| `--oke-nav-h` / `--oke-announce-h` | `4.1rem` / `2.35rem` | `tokens.css` |
| Space scale | `--oke-space-1`…`9` (0.25rem→7rem) | `tokens.css` |
| Radii | xs/sm/md = 2 / 6 / 10px | `tokens.css` |
| Section padding | often `clamp(3rem, 8vh, 5–5.5rem)` local | HomeSections etc. |
| Hero height | `100svh` / full bleed | `Hero.css` |
| z-index stack | header → drawer → sticky → modal (layered) | layout CSS |

**Note:** There is **no** `--layout-max` / `--section-y` alias — gutters/max use `--oke-*`. Section vertical rhythm is mostly **local clamp**, not a single section token.

**Estimates (visual, not tokenized):** card radius often exceeds token md (10px); button height ~44–48px; filter chip height ~36–40px.

---

## 5. Typography System

### 5.1 Families (tokens)

| Role | Family | Token |
|------|--------|-------|
| Display | Syne | `--font-display` |
| Body | Outfit | `--font-body` |
| Mono | IBM Plex Mono | `--font-mono` |

Loaded via `index.html` / CSS — expressive, on-brand (not Inter/system).

### 5.2 Hierarchy (reconstructed)

| Level | Typical use | Approx size (code/clamp) | Notes |
|-------|-------------|--------------------------|-------|
| Brand mark | Header logo | display, tight tracking | Strong |
| H1 Hero | Hero title | large clamp | Primary |
| H1 Page | Collectie, Aanvraag | page title | Slightly quieter than hero |
| H2 | Section titles (about, scroller, custom) | clamp used inconsistently | **Inconsistency hotspot** |
| H3 | Product card titles | smaller | OK |
| Body | Leads, about | Outfit | OK |
| Meta / caption | “Op aanvraag”, filters | smaller / mono sometimes | Mixed |
| Button | Syne or Outfit depending on component | — | **API inconsistency** |

### 5.3 Inconsistencies

- Section H2 clamp values differ between `HomeSections.css`, `CustomCTA.css`, `CollectionPage.css`.
- Some labels use mono, some don’t, without semantic rule.
- Hero type vs page type: intentional scale jump, but mid-page headings compete with hero residual attention.

---

## 6. Color System

### 6.1 Tokens (`src/styles/tokens.css`) — canonical

| Token | Role | Exact value (`tokens.css`) |
|-------|------|----------------------------|
| `--oke-bg` | Page background | `#f5f3ef` |
| `--oke-bg-warm` | Warm variant | `#faf8f4` |
| `--oke-bg-elevated` | Elevated surface | `#ffffff` |
| `--oke-surface` | Recessed surface | `#eceae4` |
| `--oke-ink` | Primary text | `#14171c` |
| `--oke-ink-muted` | Secondary text | `#5c6570` |
| `--oke-accent` | Filament blue | `#1570d8` |
| `--oke-accent-filament` | Brighter accent | `#1a7ef0` |
| `--oke-dark-bg` | Dark band | `#12151a` |
| `--oke-dark-ink` | Text on dark | `#f4f1ea` |
| `--oke-danger` | Error | `#d64545` |
| `--oke-mint` | Mint accent | `#7fb8a0` |

**Missing from tokens:** success, warning, focus ring, hover/active accent scale, explicit sticky/modal z-index tokens.

### 6.2 Hardcoded / duplicated (observed pattern)

- Modal/Custom surfaces: `#FAFAF6` and similar cream literals in component CSS
- ProductCard dark backgrounds near `#12151a` but not always via token
- Accent blue sometimes literal in AnnouncementBar / buttons
- Success/error colors for forms: **ad hoc**, not tokenized as `--success` / `--danger`

### 6.3 Contrast risks

- Muted text on cream: check WCAG for small captions
- Blue on charcoal: usually OK for accents
- Dark card + dark image: feet/contain fixes helped crop; contrast of meta text on dark needs verification
- Focus rings: if using low-opacity blue, keyboard users may miss them

### 6.4 Design system gap

**Er is een partial token file, geen volledig color system** (missing semantic success/warning/error, hover/active scales, surface elevation ladder).

---

## 7. Spacing System

| Source | Pattern |
|--------|---------|
| Tokens | `--oke-space-1…9`, `--oke-gutter` — good base |
| Components | Local rem/clamp, magic numbers (Hero figure padding ~14–16%, card gaps, filter gaps) |
| Rhythm | Sections often use independent `clamp(3rem, 8vh, …)` instead of shared section token; **intra-section** spacing drifts |

**4/8px audit:** Mix of rem clamps and arbitrary values → not a strict 4/8 grid. HorizontalScroller padding/gap vs Collection grid gap are independently tuned.

---

## 8. Component Inventory

### Navigation

| Component | Reusable? | Consistent? | Issues |
|-----------|-----------|-------------|--------|
| `SiteHeader` | Yes | Mostly | Desktop vs mobile split; CTA “Bekijk collectie” vs brand goals |
| `MobileDrawer` | Yes | Good | Dialog semantics present |
| `AnnouncementBar` | Yes | Accent-heavy | Can compete with hero |
| `LanguageSwitch` | Yes | Duplicated in header + footer | OK but repeated |
| `Navbar` (legacy) | No | — | Dead code |
| Breadcrumbs | **Missing** | — | PDP/collection lack trail |

### Actions

| Component | Variants | Issues |
|-----------|----------|--------|
| `Button` (`ui/Button`) | primary / secondary / ghost-ish | Not used everywhere |
| Hero CTA buttons | Local CSS | Parallel system |
| CustomDesign CTA | Local | Third system |
| StickyMobileCta | Fixed bar | Overlaps content; global not contextual |
| Filter chips | Local buttons | Act as tabs |

### Content

| Component | Notes |
|-----------|-------|
| `ProductCard` | Core shop unit; dark treatment + contain sizing; series-aware |
| `ProductGallery` | PDP media |
| `HorizontalScroller` | Swiper-based rows; home only |
| `Reveal` | Scroll reveal wrapper |
| `Hero` + `HeroFigureCarousel` + `HeroBackgroundSwitcher` | Strong, complex |
| Cards for features/testimonials | **Mostly absent** (good per brand rules) |

### Forms

| Surface | Notes |
|---------|-------|
| `RequestPage` form | Full page |
| `CustomDesignModal` form | Modal duplicate of request intent |
| Shared Input primitive | **Missing** — native inputs styled per page |

### Feedback

| Type | Status |
|------|--------|
| Toast | Not a system |
| Form success/error | Page-local |
| Loading | Partial (submit states) |
| Empty states | Weak / missing |
| Skeleton | Missing |

### Overlays

| Component | Notes |
|-----------|-------|
| `CustomDesignModal` | Light modal; z high |
| `MobileDrawer` | Nav overlay |

---

## 9. Responsive Audit

### Breakpoints in use (fragmented)

Observed across CSS: **~560, 900, 960, 1024, 1100** (+ occasional others).  
No single `--bp-*` token map.

### Behavior matrix

| Area | Mobile | Tablet | Desktop | Large |
|------|--------|--------|---------|-------|
| Nav | Hamburger + drawer | Drawer/hybrid | Full links + CTA | Same |
| Hero | Stacked copy, smaller figure, bg controls reposition | Transitional | Split composition, carousel, bg pills | Same |
| Collection grid | 1–2 cols | 2–3 | 3–4 | 4 |
| Product cards | Full width rows | Grid | Grid | Grid |
| Horizontal scroller | Touch swipe | Swipe | Swipe + arrows | Same |
| Sticky CTA | Visible | Often visible | Hidden (desktop) | Hidden |
| Forms | Single column | Single | Wider constrained | Same |

### Risks

- Sticky CTA + footer + drawer = **stack collision** on short phones.
- Hero figure padding (~14–16% desktop) may leave too much empty cream on large monitors if bg weak.
- Filter chips wrap → uneven second row.
- HorizontalScroller: snap/overflow; ensure no horizontal page scroll bleed.
- Desktop-first hero complexity → mobile must remain one composition (currently mostly OK).

---

## 10. UX Audit

### Personas

1. **Nieuwe bezoeker:** Hero communicates craft well; below-fold density may confuse “what to do next.”
2. **Snelle infozoeker:** FAQ/Over/Contact placeholders → dead ends from footer.
3. **Converter:** Path exists (Collectie → Product → Aanvraag) but “Op aanvraag” everywhere removes price momentum; duplicate custom entry points (section + `/aanvraag` + sticky).
4. **Mobile:** Sticky CTA helps conversion but adds pressure/overlap; drawer OK.
5. **Terugkerende:** No account, wishlist, or “recent” — fine for brand stage; language switch helps.

### Friction map

- Nav labels promise pages that are placeholders.
- Two custom-request UIs (page vs modal) → which is canonical?
- No breadcrumbs; back relies on browser.
- Filters as tabs without full a11y pattern.
- Cognitive load: hero + about + 2 scrollers + custom + closing.

---

## 11. Conversion Audit

**Why act?** Distinct product aesthetic, clear craft, low-friction “aanvraag,” bilingual, custom print promise.

**Where drop-off happens:**
1. Placeholder trust pages (FAQ, Over, Contact).
2. No prices / edition sizes / lead times → objection unanswered.
3. No social proof (press, customers, studio photos process).
4. CTA proliferation without hierarchy (hero vs sticky vs custom vs closing).
5. Product page thin on specs → bounce before form.
6. Form length / upload uncertainty.

**CTA hierarchy today (de facto):**
1. Sticky mobile / Hero primary
2. CustomDesignSection
3. Closing strip
4. Footer links  

**Should be:** One primary per viewport; secondary always quieter.

---

## 12. Accessibility Audit

| Check | Status | Notes |
|-------|--------|-------|
| Skip link | Present | `SiteShell` |
| Semantic landmarks | Partial | header/main/footer mostly |
| Heading order | Mostly OK | Watch card H3 under page H1 |
| Focus visible | Inconsistent | Not all interactive elements share ring token |
| Keyboard nav | Partial | Drawer OK; filter tabs incomplete; carousel needs verify |
| `prefers-reduced-motion` | Honored in places | GSAP matchMedia paths — verify all Hero/Swiper |
| Alt text | Product-dependent | Some decorative; some named links |
| Touch targets | Mixed | Chips/icon buttons may be <44px |
| Modal focus trap | Likely partial | Audit CustomDesignModal thoroughly |
| Color contrast | Needs measurement | Muted-on-cream, blue-on-cream CTAs |
| aria on filters | `tablist` without panels | Fix or switch to toggle group |

---

## 13. Technical Frontend Audit

### Strengths

- Clear Vite/React/Workers split
- i18n structured (`nl.ts` / `en.ts`)
- Tokens file as starting point
- Image Police for dark-series discipline
- Worker endpoint for custom requests

### Weaknesses

- **Dead component weight** (HomeHero, Navbar, HeroScene, etc.)
- **Triplicated CTA/button styling**
- **No shared form primitives**
- **Breakpoint chaos** (magic media queries)
- **Hardcoded colors** bypassing tokens
- **Inconsistent component APIs** (Button vs raw `<a class=...>`)
- **CSS colocation without shared utilities** for spacing/type scale
- Dual path separators on Windows (`src/components` vs `src\components`) in git status — tooling noise

### Design-system readiness

**Not ready.** Tokens + a few primitives (`Button`, `Reveal`) exist, but surfaces, forms, cards, and nav chrome are page-owned. Suitable next step: extract tokens → primitives → patterns → page templates.

---

## 14. Design System Reconstruction (proposed)

### Tokens to lock

```
colors: bg, bg-elevated, ink, ink-muted, accent, accent-hover,
        dark, dark-elevated, border, success, danger, warning, focus
spacing: 4,8,12,16,24,32,48,64,96 (rem-mapped)
type: display/body/mono + steps 12–64 with line-height/letter-spacing
radii: 0, 4, 8, 12, 16, full
shadows: none | soft (brand: prefer light shadows or none)
borders: hairline
motion: duration-fast/base/slow + easing; reduced-motion null
breakpoints: 560, 768, 960, 1100, 1440
container: 1200 (existing --layout-max)
z: announcement < header < drawer < sticky < modal
```

### Components to keep vs redesign

| Keep & harden | Redesign | Archive |
|---------------|----------|---------|
| `Hero` (+ carousel, bg) | `ProductCard` surface language | `HomeHero`, `HeroScene`, `HeroViewer` |
| `SiteHeader` / `MobileDrawer` | Unify Button usage sitewide | `Navbar` |
| `SiteFooter` | Form kit (Input, Textarea, File) | `WhatWeMake`, `FeaturedProducts` if unused |
| `HorizontalScroller` | Collection filters as ToggleGroup | — |
| `ProductGallery` | Placeholder → real content pages | — |
| `CustomDesignSection` | Merge modal ↔ `/aanvraag` UX | — |
| `Reveal` | — | — |

---

## 15. Major Visual Problems

1. **Light page + dark cards** without a defined dual-surface system → looks unfinished.
2. **Multiple button languages** (Hero / Button / Custom / Sticky).
3. **Section density after hero** flattens hierarchy.
4. **Placeholder pages** visually empty → brand drop.
5. **H2 clamp inconsistency** across home sections.
6. **Accent blue** used in announcement at high visual weight (risk of “startup blue bar”).
7. **Radii/shadows** not tokenized → micro-inconsistency.
8. **Legacy CSS** still in repo risking style bleed if imported accidentally.

---

## 16. Major UX Problems

1. Footer/nav → placeholder dead ends.
2. No pricing / lead-time / edition clarity.
3. Duplicate request flows (modal vs page).
4. Sticky CTA not context-aware on PDP.
5. Incomplete filter a11y.
6. Thin PDP specs.
7. No empty/error design language.
8. Cognitive overload mid-home.

---

## 17. Prioritized Improvement Roadmap

### P0 — Critical

| Issue | Location | Why | Solution | Complexity |
|-------|----------|-----|----------|------------|
| Placeholder trust dead-ends | `/over` `/faq` `/contact` | Trust & nav honesty | Ship minimal real content | M |
| A11y filter tabs | `CollectionPage` | Keyboard/AT broken pattern | Toggle group or full tabs | S |
| Focus rings unified | Global CSS | Keyboard users | `--focus` token + :focus-visible | S |
| Sticky CTA overlap | `StickyMobileCta` | Content obscured | Padding-bottom on main; hide on `/aanvraag` | S |
| Form success/error clarity | Request + Modal | Drop-off on fail | Shared Alert primitive | S |

### P1 — High impact

| Issue | Location | Solution | Complexity |
|-------|----------|----------|------------|
| Unify ProductCard surfaces | `ProductCard` | One system: cream or charcoal with rules | M |
| CTA hierarchy | Home + shell | One primary per view | M |
| PDP information density | `ProductPage` | Specs, size, lead time, process | M |
| Merge request UX | Modal + RequestPage | Shared form component | M |
| Kill dead components | legacy files | Archive/delete | S |
| Token enforcement | all CSS | Replace hardcoded hex | M |

### P2 — Medium

| Issue | Solution | Complexity |
|-------|----------|------------|
| Breakpoint tokens | `--bp-*` + consistent mq | S |
| Typography scale doc + CSS | Shared `.type-*` or tokens | M |
| Empty states | Collection/search | S |
| Breadcrumbs | PDP | S |
| Legal pages | Privacy/Terms content | M |
| Social proof strip | Home (careful, not hero clutter) | M |

### P3 — Polish

Micro-spacing 4/8, shadow removal, motion timing, image focal points, mono label rules, announcement quieter.

---

## 18. Recommended Redesign Direction

**Direction:** “Collectible editorial atelier” — one cream paper world with charcoal product stages and blue filament accents only.

- **Visual language:** Full-bleed hero as the only cinematic plane; below-fold = editorial sections with disciplined whitespace, not card dashboards.
- **Typography:** Syne for brand/H1/H2; Outfit for body; mono only for meta/SKU/labels.
- **Color:** Cream canvas (`--bg`), charcoal ink, blue accent ≤5% UI. Dark surfaces reserved for product stages / hero / intentional night sections — not random cards.
- **Spacing:** Strict section rhythm via `--section-y`; internal 8px grid.
- **Components:** Few primitives, many compositions. No glassmorphism, no glow CTAs.
- **Imagery:** Cutout figures on controlled grounds; consistent contain/cover rules per series.
- **Motion:** GSAP primary (hero/scroll), secondary (reveal), ambient (bg) — honor reduced motion; no infinite product spin.
- **Mobile philosophy:** One composition; thumb CTA; drawer; less mid-page chrome.

---

## 19. Exact Next Implementation Steps

*(Pas uitvoeren ná goedkeuring van deze audit — geen code in deze fase.)*

1. Freeze token sheet in Figma/CSS (`tokens.css` expansion).
2. Delete or quarantine unused hero/nav/home components.
3. Build `Button`, `Input`, `Textarea`, `Alert`, `FilterChip` as only action/form primitives.
4. Refactor `ProductCard` to token surfaces; document dark whitelist.
5. Content pass: Over, FAQ, Contact, Edities stubs → real pages.
6. PDP template: gallery + specs + single CTA.
7. Unify CustomDesignModal form with RequestPage fields.
8. A11y pass: focus, tabs, sticky offset, reduced-motion audit.
9. Browser QA matrix: 375 / 768 / 1440 on `/`, `/collectie`, `/product/*`, `/aanvraag`.
10. Only then: visual polish & motion refinements.

---

## 20. TOP 20 IMPROVEMENTS

| # | Problem | Current state | Recommended state | Why | Priority | Complexity |
|---|---------|---------------|-------------------|-----|----------|------------|
| 1 | Dual surface language | Cream pages + dark ProductCards ad hoc | Documented cream canvas + intentional dark product stage | Perceived quality / consistency | P1 | M |
| 2 | Placeholder IA holes | Nav/footer → empty pages | Real Over/FAQ/Contact/Edities | Trust / conversion | P0 | M |
| 3 | CTA proliferation | Hero + sticky + custom + closing all loud | One primary CTA per viewport | Conversion clarity | P1 | M |
| 4 | No price/lead-time anchors | “Op aanvraag” only | Show ranges or “vanaf” + lead time | Objection handling | P1 | M |
| 5 | Thin PDP | Gallery + short copy | Specs, scale, process, CTA | Conversion | P1 | M |
| 6 | Duplicate request UIs | Modal ≠ RequestPage | Shared `RequestForm` | UX / maintainability | P1 | M |
| 7 | Incomplete filter a11y | tablist w/o panels | Toggle group pattern | A11y | P0 | S |
| 8 | Focus system missing | Inconsistent rings | Global `:focus-visible` token | A11y | P0 | S |
| 9 | Sticky CTA overlap | Fixed bar covers content | `main` pad + route awareness | UX mobile | P0 | S |
| 10 | Dead code paths | Unused Hero/Nav/Home comps | Archive | Tech clarity | P1 | S |
| 11 | Hardcoded colors | Hex in many CSS files | Tokens only | Consistency | P1 | M |
| 12 | Fragmented breakpoints | 560/900/960/1024/1100 mixed | Tokenized bp set | Responsive | P2 | S |
| 13 | H2 type inconsistency | Different clamps per section | Shared type scale | Visual hierarchy | P1 | S |
| 14 | Button API split | `Button` + raw hero/custom links | All CTAs via `Button` | Consistency | P1 | M |
| 15 | No form primitives | Native inputs restyled twice | Input/Textarea kit | Quality | P1 | M |
| 16 | Announcement competes | Full blue bar | Quieter or dismissible | Brand (accent-only) | P2 | S |
| 17 | Home mid-page density | About + 2 scrollers + custom + close | Fewer sections, clearer jobs | Hierarchy | P1 | M |
| 18 | Missing empty/error UI | Ad hoc | Alert + empty pattern | UX | P2 | S |
| 19 | No breadcrumbs | Browser back only | Collection › Product | UX | P2 | S |
| 20 | Social/process proof gap | None above fold secondary | Studio/process strip below hero (not on hero) | Trust | P2 | M |

---

## Scores (1–10)

| Dimension | Score | Rationale |
|-----------|------:|-----------|
| Visual hierarchy | 6 | Strong hero; mid-home flattens; multiple CTAs equal weight |
| Typography | 7 | Excellent font choices; scale not fully systematized |
| Spacing | 6 | Section tokens help; intra-component magic numbers |
| Color system | 5 | Tokens exist; hardcoded cream/dark/accent duplicates; weak semantics |
| Consistency | 4 | Multi-iteration UI (hero vs shop vs custom vs legacy) |
| Component quality | 6 | Hero/ProductCard/Header solid; forms/feedback weak |
| Layout quality | 7 | `--layout-max` + gutters solid; grids OK |
| Responsive design | 6 | Works, but bp fragmentation + sticky issues |
| Accessibility | 5 | Skip/drawer/rmotion start; tabs/focus/contrast gaps |
| UX | 5 | Path exists; placeholders + dual forms + no pricing |
| Conversion | 5 | Aesthetic pull strong; trust/price/FAQ weak |
| Brand identity | 8 | Distinct collectible atelier feel when hero leads |
| Perceived quality | 6 | Craft imagery high; system seams visible |
| Professionalism | 6 | Not template-y; not yet coherent product site |

**Overall:** ~6.0 — strong brand nucleus, incomplete system, conversion/trust unfinished.

---

## Evidence index (primary files)

- Routes: `src/App.tsx`
- Shell: `src/components/layout/SiteShell.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `MobileDrawer.tsx`, `StickyMobileCta.tsx`, `AnnouncementBar.tsx`
- Home: `src/pages/HomePage.tsx`, `src/components/Hero.tsx`, `home/HorizontalScroller.tsx`, `custom/CustomCTA.tsx`, `custom/CustomDesignModal.tsx`
- Shop: `pages/CollectionPage.tsx`, `pages/ProductPage.tsx`, `shop/ProductCard.tsx`, `shop/ProductGallery.tsx`
- Request: `pages/RequestPage.tsx`, `worker/index.ts`
- Tokens: `src/styles/tokens.css`, `src/index.css`
- Data: `src/data/products.ts`, `fitness.ts`, `imagePolice.ts`, `i18n/*`
- Legacy: `home/HomeHero.tsx`, `nav/Navbar.tsx`, `hero/HeroScene.tsx`, `HeroViewer.tsx`

---

*Einde audit. Geen code gewijzigd. Volgende fase: prioriteiten kiezen en implementeren.*
