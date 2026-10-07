/**
 * Remove near-white studio backgrounds → true alpha PNGs.
 * Flood-fill from corners so white product details (aprons, sneakers) stay.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()

const TARGETS = [
  'public/assets/dark/winter-single.png',
  'public/assets/dark/bbq-apron.png',
  'public/assets/dark/black-fitness-kettlebell.png',
  'public/assets/collectie/fitness/black-dumbbell-shaker.png',
  'public/assets/collectie/fitness/black-coffee.png',
  'public/products/oke-collection/black-streetwear-coffee-cutout.png',
  'public/products/oke-collection/black-fitness-kettlebell-cutout.png',
  'public/products/oke-collection/black-coffee-hoodie.webp',
  'public/assets/edities/monochrome-couple.webp',
  'public/products/bbq-edition/bbq-grillmaster.webp',
  'public/products/bbq-edition/bbq-apron.webp',
  'public/assets/hero/figures/figure-fitness-black.png',
  'public/assets/hero/black-kettlebell-figure.png',
  'public/assets/hero/black-kettlebell.png',
]

/** Max channel distance from pure white to count as background seed */
const BG_LUMA = 242
/** Neighbor tolerance while flooding */
const FLOOD_TOL = 18
/** Soft edge: fade alpha when near remaining opaque edge */
const SOFT = 2

function isBg(r, g, b, a, luma = BG_LUMA) {
  if (a < 8) return true
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min
  // Near-white / light gray studio paper (low chroma)
  return max >= luma && chroma <= 18
}

function closeTo(r, g, b, sr, sg, sb, tol) {
  return (
    Math.abs(r - sr) <= tol &&
    Math.abs(g - sg) <= tol &&
    Math.abs(b - sb) <= tol
  )
}

function floodRemove(data, w, h) {
  const visited = new Uint8Array(w * h)
  const stack = []

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const i = y * w + x
    if (visited[i]) return
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const a = data[o + 3]
    if (!isBg(r, g, b, a)) return
    visited[i] = 1
    stack.push(i)
  }

  // Seed from all four edges (studio paper usually touches border)
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }

  while (stack.length) {
    const i = stack.pop()
    const o = i * 4
    const sr = data[o]
    const sg = data[o + 1]
    const sb = data[o + 2]
    data[o + 3] = 0

    const x = i % w
    const y = (i / w) | 0
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const ni = ny * w + nx
      if (visited[ni]) continue
      const no = ni * 4
      const r = data[no]
      const g = data[no + 1]
      const b = data[no + 2]
      const a = data[no + 3]
      if (a < 8 || (isBg(r, g, b, a, BG_LUMA - 8) && closeTo(r, g, b, sr, sg, sb, FLOOD_TOL))) {
        visited[ni] = 1
        stack.push(ni)
      }
    }
  }

  // Soften remaining near-white fringe still touching transparent
  if (SOFT > 0) {
    const copy = Buffer.from(data)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x
        const o = i * 4
        if (copy[o + 3] === 0) continue
        let touch = false
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const no = ((y + dy) * w + (x + dx)) * 4
          if (copy[no + 3] === 0) {
            touch = true
            break
          }
        }
        if (!touch) continue
        const r = copy[o]
        const g = copy[o + 1]
        const b = copy[o + 2]
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        if (max >= 230 && max - min <= 22) {
          data[o + 3] = Math.min(data[o + 3], 90)
        }
      }
    }
  }
}

async function processFile(rel) {
  const abs = path.join(ROOT, rel)
  if (!fs.existsSync(abs)) {
    console.warn('skip missing', rel)
    return
  }

  const { data, info } = await sharp(abs)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const rgba = Buffer.from(data)
  floodRemove(rgba, info.width, info.height)

  const outRel = rel.replace(/\.(webp|jpg|jpeg)$/i, '.png')
  const outAbs = path.join(ROOT, outRel)
  const tmpPng = `${outAbs}.tmp.png`

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(tmpPng)

  fs.renameSync(tmpPng, outAbs)

  // Prefer PNG with alpha going forward; leave original webp untouched if locked
  console.log('ok', rel, '→', path.relative(ROOT, outAbs))
}

for (const t of TARGETS) {
  await processFile(t)
}

console.log('done')
