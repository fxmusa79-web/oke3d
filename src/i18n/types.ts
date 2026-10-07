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
    custom: string
    about: string
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
  placeholder: {
    body: string
  }
}
