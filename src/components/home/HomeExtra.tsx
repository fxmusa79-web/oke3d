import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Button } from '../ui/Button'
import { assets } from '../../data/assets'
import { fitnessFigures } from '../../data/fitness'
import { useI18n } from '../../i18n/useI18n'
import { HorizontalScroller } from './HorizontalScroller'
import './HomeSections.css'

gsap.registerPlugin(useGSAP)

export function AboutSection() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)

  const cards = [
    {
      id: 'winter-single',
      src: assets.about.winterSingle,
      alt: 'OKE monochrome winter collectible',
    },
    {
      id: 'black-coffee',
      src: assets.about.blackCoffee,
      alt: 'OKE black coffee ghost',
    },
  ]

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const cardsEl = gsap.utils.toArray<HTMLElement>('.home-about__card')
      const cleanups: Array<() => void> = []

      cardsEl.forEach((card) => {
        const enter = () =>
          gsap.to(card, { scale: 1.03, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        const leave = () =>
          gsap.to(card, { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' })
        card.addEventListener('pointerenter', enter)
        card.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          card.removeEventListener('pointerenter', enter)
          card.removeEventListener('pointerleave', leave)
        })
      })

      return () => cleanups.forEach((fn) => fn())
    },
    { scope: rootRef },
  )

  return (
    <section
      ref={rootRef}
      className="home-about"
      id="over-oke3d"
      aria-labelledby="about-title"
    >
      <div className="home-about__grid">
        <div className="home-about__copy">
          <p className="home-section__eyebrow">{t.about.eyebrow}</p>
          <h2 id="about-title" className="home-about__title">
            {t.about.title}
          </h2>
          <p className="home-section__lede">{t.about.lede}</p>
          <div className="home-about__actions">
            <Button to="/collectie">{t.nav.cta}</Button>
          </div>
        </div>

        <div className="home-about__cards">
          {cards.map((card) => (
            <Link
              key={card.id}
              to="/collectie"
              className="home-about__card"
              aria-label={card.alt}
            >
              <img
                src={card.src}
                alt={card.alt}
                width={672}
                height={840}
                loading="lazy"
                decoding="async"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WhatWeMakeVisual() {
  const { t } = useI18n()

  return (
    <section className="home-make" id="wat-we-maken" aria-labelledby="make-title">
      <div className="home-make__intro">
        <p className="home-section__eyebrow">{t.make.eyebrow}</p>
        <h2 id="make-title" className="home-section__title">
          {t.make.title}
        </h2>
        <p className="home-section__lede">{t.make.lede}</p>
      </div>

      <HorizontalScroller
        items={fitnessFigures}
        aria-label={t.make.title}
      />
    </section>
  )
}

export function CustomSection() {
  const { t } = useI18n()
  const cards = [
    {
      id: 'custom-dolls',
      title: t.custom.cards.customDolls.title,
      body: t.custom.cards.customDolls.body,
      image: assets.custom.monochromeCouple,
      to: '/op-maat',
      alt: 'OKE monochrome duo collectibles',
    },
    {
      id: 'request',
      title: t.custom.cards.request.title,
      body: t.custom.cards.request.body,
      image: assets.custom.winterSingle,
      to: '/aanvragen',
      alt: 'OKE winter monochrome collectible',
    },
  ] as const

  return (
    <section className="home-custom" id="op-aanvraag" aria-labelledby="custom-title">
      <div className="home-custom__inner">
        <div className="home-custom__intro">
          <p className="home-section__eyebrow">{t.custom.eyebrow}</p>
          <h2 id="custom-title" className="home-section__title">
            {t.custom.title}
          </h2>
          <p className="home-section__lede">{t.custom.lede}</p>
        </div>

        <div className="home-custom__cards">
          {cards.map((card) => (
            <Link key={card.id} to={card.to} className="home-custom__card">
              <div className="home-custom__card-media">
                <img
                  src={card.image}
                  alt={card.alt}
                  width={960}
                  height={540}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="home-custom__card-body">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="home-custom__actions">
          <Button to="/aanvragen">{t.custom.primaryCta}</Button>
          <Button to="/#proces" variant="secondary">
            {t.custom.secondaryCta}
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ProcessSection() {
  const { t } = useI18n()
  return (
    <section className="home-section" id="proces" aria-labelledby="process-title">
      <div className="home-section__intro">
        <p className="home-section__eyebrow">{t.process.eyebrow}</p>
        <h2 id="process-title" className="home-section__title">
          {t.process.title}
        </h2>
      </div>
      <ol className="home-process__grid">
        {t.process.steps.map((step, i) => (
          <li key={step.title}>
            <span className="home-process__num">0{i + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function EditionsStrip() {
  const { t } = useI18n()
  const editions = [
    { id: 'oke-collection', image: assets.editions.fitness },
    { id: 'monochrome', image: assets.editions.mono },
    { id: 'bbq-edition', image: assets.editions.bbq },
  ] as const

  return (
    <section className="home-section" id="edities" aria-labelledby="editions-title">
      <div className="home-section__intro">
        <p className="home-section__eyebrow">{t.ideas.eyebrow}</p>
        <h2 id="editions-title" className="home-section__title">
          {t.ideas.title}
        </h2>
        <p className="home-section__lede">{t.ideas.lede}</p>
      </div>
      <div className="home-editions__rail">
        {editions.map((ed) => (
          <Link
            key={ed.id}
            to={`/collectie?cat=${ed.id}`}
            className="home-editions__card"
          >
            <img src={ed.image} alt="" loading="lazy" width={400} height={500} />
            <span>{t.categories[ed.id]}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function FinalCta() {
  const { t } = useI18n()
  return (
    <section className="home-final" aria-labelledby="final-title">
      <h2 id="final-title">{t.finalCta.title}</h2>
      <p>{t.finalCta.lede}</p>
      <Button to="/aanvragen">{t.finalCta.cta}</Button>
    </section>
  )
}
