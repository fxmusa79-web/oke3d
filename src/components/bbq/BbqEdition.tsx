import { useRef, useMemo } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from '../../i18n/useI18n'
import './BbqEdition.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const ASSEMBLED = '/products/bbq-edition/bbq-assembled.png'
const EXPLODED = '/products/bbq-edition/bbq-exploded-alpha.png'
const BAND_COUNT = 16

type BandMeta = {
  index: number
  /** 0–1 along height */
  t: number
  delay: number
  depth: number
}

function buildBands(count: number): BandMeta[] {
  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0 : index / (count - 1)
    return {
      index,
      t,
      delay: Math.abs(t - 0.42) * 0.28 + (index % 4) * 0.02,
      depth: 12 + Math.sin(t * Math.PI) * 48,
    }
  })
}

export function BbqEdition() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const bands = useMemo(() => buildBands(BAND_COUNT), [])

  useGSAP(
    () => {
      const root = rootRef.current
      const stage = stageRef.current
      const stack = stackRef.current
      if (!root || !stage || !stack) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const q = gsap.utils.selector(root)
      const bandEls = q('.bbq__band') as HTMLElement[]
      const assembled = q('.bbq__assembled')
      const explodedWrap = q('.bbq__explode-stack')
      const lines = q('.bbq__line')
      const shadow = q('.bbq__shadow')
      const glow = q('.bbq__glow')

      const parallax = { x: 0, y: 0 }
      const target = { x: 0, y: 0 }
      let raf = 0
      let active = true

      const onMove = (e: PointerEvent) => {
        const rect = stage.getBoundingClientRect()
        target.x = gsap.utils.clamp(
          -1,
          1,
          ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        )
        target.y = gsap.utils.clamp(
          -1,
          1,
          ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        )
      }

      const tickParallax = () => {
        if (!active) return
        parallax.x += (target.x - parallax.x) * 0.055
        parallax.y += (target.y - parallax.y) * 0.055
        gsap.set(stage, {
          rotateY: parallax.x * 6.5,
          rotateX: -parallax.y * 3.5,
          force3D: true,
        })
        raf = requestAnimationFrame(tickParallax)
      }

      const io = new IntersectionObserver(
        ([entry]) => {
          active = entry.isIntersecting
          if (active && !reduced) {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(tickParallax)
          } else cancelAnimationFrame(raf)
        },
        { threshold: 0.12 },
      )
      io.observe(root)

      // Keep horizontal centering via GSAP so idle y doesn't wipe CSS transform
      gsap.set(assembled, { xPercent: -50, left: '50%', transformOrigin: '50% 90%' })

      const applyExplode = (v: number) => {
        const easeV = gsap.parseEase('power3.inOut')(gsap.utils.clamp(0, 1, v))
        const stackH = stack.offsetHeight || 1

        gsap.set(assembled, {
          xPercent: -50,
          autoAlpha: 1 - Math.min(1, easeV * 1.45),
          scale: 1 - easeV * 0.05,
          filter: easeV > 0.05 ? `blur(${easeV * 3}px)` : 'none',
        })
        gsap.set(explodedWrap, {
          autoAlpha: Math.min(1, easeV * 1.55),
        })

        bandEls.forEach((el, i) => {
          const b = bands[i]
          const local = gsap.utils.clamp(
            0,
            1,
            (easeV - b.delay * 0.4) / Math.max(0.001, 1 - b.delay * 0.4),
          )
          const naturalTop = (i / BAND_COUNT) * stackH
          const packTop = (0.2 + b.t * 0.45) * stackH
          const y = (packTop - naturalTop) * (1 - local)
          const z = b.depth * (0.15 + local * 0.95)
          const rotX = (i % 2 === 0 ? -1.2 : 1.2) * local * 4
          const rotY = (b.t - 0.5) * local * 5

          gsap.set(el, {
            y,
            z,
            rotateX: rotX,
            rotateY: rotY,
            force3D: true,
          })
        })

        gsap.set(lines, {
          autoAlpha: easeV > 0.5 ? (easeV - 0.5) * 0.7 : 0,
        })
        gsap.set(shadow, {
          scaleX: 1 + easeV * 0.65,
          opacity: 0.5 - easeV * 0.15,
        })
        gsap.set(glow, { opacity: 0.32 + easeV * 0.28 })
      }

      if (reduced) {
        gsap.set(assembled, { autoAlpha: 0, xPercent: -50 })
        gsap.set(explodedWrap, { autoAlpha: 1 })
        applyExplode(1)
        gsap.set(lines, { autoAlpha: 0.2 })
        return () => io.disconnect()
      }

      applyExplode(0)

      const idle = gsap.to(assembled, {
        y: -9,
        duration: 3.1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px)', () => {
        const st = ScrollTrigger.create({
          trigger: root,
          start: 'top 70%',
          end: '+=140%',
          scrub: 1.2,
          pin: false,
          onUpdate: (self) => {
            const p = self.progress
            let v = 0
            if (p < 0.15) v = 0
            else if (p < 0.5) v = gsap.utils.mapRange(0.15, 0.5, 0, 1, p)
            else if (p < 0.72) v = 1
            else v = gsap.utils.mapRange(0.72, 1, 1, 0.08, p)
            applyExplode(v)
            if (v > 0.06) idle.pause()
            else idle.play()
          },
        })

        // Autonomous loop if user parks on section without scrolling
        const explodeAmount = { v: 0 }
        const loop = gsap.timeline({
          repeat: -1,
          paused: true,
          defaults: { ease: 'power3.inOut' },
        })
        loop
          .to(explodeAmount, {
            v: 1,
            duration: 2.6,
            onUpdate: () => applyExplode(explodeAmount.v),
          })
          .to({}, { duration: 3.0 })
          .to(explodeAmount, {
            v: 0,
            duration: 2.2,
            onUpdate: () => applyExplode(explodeAmount.v),
          })
          .to({}, { duration: 2.4 })

        const arm = window.setTimeout(() => {
          if (st.progress < 0.04) {
            idle.pause()
            loop.play(0)
          }
        }, 5000)

        stage.addEventListener('pointermove', onMove)
        raf = requestAnimationFrame(tickParallax)

        return () => {
          window.clearTimeout(arm)
          st.kill()
          loop.kill()
          stage.removeEventListener('pointermove', onMove)
        }
      })

      mm.add('(max-width: 900px)', () => {
        const st = ScrollTrigger.create({
          trigger: root,
          start: 'top 65%',
          end: 'bottom 35%',
          scrub: 0.95,
          onUpdate: (self) => {
            const p = self.progress
            let v = 0
            if (p < 0.08) v = 0
            else if (p < 0.5) v = gsap.utils.mapRange(0.08, 0.5, 0, 1, p)
            else if (p < 0.75) v = 1
            else v = gsap.utils.mapRange(0.75, 1, 1, 0.18, p)
            applyExplode(v)
            if (v > 0.06) idle.pause()
            else idle.play()
          },
        })

        stage.addEventListener('pointermove', onMove)
        raf = requestAnimationFrame(tickParallax)

        return () => {
          st.kill()
          stage.removeEventListener('pointermove', onMove)
        }
      })

      return () => {
        active = false
        cancelAnimationFrame(raf)
        io.disconnect()
        idle.kill()
        mm.revert()
      }
    },
    { scope: rootRef, dependencies: [bands] },
  )

  return (
    <section
      id="bbq"
      className="bbq"
      ref={rootRef}
      aria-labelledby="bbq-title"
    >
      <div className="bbq__layout">
        <div className="bbq__copy">
          <p className="bbq__meta">{t.edition.eyebrow}</p>
          <h2 id="bbq-title" className="bbq__title">
            {t.edition.title}
          </h2>
          <div className="bbq__rule" aria-hidden="true" />
          <p className="bbq__lede">{t.edition.lede}</p>
          <ul className="bbq__specs">
            {t.edition.specs.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
        </div>

        <div className="bbq__viewport">
          <div className="bbq__studio" aria-hidden="true">
            <div className="bbq__glow" />
            <div className="bbq__floor" />
          </div>

          <div className="bbq__stage" ref={stageRef}>
            <div className="bbq__shadow" aria-hidden="true" />

            <img
              className="bbq__assembled"
              src={ASSEMBLED}
              alt="OKE BBQ Edition — complete figure met grill"
              width={640}
              height={960}
              loading="lazy"
              decoding="async"
            />

            <div
              className="bbq__explode-stack"
              ref={stackRef}
              aria-hidden="true"
            >
              {bands.map((b) => (
                <div
                  key={b.index}
                  className="bbq__band"
                  style={{
                    zIndex: 20 + b.index,
                    height: `${100 / BAND_COUNT}%`,
                    top: `${(b.index / BAND_COUNT) * 100}%`,
                  }}
                >
                  <img
                    className="bbq__band-img"
                    src={EXPLODED}
                    alt=""
                    draggable={false}
                    style={{
                      height: `${BAND_COUNT * 100}%`,
                      top: `${-b.index * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>

            <svg
              className="bbq__lines"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {bands
                .filter((_, i) => i % 3 === 1)
                .map((b) => (
                  <line
                    key={b.index}
                    className="bbq__line"
                    x1="50"
                    y1="50"
                    x2={36 + (b.index % 6) * 5}
                    y2={6 + b.t * 88}
                  />
                ))}
            </svg>
          </div>
        </div>
      </div>

      <ul className="bbq__grid">
        {[
          {
            src: '/assets/dark/bbq-apron.png',
            label: t.edition.cards.apron,
          },
          {
            src: '/products/bbq-edition/bbq-grillmaster.webp',
            label: t.edition.cards.grillmaster,
          },
        ].map((item) => (
          <li key={item.src} className="bbq__card">
            <img
              src={item.src}
              alt={`OKE BBQ Edition — ${item.label}`}
              width={400}
              height={500}
              loading="lazy"
            />
            <span className="bbq__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
