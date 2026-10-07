/**
 * Curated OKE3D asset map. Whitelist only: files under /public.
 * Forbidden in UI: custom-dolls/* (non-OKE fashion dolls), catalog sheets.
 */

export type AssetKind = 'studio' | 'exploded' | 'lifestyle' | 'sheet' | 'verboden' | 'brand'

export const assets = {
  brand: {
    icon: '/brand/logo-icon.png',
    logo: '/brand/logo.png',
  },

  hero: {
    mintGhost: '/assets/hero/mint-ghost-main.png',
    mintHoodie: '/assets/hero/mint-hoodie.png',
    kettlebell: '/assets/hero/black-kettlebell-figure.png',
    width: 1344,
    height: 1792,
    altNl: 'OKE mint ghost collectible, studiofoto',
    altEn: 'OKE mint ghost collectible, studio photo',
  },

  about: {
    /** Dark-only studio cards */
    winterSingle: '/assets/dark/winter-single.png',
    blackCoffee: '/products/oke-collection/black-streetwear-coffee-cutout.png',
    kettlebell: '/assets/dark/black-fitness-kettlebell.png',
  },

  /** Single OKE studio figures only. Never sheets or fashion dolls. */
  make: {
    collectibles: '/assets/dark/black-fitness-kettlebell.png',
    editions: '/products/bbq-edition/bbq-grillmaster.webp',
    custom: '/assets/edities/monochrome-couple.webp',
    request: '/products/oke-collection/black-streetwear-coffee-cutout.png',
  },

  editions: {
    mono: '/assets/dark/winter-single.png',
    winterCouple: '/assets/edities/monochrome-couple.webp',
    bbq: '/products/bbq-edition/bbq-grillmaster.webp',
    fitness: '/assets/dark/black-fitness-kettlebell.png',
    coffee: '/products/oke-collection/black-streetwear-coffee-cutout.png',
  },

  bbq: {
    hero: '/products/bbq-edition/bbq-grillmaster.webp',
    apron: '/assets/dark/bbq-apron.png',
    assembled: '/products/bbq-edition/bbq-assembled.png',
    explodedAlpha: '/products/bbq-edition/bbq-exploded-alpha.png',
  },

  custom: {
    /** OKE only. Never custom-dolls / fashion dolls / mint. */
    monochromeCouple: '/assets/edities/monochrome-couple.webp',
    winterSingle: '/assets/dark/winter-single.png',
  },

  cutouts: {
    kettlebell: '/assets/dark/black-fitness-kettlebell.png',
    coffee: '/products/oke-collection/black-streetwear-coffee-cutout.png',
    fitness: '/assets/collectie/fitness/black-dumbbell-shaker.png',
  },

  /** Do not render these in product UI */
  forbidden: {
    sheetGrid: '/products/catalog/oke-collection-grid.webp',
    fashionTrio: '/products/custom-dolls/fashion-dolls-trio.webp',
    fashionAfro: '/products/custom-dolls/fashion-doll-afro.webp',
    fashionBlonde: '/products/custom-dolls/fashion-doll-blonde.webp',
    fashionPink: '/products/custom-dolls/custom-girl-pink-outfit.webp',
  },
} as const

/** Inventory labels for Image Police audits */
export const assetInventory: Array<{
  path: string
  kind: AssetKind
  note: string
}> = [
  { path: '/assets/hero/mint-ghost-main.png', kind: 'studio', note: 'Hero mint ghost cutout' },
  { path: '/assets/hero/mint-hoodie.png', kind: 'studio', note: 'Hero mint hoodie cutout' },
  { path: '/assets/hero/black-kettlebell-figure.png', kind: 'studio', note: 'Hero kettlebell cutout' },
  { path: '/assets/hero/black-kettlebell.png', kind: 'studio', note: 'Alt kettlebell' },
  { path: '/brand/logo.png', kind: 'brand', note: 'Wordmark' },
  { path: '/brand/logo-icon.png', kind: 'brand', note: 'Icon' },
  { path: '/products/catalog/oke-collection-grid.webp', kind: 'sheet', note: '7 fitness figures. Do not use as product' },
  { path: '/products/custom-dolls/fashion-dolls-trio.webp', kind: 'verboden', note: 'Non-OKE fashion dolls' },
  { path: '/products/custom-dolls/fashion-doll-afro.webp', kind: 'verboden', note: 'Non-OKE fashion doll' },
  { path: '/products/custom-dolls/fashion-doll-blonde.webp', kind: 'verboden', note: 'Non-OKE fashion doll' },
  { path: '/products/custom-dolls/custom-girl-pink-outfit.webp', kind: 'verboden', note: 'Non-OKE fashion doll' },
  { path: '/products/oke-collection/mint-ghost-mascot.webp', kind: 'studio', note: 'Signature mint ghost' },
  { path: '/products/oke-collection/mint-streetwear-cap.webp', kind: 'studio', note: 'Mint cap figure' },
  { path: '/products/oke-collection/mint-streetwear-hoodie.png', kind: 'studio', note: 'Mint hoodie' },
  { path: '/products/oke-collection/mint-streetwear-hoodie-cutout.png', kind: 'studio', note: 'Mint hoodie alpha' },
  { path: '/products/oke-collection/black-coffee-hoodie.webp', kind: 'studio', note: 'Black coffee hoodie' },
  { path: '/products/oke-collection/black-fitness-kettlebell-cutout.png', kind: 'studio', note: 'Kettlebell cutout' },
  { path: '/products/oke-collection/mint-fitness-female.png', kind: 'sheet', note: 'Crop from sheet, edge fragments' },
  { path: '/products/oke-collection/black-fitness-male.webp', kind: 'sheet', note: 'Treat as sheet source, prefer cutouts' },
  { path: '/products/bbq-edition/bbq-exploded-alpha.png', kind: 'exploded', note: 'BBQ parts on dark' },
  { path: '/products/bbq-edition/bbq-grillmaster.webp', kind: 'studio', note: 'BBQ grillmaster' },
  { path: '/products/bbq-edition/bbq-apron.webp', kind: 'studio', note: 'BBQ apron' },
  { path: '/products/pastel-bike/oke-bike-pink-blossoms.webp', kind: 'lifestyle', note: 'Bike outdoors blossoms' },
  { path: '/products/pastel-bike/oke-bike-blue-garden.webp', kind: 'lifestyle', note: 'Bike garden' },
  { path: '/products/pastel-bike/oke-bike-pink-studio.webp', kind: 'studio', note: 'Bike studio' },
  { path: '/products/pastel-bike/oke-pink-handheld.webp', kind: 'lifestyle', note: 'Handheld OKE figure' },
  { path: '/products/urban-magenta/ghost-puffer.webp', kind: 'studio', note: 'Magenta ghost' },
  { path: '/products/urban-magenta/ghost-girl-duo-size.webp', kind: 'sheet', note: 'Duo / multi figure' },
  { path: '/products/monochrome/winter-puffer-duo.webp', kind: 'sheet', note: 'Duo sheet' },
  { path: '/products/monochrome/winter-single.jpg', kind: 'studio', note: 'Single winter figure' },
]
