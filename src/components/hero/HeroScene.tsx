import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '../../lib/animations/motion'
import './HeroScene.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const HERO_FIGURE = '/products/oke-collection/mint-streetwear-hoodie-cutout.png'
const RAIL = [
  '/products/oke-collection/black-streetwear-coffee-cutout.png',
  '/products/oke-collection/mint-weight-plate-cutout.png',
  '/products/oke-collection/black-fitness-kettlebell-cutout.png',
] as const

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
      const stageLight = q('.hero__stage-light')
      const typePrimary = q('.hero__type-primary')
      const typeMeta = q('.hero__meta')
      const filament = q('.hero__filament')
      const reveal = q('.hero__reveal')
      const revealItems = q('.hero__reveal-item')
      const revealRule = q('.hero__reveal-rule')
      const statement = q('.hero__statement')
      const statementLines = q('.hero__statement-line')
      const statementMeta = q('.hero__statement-meta')
      const hairline = q('.hero__hairline')
      const rail = q('.hero__rail')
      const railTitle = q('.hero__rail-title')
      const railItems = q('.hero__rail-item')
      const scrollHint = q('.hero__scroll-hint')
      const shadow = q('.hero__shadow')
      const metaLabel = root.querySelector('.hero__meta-label')

      const setMeta = (text: string) => {
        if (metaLabel) metaLabel.textContent = text
      }

      if (reduced) {
        gsap.set([statement, statementMeta, ...statementLines], {
          autoAlpha: 1,
          clearProps: 'clipPath,y,yPercent',
        })
        gsap.set(scrollHint, { autoAlpha: 0 })
        setMeta('01 / COLLECTIBLE')
        return
      }

      const mm = gsap.matchMedia()

      mm.add('(min-width: 901px)', () => {
        let idle: gsap.core.Tween | null = gsap.to(figure, {
          y: -5,
          rotate: 1.1,
          duration: 7.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        const stopIdle = () => {
          if (idle) {
            idle.kill()
            idle = null
            gsap.set(figure, { y: 0, rotate: 0 })
          }
        }

        const tl = gsap.timeline({
          defaults: { ease: MOTION.ease.product, overwrite: 'auto' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: `+=${MOTION.heroScrollVh}%`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.02) stopIdle()
            },
          },
        })

        // 01 INTRO hold
        tl.addLabel('intro', 0)
        tl.to({}, { duration: 0.4 }, 'intro')

        // 02 DISCOVERY — depth / parallax
        tl.addLabel('discovery')
        tl.call(() => setMeta('02 / DISCOVERY'), undefined, 'discovery')
        tl.to(
          figureWrap,
          { x: -48, duration: 1.25 },
          'discovery',
        )
          .to(
            figure,
            { rotateY: 8, scale: 1.05, duration: 1.25 },
            'discovery',
          )
          .to(
            typePrimary,
            { x: 36, y: -18, duration: 1.25, ease: MOTION.ease.out },
            'discovery',
          )
          .to(
            typeMeta,
            { x: 22, y: -8, duration: 1.25, ease: MOTION.ease.out },
            'discovery+=0.04',
          )
          .to(stageLight, { x: 40, opacity: 0.55, duration: 1.25 }, 'discovery')
          .to(shadow, { scaleX: 1.2, opacity: 0.58, duration: 1.25 }, 'discovery')
          .to(
            filament,
            { scaleX: 1, opacity: 1, duration: 0.85, ease: MOTION.ease.out },
            'discovery+=0.18',
          )
          .to(scrollHint, { autoAlpha: 0, y: 10, duration: 0.35 }, 'discovery')

        // 03 REVEAL — figure owns frame
        tl.addLabel('reveal')
        tl.call(() => setMeta('03 / REVEAL'), undefined, 'reveal')
        tl.to(
          figureWrap,
          { x: -96, duration: 1.15 },
          'reveal',
        )
          .to(figure, { scale: 1.16, rotateY: 4, duration: 1.15 }, 'reveal')
          .to(
            typePrimary,
            {
              y: -90,
              autoAlpha: 0,
              clipPath: 'inset(0 0 100% 0)',
              duration: 0.8,
              ease: MOTION.ease.text,
            },
            'reveal',
          )
          .to(typeMeta, { autoAlpha: 0, y: -16, duration: 0.45 }, 'reveal')
          .to(filament, { autoAlpha: 0, duration: 0.35 }, 'reveal')
          .to(stageLight, { opacity: 0.32, duration: 1 }, 'reveal')
          .fromTo(
            reveal,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3 },
            'reveal+=0.28',
          )
          .from(
            revealItems,
            {
              y: 24,
              autoAlpha: 0,
              stagger: 0.09,
              duration: 0.5,
              ease: MOTION.ease.text,
            },
            'reveal+=0.32',
          )
          .fromTo(
            revealRule,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, ease: MOTION.ease.out },
            'reveal+=0.48',
          )

        // 04 STATEMENT — split composition
        tl.addLabel('statement')
        tl.call(() => setMeta('04 / MANIFESTO'), undefined, 'statement')
        tl.to(
          figureWrap,
          { x: 120, duration: 1.2 },
          'statement',
        )
          .to(figure, { scale: 1.04, rotateY: 2, duration: 1.2 }, 'statement')
          .to(reveal, { autoAlpha: 0, x: 36, duration: 0.5 }, 'statement')
          .to(hairline, { autoAlpha: 1, duration: 0.55 }, 'statement+=0.12')
          .fromTo(
            statement,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.2 },
            'statement+=0.1',
          )
          .fromTo(
            statementMeta,
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.35 },
            'statement+=0.14',
          )
          .fromTo(
            statementLines,
            { yPercent: 105, clipPath: 'inset(100% 0 0 0)' },
            {
              yPercent: 0,
              clipPath: 'inset(0% 0 0 0)',
              stagger: 0.11,
              duration: 0.8,
              ease: MOTION.ease.text,
            },
            'statement+=0.18',
          )

        // 05 TRANSFORM → collection lead
        tl.addLabel('transform')
        tl.call(() => setMeta('05 / SIGNATURE'), undefined, 'transform')
        tl.to(
          figureWrap,
          { x: -210, y: 36, scale: 0.72, duration: 1.35 },
          'transform',
        )
          .to(figure, { rotateY: 0, scale: 1, duration: 1.35 }, 'transform')
          .to(
            statement,
            { autoAlpha: 0, scale: 0.94, y: -24, duration: 0.65 },
            'transform',
          )
          .to(hairline, { autoAlpha: 0, duration: 0.35 }, 'transform')
          .to(stageLight, { opacity: 0.2, duration: 1 }, 'transform')
          .fromTo(
            rail,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3 },
            'transform+=0.28',
          )
          .fromTo(
            railTitle,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: MOTION.ease.text },
            'transform+=0.32',
          )
          .fromTo(
            railItems,
            { x: 90, autoAlpha: 0 },
            {
              x: 0,
              autoAlpha: 1,
              stagger: 0.11,
              duration: 0.8,
              ease: MOTION.ease.out,
            },
            'transform+=0.42',
          )

        return () => {
          stopIdle()
        }
      })

      mm.add('(max-width: 900px)', () => {
        const idle = gsap.to(figure, {
          y: -3,
          duration: 6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        const tl = gsap.timeline({
          defaults: { ease: MOTION.ease.product, overwrite: 'auto' },
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.progress > 0.03) idle.pause()
            },
          },
        })

        tl.to({}, { duration: 0.25 })
          .to(figure, { scale: 1.04, rotateY: 3, duration: 1 })
          .to(typePrimary, { y: -12, duration: 1 }, '<')
          .to(filament, { scaleX: 1, opacity: 1, duration: 0.65 }, '<0.15')
          .to(scrollHint, { autoAlpha: 0, duration: 0.25 }, '<')
          .to(figureWrap, { y: 12, scale: 1.08, duration: 1 })
          .to(typePrimary, { autoAlpha: 0, y: -40, duration: 0.55 }, '<')
          .to(typeMeta, { autoAlpha: 0, duration: 0.35 }, '<')
          .fromTo(reveal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
          .from(revealItems, {
            y: 16,
            autoAlpha: 0,
            stagger: 0.07,
            duration: 0.4,
          })
          .to(figureWrap, { y: -28, scale: 0.92, duration: 1 })
          .to(reveal, { autoAlpha: 0, duration: 0.35 }, '<')
          .fromTo(statement, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 })
          .fromTo(
            statementLines,
            { yPercent: 70, clipPath: 'inset(100% 0 0 0)' },
            {
              yPercent: 0,
              clipPath: 'inset(0% 0 0 0)',
              stagger: 0.09,
              duration: 0.65,
            },
          )
          .to(figureWrap, { y: -70, scale: 0.68, duration: 1.05 })
          .to(statement, { autoAlpha: 0, y: -14, duration: 0.45 }, '<')
          .fromTo(rail, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 })
          .fromTo(
            railTitle,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
          )
          .fromTo(
            railItems,
            { y: 28, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.55 },
          )

        return () => idle.kill()
      })

      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      // Refresh after fonts/images
      requestAnimationFrame(() => ScrollTrigger.refresh())

      return () => {
        window.removeEventListener('load', onLoad)
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
      aria-label="OKE3D cinematic introduction"
    >
      <a className="hero__skip" href="#collections">
        Skip to collection
      </a>

      <div className="hero__stage" aria-hidden="true">
        <div className="hero__grain" />
        <div className="hero__stage-light" />
        <div className="hero__shadow" />
      </div>

      <div className="hero__copy">
        <p className="hero__meta">
          <span className="hero__meta-label">01 / COLLECTIBLE</span>
          <span className="hero__meta-sub">3D PRINTED FIGURES</span>
        </p>
        <div className="hero__filament" aria-hidden="true" />
        <h1 className="hero__type-primary">
          <span className="hero__oke">OKE</span>
          <span className="hero__three">3D</span>
        </h1>
      </div>

      <div className="hero__figure-wrap">
        <img
          className="hero__figure"
          src={HERO_FIGURE}
          alt="OKE. mint streetwear collectible figure"
          width={720}
          height={900}
          fetchPriority="high"
        />
      </div>

      <div className="hero__reveal" aria-hidden="true">
        <p className="hero__reveal-item">3D PRINTED</p>
        <p className="hero__reveal-item">COLLECTIBLE</p>
        <div className="hero__reveal-rule" />
        <p className="hero__reveal-item hero__reveal-item--sig">OKE. SIGNATURE</p>
      </div>

      <div className="hero__hairline" aria-hidden="true" />

      <div className="hero__statement">
        <p className="hero__statement-meta">04 / MANIFESTO</p>
        <p className="hero__statement-line">MADE TO EXIST</p>
        <p className="hero__statement-line">OUTSIDE THE SCREEN.</p>
      </div>

      <div className="hero__rail" id="collections">
        <p className="hero__rail-title">SIGNATURE FORMS</p>
        <div className="hero__rail-track">
          {RAIL.map((src, i) => (
            <div className="hero__rail-item" key={src}>
              <img src={src} alt="" width={280} height={350} loading="lazy" />
              <span className="hero__rail-index">0{i + 2}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="hero__scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </p>
    </section>
  )
}
