import { filterDarkProducts, isDarkAllowedImage, isWhitelistedId } from './imagePolice'

export type ProductCategory = 'oke-collection' | 'monochrome' | 'bbq-edition'

export type ImageKind = 'studio' | 'exploded' | 'lifestyle'

export type GallerySlide = {
  src: string
  alt?: string
  kind?: ImageKind
  hotspots?: Array<{ id: string; label: string; x: number; y: number }>
}

export type Product = {
  id: string
  title: string
  category: ProductCategory
  image: string
  kind: ImageKind
  gallery: GallerySlide[]
  tags: string[]
  featured?: boolean
  description: { nl: string; en: string }
}

export const categories: {
  id: ProductCategory | 'all'
  label: string
  blurb: string
}[] = [
  { id: 'all', label: 'Alles', blurb: 'Volledige collectie' },
  {
    id: 'oke-collection',
    label: 'OKE. Collectie',
    blurb: 'Signature black studio figures',
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    blurb: 'Zwart winter & studio streetwear',
  },
  {
    id: 'bbq-edition',
    label: 'BBQ Edition',
    blurb: 'Grillmaster specials',
  },
]

const studio = (src: string): GallerySlide[] => [{ src, kind: 'studio' }]

/**
 * Dark-only whitelist products. No mint / pastel / magenta / bloesem / bike.
 */
