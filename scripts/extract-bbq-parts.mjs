import sharp from 'sharp'
import fs from 'fs'

const SRC = 'public/products/bbq-edition/eplodedv view.png'
const OUT = 'public/products/bbq-edition/parts'
fs.mkdirSync(OUT, { recursive: true })

const meta = await sharp(SRC).metadata()
const W = meta.width
const H = meta.height
const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

function alphaAt(x, y) {
  const i = (y * info.width + x) * info.channels
  return data[i + 3]
}

/** Tight bbox inside a search rect for opaque pixels */
function bbox(x0, y0, x1, y1, threshold = 24) {
  let minX = x1,
    minY = y1,
    maxX = x0,
    maxY = y0
  let found = false
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (alphaAt(x, y) > threshold) {
        found = true
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }
  if (!found) return null
  // pad
  const pad = 6
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(W - 1, maxX + pad)
  maxY = Math.min(H - 1, maxY + pad)
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

// Search zones tuned for this BBQ exploded composition (character left, grill right)
const zones = [
  { id: 'head', search: [0.05, 0.0, 0.55, 0.18], z: 42, delay: 0.08 },
  { id: 'torso', search: [0.08, 0.14, 0.55, 0.42], z: 28, delay: 0.0 },
  { id: 'arm-l', search: [0.0, 0.28, 0.28, 0.58], z: 55, delay: 0.14 },
  { id: 'arm-r', search: [0.35, 0.3, 0.58, 0.58], z: 50, delay: 0.12 },
  { id: 'legs', search: [0.12, 0.48, 0.52, 0.72], z: 18, delay: 0.18 },
  { id: 'boots', search: [0.1, 0.68, 0.55, 0.98], z: 8, delay: 0.22 },
  { id: 'lid', search: [0.52, 0.0, 0.98, 0.22], z: 58, delay: 0.05 },
  { id: 'food', search: [0.55, 0.18, 0.98, 0.34], z: 62, delay: 0.1 },
  { id: 'grate', search: [0.55, 0.32, 0.98, 0.44], z: 38, delay: 0.06 },
  { id: 'bowl', search: [0.52, 0.4, 0.98, 0.62], z: 24, delay: 0.02 },
  { id: 'stand', search: [0.55, 0.58, 0.98, 0.99], z: 4, delay: 0.16 },
]

const manifest = []

for (const z of zones) {
  const [sx0, sy0, sx1, sy1] = z.search
  const box = bbox(
    Math.floor(sx0 * W),
    Math.floor(sy0 * H),
    Math.floor(sx1 * W),
    Math.floor(sy1 * H),
  )
  if (!box) {
    console.warn('no content', z.id)
    continue
  }
  const out = `${OUT}/${z.id}.png`
  await sharp(SRC).extract(box).png().toFile(out)

  // rest = natural position in full frame as % of stage
  const rest = {
    x: (box.left / W) * 100,
    y: (box.top / H) * 100,
    w: (box.width / W) * 100,
    h: (box.height / H) * 100,
  }
  // pack = pulled toward character/grill assembly centers
  const isGrill = rest.x > 50
  const pack = {
    x: isGrill ? rest.x - 4 : rest.x + 3,
    y: 18 + (rest.y / 100) * 42,
    w: rest.w,
    h: rest.h,
  }

  manifest.push({
    id: z.id,
    src: `/products/bbq-edition/parts/${z.id}.png`,
    rest,
    pack,
    z: z.z,
    delay: z.delay,
    pixel: box,
  })
  console.log(z.id, box)
}

// Assembled cutout
const gm = 'public/products/bbq-edition/bbq-grillmaster.webp'
const raw = await sharp(gm).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < raw.data.length; i += raw.info.channels) {
  const r = raw.data[i]
  const g = raw.data[i + 1]
  const b = raw.data[i + 2]
  if (r < 30 && g < 30 && b < 30) raw.data[i + 3] = 0
  else if (r < 48 && g < 48 && b < 48) {
    raw.data[i + 3] = Math.round(((Math.max(r, g, b) - 30) / 18) * 255)
  }
}
await sharp(raw.data, {
  raw: {
    width: raw.info.width,
    height: raw.info.height,
    channels: raw.info.channels,
  },
})
  .png()
  .toFile('public/products/bbq-edition/bbq-assembled.png')

fs.copyFileSync(SRC, 'public/products/bbq-edition/bbq-exploded-alpha.png')
fs.writeFileSync(
  'src/components/bbq/parts-manifest.json',
  JSON.stringify({ width: W, height: H, parts: manifest }, null, 2),
)
console.log('parts:', manifest.length)
