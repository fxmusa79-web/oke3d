import { useMemo } from 'react'
import { Hero } from '../components/Hero'
import { CustomDesignSection } from '../components/custom/CustomDesignSection'
import { FeaturedProducts } from '../components/home/FeaturedProducts'
import { AboutSection, FinalCta } from '../components/home/HomeExtra'
import { ProcessTimeline } from '../components/home/ProcessTimeline'
import { PrintIdeasSection } from '../components/home/PrintIdeasSection'
import { Reveal } from '../components/ui/Reveal'
import { Seo } from '../components/seo/Seo'
import { useI18n } from '../i18n/useI18n'
import './HomePage.css'

/**
 * Home: Hero → custom → about → ideas → process → featured → CTA
 * Heavy galleries live on /collectie and /edities
 */
export function HomePage() {
  const { t, locale } = useI18n()

  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'OKE3D',
        url: 'https://oke3d.nl',
        logo: 'https://oke3d.nl/brand/logo.png',
        description: t.meta.description,
        areaServed: 'NL',
        sameAs: [],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'OKE3D',
        url: 'https://oke3d.nl',
        inLanguage: locale === 'nl' ? 'nl-NL' : 'en-GB',
        description: t.meta.description,
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://oke3d.nl/collectie',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
    [t.meta.description, locale],
  )

  return (
    <>
      <Seo path="/" jsonLd={jsonLd} />
      <Hero />
      <CustomDesignSection />
      <AboutSection />
      <Reveal>
        <PrintIdeasSection />
      </Reveal>
      <ProcessTimeline />
      <Reveal>
        <FeaturedProducts />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
    </>
  )
}
