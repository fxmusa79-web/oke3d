/** Studio accessories & functional prints — OKE3D-owned assets only (no third-party scrapes). */
export type AccessoryItem = {
  id: string
  image: string
  title: { nl: string; en: string }
  body: { nl: string; en: string }
  tag: { nl: string; en: string }
}

export const accessories: AccessoryItem[] = [
  {
    id: 'grinder',
    image: '/assets/ideas/grinder.jpg',
    title: { nl: 'Grinder', en: 'Grinder' },
    body: {
      nl: 'Compact functioneel printwerk met zichtbare lagen en stevige geometrie.',
      en: 'Compact functional printwork with visible layers and solid geometry.',
    },
    tag: { nl: 'Functioneel', en: 'Functional' },
  },
  {
    id: 'cup',
    image: '/assets/ideas/cup.jpg',
    title: { nl: 'Studio beker', en: 'Studio cup' },
    body: {
      nl: 'Drinkobject met eigen karakter — klaar als basis voor een custom oplage.',
      en: 'Drinkware with character — ready as a base for a custom run.',
    },
    tag: { nl: 'Lifestyle', en: 'Lifestyle' },
  },
  {
    id: 'phone-stand',
    image: '/assets/ideas/phone-stand.jpg',
    title: { nl: 'Telefoonstand', en: 'Phone stand' },
    body: {
      nl: 'Minimalistische desk accessory. Strak, stabiel, printklaar.',
      en: 'Minimal desk accessory. Clean, stable, print-ready.',
    },
    tag: { nl: 'Desk', en: 'Desk' },
  },
  {
    id: 'keychain',
    image: '/assets/ideas/keychain.jpg',
    title: { nl: 'Sleutelhanger', en: 'Keychain' },
    body: {
      nl: 'Kleine charms en merch-formats. Ideaal voor personalisatie.',
      en: 'Small charms and merch formats. Ideal for personalisation.',
    },
    tag: { nl: 'Merch', en: 'Merch' },
  },
  {
    id: 'organizer',
    image: '/assets/ideas/organizer.jpg',
    title: { nl: 'Desk organizer', en: 'Desk organizer' },
    body: {
      nl: 'Bureau-object met modules en strakke lijnen.',
      en: 'Desk object with modules and clean lines.',
    },
    tag: { nl: 'Desk', en: 'Desk' },
  },
  {
    id: 'bbq-lid',
    image: '/products/bbq-edition/parts/lid.png',
    title: { nl: 'BBQ lid module', en: 'BBQ lid module' },
    body: {
      nl: 'Losse printmodule uit BBQ Edition — klikbaar onderdeel van grotere builds.',
      en: 'Standalone BBQ Edition module — a snap-fit part of larger builds.',
    },
    tag: { nl: 'Module', en: 'Module' },
  },
  {
    id: 'bbq-bowl',
    image: '/products/bbq-edition/parts/bowl.png',
    title: { nl: 'BBQ bowl module', en: 'BBQ bowl module' },
    body: {
      nl: 'Diepe kom-module. Voorbeeld van hoe we grote figuren in delen printen.',
      en: 'Deep bowl module. Example of how we print large figures in parts.',
    },
    tag: { nl: 'Module', en: 'Module' },
  },
  {
    id: 'bbq-stand',
    image: '/products/bbq-edition/parts/stand.png',
    title: { nl: 'BBQ stand module', en: 'BBQ stand module' },
    body: {
      nl: 'Stabiele basis voor exploded en assembled weergaven.',
      en: 'Stable base for exploded and assembled presentations.',
    },
    tag: { nl: 'Module', en: 'Module' },
  },
  {
    id: 'bbq-grate',
    image: '/products/bbq-edition/parts/grate.png',
    title: { nl: 'BBQ grate detail', en: 'BBQ grate detail' },
    body: {
      nl: 'Fijn detailwerk — laat zien hoe ver we gaan in afwerking.',
      en: 'Fine detail work — shows how far we push finishing.',
    },
    tag: { nl: 'Detail', en: 'Detail' },
  },
  {
    id: 'bbq-torso',
    image: '/products/bbq-edition/parts/torso.png',
    title: { nl: 'Torso module', en: 'Torso module' },
    body: {
      nl: 'Centrale body-module. In elkaar klikken tot een groot figuur.',
      en: 'Central body module. Snap together into a large figure.',
    },
    tag: { nl: 'Module', en: 'Module' },
  },
]
