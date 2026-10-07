import type { Dictionary } from './types'

export const en: Dictionary = {
  meta: {
    title: 'OKE3D — 3D-printed collectibles & custom prints | Netherlands',
    description:
      'OKE3D is a Dutch 3D-print studio for collectibles, editions and made-to-order prints. From figurines to functional objects: digital idea to something you can hold.',
  },
  announce: {
    message: 'Unique 3D prints · Small batches · Made to order',
    cta: 'Discover more',
    dismiss: 'Dismiss',
  },
  nav: {
    collection: 'Collection',
    editions: 'Editions',
    accessories: 'Accessories',
    materials: 'Materials',
    custom: 'Custom',
    about: 'About OKE3D',
    request: 'Request',
    cta: 'View collection',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
  },
  hero: {
    eyebrow: '3D prints from our studio',
    titleLine1: 'From digital idea',
    titleLine2: 'to real object.',
    lede: 'Explore unique 3D prints, special collections and products we make to order for you.',
    primaryCta: 'View collection',
    secondaryCta: 'Request a print',
  },
  customCta: {
    eyebrow: 'Custom',
    title: 'Your idea, as a collectible.',
    lede: 'Upload a photo or sketch. We translate it into a 3D print in the studio.',
    cta: 'Start design',
    modal: {
      title: 'Your custom OKE',
      close: 'Close',
      back: 'Back',
      next: 'Continue',
      submit: 'Send',
      sending: 'Sending…',
      done: 'Done',
      uploadHint: 'Upload a photo of yourself or a sketch. We use this as a starting point.',
      uploadCta: 'Choose an image',
      previewHint:
        'We build a 3D mesh from your photo (TripoSR). Usually 20–40 seconds. Concept preview — not the final studio print.',
      previewLabel: '3D Preview (concept)',
      previewLoading: 'OKE is being built…',
      previewReady: '3D ready — drag to rotate',
      previewFallback: 'API unavailable — texture preview. Drag to rotate',
      name: 'Name',
      email: 'Email',
      description: 'Description / wishes',
      reviewHint: 'Review your request and send. We will get back to you soon.',
      reviewImage: 'Reference image',
      successTitle: 'Request received',
      successBody: 'We will review it and get back to you soon.',
      error: 'Sending failed. Please try again.',
    },
  },
  about: {
    eyebrow: 'About OKE3D',
    title: '3D printing with character.',
    lede: 'From collectibles and special editions to made-to-order prints. We turn digital designs into objects you can hold, from our own studio.',
    body: 'Every print starts with form, material and detail. We work in small runs with careful finishing — so an object does not just look right, it feels right in the hand.',
    craft:
      'We go beyond small gadgets: large figures printed in modules that snap together, exploded builds, and custom work down to the detail. Precision, scale and finish — that is the level.',
    stats: [
      { value: 120, suffix: '+', label: 'unique prints' },
      { value: 100, suffix: '%', label: 'in-house studio' },
    ],
  },
  aboutPage: {
    seoTitle: 'About OKE3D — Dutch 3D print studio for collectibles',
    seoDescription:
      'OKE3D is a Dutch studio for 3D-printed collectibles, editions and made-to-order prints. Modular builds, exploded views and finishing from our own shop.',
    eyebrow: 'Studio',
    title: 'We make digital ideas tangible.',
    lede: 'OKE3D is not a generic storefront. It is a collectible studio: form, material and finish from our own print bed — from compact charms to large snap-fit figures.',
    craftTitle: 'Craft & scale',
    craftBody:
      'Large figures are printed in modules that click together. Exploded views show every part. That is how we keep scale, detail and strength under control without losing the look.',
    craftBody2:
      'Every request starts with feasibility: wall thickness, supports, material and finish. Then a clear proposal — no promises the printer cannot keep.',
    studioTitle: 'Own studio, own standard',
    studioBody:
      'We work in small runs. That means more control over colour, layers and post-processing — objects that look right and feel right.',
    studioPoints: [
      'Collectibles & signature editions',
      'Custom prints from photo or sketch',
      'Functional accessories and desk objects',
      'Modular builds for larger figures',
    ],
    exploreTitle: 'Explore further',
    exploreBody: 'From collection to materials and requests — one connected studio experience.',
  },
  accessoriesPage: {
    seoTitle: 'Accessories & modules — OKE3D',
    seoDescription:
      'Functional 3D prints and snap-fit modules from the OKE3D studio: desk objects, charms and BBQ parts.',
    eyebrow: 'Studio extras',
    title: 'Accessories & modules',
    lede: 'Alongside signature figures we print functional objects and standalone modules — useful as inspiration or as a starting point for your request.',
    ctaLede: 'Want something similar or a custom module build?',
    cta: 'Start request',
  },
  materialsPage: {
    seoTitle: 'Materials & filament — OKE3D studio',
    seoDescription:
      'Materials we use at OKE3D: PLA, PETG, ABS and more. Choose colour and properties with the studio.',
    eyebrow: 'Material',
    title: 'Filament & finish',
    lede: 'Material shapes look, strength and feel. We advise per object — from display collectibles to functional prints.',
    body: 'We work with proven studio filaments (PLA, PETG, ABS/ASA, TPU where needed). Colour, sheen and finishing are matched to your design.',
    body2:
      'No marketplace scrapes: only what we actually print in-studio. Unsure which material? Mention it in your request — we will advise.',
    swatchLabel: 'Sample colours',
    ctaLede: 'Ready to discuss material and model?',
    cta: 'Ask for advice',
  },
  editionsPage: {
    seoTitle: 'Editions — OKE3D collections',
    seoDescription:
      'OKE3D editions: OKE. Collection, Monochrome and BBQ Edition. Themed sets with their own studio look.',
    body: 'Each edition has its own visual language: fitness black, monochrome winter, BBQ craft. Not a random dump — curated sets that belong together.',
    body2:
      'Large builds (like BBQ) show how modules, exploded views and finishing come together. Smaller editions focus on silhouette and studio finish.',
    craftNote: 'Tip: open BBQ Edition for snap-fit parts and exploded craft.',
  },
  collectionPage: {
    seoTitle: 'Collection — 3D collectibles by OKE3D',
    seoDescription:
      'Browse the OKE3D collection: black fitness figures, monochrome winter and BBQ Edition. Made to order from our studio.',
    body: 'Filter by edition and open a product for detail. Everything below is from our dark studio line — cutouts without white boxes.',
    craftNote:
      'Many figures can go larger: printed in modules that snap together. Ask about it in your request.',
    related: 'Also worth seeing',
  },
  printIdeas: {
    eyebrow: 'Inspiration',
    title: 'What can you have made?',
    lede: 'Beyond collectibles we also print functional objects — grinders, cups, stands and organizers. Use the examples as a starting point for your request.',
    cta: 'Request your print',
    secondary: 'Browse the collection',
  },
  make: {
    eyebrow: 'What we make',
    title: 'Objects you can hold.',
    lede: 'Everything below comes from our real collections and editions. No invented categories.',
    items: [
      {
        title: 'Collectibles',
        body: '3D-printed figures and collectible objects with their own character.',
      },
      {
        title: 'Special editions',
        body: 'Small themed collections such as BBQ Edition, each with its own identity.',
      },
      {
        title: 'Custom prints',
        body: 'Personal OKE prints based on your idea or design.',
      },
      {
        title: 'Made to order',
        body: 'Your design, photo, sketch or idea. We review what is possible.',
      },
    ],
  },
  featured: {
    eyebrow: 'Featured',
    title: 'From the collection',
    lede: 'A selection from existing editions. Pricing and availability via request.',
    viewAll: 'Full collection',
    requestStatus: 'On request',
  },
  edition: {
    eyebrow: 'Special edition',
    title: 'BBQ Edition',
    lede: 'Grillmasters, aprons and exploded builds. A themed collection with its own identity.',
    cta: 'View BBQ Edition',
    specs: [
      '3D-printed collectible',
      'Exploded assembly view',
      'OKE. signature finish',
    ],
    cards: {
      apron: 'Apron',
      grillmaster: 'Grillmaster',
      ninja: 'Ninja',
    },
  },
  custom: {
    eyebrow: 'Custom',
    title: 'Got something in mind?',
    lede: 'Send your design, photo, sketch or idea. We review what is possible and turn it into a 3D print.',
    primaryCta: 'Start your request',
    secondaryCta: 'How it works',
    accepts:
      'You can send a 3D file, photo, sketch, reference or just an idea. Not everything is printable. We review what can be done.',
    types: ['Photo', 'Sketch', '3D file', 'Idea'],
    cards: {
      customDolls: {
        title: 'Custom figures',
        body: 'Your idea as a collectible. From sketch to object in our own studio.',
      },
      request: {
        title: 'Made to order',
        body: 'Unique editions or one-off prints. Small batches.',
      },
    },
  },
  process: {
    eyebrow: 'How it works',
    title: 'From idea to print',
    steps: [
      {
        title: 'Tell us your idea',
        body: 'Send a file, photo, sketch or short description. The clearer the start, the faster we can assess what’s possible.',
      },
      {
        title: 'We review what’s possible',
        body: 'We check technique, size, material preference and feasibility — then reply with a clear proposal.',
      },
      {
        title: 'We make it',
        body: 'After approval, your object goes into the printer. We watch layers, supports and finish.',
      },
      {
        title: 'Your idea becomes real',
        body: 'You receive a physical object: ready to display, gift, or hold.',
      },
    ],
  },
  ideas: {
    eyebrow: 'Editions',
    title: 'Our collections',
    lede: 'Based on what actually exists in the studio.',
  },
  finalCta: {
    title: 'Got an idea?',
    lede: 'Tell us what you want printed. We’ll reply with what’s possible.',
    cta: 'Start your request',
  },
  footer: {
    blurb: '3D printing for distinctive ideas, objects and collectibles.',
    collection: 'Collection',
    custom: 'Custom',
    info: 'Info',
    contact: 'Contact',
    language: 'Language',
    links: {
      collection: 'Collection',
      editions: 'Editions',
      accessories: 'Accessories',
      materials: 'Materials',
      custom: 'Custom prints',
      about: 'About OKE3D',
      contact: 'Contact',
      faq: 'FAQ',
      privacy: 'Privacy',
      terms: 'Terms',
      request: 'Request',
    },
    rights: 'All rights reserved.',
  },
  categories: {
    all: 'All',
    'oke-collection': 'OKE. Collection',
    monochrome: 'Monochrome',
    'bbq-edition': 'BBQ Edition',
  },
  collection: {
    title: 'Collection',
    lede: 'Every edition from the studio. Pricing and availability via request.',
    filterLabel: 'Filter by edition',
    empty: 'No products in this filter.',
  },
  product: {
    requestCta: 'Submit request',
    backToCollection: 'Back to collection',
    inEdition: 'In this edition',
  },
  request: {
    pageTitle: 'Request',
    lede: 'Tell us what you want printed. We reply with what is possible.',
    name: 'Name',
    email: 'Email',
    product: 'Product',
    productNone: 'No specific product',
    message: 'Message',
    submit: 'Send request',
    sending: 'Sending...',
    success: 'Request received. We will get back to you.',
    error: 'Please fill in name, email and message.',
  },
  stickyCta: {
    label: 'Request a print',
  },
  floatMenu: {
    label: 'Quick actions',
    open: 'Open menu',
    close: 'Close menu',
    contact: 'Contact',
    contactSub: 'Send a message',
    design: 'Upload idea',
    designSub: 'Photo or sketch to start',
    collection: 'Quick collection',
    collectionSub: 'Browse all figures',
  },
  placeholder: {
    body: 'This page will be expanded in the next phase.',
  },
  contactPage: {
    seoTitle: 'Contact — OKE3D',
    seoDescription: 'Contact the OKE3D studio for collectibles, editions and made-to-order prints.',
    eyebrow: 'Contact',
    title: 'Talk to the studio.',
    lede: 'Questions about a print, run size or material? Email us or start a custom request.',
    emailLabel: 'Email',
    emailBody: 'We usually reply within one to two business days.',
    studioLabel: 'Studio',
    studioBody: 'Dutch 3D print studio. Small runs, own craft — from digital idea to physical object.',
    ctaCustom: 'Start custom OKE',
    ctaRequest: 'Product request',
  },
  faqPage: {
    seoTitle: 'FAQ — OKE3D',
    seoDescription: 'FAQ about OKE3D collectibles, custom prints, materials and lead times.',
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    lede: 'Short and practical — what to expect from the studio.',
    items: [
      {
        q: 'What can I get printed?',
        a: 'Collectibles, editions, modules and custom prints from a photo or sketch. We check technical feasibility first.',
      },
      {
        q: 'Is the popup 3D preview the final print?',
        a: 'No. It is a concept mesh to explore form. The real studio print follows after we agree on scale, material and finish.',
      },
      {
        q: 'How long does a request take?',
        a: 'Reply within 1–2 business days. Production time depends on complexity, run size and finishing.',
      },
      {
        q: 'Which materials do you use?',
        a: 'Among others PLA, PETG and ABS/ASA. We advise per object — see also the materials page.',
      },
    ],
    cta: 'Start custom OKE',
  },
}
