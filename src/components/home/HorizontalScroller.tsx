import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './HorizontalScroller.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export type ScrollerItem = {
  id: string
  src: string
  alt: string
  label?: string
}

type Props = {
  items: readonly ScrollerItem[]
  'aria-label'?: string
}

export function HorizontalScroller({ items, 'aria-label': ariaLabel }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const pin = pinRef.current
      const track = trackRef.current
      const scrollEl = scrollRef.current
      if (!root || !pin || !track || !scrollEl) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        if (reduced) return

        const getDistance = () => {
          const overflow = track.scrollWidth - pin.clientWidth
          return Math.max(overflow, 0)
        }

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${getDistance() + window.innerHeight * 0.35}`,
            pin: true,
            scrub: 0.85,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })

        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(track, { clearProps: 'transform' })
        }
      })

      mm.add('(max-width: 767px)', () => {
        scrollEl.classList.add('is-native-scroll')
        let lenis: Lenis | null = null
        let raf = 0

        if (!reduced) {
          lenis = new Lenis({
            wrapper: scrollEl,
            content: track,
            orientation: 'horizontal',
            gestureOrientation: 'horizontal',
            smoothWheel: true,
            syncTouch: true,
          })
          const loop = (time: number) => {
            lenis?.raf(time)
            raf = requestAnimationFrame(loop)
          }
          raf = requestAnimationFrame(loop)
        }

        return () => {
          scrollEl.classList.remove('is-native-scroll')
          cancelAnimationFrame(raf)
          lenis?.destroy()
          gsap.set(track, { clearProps: 'transform' })
        }
      })

      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [items] },
  )

  return (
    <div ref={rootRef} className="oke-hscroll">
      <div ref={pinRef} className="oke-hscroll__pin">
        <div
          ref={scrollRef}
          className="oke-hscroll__viewport"
          aria-label={ariaLabel}
        >
          <ul ref={trackRef} className="oke-hscroll__track">
            {items.map((item) => (
              <li key={item.id} className="oke-hscroll__item">
                <div className="oke-hscroll__card">
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={320}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                {item.label ? (
                  <p className="oke-hscroll__label">{item.label}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
