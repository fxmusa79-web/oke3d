type AanvraagPayload = {
  name?: string
  email?: string
  product?: string
  message?: string
}

type CustomRequestPayload = {
  name?: string
  email?: string
  description?: string
  desc?: string
  imageBase64?: string
  imageName?: string
  imageType?: string
}

type RequestStatus = 'new' | 'seen' | 'done'
type RequestType = 'custom' | 'product'

type RequestRow = {
  id: string
  name: string
  email: string
  description: string
  image_key: string | null
  created_at: string
  type: RequestType
  product: string | null
  status: RequestStatus
}

/**
 * Bindings after D1/R2 provision + secrets via `wrangler secret put`.
 * CUSTOM_REQUESTS -> D1 oke3d_requests
 * R2_UPLOADS -> R2 oke3d-uploads
 * ADMIN_USER / ADMIN_PASS / RESEND_API_KEY / NOTIFY_EMAIL (optional)
 */
type WorkerEnv = Env & {
  CUSTOM_REQUESTS?: D1Database
  R2_UPLOADS?: R2Bucket
  /** @deprecated legacy alias */
  UPLOADS?: R2Bucket
  ADMIN_USER?: string
  ADMIN_PASS?: string
  /** JSON array: [{"user":"a","pass":"b"}, ...] — preferred for multi-admin */
  ADMIN_CREDENTIALS?: string
  RESEND_API_KEY?: string
  NOTIFY_EMAIL?: string
  RESEND_FROM?: string
  /** Hugging Face token (Inference API / Spaces) — `wrangler secret put HF_TOKEN` */
  HF_TOKEN?: string
}

const TRIPOSR_MODEL = 'stabilityai/TripoSR'
const HF_INFERENCE_URLS = [
  `https://router.huggingface.co/hf-inference/models/${TRIPOSR_MODEL}`,
  `https://api-inference.huggingface.co/models/${TRIPOSR_MODEL}`,
]

function json(data: unknown, status = 200, extraHeaders?: HeadersInit) {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...extraHeaders,
    },
  })
}

function id() {
  return crypto.randomUUID()
}

function base64ToBytes(base64: string): Uint8Array {
  const cleaned = base64.includes(',') ? base64.split(',')[1]! : base64
  const binary = atob(cleaned)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const aa = enc.encode(a)
  const bb = enc.encode(b)
  if (aa.length !== bb.length) return false
  let out = 0
  for (let i = 0; i < aa.length; i++) out |= aa[i]! ^ bb[i]!
  return out === 0
}

