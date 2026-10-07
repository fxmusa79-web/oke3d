/**
 * One-shot Cloudflare provision: D1 + R2 + patch wrangler.jsonc database_id.
 * Requires: npx wrangler login
 *
 * Usage: node scripts/cf-provision.mjs
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const wranglerPath = resolve(root, 'wrangler.jsonc')

function run(args, opts = {}) {
  return execFileSync('npx', ['wrangler', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    ...opts,
  })
}

function stripJsonc(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

console.log('Creating D1 database oke3d_requests (ok if already exists)…')
let d1Out = ''
try {
  d1Out = run(['d1', 'create', 'oke3d_requests'])
  console.log(d1Out)
} catch (err) {
  const msg = String(err?.stdout ?? '') + String(err?.stderr ?? err)
  console.log(msg)
  d1Out = msg
}

let databaseId = null
const idMatch = d1Out.match(/database_id\s*[:=]\s*["']?([0-9a-f-]{36})/i)
if (idMatch) databaseId = idMatch[1]

if (!databaseId) {
  console.log('Listing D1 databases to resolve id…')
  try {
    const list = run(['d1', 'list', '--json'])
    const rows = JSON.parse(list)
    const found = Array.isArray(rows)
      ? rows.find((r) => r.name === 'oke3d_requests' || r.database_name === 'oke3d_requests')
      : null
    databaseId = found?.uuid ?? found?.id ?? found?.database_id ?? null
    if (databaseId) console.log('Found database_id:', databaseId)
  } catch (err) {
    console.error('Could not list D1:', err?.stderr ?? err)
  }
}

if (!databaseId) {
  console.error('Failed to resolve D1 database_id. Fix wrangler.jsonc manually after create.')
  process.exit(1)
}

let wranglerText = readFileSync(wranglerPath, 'utf8')
wranglerText = wranglerText.replace(
  /"database_id"\s*:\s*"[^"]+"/,
  `"database_id": "${databaseId}"`,
)
writeFileSync(wranglerPath, wranglerText)
console.log('Updated wrangler.jsonc database_id →', databaseId)

console.log('Creating R2 bucket oke3d-uploads (ok if already exists)…')
try {
  console.log(run(['r2', 'bucket', 'create', 'oke3d-uploads']))
} catch (err) {
  console.log(String(err?.stdout ?? '') + String(err?.stderr ?? err))
}

console.log('Applying D1 migrations (remote)…')
try {
  console.log(run(['d1', 'migrations', 'apply', 'CUSTOM_REQUESTS', '--remote']))
} catch (err) {
  console.error(String(err?.stdout ?? '') + String(err?.stderr ?? err))
  process.exit(1)
}

console.log('Applying D1 migrations (local)…')
try {
  console.log(run(['d1', 'migrations', 'apply', 'CUSTOM_REQUESTS', '--local']))
} catch (err) {
  console.log('(local migrate skipped)', String(err?.stderr ?? err))
}

console.log('\nDone. Next:')
console.log('  npx wrangler secret put ADMIN_USER')
console.log('  npx wrangler secret put ADMIN_PASS')
console.log('  npm run deploy')
