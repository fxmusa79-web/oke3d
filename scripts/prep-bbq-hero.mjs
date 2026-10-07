import sharp from 'sharp'
import fs from 'fs'

fs.mkdirSync('public/products/bbq-edition/parts', { recursive: true })

// Assembled: apron figure — remove near-white studio bg
const apron = 'public/products/bbq-edition/bbq-apron.webp'
const raw = await sharp(apron).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < raw.data.length; i += raw.info.channels) {
  const r = raw.data[i]
  const g = raw.data[i + 1]
  const b = raw.data[i + 2]
  if (r > 248 && g > 248 && b > 248) raw.data[i + 3] = 0
  else if (r > 232 && g > 232 && b > 232) {
    const t = (Math.min(r, g, b) - 232) / 16
    raw.data[i + 3] = Math.round(255 * (1 - t))
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

// Normalize exploded alpha source
fs.copyFileSync(
  'public/products/bbq-edition/eplodedv view.png',
  'public/products/bbq-edition/bbq-exploded-alpha.png',
)

const meta = await sharp('public/products/bbq-edition/bbq-exploded-alpha.png').metadata()
console.log('assembled + exploded ready', meta.width, meta.height, meta.hasAlpha)
