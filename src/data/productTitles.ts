import type { Locale } from '../i18n/types'

/** Centralized product titles — NL primary, EN secondary. Whitelist only. */
export const productTitles: Record<string, Record<Locale, string>> = {
  'black-fitness-kettlebell': {
    nl: 'Zwarte fitness kettlebell',
    en: 'Black Fitness Kettlebell',
  },
  'black-fitness-dumbbell': {
    nl: 'Zwarte fitness dumbbell',
    en: 'Black Fitness Dumbbell',
  },
  'black-ghost-coffee': {
    nl: 'Zwarte coffee ghost',
    en: 'Black Ghost Coffee',
  },
  'black-puffer': {
    nl: 'Zwarte puffer',
    en: 'Black Puffer',
  },
  'winter-single': {
    nl: 'Winter single',
    en: 'Winter Single',
  },
  'monochrome-couple': {
    nl: 'Monochrome duo',
    en: 'Monochrome Couple',
  },
  'bbq-apron-editie': {
    nl: 'BBQ apron editie',
    en: 'BBQ Apron Edition',
  },
  'bbq-grillmaster': {
    nl: 'BBQ grillmaster',
    en: 'BBQ Grillmaster',
  },
}

export function productTitle(id: string, locale: Locale, fallback: string) {
  return productTitles[id]?.[locale] ?? fallback
}
