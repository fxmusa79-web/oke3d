import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './HeroViewer.css'

gsap.registerPlugin(useGSAP)

export type HeroCharacter = {
  id: string
  src: string
  alt: string
}

type Props = {
  characters: readonly HeroCharacter[]
  activeIndex: number
  onChange: (index: number) => void
}

export function HeroViewer({ characters, activeIndex, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const prevIndex = useRef(activeIndex)

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let running = true

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
    }))

    const resize = () => {
      const rect = root.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      if (!running) return
      const { width, height } = root.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(209, 231, 221, 0.2)'
      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx * 0.3 * 16
          p.y += p.vy * 0.3 * 16
          if (p.x < 0 || p.x > 1) p.vx *= -1
          if (p.y < 0 || p.y > 1) p.vy *= -1
        }
        ctx.beginPath()
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()
    const ro = new ResizeObserver(resize)
    ro.observe(root)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  useGSAP(
    () => {
      const layer = layerRef.current
      const root = rootRef.current
      if (!layer || !root) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const imgs = gsap.utils.toArray<HTMLElement>('.oke-hero-viewer__img')
      const fromIndex = prevIndex.current
      const toIndex = activeIndex
      const from = imgs[fromIndex]
      const to = imgs[toIndex]

      imgs.forEach((img, i) => {
        gsap.killTweensOf(img)
        if (i !== fromIndex && i !== toIndex) {
          gsap.set(img, { opacity: 0, zIndex: 1, scale: 0.98 })
        }
      })

      if (fromIndex !== toIndex && from && to && !reduced) {
        gsap.set(from, { zIndex: 2 })
        gsap.set(to, { zIndex: 3, opacity: 0, scale: 1.02 })
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(from, { opacity: 0, zIndex: 1, scale: 0.98 })
              gsap.set(to, { opacity: 1, zIndex: 2, scale: 1 })
            },
          })
          .to(from, { opacity: 0, scale: 0.98, duration: 0.45, ease: 'power2.out' }, 0)
          .to(to, { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }, 0.05)
      } else if (to) {
        imgs.forEach((img, i) => {
          gsap.set(img, {
            opacity: i === toIndex ? 1 : 0,
            zIndex: i === toIndex ? 2 : 1,
            scale: i === toIndex ? 1 : 0.98,
          })
        })
      }

      prevIndex.current = activeIndex

      const badges = gsap.utils.toArray<HTMLElement>('.oke-hero-viewer__badge')
      if (!reduced && badges.length) {
        badges.forEach((badge, i) => {
          gsap.killTweensOf(badge)
          gsap.to(badge, {
            y: i % 2 === 0 ? -10 : 12,
            duration: 2.4 + i * 0.35,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        })
      }

      if (reduced) return

      const onMove = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        gsap.to(layer, {
          x: x * 12,
          y: y * 10,
          rotateY: x * 5,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const onLeave = () => {
        gsap.to(layer, {
          x: 0,
          y: 0,
          rotateY: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
      }

      root.addEventListener('pointermove', onMove)
      root.addEventListener('pointerleave', onLeave)
      return () => {
        root.removeEventListener('pointermove', onMove)
        root.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: rootRef, dependencies: [activeIndex] },
  )

  return (
    <div ref={rootRef} className="oke-hero-viewer">
      <canvas ref={canvasRef} className="oke-hero-viewer__particles" aria-hidden="true" />

      <div ref={layerRef} className="oke-hero-viewer__parallax">
        {characters.map((character, index) => (
          <img
            key={character.id}
            className="oke-hero-viewer__img"
            src={character.src}
            alt={character.alt}
            width={900}
            height={1200}
            decoding="async"
            fetchPriority={index === activeIndex ? 'high' : 'low'}
            draggable={false}
          />
        ))}

        <span className="oke-hero-viewer__badge oke-hero-viewer__badge--a">
          Kleine oplages
        </span>
        <span className="oke-hero-viewer__badge oke-hero-viewer__badge--b">
          Op aanvraag
        </span>
      </div>

      <div className="oke-hero-viewer__dots" role="tablist" aria-label="Hero characters">
        {characters.map((character, index) => (
          <button
            key={character.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`oke-hero-viewer__dot ${index === activeIndex ? 'is-active' : ''}`}
            onClick={() => onChange(index)}
            aria-label={character.alt}
          />
        ))}
      </div>
    </div>
  )
}
