import { useEffect, useRef, useState } from 'react'
import {
  AmbientLight,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { getCachedGlb, hashImageSource, setCachedGlb } from '../../lib/glbCache'
import './CustomPhoto3DPreview.css'

type Props = {
  imageUrl: string
  label: string
  loadingLabel: string
  readyLabel: string
  fallbackLabel: string
}

type Phase = 'building' | 'ready' | 'fallback'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image load failed'))
    img.src = url
  })
}

function imageToCanvas(img: HTMLImageElement, maxSide = 768): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d unavailable')
  ctx.drawImage(img, 0, 0, w, h)
  return canvas
}

async function blobFromImageUrl(url: string): Promise<Blob> {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const res = await fetch(url)
    return res.blob()
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error('image fetch failed')
  return res.blob()
}

async function requestTripoSrGlb(image: Blob): Promise<{ loadUrl: string; cacheUrl: string }> {
  const form = new FormData()
  form.append('image', image, 'upload.jpg')

  const res = await fetch('/api/generate-3d', {
    method: 'POST',
    body: form,
  })

  const data = (await res.json()) as {
    ok?: boolean
    glbUrl?: string
    dataUrl?: string | null
    error?: string
  }

  if (!res.ok || !data.ok) {
    throw new Error(data.error || `generate-3d ${res.status}`)
  }

  const loadUrl = data.dataUrl || data.glbUrl
  if (!loadUrl) throw new Error('No GLB url in response')

  // Prefer same-origin path for localStorage (short); data URLs can blow quota
  const cacheUrl =
    data.glbUrl && !data.glbUrl.startsWith('data:')
      ? data.glbUrl
      : loadUrl.length < 4_000_000
        ? loadUrl
        : data.glbUrl || loadUrl

  return { loadUrl, cacheUrl }
}

function fitObject(root: Group, targetSize = 1.15) {
  const box = new Box3().setFromObject(root)
  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 0.001)
  const scale = targetSize / maxDim
  root.scale.setScalar(scale)
  root.position.sub(center.multiplyScalar(scale))
}

/** Route 1 — photo as texture projection on a plane (OrbitControls). */
function mountTextureProjection(
  root: Group,
  img: HTMLImageElement,
): { dispose: () => void } {
  const photoCanvas = imageToCanvas(img, 900)
  const aspect = photoCanvas.width / photoCanvas.height
  const texture = new CanvasTexture(photoCanvas)
  texture.colorSpace = SRGBColorSpace

  const material = new MeshStandardMaterial({
    map: texture,
    roughness: 0.62,
    metalness: 0.08,
    side: DoubleSide,
  })
  const mesh = new Mesh(new PlaneGeometry(1, 1 / aspect, 1, 1), material)
  root.add(mesh)

  return {
    dispose: () => {
      mesh.geometry.dispose()
      material.map?.dispose()
      material.dispose()
    },
  }
}

