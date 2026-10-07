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

/**
 * Optional bindings — present after D1/R2 are provisioned in wrangler.jsonc.
 * CUSTOM_REQUESTS -> D1 oke3d_requests
 * R2_UPLOADS -> R2 oke3d-uploads
 */
type WorkerEnv = Env & {
  CUSTOM_REQUESTS?: D1Database
  R2_UPLOADS?: R2Bucket
  /** @deprecated legacy alias */
  UPLOADS?: R2Bucket
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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
  let imageKey: string | null = null
  const r2 = env.R2_UPLOADS ?? env.UPLOADS

  if (imageBase64 && r2) {
    try {
      imageKey = `custom/${requestId}/${imageName}`
      const bytes = base64ToBytes(imageBase64)
      await r2.put(imageKey, bytes, {
        httpMetadata: { contentType: imageType },
        customMetadata: { name, email },
      })
    } catch (err) {
      console.log('custom-request R2 upload failed', err)
      imageKey = null
    }
  } else if (imageBase64) {
    console.log('custom-request image received (no R2 binding)', {
      id: requestId,
      imageName,
      bytesApprox: Math.floor(imageBase64.length * 0.75),
    })
  }

  if (env.CUSTOM_REQUESTS) {
    try {
      await env.CUSTOM_REQUESTS.prepare(
        `INSERT INTO custom_requests (id, name, email, description, image_key, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      )
        .bind(requestId, name, email, description, imageKey, createdAt)
        .run()
    } catch (err) {
      console.log('custom-request D1 insert failed', err)
      console.log('custom-request', {
        id: requestId,
        name,
        email,
        description,
        imageKey,
        createdAt,
      })
    }
  } else {
    console.log('custom-request (no D1 binding)', {
      id: requestId,
      name,
      email,
      description,
      imageKey,
      hasImage: Boolean(imageBase64),
      createdAt,
    })
  }

  return json({ ok: true, id: requestId })
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
        },
      })
    }

    if (url.pathname === '/api/aanvraag' && request.method === 'POST') {
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

      console.log('aanvraag', { name, email, product, message, at: new Date().toISOString() })
      return json({ ok: true })
    }

    if (url.pathname === '/api/custom-request' && request.method === 'POST') {
      return handleCustomRequest(request, env)
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<WorkerEnv>
