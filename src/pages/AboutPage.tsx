import { Link } from 'react-router-dom'
import { FloatingOke3dMark } from '../components/brand/FloatingOke3dMark'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { assets } from '../data/assets'
import { useI18n } from '../i18n/useI18n'
import './AboutPage.css'

export function AboutPage() {
  const { t, locale } = useI18n()
  const a = t.aboutPage

  return (
    <>
      <Seo
        title={a.seoTitle}
        description={a.seoDescription}
        path="/over"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: a.seoTitle,
          description: a.seoDescription,
          url: 'https://oke3d.nl/over',
          mainEntity: {
            '@type': 'Organization',
            name: 'OKE3D',
            url: 'https://oke3d.nl',
            description: a.seoDescription,
          },
        }}
      />
      <article className="oke-about-page">
        <header className="oke-about-page__hero">
          <p className="oke-about-page__eyebrow">{a.eyebrow}</p>
          <h1>{a.title}</h1>
          <p className="oke-about-page__lede">{a.lede}</p>
          <FloatingOke3dMark />
        </header>

        <section className="oke-about-page__block">
          <h2>{a.craftTitle}</h2>
          <p>{a.craftBody}</p>
          <p>{a.craftBody2}</p>
        </section>

        <section className="oke-about-page__split">
          <div>
            <h2>{a.studioTitle}</h2>
            <p>{a.studioBody}</p>
            <ul className="oke-about-page__list">
              {a.studioPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <figure className="oke-about-page__figure">
            <img
              src={assets.about.winterSingle}
              alt={locale === 'nl' ? 'OKE3D monochrome collectible' : 'OKE3D monochrome collectible'}
              width={640}
              height={800}
              loading="lazy"
            />
          </figure>
        </section>

        <section className="oke-about-page__block oke-about-page__block--links">
          <h2>{a.exploreTitle}</h2>
          <p>{a.exploreBody}</p>
          <div className="oke-about-page__actions">
            <Button to="/collectie">{t.nav.collection}</Button>
            <Button to="/edities" variant="secondary">
              {t.nav.editions}
            </Button>
            <Link to="/accessoires" className="oke-about-page__text-link">
              {t.nav.accessories} →
            </Link>
            <Link to="/aanvragen" className="oke-about-page__text-link">
              {t.nav.request} →
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
