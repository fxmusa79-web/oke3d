import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const dl = path.join(process.env.USERPROFILE, 'Downloads')
const root = process.cwd()
const desktopDir = path.join(root, 'public/assets/hero/desktop')
const mobileDir = path.join(root, 'public/assets/hero/mobile')
const figuresDir = path.join(root, 'public/assets/hero/figures')

for (const d of [desktopDir, mobileDir, figuresDir]) {
  fs.mkdirSync(d, { recursive: true })
}

const imgs = fs
  .readdirSync(dl)
  .filter((f) => /^image_20261007/i.test(f) && /\.(jpe?g|webp|png)$/i.test(f))
  .map((f) => {
    const full = path.join(dl, f)
    return { name: f, full, mtime: fs.statSync(full).mtimeMs }
  })

for (const img of imgs) {
  const meta = await sharp(img.full).metadata()
  img.width = meta.width
  img.height = meta.height
  img.orient = meta.width > meta.height ? 'desktop' : 'mobile'
}

const desktop = imgs
  .filter((i) => i.orient === 'desktop')
  .sort((a, b) => a.mtime - b.mtime)
  .slice(0, 5)

const mobile = imgs
  .filter((i) => i.orient === 'mobile')
  .sort((a, b) => a.mtime - b.mtime)
  .slice(0, 5)

const rows = []

async function copyWebp(src, destAbs, destLabel) {
  const meta = await sharp(src).metadata()
  await sharp(src).webp({ quality: 82 }).toFile(destAbs)
  rows.push({
    source: path.basename(src),
    destination: destLabel,
    dimensions: `${meta.width}x${meta.height}`,
    orientation: meta.width > meta.height ? 'desktop' : 'mobile',
  })
}

for (let i = 0; i < desktop.length; i++) {
  const n = i + 1
  await copyWebp(
    desktop[i].full,
    path.join(desktopDir, `bg-${n}.webp`),
    `/assets/hero/desktop/bg-${n}.webp`,
  )
}

for (let i = 0; i < mobile.length; i++) {
  const n = i + 1
  await copyWebp(
    mobile[i].full,
    path.join(mobileDir, `bg-${n}.webp`),
    `/assets/hero/mobile/bg-${n}.webp`,
  )
}

const figureMap = [
  {
    preferred: path.join(root, 'public/assets/hero/black-kettlebell-figure.png'),
    alt: path.join(root, 'public/assets/collectie/fitness/black-dumbbell-alt.png'),
    destName: 'figure-fitness-black.png',
    note: 'Downloads had no fitness PNG; copied existing kettlebell cutout (dumbbell alt too small)',
  },
  {
    preferred: path.join(root, 'public/assets/hero/mint-ghost-main.png'),
    alt: path.join(root, 'public/products/oke-collection/mint-puffer-cap.png'),
    destName: 'figure-mint-puffer.png',
    note: 'stylized figure PNG missing (only .3mf); used mint-ghost hero cutout',
  },
  {
    preferred: path.join(root, 'public/assets/hero/mint-hoodie.png'),
    alt: path.join(root, 'public/products/oke-collection/mint-streetwear-hoodie-cutout.png'),
    destName: 'figure-orange-teal.png',
    note: 'BUBA J.png missing (only BUBA J.3mf in Downloads); used mint-hoodie cutout as stand-in',
  },
]

for (const fig of figureMap) {
  let use = fs.existsSync(fig.preferred) ? fig.preferred : fig.alt
  if (fs.existsSync(fig.preferred) && fs.existsSync(fig.alt)) {
    const a = await sharp(fig.preferred).metadata()
    const b = await sharp(fig.alt).metadata()
    // Prefer larger asset for hero quality
    use = (a.width || 0) >= (b.width || 0) ? fig.preferred : fig.alt
  }
  const dest = path.join(figuresDir, fig.destName)
  const meta = await sharp(use).metadata()
  await sharp(use).png().toFile(dest)
  rows.push({
    source: `${path.relative(root, use).replace(/\\/g, '/')} — ${fig.note}`,
    destination: `/assets/hero/figures/${fig.destName}`,
    dimensions: `${meta.width}x${meta.height}`,
    orientation: 'figure',
  })
}

console.log(
  JSON.stringify(
    {
      foundBackgrounds: imgs.length,
      desktopAssigned: desktop.map((d) => d.name),
      mobileAssigned: mobile.map((d) => d.name),
      rows,
    },
    null,
    2,
  ),
)
