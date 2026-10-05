export type ProductCategory =
  | 'oke-collection'
  | 'urban-magenta'
  | 'monochrome'
  | 'pastel-bike'
  | 'bbq-edition'
  | 'custom-dolls'

export type Product = {
  id: string
  title: string
  category: ProductCategory
  image: string
  tags: string[]
  featured?: boolean
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
    blurb: 'Signature ghost figures in mint & black',
  },
  {
    id: 'urban-magenta',
    label: 'Urban Series',
    blurb: 'Streetwear collectibles met bold magenta',
  },
  {
    id: 'monochrome',
    label: 'Monochrome',
    blurb: 'Zwart winter & veil streetwear',
  },
  {
    id: 'pastel-bike',
    label: 'Pastel & Bike',
    blurb: 'Zachte OKE-figuren op fiets & in pastel',
  },
  {
    id: 'bbq-edition',
    label: 'BBQ Edition',
    blurb: 'Grillmaster specials',
  },
  {
    id: 'custom-dolls',
    label: 'Op maat',
    blurb: 'Custom dolls & persoonlijke prints',
  },
]

export const products: Product[] = [
  {
    id: 'mint-streetwear-hoodie',
    title: 'Mint Streetwear Hoodie',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-streetwear-hoodie.png',
    tags: ['mint', 'streetwear', 'signature'],
    featured: true,
  },
  {
    id: 'black-fitness-kettlebell',
    title: 'Black Fitness Kettlebell',
    category: 'oke-collection',
    image: '/products/oke-collection/black-fitness-kettlebell.png',
    tags: ['black', 'fitness'],
    featured: true,
  },
  {
    id: 'mint-fitness-female',
    title: 'Mint Fitness Curl',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-fitness-female.png',
    tags: ['mint', 'fitness'],
  },
  {
    id: 'black-streetwear-coffee',
    title: 'Black Coffee Run',
    category: 'oke-collection',
    image: '/products/oke-collection/black-streetwear-coffee.png',
    tags: ['black', 'streetwear'],
  },
  {
    id: 'mint-weight-plate',
    title: 'Mint Weight Plate',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-weight-plate.png',
    tags: ['mint', 'fitness'],
  },
  {
    id: 'mint-puffer-cap',
    title: 'Mint Puffer Cap',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-puffer-cap.png',
    tags: ['mint', 'lifestyle'],
  },
  {
    id: 'black-gym-backpack',
    title: 'Black Gym Backpack',
    category: 'oke-collection',
    image: '/products/oke-collection/black-gym-backpack.png',
    tags: ['black', 'fitness'],
  },
  {
    id: 'mint-ghost-mascot',
    title: 'Mint Ghost Mascot',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-ghost-mascot.webp',
    tags: ['mint', 'mascot'],
    featured: true,
  },
  {
    id: 'mint-streetwear-cap',
    title: 'Mint Cap & Puffer',
    category: 'oke-collection',
    image: '/products/oke-collection/mint-streetwear-cap.webp',
    tags: ['mint', 'streetwear'],
  },
  {
    id: 'black-fitness-male',
    title: 'Black Fitness Male',
    category: 'oke-collection',
    image: '/products/oke-collection/black-fitness-male.webp',
    tags: ['black', 'fitness'],
  },
  {
    id: 'black-coffee-hoodie',
    title: 'Black Coffee Hoodie',
    category: 'oke-collection',
    image: '/products/oke-collection/black-coffee-hoodie.webp',
    tags: ['black', 'streetwear'],
  },
  {
    id: 'black-skater',
    title: 'Black Skater',
    category: 'oke-collection',
    image: '/products/oke-collection/black-skater.webp',
    tags: ['black', 'skate'],
  },
  {
    id: 'ghost-puffer',
    title: 'Magenta Ghost Puffer',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-puffer.webp',
    tags: ['urban', 'magenta'],
    featured: true,
  },
  {
    id: 'ghost-number-one',
    title: 'Number One Ghost',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-number-one.webp',
    tags: ['urban', 'magenta'],
  },
  {
    id: 'ghost-number-one-bag',
    title: 'Number One + Bag',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-number-one-bag.webp',
    tags: ['urban', 'fashion'],
  },
  {
    id: 'ghost-puffer-cargo',
    title: 'Ghost Cargo Puffer',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-puffer-cargo.webp',
    tags: ['urban'],
  },
  {
    id: 'masked-elder',
    title: 'Masked Elder',
    category: 'urban-magenta',
    image: '/products/urban-magenta/masked-elder.webp',
    tags: ['urban', 'character'],
  },
  {
    id: 'ghost-mitten-puffer',
    title: 'Mitten Ghost Puffer',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-mitten-puffer.webp',
    tags: ['urban'],
  },
  {
    id: 'ghost-girl-duo-size',
    title: 'Ghost Girl Duo Size',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-girl-duo-size.webp',
    tags: ['urban', 'sizes'],
  },
  {
    id: 'ghost-open-jacket',
    title: 'Open Jacket Ghost',
    category: 'urban-magenta',
    image: '/products/urban-magenta/ghost-open-jacket.jpg',
    tags: ['urban'],
  },
  {
    id: 'veil-duo',
    title: 'Black Veil Duo',
    category: 'monochrome',
    image: '/products/monochrome/veil-duo.webp',
    tags: ['mono', 'duo'],
  },
  {
    id: 'winter-puffer-duo',
    title: 'Winter Puffer Duo',
    category: 'monochrome',
    image: '/products/monochrome/winter-puffer-duo.webp',
    tags: ['mono', 'winter'],
    featured: true,
  },
  {
    id: 'winter-single',
    title: 'Winter Single',
    category: 'monochrome',
    image: '/products/monochrome/winter-single.jpg',
    tags: ['mono', 'winter'],
  },
  {
    id: 'winter-duo',
    title: 'Winter Duo',
    category: 'monochrome',
    image: '/products/monochrome/winter-duo.jpg',
    tags: ['mono', 'winter'],
  },
  {
    id: 'oke-bike-pink-blossoms',
    title: 'OKE Bike Pink Blossoms',
    category: 'pastel-bike',
    image: '/products/pastel-bike/oke-bike-pink-blossoms.webp',
    tags: ['pastel', 'bike'],
    featured: true,
  },
  {
    id: 'oke-bike-blue-garden',
    title: 'OKE Bike Blue Garden',
    category: 'pastel-bike',
    image: '/products/pastel-bike/oke-bike-blue-garden.webp',
    tags: ['pastel', 'bike'],
  },
  {
    id: 'oke-bike-pink-studio',
    title: 'OKE Bike Pink Studio',
    category: 'pastel-bike',
    image: '/products/pastel-bike/oke-bike-pink-studio.webp',
    tags: ['pastel', 'bike'],
  },
  {
    id: 'oke-pink-handheld',
    title: 'Pink Puffer Handheld',
    category: 'pastel-bike',
    image: '/products/pastel-bike/oke-pink-handheld.webp',
    tags: ['pastel'],
  },
  {
    id: 'bbq-apron',
    title: 'BBQ Apron Edition',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-apron.webp',
    tags: ['bbq'],
    featured: true,
  },
  {
    id: 'bbq-grillmaster',
    title: 'BBQ Grillmaster',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-grillmaster.webp',
    tags: ['bbq'],
  },
  {
    id: 'bbq-ninja',
    title: 'BBQ Ninja',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-ninja.webp',
    tags: ['bbq'],
  },
  {
    id: 'bbq-roundhead',
    title: 'BBQ Roundhead',
    category: 'bbq-edition',
    image: '/products/bbq-edition/bbq-roundhead.webp',
    tags: ['bbq'],
  },
  {
    id: 'fashion-dolls-trio',
    title: 'Custom Fashion Trio',
    category: 'custom-dolls',
    image: '/products/custom-dolls/fashion-dolls-trio.webp',
    tags: ['custom', 'dolls'],
    featured: true,
  },
  {
    id: 'fashion-doll-afro',
    title: 'Custom Fashion Doll',
    category: 'custom-dolls',
    image: '/products/custom-dolls/fashion-doll-afro.webp',
    tags: ['custom'],
  },
  {
    id: 'fashion-doll-blonde',
    title: 'Custom Style Doll',
    category: 'custom-dolls',
    image: '/products/custom-dolls/fashion-doll-blonde.webp',
    tags: ['custom'],
  },
  {
    id: 'custom-girl-pink-outfit',
    title: 'Custom Girl Pink',
    category: 'custom-dolls',
    image: '/products/custom-dolls/custom-girl-pink-outfit.webp',
    tags: ['custom'],
  },
]

export const heroImage = '/products/oke-collection/mint-streetwear-hoodie.png'
export const catalogGrid = '/products/catalog/oke-collection-grid.webp'
export const brandLogo = '/brand/logo.png'
export const brandIcon = '/brand/logo-icon.png'