function unauthorized() {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="OKE3D Admin"',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

function adminPairs(env: WorkerEnv): Array<{ user: string; pass: string }> {
  const pairs: Array<{ user: string; pass: string }> = []

  if (env.ADMIN_CREDENTIALS) {
    try {
      const parsed = JSON.parse(env.ADMIN_CREDENTIALS) as unknown
      if (Array.isArray(parsed)) {
        for (const row of parsed) {
          if (!row || typeof row !== 'object') continue
          const user = String((row as { user?: unknown }).user ?? '').trim()
          const pass = String((row as { pass?: unknown }).pass ?? '')
          if (user && pass) pairs.push({ user, pass })
        }
      }
    } catch {
      console.log('ADMIN_CREDENTIALS JSON parse failed')
    }
  }

  if (env.ADMIN_USER && env.ADMIN_PASS) {
    pairs.push({ user: env.ADMIN_USER, pass: env.ADMIN_PASS })
  }

  return pairs
}

function requireAdmin(request: Request, env: WorkerEnv): boolean {
  const pairs = adminPairs(env)
  if (!pairs.length) return false

  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Basic ')) return false

  try {
    const decoded = atob(header.slice(6))
    const colon = decoded.indexOf(':')
    if (colon < 0) return false
    const u = decoded.slice(0, colon)
    const p = decoded.slice(colon + 1)
    return pairs.some((pair) => timingSafeEqual(u, pair.user) && timingSafeEqual(p, pair.pass))
  } catch {
    return false
  }
}

async function uploadImage(
  env: WorkerEnv,
  requestId: string,
  imageBase64: string,
  imageName: string,
  imageType: string,
  meta: { name: string; email: string },
): Promise<string | null> {
  const r2 = env.R2_UPLOADS ?? env.UPLOADS
  if (!imageBase64 || !r2) {
    if (imageBase64) {
      console.log('custom-request image received (no R2 binding)', {
        id: requestId,
        imageName,
        bytesApprox: Math.floor(imageBase64.length * 0.75),
      })
    }
    return null
  }

  try {
    const imageKey = `custom/${requestId}/${imageName}`
    const bytes = base64ToBytes(imageBase64)
    await r2.put(imageKey, bytes, {
      httpMetadata: { contentType: imageType },
      customMetadata: meta,
    })
    return imageKey
  } catch (err) {
    console.log('custom-request R2 upload failed', err)
    return null
  }
}

async function insertRequest(
  env: WorkerEnv,
  row: {
    id: string
    name: string
    email: string
    description: string
    imageKey: string | null
    createdAt: string
    type: RequestType
    product: string | null
  },
): Promise<boolean> {
  if (!env.CUSTOM_REQUESTS) {
    console.log('request (no D1 binding)', row)
    return false
  }

  try {
    await env.CUSTOM_REQUESTS.prepare(
      `INSERT INTO custom_requests
        (id, name, email, description, image_key, created_at, type, product, status)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'new')`,
    )
      .bind(
        row.id,
        row.name,
        row.email,
        row.description,
        row.imageKey,
        row.createdAt,
        row.type,
        row.product,
      )
      .run()
    return true
  } catch (err) {
    console.log('request D1 insert failed', err)
    console.log('request fallback log', row)
    return false
  }
}

async function notifyEmail(
  env: WorkerEnv,
  row: {
    id: string
    name: string
    email: string
    description: string
    type: RequestType
    product: string | null
    hasImage: boolean
  },
  origin: string,
) {
  const apiKey = env.RESEND_API_KEY
  if (!apiKey) return

  const to = env.NOTIFY_EMAIL || 'info@oke3d.nl'
  const from = env.RESEND_FROM || 'OKE3D <onboarding@resend.dev>'
  const adminUrl = `${origin}/scotdejews`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Nieuwe ${row.type === 'custom' ? 'custom' : 'product'}-aanvraag — ${row.name}`,
        text: [
          `Nieuwe aanvraag (${row.type})`,
          ``,
          `Naam: ${row.name}`,
          `Email: ${row.email}`,
          row.product ? `Product: ${row.product}` : null,
          ``,
          row.description,
          ``,
          row.hasImage ? `Foto: ja` : `Foto: nee`,
          `ID: ${row.id}`,
          `Admin: ${adminUrl}`,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    })
    if (!res.ok) {
      console.log('resend failed', res.status, await res.text())
    }
  } catch (err) {
    console.log('resend error', err)
  }
}

async function handleCustomRequest(request: Request, env: WorkerEnv) {
  let body: CustomRequestPayload = {}
  try {
    body = (await request.json()) as CustomRequestPayload
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const description = String(body.description ?? body.desc ?? '').trim()
  const imageBase64 = body.imageBase64 ? String(body.imageBase64) : ''
  const imageType = String(body.imageType ?? 'image/jpeg')
  const imageName = String(body.imageName ?? 'upload.jpg').replace(/[^\w.-]+/g, '_')

  if (!name || !email || !description) {
    return json({ ok: false, error: 'Missing fields' }, 400)
  }

  const requestId = id()
  const createdAt = new Date().toISOString()
  const imageKey = await uploadImage(env, requestId, imageBase64, imageName, imageType, {
    name,
    email,
  })

  const saved = await insertRequest(env, {
    id: requestId,
    name,
    email,
    description,
    imageKey,
    createdAt,
    type: 'custom',
    product: null,
  })

  if (saved) {
    await notifyEmail(
      env,
      {
        id: requestId,
        name,
        email,
        description,
        type: 'custom',
        product: null,
        hasImage: Boolean(imageKey || imageBase64),
      },
      new URL(request.url).origin,
    )
  }

  return json({ ok: true, id: requestId })
}

async function handleProductAanvraag(request: Request, env: WorkerEnv) {
  let body: AanvraagPayload = {}
  try {
    body = (await request.json()) as AanvraagPayload
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const product = String(body.product ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!name || !email || !message) {
    return json({ ok: false, error: 'Missing fields' }, 400)
  }

  const requestId = id()
  const createdAt = new Date().toISOString()
  const description = message

  const saved = await insertRequest(env, {
    id: requestId,
    name,
    email,
    description,
    imageKey: null,
    createdAt,
    type: 'product',
    product: product || null,
  })

  if (saved) {
    await notifyEmail(
      env,
      {
        id: requestId,
        name,
        email,
        description,
        type: 'product',
        product: product || null,
        hasImage: false,
      },
      new URL(request.url).origin,
    )
  }

  return json({ ok: true, id: requestId })
}

async function adminList(env: WorkerEnv) {
  if (!env.CUSTOM_REQUESTS) return json({ ok: false, error: 'D1 not configured' }, 503)

  const { results } = await env.CUSTOM_REQUESTS.prepare(
    `SELECT id, name, email, description, image_key, created_at, type, product, status
     FROM custom_requests
     ORDER BY created_at DESC
     LIMIT 200`,
  ).all<RequestRow>()

  return json({ ok: true, requests: results ?? [] })
}

async function adminGet(env: WorkerEnv, requestId: string) {
  if (!env.CUSTOM_REQUESTS) return json({ ok: false, error: 'D1 not configured' }, 503)

  const row = await env.CUSTOM_REQUESTS.prepare(
    `SELECT id, name, email, description, image_key, created_at, type, product, status
     FROM custom_requests WHERE id = ?1`,
  )
    .bind(requestId)
    .first<RequestRow>()

  if (!row) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, request: row })
}

async function adminPatch(request: Request, env: WorkerEnv, requestId: string) {
  if (!env.CUSTOM_REQUESTS) return json({ ok: false, error: 'D1 not configured' }, 503)

  let body: { status?: string } = {}
  try {
    body = (await request.json()) as { status?: string }
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400)
  }

  const status = String(body.status ?? '') as RequestStatus
  if (status !== 'new' && status !== 'seen' && status !== 'done') {
    return json({ ok: false, error: 'Invalid status' }, 400)
  }

  const result = await env.CUSTOM_REQUESTS.prepare(
    `UPDATE custom_requests SET status = ?1 WHERE id = ?2`,
  )
    .bind(status, requestId)
    .run()

  if (!result.meta.changes) return json({ ok: false, error: 'Not found' }, 404)
  return json({ ok: true, id: requestId, status })
}

async function adminFile(request: Request, env: WorkerEnv) {
  const key = new URL(request.url).searchParams.get('key')
  if (!key || key.includes('..')) return json({ ok: false, error: 'Invalid key' }, 400)

  const r2 = env.R2_UPLOADS ?? env.UPLOADS
  if (!r2) return json({ ok: false, error: 'R2 not configured' }, 503)

  const obj = await r2.get(key)
  if (!obj) return json({ ok: false, error: 'Not found' }, 404)

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('Cache-Control', 'private, max-age=3600')
  headers.set('Access-Control-Allow-Origin', '*')

  return new Response(obj.body, { headers })
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x2000
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode.apply(null, Array.from(slice) as unknown as number[])
  }
  return btoa(binary)
}

function looksLikeGlb(buf: ArrayBuffer): boolean {
  if (buf.byteLength < 12) return false
  const view = new Uint8Array(buf, 0, 4)
  // glTF binary magic "glTF"
  return view[0] === 0x67 && view[1] === 0x6c && view[2] === 0x54 && view[3] === 0x46
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms))
}

/** Call HF Inference API for TripoSR; returns raw GLB bytes. */
async function callTripoSrInference(
  token: string,
  imageBytes: Uint8Array,
  contentType: string,
): Promise<ArrayBuffer> {
  let lastError = 'TripoSR inference failed'

  for (const endpoint of HF_INFERENCE_URLS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType || 'image/jpeg',
          Accept: '*/*',
          'x-wait-for-model': 'true',
        },
        body: imageBytes,
        signal: AbortSignal.timeout(110_000),
      })

      const ct = res.headers.get('content-type') ?? ''

      if (res.status === 503 || res.status === 529) {
        let wait = 8_000
        try {
          const body = (await res.json()) as { estimated_time?: number; error?: string }
          if (body.estimated_time) wait = Math.min(25_000, Math.ceil(body.estimated_time * 1000))
          lastError = body.error || `Model loading (${res.status})`
        } catch {
          lastError = `Model loading (${res.status})`
        }
        await sleep(wait)
        continue
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        lastError = text.slice(0, 280) || `HF ${res.status}`
        // Try next endpoint on hard failures
        if (res.status === 404 || res.status === 410) break
        if (res.status >= 500) {
          await sleep(2_000)
          continue
        }
        break
      }

      if (ct.includes('application/json')) {
        const data = (await res.json()) as Record<string, unknown>
        let meshUrl: string | null = null
        if (typeof data.url === 'string') meshUrl = data.url
        else if (typeof data.glb_url === 'string') meshUrl = data.glb_url
        else if (data.model_mesh && typeof data.model_mesh === 'object') {
          const nested = (data.model_mesh as { url?: unknown }).url
          if (typeof nested === 'string') meshUrl = nested
        }

        if (meshUrl) {
          const fileRes = await fetch(meshUrl, { signal: AbortSignal.timeout(60_000) })
          if (!fileRes.ok) throw new Error(`GLB download failed (${fileRes.status})`)
          const buf = await fileRes.arrayBuffer()
          if (!looksLikeGlb(buf)) throw new Error('Downloaded file is not GLB')
          return buf
        }

        let b64: string | null = null
        if (typeof data.glb === 'string') b64 = data.glb
        else if (typeof data.generated_3d === 'string') b64 = data.generated_3d

        if (b64) {
          const cleaned = b64.includes(',') ? b64.split(',')[1]! : b64
          const raw = base64ToBytes(cleaned)
          const copy = new Uint8Array(raw.byteLength)
          copy.set(raw)
          const buf = copy.buffer
          if (!looksLikeGlb(buf)) throw new Error('HF JSON blob is not GLB')
          return buf
        }
        lastError = 'Unexpected HF JSON response'
        break
      }

      const buf = await res.arrayBuffer()
      if (looksLikeGlb(buf)) return buf
      lastError = 'HF response was not a GLB mesh'
      break
    }
  }

  throw new Error(lastError)
}

/**
 * Fallback: official TripoSR Gradio Space (same model, free queue).
 * Used when HF Inference does not host TripoSR for the account.
 */
async function callTripoSrGradio(
  token: string | undefined,
  imageBytes: Uint8Array,
  contentType: string,
): Promise<ArrayBuffer> {
  const mime = contentType || 'image/jpeg'
  const dataUrl = `data:${mime};base64,${bytesToBase64(imageBytes)}`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const space = 'https://stabilityai-triposr.hf.space'
  const filePayload = {
    path: null,
    url: dataUrl,
    orig_name: 'oke-upload.jpg',
    meta: { _type: 'gradio.FileData' },
  }

  // run_example: preprocess + generate → [processed, obj, glb]
  const submit = await fetch(`${space}/gradio_api/call/run_example`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: [filePayload] }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!submit.ok) {
    const t = await submit.text().catch(() => '')
    throw new Error(`TripoSR Space submit failed (${submit.status}) ${t.slice(0, 160)}`)
  }
  const { event_id: eventId } = (await submit.json()) as { event_id?: string }
  if (!eventId) throw new Error('TripoSR Space: missing event_id')

  const deadline = Date.now() + 100_000
  while (Date.now() < deadline) {
    const poll = await fetch(`${space}/gradio_api/call/run_example/${eventId}`, {
      headers,
      signal: AbortSignal.timeout(30_000),
    })
    const text = await poll.text()
    // SSE: lines like "event: complete\ndata: [...]"
    if (text.includes('event: complete') || text.includes('"glb"') || text.includes('.glb')) {
      const dataLine = text
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l.startsWith('data:'))
      if (!dataLine) break
      const raw = dataLine.slice(5).trim()
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        await sleep(2000)
        continue
      }
      // Expect array: [image, objPath, glbPath] or nested file objects
      const list = Array.isArray(parsed) ? parsed : [parsed]
      let glbRef: string | null = null
      for (const item of list) {
        if (typeof item === 'string' && item.includes('.glb')) {
          glbRef = item
          break
        }
        if (item && typeof item === 'object') {
          const o = item as { url?: string; path?: string; name?: string }
          const cand = o.url || o.path || o.name
          if (typeof cand === 'string' && cand.includes('.glb')) {
            glbRef = cand
            break
          }
        }
      }
      // Sometimes data is [[...]]
      if (!glbRef && Array.isArray(list[0])) {
        for (const item of list[0] as unknown[]) {
          if (typeof item === 'string' && item.includes('.glb')) {
            glbRef = item
            break
          }
          if (item && typeof item === 'object') {
            const o = item as { url?: string; path?: string }
            const cand = o.url || o.path
            if (typeof cand === 'string' && (cand.includes('.glb') || cand.startsWith('http'))) {
              glbRef = cand
            }
          }
        }
      }
      if (!glbRef) throw new Error('TripoSR Space: no GLB in response')

      const glbUrl = glbRef.startsWith('http')
        ? glbRef
        : glbRef.startsWith('/')
          ? `${space}${glbRef}`
          : `${space}/file=${glbRef}`

      const fileRes = await fetch(glbUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: AbortSignal.timeout(60_000),
      })
      if (!fileRes.ok) throw new Error(`TripoSR Space GLB download ${fileRes.status}`)
      const buf = await fileRes.arrayBuffer()
      if (!looksLikeGlb(buf)) throw new Error('TripoSR Space file is not GLB')
      return buf
    }
    if (text.includes('event: error')) {
      throw new Error('TripoSR Space generation error')
    }
    await sleep(2500)
  }
  throw new Error('TripoSR Space timed out')
}

async function storeGeneratedGlb(
  env: WorkerEnv,
  glbId: string,
  glbBytes: ArrayBuffer,
): Promise<string | null> {
  const r2 = env.R2_UPLOADS ?? env.UPLOADS
  if (!r2) return null
  const key = `generated/${glbId}.glb`
  await r2.put(key, glbBytes, {
    httpMetadata: { contentType: 'model/gltf-binary' },
  })
  return key
}

async function serveGeneratedGlb(env: WorkerEnv, glbId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(glbId)) return json({ ok: false, error: 'Invalid id' }, 400)
  const r2 = env.R2_UPLOADS ?? env.UPLOADS
  if (!r2) return json({ ok: false, error: 'R2 not configured' }, 503)
  const obj = await r2.get(`generated/${glbId}.glb`)
  if (!obj) return json({ ok: false, error: 'Not found' }, 404)

  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('Content-Type', 'model/gltf-binary')
  headers.set('Cache-Control', 'public, max-age=86400')
  headers.set('Access-Control-Allow-Origin', '*')
  return new Response(obj.body, { headers })
}

async function handleGenerate3d(request: Request, env: WorkerEnv) {
  const token = env.HF_TOKEN?.trim() || undefined

  let imageBytes: Uint8Array | null = null
  let contentType = 'image/jpeg'

  const ct = request.headers.get('content-type') ?? ''
  try {
    if (ct.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('image')
      if (file instanceof File) {
        imageBytes = new Uint8Array(await file.arrayBuffer())
        contentType = file.type || contentType
      }
    } else {
      const body = (await request.json()) as {
        imageBase64?: string
        imageType?: string
      }
      if (body.imageBase64) {
        imageBytes = base64ToBytes(String(body.imageBase64))
        contentType = String(body.imageType ?? contentType)
      }
    }
  } catch {
    return json({ ok: false, error: 'Invalid body' }, 400)
  }

  if (!imageBytes?.byteLength) {
    return json({ ok: false, error: 'Missing image' }, 400)
  }

  // Cap upload ~6 MB
  if (imageBytes.byteLength > 6_000_000) {
    return json({ ok: false, error: 'Image too large (max 6MB)' }, 413)
  }

  try {
    let glbBuf: ArrayBuffer
    let via: 'inference' | 'space' = 'inference'
    try {
      if (!token) throw new Error('NO_TOKEN')
      glbBuf = await callTripoSrInference(token, imageBytes, contentType)
    } catch (infErr) {
      console.log('TripoSR inference fallback → Space', infErr)
      via = 'space'
      glbBuf = await callTripoSrGradio(token, imageBytes, contentType)
    }

    const glbId = id()
    const key = await storeGeneratedGlb(env, glbId, glbBuf)

    const origin = new URL(request.url).origin
    const glbUrl = key ? `${origin}/api/generate-3d/glb/${glbId}` : null

    const bytes = new Uint8Array(glbBuf)
    const dataUrl =
      bytes.byteLength <= 3_500_000
        ? `data:model/gltf-binary;base64,${bytesToBase64(bytes)}`
        : null

    if (!glbUrl && !dataUrl) {
      return json({ ok: false, error: 'Could not persist GLB', code: 'NO_STORAGE' }, 500)
    }

    return json({
      ok: true,
      model: TRIPOSR_MODEL,
      via,
      glbUrl: glbUrl ?? dataUrl,
      dataUrl,
      bytes: bytes.byteLength,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TripoSR failed'
    console.log('generate-3d failed', message)
    return json({ ok: false, error: message, code: 'TRIPOSR_FAILED' }, 502)
  }
}

export default {
  async fetch(request, env: WorkerEnv) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return json({ ok: true })
    }

    if (url.pathname === '/api/' || url.pathname === '/api/health') {
      return json({
        ok: true,
        name: 'OK Store',
        service: 'okstore-api',
        bindings: {
          d1: Boolean(env.CUSTOM_REQUESTS),
          r2: Boolean(env.R2_UPLOADS ?? env.UPLOADS),
          admin: adminPairs(env).length > 0,
          resend: Boolean(env.RESEND_API_KEY),
          hf: Boolean(env.HF_TOKEN),
        },
      })
    }

    if (url.pathname === '/api/aanvraag' && request.method === 'POST') {
      return handleProductAanvraag(request, env)
    }

    if (url.pathname === '/api/custom-request' && request.method === 'POST') {
      return handleCustomRequest(request, env)
    }

    if (url.pathname === '/api/generate-3d' && request.method === 'POST') {
      return handleGenerate3d(request, env)
    }

    const glbMatch = url.pathname.match(/^\/api\/generate-3d\/glb\/([^/]+)$/)
    if (glbMatch && request.method === 'GET') {
      return serveGeneratedGlb(env, decodeURIComponent(glbMatch[1]!))
    }

    if (url.pathname.startsWith('/api/admin')) {
      if (!requireAdmin(request, env)) return unauthorized()

      if (url.pathname === '/api/admin/requests' && request.method === 'GET') {
        return adminList(env)
      }

      const detailMatch = url.pathname.match(/^\/api\/admin\/requests\/([^/]+)$/)
      if (detailMatch) {
        const requestId = decodeURIComponent(detailMatch[1]!)
        if (request.method === 'GET') return adminGet(env, requestId)
        if (request.method === 'PATCH') return adminPatch(request, env, requestId)
      }

      if (url.pathname === '/api/admin/files' && request.method === 'GET') {
        return adminFile(request, env)
      }

      return json({ ok: false, error: 'Not found' }, 404)
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<WorkerEnv>
