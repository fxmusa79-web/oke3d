import { Button } from '../ui/Button'
import { assets } from '../../data/assets'
import { useI18n } from '../../i18n/useI18n'
import './HomeHero.css'

export function HomeHero() {
  const { t, locale } = useI18n()
  const { hero } = assets

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero__stage">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">{t.hero.eyebrow}</p>
          <h1 id="home-hero-title" className="home-hero__title">
            <span>{t.hero.titleLine1}</span>{' '}
            <span className="home-hero__title-accent">{t.hero.titleLine2}</span>
          </h1>
          <p className="home-hero__lede">{t.hero.lede}</p>
          <div className="home-hero__actions">
            <Button to="/collectie">{t.hero.primaryCta}</Button>
            <Button to="/aanvragen" variant="secondary">
              {t.hero.secondaryCta}
            </Button>
          </div>
        </div>

        <div className="home-hero__visual">
          <div className="home-hero__frame">
            <img
              src={hero.mintGhost}
              alt={locale === 'nl' ? hero.altNl : hero.altEn}
              width={hero.width}
              height={hero.height}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
