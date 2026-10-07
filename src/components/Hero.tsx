import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { HeroBackgroundSwitcher } from './HeroBackgroundSwitcher'
import { HeroFigureCarousel } from './HeroFigureCarousel'
import { HeroShaderBg } from './HeroShaderBg'
import './Hero.css'

gsap.registerPlugin(useGSAP)

export function Hero() {
  const rootRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const lines = gsap.utils.toArray<HTMLElement>('.oke-hero__line')
      const rest = gsap.utils.toArray<HTMLElement>('.oke-hero__reveal')

      if (reduced) {
        gsap.set([...lines, ...rest], { clearProps: 'all', opacity: 1, y: 0 })
        return
      }

      // No clip-path — that was clipping the title on the left.
      gsap.set(lines, { opacity: 0, y: 22 })
      gsap.set(rest, { opacity: 0, y: 16 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
      }).to(
        rest,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
        },
        '-=0.45',
      )
    },
    { scope: rootRef },
  )

  useEffect(() => {
    const buttons = rootRef.current?.querySelectorAll<HTMLElement>('.oke-hero__btn')
    if (!buttons?.length) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const cleanups: Array<() => void> = []
    buttons.forEach((btn) => {
      const enter = () => gsap.to(btn, { scale: 1.02, duration: 0.25, ease: 'power2.out' })
      const leave = () => gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' })
      btn.addEventListener('mouseenter', enter)
      btn.addEventListener('mouseleave', leave)
      cleanups.push(() => {
        btn.removeEventListener('mouseenter', enter)
        btn.removeEventListener('mouseleave', leave)
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [])

  return (
    <section ref={rootRef} className="oke-hero" aria-labelledby="oke-hero-title">
      <HeroShaderBg />
      <HeroBackgroundSwitcher />

      <div className="oke-hero__grid">
        <div className="oke-hero__copy">
          <span className="oke-hero__eyebrow oke-hero__reveal">
            3D-PRINTS UIT EIGEN STUDIO
          </span>

          <h1 id="oke-hero-title" className="oke-hero__title">
            <span className="oke-hero__line oke-hero__line--strong">Van digitaal idee</span>
            <span className="oke-hero__line oke-hero__line--soft">naar echt object.</span>
          </h1>

          <p className="oke-hero__lede oke-hero__reveal">
            Ontdek unieke 3D-prints, bijzondere collecties en producten die we op
            aanvraag voor je maken.
          </p>

          <div className="oke-hero__actions oke-hero__reveal">
            <Link className="oke-hero__btn oke-hero__btn--primary" to="/collectie">
              Bekijk collectie
            </Link>
            <Link className="oke-hero__btn oke-hero__btn--secondary" to="/aanvragen">
              Laat iets maken
            </Link>
          </div>
        </div>

        <div className="oke-hero__stage">
          <HeroFigureCarousel />
        </div>
      </div>
    </section>
  )
}

export default Hero
