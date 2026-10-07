import { Link } from 'react-router-dom'
import { assets } from '../data/assets'
import { useI18n } from '../i18n/useI18n'
import { Button } from '../components/ui/Button'
import { Seo } from '../components/seo/Seo'
import './EditionsPage.css'

/** Editions hub — images live here instead of crowding the home. */
export function EditionsPage() {
  const { t, locale } = useI18n()
  const copy = t.editionsPage

  const editions = [
    {
      id: 'oke',
      title: t.categories['oke-collection'],
      blurb:
        locale === 'nl'
          ? 'Signature black fitness & streetwear figuren.'
          : 'Signature black fitness & streetwear figures.',
      image: assets.editions.fitness,
      to: '/collectie?cat=oke-collection',
    },
    {
      id: 'mono',
      title: t.categories.monochrome,
      blurb:
        locale === 'nl'
          ? 'Winter silhouettes, duo’s en monochrome studio shots.'
          : 'Winter silhouettes, duos and monochrome studio shots.',
      image: assets.editions.mono,
      to: '/collectie?cat=monochrome',
    },
    {
      id: 'bbq',
      title: t.categories['bbq-edition'],
      blurb:
        locale === 'nl'
          ? 'Grillmasters, modules en exploded craft builds.'
          : 'Grillmasters, modules and exploded craft builds.',
      image: assets.editions.bbq,
      to: '/edities/bbq',
    },
  ] as const

  return (
    <>
      <Seo title={copy.seoTitle} description={copy.seoDescription} path="/edities" />
      <section className="oke-editions-page">
        <header className="oke-editions-page__intro">
          <p className="oke-editions-page__eyebrow">{t.ideas.eyebrow}</p>
          <h1>{t.nav.editions}</h1>
          <p className="oke-editions-page__lede">{t.ideas.lede}</p>
          <p className="oke-editions-page__body">{copy.body}</p>
          <p className="oke-editions-page__body">{copy.body2}</p>
        </header>

        <div className="oke-editions-page__grid">
          {editions.map((ed) => (
            <Link key={ed.id} to={ed.to} className="oke-editions-page__card">
              <img src={ed.image} alt="" width={480} height={600} loading="lazy" />
              <span>{ed.title}</span>
              <p>{ed.blurb}</p>
            </Link>
          ))}
        </div>

        <p className="oke-editions-page__note">{copy.craftNote}</p>

        <div className="oke-editions-page__actions">
          <Button to="/collectie">{t.nav.cta}</Button>
          <Button to="/accessoires" variant="secondary">
            {t.nav.accessories}
          </Button>
          <Link to="/over" className="oke-editions-page__text-link">
            {t.nav.about} →
          </Link>
        </div>
      </section>
    </>
  )
}
