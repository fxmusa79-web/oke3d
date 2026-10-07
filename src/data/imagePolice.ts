/**
 * Image Police — strict dark-only whitelist for OKE3D grids.
 * Forbidden: mint / pastel / magenta / bloesem / bike-roze.
 */

const FORBIDDEN =
  /mint|pastel|bloesem|magenta|pink|bike-roze|bike-pink|bike-blue|orange-teal|figure-mint|urban-magenta|pastel-bike/i

/** Exact product / asset identity whitelist (ids + path fragments). */
const ALLOWED_IDS = new Set([
  'black-fitness-kettlebell',
  'black-fitness-dumbbell',
  'winter-single',
  'monochrome-couple',
  'bbq-apron-editie',
  'bbq-apron',
  'grillmaster',
  'bbq-grillmaster',
  'black-puffer',
  'black-ghost-coffee',
])

const ALLOWED_PATH =
  /black-fitness-kettlebell|black-dumbbell|black-fitness-dumbbell|winter-single|monochrome-couple|bbq-apron|bbq-grillmaster|grillmaster|black-puffer|black-ghost-coffee|black-streetwear-coffee|black-coffee|\/assets\/dark\//i

export function isForbiddenImagePath(path: string): boolean {
  return FORBIDDEN.test(path)
}

export function isWhitelistedId(id: string): boolean {
  return ALLOWED_IDS.has(id)
}

/** True when path is allowed in collection / home grids (dark palette). */
export function isDarkAllowedImage(path: string): boolean {
  if (!path) return false
  if (isForbiddenImagePath(path)) return false
  return ALLOWED_PATH.test(path)
}

export function filterDarkProducts<T extends { image: string; id: string }>(
  list: T[],
): T[] {
  return list.filter(
    (p) =>
      isWhitelistedId(p.id) &&
      isDarkAllowedImage(p.image) &&
      !isForbiddenImagePath(p.id),
  )
}
