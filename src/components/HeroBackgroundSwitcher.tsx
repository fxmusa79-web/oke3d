import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './HeroBackgroundSwitcher.css'

gsap.registerPlugin(useGSAP)

/** 5 desktop + 5 mobile = 10 backgrounds under /public/assets/hero/ */
const DESKTOP_BGS = [
  '/assets/hero/desktop/bg-1.webp',
  '/assets/hero/desktop/bg-2.webp',
  '/assets/hero/desktop/bg-3.webp',
  '/assets/hero/desktop/bg-4.webp',
  '/assets/hero/desktop/bg-5.webp',
] as const

const MOBILE_BGS = [
  '/assets/hero/mobile/bg-1.webp',
  '/assets/hero/mobile/bg-2.webp',
  '/assets/hero/mobile/bg-3.webp',
  '/assets/hero/mobile/bg-4.webp',
  '/assets/hero/mobile/bg-5.webp',
] as const

const BG_OPACITY = 0.12

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(window.innerWidth < breakpoint || mq.matches)
    update()
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [breakpoint])

  return isMobile
}

export function HeroBackgroundSwitcher() {
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const isMobile = useIsMobile(768)
  const bgs = isMobile ? MOBILE_BGS : DESKTOP_BGS
  const [index, setIndex] = useState(0)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setIndex(0)
    const first = (isMobile ? MOBILE_BGS : DESKTOP_BGS)[0]
    if (imgRef.current) {
      imgRef.current.src = first
      gsap.set(imgRef.current, { opacity: BG_OPACITY, scale: 1.05 })
    }
  }, [isMobile])

  useGSAP(
    () => {
      const img = imgRef.current
      if (!img) return

      const list = isMobile ? MOBILE_BGS : DESKTOP_BGS
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set(img, { opacity: BG_OPACITY, scale: 1.05 })

      if (reduced) return

      let kenBurns: gsap.core.Tween | null = gsap.to(img, {
        scale: 1.08,
        duration: 5,
        ease: 'none',
      })

      const interval = window.setInterval(() => {
        const next = (indexRef.current + 1) % list.length
        kenBurns?.kill()

        const tl = gsap.timeline()
        tl.to(img, { opacity: 0, duration: 0.9, ease: 'power2.inOut' })
          .add(() => {
            indexRef.current = next
            setIndex(next)
            img.src = list[next]
            gsap.set(img, { scale: 1.05 })
          })
          .to(img, { opacity: BG_OPACITY, duration: 0.9, ease: 'power2.inOut' })
          .add(() => {
            kenBurns = gsap.to(img, {
              scale: 1.08,
              duration: 5,
              ease: 'none',
            })
          })
      }, 5000)

      return () => {
        window.clearInterval(interval)
        kenBurns?.kill()
      }
    },
    { scope: rootRef, dependencies: [isMobile] },
  )

  return (
    <div ref={rootRef} className="hero-bg-switcher" aria-hidden="true">
      <img
        ref={imgRef}
        className="hero-bg"
        src={bgs[index]}
        alt=""
        width={isMobile ? 1152 : 2048}
        height={isMobile ? 2048 : 1152}
        decoding="async"
        fetchPriority="low"
        draggable={false}
      />
      <div className="hero-bg-switcher__overlay" />
    </div>
  )
}
