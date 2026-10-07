export type Locale = 'nl' | 'en'

export type Dictionary = {
  meta: {
    title: string
    description: string
  }
  announce: {
    message: string
    cta: string
    dismiss: string
  }
  nav: {
    collection: string
    editions: string
    accessories: string
    materials: string
    custom: string
    about: string
    request: string
    cta: string
    openMenu: string
    closeMenu: string
    language: string
  }
  hero: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    lede: string
    primaryCta: string
    secondaryCta: string
  }
  customCta: {
    eyebrow: string
    title: string
    lede: string
    cta: string
    modal: {
      title: string
      close: string
      back: string
      next: string
      submit: string
      sending: string
      done: string
      uploadHint: string
      uploadCta: string
      previewHint: string
      previewLabel: string
      previewLoading: string
      previewReady: string
      previewFallback: string
      name: string
      email: string
      description: string
      reviewHint: string
      reviewImage: string
      successTitle: string
      successBody: string
      error: string
    }
  }
  about: {
    eyebrow: string
    title: string
    lede: string
    body: string
    craft: string
    stats: { value: number; suffix: string; label: string }[]
  }
  aboutPage: {
    seoTitle: string
    seoDescription: string
    eyebrow: string
    title: string
    lede: string
    craftTitle: string
    craftBody: string
    craftBody2: string
    studioTitle: string
    studioBody: string
    studioPoints: string[]
    exploreTitle: string
    exploreBody: string
  }
  accessoriesPage: {
    seoTitle: string
    seoDescription: string
    eyebrow: string
    title: string
    lede: string
    ctaLede: string
    cta: string
  }
  materialsPage: {
    seoTitle: string
    seoDescription: string
    eyebrow: string
    title: string
    lede: string
    body: string
    body2: string
    swatchLabel: string
    ctaLede: string
    cta: string
  }
  editionsPage: {
    seoTitle: string
    seoDescription: string
    body: string
    body2: string
    craftNote: string
  }
  collectionPage: {
    seoTitle: string
    seoDescription: string
    body: string
    craftNote: string
    related: string
  }
  printIdeas: {
    eyebrow: string
    title: string
    lede: string
    cta: string
    secondary: string
  }
  make: {
    eyebrow: string
    title: string
    lede: string
    items: { title: string; body: string }[]
  }
  featured: {
    eyebrow: string
    title: string
    lede: string
    viewAll: string
    requestStatus: string
  }
  edition: {
    eyebrow: string
    title: string
    lede: string
    cta: string
    specs: string[]
    cards: { apron: string; grillmaster: string; ninja: string }
  }
  custom: {
    eyebrow: string
    title: string
    lede: string
    primaryCta: string
    secondaryCta: string
    accepts: string
    types: string[]
    cards: {
      customDolls: { title: string; body: string }
      request: { title: string; body: string }
    }
  }
  process: {
    eyebrow: string
    title: string
    steps: { title: string; body: string }[]
  }
  ideas: {
    eyebrow: string
    title: string
    lede: string
  }
  finalCta: {
    title: string
    lede: string
    cta: string
  }
  footer: {
    blurb: string
    collection: string
    custom: string
    info: string
    contact: string
    language: string
    links: {
      collection: string
      editions: string
      accessories: string
      materials: string
      custom: string
      about: string
      contact: string
      faq: string
      privacy: string
      terms: string
      request: string
    }
    rights: string
  }
  categories: Record<string, string>
  collection: {
    title: string
    lede: string
    filterLabel: string
    empty: string
  }
  product: {
    requestCta: string
    backToCollection: string
    inEdition: string
  }
  request: {
    pageTitle: string
    lede: string
    name: string
    email: string
    product: string
    productNone: string
    message: string
    submit: string
    sending: string
    success: string
    error: string
  }
  stickyCta: {
    label: string
  }
  floatMenu: {
    label: string
    open: string
    close: string
    contact: string
    contactSub: string
    design: string
    designSub: string
    collection: string
    collectionSub: string
  }
  placeholder: {
    body: string
  }
  contactPage: {
    seoTitle: string
    seoDescription: string
    eyebrow: string
    title: string
    lede: string
    emailLabel: string
    emailBody: string
    studioLabel: string
    studioBody: string
    ctaCustom: string
    ctaRequest: string
  }
  faqPage: {
    seoTitle: string
    seoDescription: string
    eyebrow: string
    title: string
    lede: string
    items: { q: string; a: string }[]
    cta: string
  }
}