export function CustomPhoto3DPreview({
  imageUrl,
  label,
  loadingLabel,
  readyLabel,
  fallbackLabel,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('building')
  const [statusText, setStatusText] = useState(loadingLabel)
  const [progress, setProgress] = useState(4)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let raf = 0
    let progressTimer = 0
    let renderer: WebGLRenderer | null = null
    let controls: OrbitControls | null = null
    let contentDispose: (() => void) | null = null

    const scene = new Scene()
    scene.background = new Color('#0c0c0c')

    const camera = new PerspectiveCamera(38, 1, 0.01, 40)
    camera.position.set(0, 0.15, 1.85)

    const root = new Group()
    scene.add(root)

    const key = new DirectionalLight(0xffffff, 1.35)
    key.position.set(1.2, 1.6, 2.2)
    scene.add(key)
    const fill = new DirectionalLight(0xa8c4ff, 0.45)
    fill.position.set(-1.4, 0.4, 1.2)
    scene.add(fill)
    const rim = new DirectionalLight(0x1570d8, 0.35)
    rim.position.set(0.2, 1.2, -1.5)
    scene.add(rim)
    scene.add(new AmbientLight(0xffffff, 0.28))

    const resize = () => {
      if (!renderer || !host) return
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
    }

    const tick = () => {
      if (disposed) return
      controls?.update()
      renderer?.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    const clearRoot = () => {
      contentDispose?.()
      contentDispose = null
      while (root.children.length) {
        root.remove(root.children[0]!)
      }
      root.position.set(0, 0, 0)
      root.scale.set(1, 1, 1)
      root.rotation.set(0, 0, 0)
    }

    const startProgress = () => {
      setProgress(6)
      const started = performance.now()
      const durationMs = 32_000
      const step = () => {
        if (disposed) return
        const t = Math.min(1, (performance.now() - started) / durationMs)
        // Ease toward ~92% while waiting (20–40s feel)
        const eased = 1 - Math.pow(1 - t, 1.55)
        setProgress(Math.min(92, Math.round(6 + eased * 86)))
        progressTimer = window.setTimeout(step, 220)
      }
      progressTimer = window.setTimeout(step, 220)
    }

    const finishProgress = () => {
      window.clearTimeout(progressTimer)
      setProgress(100)
    }

    const loadGlbIntoScene = async (glbUrl: string) => {
      const loader = new GLTFLoader()
      const gltf = await loader.loadAsync(glbUrl)
      if (disposed) return
      clearRoot()
      const model = gltf.scene
      root.add(model)
      fitObject(root)
      contentDispose = () => {
        model.traverse((obj) => {
          const m = obj as Mesh
          if (!m.isMesh) return
          m.geometry?.dispose()
          const mat = m.material
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
          else mat?.dispose()
        })
      }
      setPhase('ready')
      setStatusText(readyLabel)
      finishProgress()
    }

    const useTextureFallback = async (img: HTMLImageElement) => {
      clearRoot()
      contentDispose = mountTextureProjection(root, img).dispose
      setPhase('fallback')
      setStatusText(fallbackLabel)
      finishProgress()
    }

    const boot = async () => {
      setPhase('building')
      setStatusText(loadingLabel)
      startProgress()

      renderer = new WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      host.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.enablePan = false
      controls.minDistance = 0.85
      controls.maxDistance = 4.5
      controls.target.set(0, 0, 0)

      resize()
      tick()

      const img = await loadImage(imageUrl)
      if (disposed) return

      const hash = await hashImageSource(imageUrl)
      const cached = getCachedGlb(hash)
      if (cached) {
        try {
          await loadGlbIntoScene(cached)
          return
        } catch (err) {
          console.log('cached GLB failed', err)
        }
      }

      try {
        const blob = await blobFromImageUrl(imageUrl)
        const { loadUrl, cacheUrl } = await requestTripoSrGlb(blob)
        if (disposed) return
        setCachedGlb(hash, cacheUrl)
        await loadGlbIntoScene(loadUrl)
      } catch (err) {
        console.log('TripoSR failed → texture projection', err)
        if (disposed) return
        await useTextureFallback(img)
      }
    }

    window.addEventListener('resize', resize)
    void boot()

    return () => {
      disposed = true
      window.clearTimeout(progressTimer)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      controls?.dispose()
      clearRoot()
      renderer?.dispose()
      if (renderer?.domElement.parentElement === host) host.removeChild(renderer.domElement)
    }
  }, [imageUrl, loadingLabel, readyLabel, fallbackLabel])

  return (
    <div className="cdm-3d">
      <div ref={hostRef} className="cdm-3d__stage" role="img" aria-label={label} />

      {phase === 'building' ? (
        <div className="cdm-3d__build" aria-live="polite">
          <p className="cdm-3d__status cdm-3d__status--building">{statusText}</p>
          <div
            className="cdm-3d__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label={statusText}
          >
            <span className="cdm-3d__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="cdm-3d__eta">~20–40s</p>
        </div>
      ) : (
        <p className={`cdm-3d__status cdm-3d__status--${phase}`} aria-live="polite">
          {statusText}
        </p>
      )}
    </div>
  )
}
