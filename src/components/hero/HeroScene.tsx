import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '../../lib/animations/motion'
import './HeroScene.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const HERO_FIGURE = '/products/oke-collection/mint-hero.png'

export function HeroScene() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const q = gsap.utils.selector(root)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const figure = q('.hero__figure')
      const figureWrap = q('.hero__figure-wrap')
      const typeBlock = q('.hero__copy')
      const statement = q('.hero__statement')
      const statementLines = q('.hero__statement-line')
      const scrollHint = q('.hero__scroll-hint')
      const filament = q('.hero__filament')
      const cta = q('.hero__cta')

      if (reduced) {
        root.classList.add('hero--reduced')
        gsap.set([statement, statementLines, filament], {
          autoAlpha: 1,
          clearProps: 'clipPath,y,yPercent',
        })
        gsap.set(scrollHint, { autoAlpha: 0 })
        return
      }

      const mm = gsap.matchMedia()

      mm.add('(min-width: 1201px)', () => {
        const idle = gsap.to(figure, {
          y: -8,
          duration: 2.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        const tl = gsap.timeline({
          defaults: { ease: MOTION.ease.product, overwrite: 'auto' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=140%',
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.08) {
                idle.pause()
                gsap.set(figure, { y: 0 })
              }
            },
          },
        })

        tl.to(filament, { scaleX: 1, opacity: 1, duration: 0.5 }, 0)
          .to(scrollHint, { autoAlpha: 0, duration: 0.3 }, 0.15)
          .to(cta, { autoAlpha: 0, y: -12, duration: 0.35 }, 0.2)
          .to(
            typeBlock,
            { autoAlpha: 0, y: -36, duration: 0.55, ease: MOTION.ease.text },
            0.25,
          )
          .to(figureWrap, { x: '10vw', scale: 0.94, duration: 0.9 }, 0.35)
          .fromTo(
            statement,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.25 },
            0.5,
          )
          .fromTo(
            statementLines,
            { yPercent: 80, clipPath: 'inset(100% 0 0 0)' },
            {
              yPercent: 0,
              clipPath: 'inset(0% 0 0 0)',
              stagger: 0.1,
              duration: 0.7,
              ease: MOTION.ease.text,
            },
            0.55,
          )
          .to({}, { duration: 0.35 })

        return () => idle.kill()
      })

      mm.add('(max-width: 1200px)', () => {
        const idle = gsap.to(figure, {
          y: -6,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        const tl = gsap.timeline({
          defaults: { ease: MOTION.ease.product, overwrite: 'auto' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.1) {
                idle.pause()
                gsap.set(figure, { y: 0 })
              }
            },
          },
        })

        tl.to(filament, { scaleX: 1, opacity: 1, duration: 0.4 }, 0)
          .to(scrollHint, { autoAlpha: 0, duration: 0.25 }, 0.1)
          .to(cta, { autoAlpha: 0, duration: 0.25 }, 0.15)
          .to(typeBlock, { autoAlpha: 0.15, duration: 0.4 }, 0.2)
          .to(figureWrap, { y: -12, scale: 0.92, duration: 0.65 }, 0.25)
          .fromTo(statement, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0.4)
          .fromTo(
            statementLines,
            { yPercent: 50, clipPath: 'inset(100% 0 0 0)' },
            {
              yPercent: 0,
              clipPath: 'inset(0% 0 0 0)',
              stagger: 0.08,
              duration: 0.55,
            },
            0.45,
          )

        return () => idle.kill()
      })

      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      root.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', refresh, { once: true })
      })
      requestAnimationFrame(refresh)

      return () => {
        window.removeEventListener('load', refresh)
        mm.revert()
      }
    },
    { scope: rootRef },
  )

  return (
    <section
      id="top"
      className="hero"
      ref={rootRef}
      aria-label="OKE3D introductie"
    >
      <a className="hero__skip" href="#bbq">
        Ga naar BBQ Edition
      </a>

      <div className="hero__stage" aria-hidden="true">
        <div className="hero__wash" />
        <div className="hero__grain" />
        <div className="hero__stage-light" />
      </div>

      <div className="hero__copy">
        <p className="hero__meta">
          <span>01 / Collectible</span>
          <span className="hero__meta-sub">3D-geprinte figures</span>
        </p>
        <div className="hero__filament" aria-hidden="true" />
        <h1 className="hero__type-primary">
          <span className="hero__line">Figures</span>
          <span className="hero__line hero__line--accent">made real.</span>
        </h1>
        <p className="hero__lede">
          Premium 3D-printed collectibles — van digitaal naar fysiek.
        </p>
        <a className="hero__cta" href="#bbq">
          Bekijk collectie
        </a>
      </div>

      <div className="hero__figure-wrap">
        <img
          className="hero__figure"
          src={HERO_FIGURE}
          alt="OKE mint streetwear collectible figure"
          width={520}
          height={880}
          fetchPriority="high"
        />
      </div>

      <div className="hero__statement">
        <p className="hero__statement-meta">Gemaakt om vast te houden</p>
        <p className="hero__statement-line">Made to exist</p>
        <p className="hero__statement-line">outside the screen.</p>
      </div>

      <p className="hero__scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </p>
    </section>
  )
}
