const STORAGE_KEY = 'oke3d-glb-cache-v1'
const MAX_ENTRIES = 3
const MAX_VALUE_CHARS = 4_500_000

type CacheEntry = {
  glbUrl: string
  createdAt: number
}

type CacheMap = Record<string, CacheEntry>

function readMap(): CacheMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as CacheMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: CacheMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Quota — drop oldest and retry once
    const entries = Object.entries(map).sort((a, b) => a[1].createdAt - b[1].createdAt)
    if (entries.length <= 1) return
    const next: CacheMap = {}
    for (const [k, v] of entries.slice(1)) next[k] = v
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* give up */
    }
  }
}

/** Stable hash for an image blob / data URL (for GLB cache keys). */
export async function hashImageSource(source: string | Blob): Promise<string> {
  const buf =
    typeof source === 'string'
      ? new TextEncoder().encode(source.slice(0, 120_000))
      : await source.arrayBuffer().then((b) => new Uint8Array(b).slice(0, 120_000))

  const digest = await crypto.subtle.digest('SHA-256', buf)
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return hex.slice(0, 40)
}

export function getCachedGlb(hash: string): string | null {
  const map = readMap()
  return map[hash]?.glbUrl ?? null
}

export function setCachedGlb(hash: string, glbUrl: string) {
  if (!glbUrl || glbUrl.length > MAX_VALUE_CHARS) {
    // Prefer short same-origin URLs over huge data URLs
    if (!glbUrl.startsWith('http') && !glbUrl.startsWith('/')) return
    if (glbUrl.length > MAX_VALUE_CHARS) return
  }

  const map = readMap()
  map[hash] = { glbUrl, createdAt: Date.now() }

  const sorted = Object.entries(map).sort((a, b) => b[1].createdAt - a[1].createdAt)
  const trimmed: CacheMap = {}
  for (const [k, v] of sorted.slice(0, MAX_ENTRIES)) trimmed[k] = v
  writeMap(trimmed)
}
