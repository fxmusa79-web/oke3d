import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

async function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'parts' || e.name === 'node_modules') continue
      await walk(p, out)
    } else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(e.name)) {
      out.push(p)
    }
  }
  return out
}

const files = await walk('public')
const rows = []
for (const f of files) {
  const m = await sharp(f).metadata()
  const rel = f.split(path.sep).join('/')
  rows.push({
    file: path.basename(f),
    path: rel,
    folder: path.dirname(rel).replace(/^public\/?/, '') || 'public',
    w: m.width,
    h: m.height,
    ar: m.width && m.height ? Number((m.width / m.height).toFixed(2)) : null,
    format: m.format,
    alpha: !!m.hasAlpha,
    kb: Math.round(fs.statSync(f).size / 1024),
  })
}
fs.writeFileSync('docs/asset-inventory.json', JSON.stringify(rows, null, 2))
console.log('wrote docs/asset-inventory.json', rows.length, 'images')
for (const r of rows) {
  console.log(
    `${r.folder.padEnd(28)} ${String(r.w + 'x' + r.h).padEnd(12)} a=${r.alpha ? 'Y' : 'N'} ${r.kb}kb  ${r.file}`,
  )
}
