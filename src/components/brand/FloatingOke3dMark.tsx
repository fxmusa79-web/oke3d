import { useEffect, useRef } from 'react'
import {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'
import './FloatingOke3dMark.css'

/** Floating “OKE3D” wordmark in a lit Three.js scene — about-page brand mark. */
export function FloatingOke3dMark() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new Scene()
    scene.background = null

    const camera = new PerspectiveCamera(42, 1, 0.1, 20)
    camera.position.set(0, 0, 2.4)

    const renderer = new WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)

    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 384
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fafaf6'
    ctx.font = '800 180px Syne, Arial Black, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('OKE', canvas.width * 0.38, canvas.height * 0.52)
    ctx.fillStyle = '#1570d8'
    ctx.fillText('3D', canvas.width * 0.72, canvas.height * 0.52)

    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace

    const geo = new PlaneGeometry(2.4, 0.9)
    const mat = new MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.35,
      metalness: 0.15,
    })
    const mesh = new Mesh(geo, mat)
    scene.add(mesh)

    const key = new DirectionalLight(0xffffff, 1.2)
    key.position.set(1.5, 2, 2)
    scene.add(key)
    const rim = new DirectionalLight(0x1570d8, 0.55)
    rim.position.set(-1.2, 0.6, -1)
    scene.add(rim)
    scene.add(new AmbientLight(0xffffff, 0.35))

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
    }
    resize()

    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = (now - t0) / 1000
      if (!reduced) {
        mesh.rotation.y = Math.sin(t * 0.55) * 0.35
        mesh.rotation.x = Math.sin(t * 0.4) * 0.12
        mesh.position.y = Math.sin(t * 0.9) * 0.06
      }
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      geo.dispose()
      mat.dispose()
      texture.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="oke-float-mark"
      role="img"
      aria-label="OKE3D"
    />
  )
}
