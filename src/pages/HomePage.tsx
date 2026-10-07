import { lazy, Suspense } from 'react'
import { Hero } from '../components/Hero'
import { CustomDesignSection } from '../components/custom/CustomDesignSection'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import {
  AboutSection,
  CustomSection,
  EditionsStrip,
  FinalCta,
  ProcessSection,
  WhatWeMakeVisual,
} from '../components/home/HomeExtra'
import { Reveal } from '../components/ui/Reveal'
import { useI18n } from '../i18n/useI18n'
import './HomePage.css'

const BbqEdition = lazy(() =>
  import('../components/bbq/BbqEdition').then((m) => ({ default: m.BbqEdition })),
)

export function HomePage() {
  const { t } = useI18n()

  return (
    <>
      <Hero />
      <CustomDesignSection />
      <AboutSection />
      <WhatWeMakeVisual />
      <Reveal>
        <FeaturedProducts />
      </Reveal>

      <section className="home-edition-wrap" aria-label={t.edition.title}>
        <Suspense fallback={<div className="home-edition-wrap__fallback" />}>
          <BbqEdition />
        </Suspense>
      </section>

      <Reveal>
        <CustomSection />
      </Reveal>
      <Reveal>
        <ProcessSection />
      </Reveal>
      <Reveal>
        <EditionsStrip />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
    </>
  )
}
