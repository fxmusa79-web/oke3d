import { useEffect, useRef } from 'react'

type Props = {
  active: boolean
  onDone?: () => void
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  rot: number
  vr: number
  color: string
  life: number
}

const COLORS = ['#1570d8', '#0a0a0a', '#fafaf6', '#1a7ef0', '#5c6570']

/** Lightweight canvas confetti — no particle libraries. */
export function ConfettiBurst({ active, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      onDone?.()
      return
    }

    let raf = 0
    let alive = true
    const dpr = Math.min(window.devicePixelRatio, 2)

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const particles: Particle[] = Array.from({ length: 72 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
      const speed = 6 + Math.random() * 10
      return {
        x: window.innerWidth * (0.35 + Math.random() * 0.3),
        y: window.innerHeight * 0.28,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
        vy: Math.sin(angle) * speed,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        life: 1,
      }
    })

    const start = performance.now()
    const tick = (now: number) => {
      if (!alive) return
      const elapsed = (now - start) / 1000
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      let living = 0
      for (const p of particles) {
        p.vy += 0.28
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life = Math.max(0, 1 - elapsed / 1.6)
        if (p.life <= 0) continue
        living++
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (living > 0 && elapsed < 1.8) {
        raf = requestAnimationFrame(tick)
      } else {
        onDone?.()
      }
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, onDone])

  if (!active) return null
  return <canvas ref={canvasRef} className="cdm-confetti" aria-hidden="true" />
}
