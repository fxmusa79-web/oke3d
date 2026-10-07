import { Link } from 'react-router-dom'
import { assets } from '../data/assets'
import { useI18n } from '../i18n/useI18n'
import { Button } from '../components/ui/Button'
import './PlaceholderPage.css'
import './EditionsPage.css'

/** Editions hub — images live here instead of crowding the home. */
export function EditionsPage() {
  const { t } = useI18n()

  const editions = [
    {
      id: 'oke',
      title: t.categories['oke-collection'],
      image: assets.editions.fitness,
      to: '/collectie?cat=oke-collection',
    },
    {
      id: 'mono',
      title: t.categories.monochrome,
      image: assets.editions.mono,
      to: '/collectie?cat=monochrome',
    },
    {
      id: 'bbq',
      title: t.categories['bbq-edition'],
      image: assets.editions.bbq,
      to: '/edities/bbq',
    },
  ] as const

  return (
    <section className="oke-editions-page">
      <header className="oke-editions-page__intro">
        <p className="oke-editions-page__eyebrow">{t.ideas.eyebrow}</p>
        <h1>{t.nav.editions}</h1>
        <p className="oke-editions-page__lede">{t.ideas.lede}</p>
      </header>

      <div className="oke-editions-page__grid">
        {editions.map((ed) => (
          <Link key={ed.id} to={ed.to} className="oke-editions-page__card">
            <img src={ed.image} alt="" width={480} height={600} loading="lazy" />
            <span>{ed.title}</span>
          </Link>
        ))}
      </div>

      <div className="oke-editions-page__actions">
        <Button to="/collectie">{t.nav.cta}</Button>
      </div>
    </section>
  )
}