export const products: Product[] = [
  {
    id: 'black-fitness-kettlebell',
    title: 'Black Fitness Kettlebell',
    category: 'oke-collection',
    image: '/assets/dark/black-fitness-kettlebell.png',
    kind: 'studio',
    gallery: studio('/assets/dark/black-fitness-kettlebell.png'),
    tags: ['black', 'fitness'],
    featured: true,
    description: {
      nl: 'Zwarte fitness figuur met kettlebell. Klaar voor kleine oplages op aanvraag.',
      en: 'Black fitness figure with kettlebell. Available in small runs on request.',
    },
  },
  {
    id: 'black-fitness-dumbbell',
    title: 'Black Fitness Dumbbell',
    category: 'oke-collection',
    image: '/assets/collectie/fitness/black-dumbbell-shaker.png',
    kind: 'studio',
    gallery: studio('/assets/collectie/fitness/black-dumbbell-shaker.png'),
    tags: ['black', 'fitness'],
    featured: true,
    description: {
      nl: 'Zwarte fitness figuur met dumbbell. Studio collectible.',
      en: 'Black fitness figure with dumbbell. Studio collectible.',
    },
  },
  {
    id: 'black-ghost-coffee',
    title: 'Black Ghost Coffee',
    category: 'oke-collection',
    image: '/products/oke-collection/black-streetwear-coffee-cutout.png',
    kind: 'studio',
    gallery: studio('/products/oke-collection/black-streetwear-coffee-cutout.png'),
    tags: ['black', 'streetwear'],
    featured: true,
    description: {
      nl: 'Black coffee ghost met beker. Streetwear vibe, studio finish.',
      en: 'Black coffee ghost with cup. Streetwear vibe, studio finish.',
    },
  },
  {
    id: 'black-puffer',
    title: 'Black Puffer',
    category: 'monochrome',
    image: '/products/oke-collection/black-coffee-hoodie.png',
    kind: 'studio',
    gallery: studio('/products/oke-collection/black-coffee-hoodie.png'),
    tags: ['black', 'streetwear'],
    featured: true,
    description: {
      nl: 'Zwarte hoodie / puffer ghost. Monochrome studio shot.',
      en: 'Black hoodie / puffer ghost. Monochrome studio shot.',
    },
  },
  {
    id: 'winter-single',
    title: 'Winter Single',
    category: 'monochrome',
    image: '/assets/dark/winter-single.png',
    kind: 'studio',
    gallery: studio('/assets/dark/winter-single.png'),
    tags: ['mono', 'winter'],
    featured: true,
    description: {
      nl: 'Zwarte winter figuur. Monochrome editie.',
      en: 'Black winter figure. Monochrome edition.',
    },
  },
  {
    id: 'monochrome-couple',
    title: 'Monochrome Couple',
    category: 'monochrome',
    image: '/assets/edities/monochrome-couple.png',
    kind: 'studio',
    gallery: studio('/assets/edities/monochrome-couple.png'),
    tags: ['mono', 'duo'],
    featured: true,
    description: {
      nl: 'Monochrome duo. Winter streetwear collectibles.',
      en: 'Monochrome duo. Winter streetwear collectibles.',
    },
  },
  {
    id: 'bbq-apron-editie',
    title: 'BBQ Apron Editie',
    category: 'bbq-edition',
    image: '/assets/dark/bbq-apron.png',
    kind: 'studio',
    gallery: studio('/assets/dark/bbq-apron.png'),
    tags: ['bbq'],
    featured: true,
    description: {
      nl: 'BBQ apron figuur. Speciale editie uit eigen studio.',
      en: 'BBQ apron figure. Special edition from our studio.',
    },
  },
  {
    id: 'bbq-grillmaster',
    title: 'BBQ Grillmaster',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-grillmaster.png',
    kind: 'studio',
    gallery: studio('/products/bbq-edition/bbq-grillmaster.png'),
    tags: ['bbq', 'grillmaster'],
    featured: true,
    description: {
      nl: 'Grillmaster collectible. Het gezicht van BBQ Edition.',
      en: 'Grillmaster collectible. The face of BBQ Edition.',
    },
  },
  {
    id: 'black-gym-backpack',
    title: 'Black Gym Backpack',
    category: 'oke-collection',
    image: '/assets/collectie/fitness/black-gym-backpack.png',
    kind: 'studio',
    gallery: studio('/assets/collectie/fitness/black-gym-backpack.png'),
    tags: ['black', 'fitness'],
    featured: true,
    description: {
      nl: 'Fitness figuur met gym backpack. Zwarte studio cutout.',
      en: 'Fitness figure with gym backpack. Black studio cutout.',
    },
  },
  {
    id: 'black-kettlebell-female',
    title: 'Black Kettlebell Female',
    category: 'oke-collection',
    image: '/assets/collectie/fitness/black-kettlebell-female.png',
    kind: 'studio',
    gallery: studio('/assets/collectie/fitness/black-kettlebell-female.png'),
    tags: ['black', 'fitness'],
    featured: true,
    description: {
      nl: 'Vrouwelijke kettlebell pose. Dark studio finish.',
      en: 'Female kettlebell pose. Dark studio finish.',
    },
  },
  {
    id: 'black-coffee-cutout',
    title: 'Black Coffee Cutout',
    category: 'oke-collection',
    image: '/assets/collectie/fitness/black-coffee.png',
    kind: 'studio',
    gallery: studio('/assets/collectie/fitness/black-coffee.png'),
    tags: ['black', 'streetwear'],
    featured: true,
    description: {
      nl: 'Coffee ghost cutout. Streetwear silhouette.',
      en: 'Coffee ghost cutout. Streetwear silhouette.',
    },
  },
  {
    id: 'black-dumbbell-alt',
    title: 'Black Dumbbell Alt',
    category: 'oke-collection',
    image: '/assets/collectie/fitness/black-dumbbell-alt.png',
    kind: 'studio',
    gallery: studio('/assets/collectie/fitness/black-dumbbell-alt.png'),
    tags: ['black', 'fitness'],
    featured: false,
    description: {
      nl: 'Alternatieve dumbbell pose uit de fitness-lijn.',
      en: 'Alternate dumbbell pose from the fitness line.',
    },
  },
  {
    id: 'bbq-exploded',
    title: 'BBQ Exploded Build',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-exploded-alpha.png',
    kind: 'exploded',
    gallery: [
      { src: '/products/bbq-edition/bbq-exploded-alpha.png', kind: 'exploded' },
      { src: '/products/bbq-edition/bbq-assembled.png', kind: 'studio' },
    ],
    tags: ['bbq', 'modules'],
    featured: true,
    description: {
      nl: 'Exploded BBQ build — modules die in elkaar klikken tot één groot figuur.',
      en: 'Exploded BBQ build — modules that snap together into one large figure.',
    },
  },
  {
    id: 'bbq-assembled',
    title: 'BBQ Assembled',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-assembled.png',
    kind: 'studio',
    gallery: studio('/products/bbq-edition/bbq-assembled.png'),
    tags: ['bbq'],
    featured: false,
    description: {
      nl: 'Geassembleerde BBQ figuur. Eindresultaat van de module-build.',
      en: 'Assembled BBQ figure. End result of the module build.',
    },
  },
]

export const heroImage = '/assets/dark/black-fitness-kettlebell.png'
export const brandLogo = '/brand/logo.png'
export const brandIcon = '/brand/logo-icon.png'

export function featuredProducts(limit = 8): Product[] {
  return filterDarkProducts(products.filter((p) => p.featured)).slice(0, limit)
}

/** Collection / grids: dark palette only (Image Police). */
export function darkProducts(): Product[] {
  return filterDarkProducts(products)
}

export function isDarkProduct(product: Product): boolean {
  return isWhitelistedId(product.id) && isDarkAllowedImage(product.image)
}

export function getProduct(slug: string): Product | undefined {
  return darkProducts().find((p) => p.id === slug)
}

export function productsInCategory(
  category: ProductCategory,
  excludeId?: string,
): Product[] {
  return darkProducts().filter(
    (p) => p.category === category && p.id !== excludeId,
  )
}
