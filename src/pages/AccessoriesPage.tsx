import { Link } from 'react-router-dom'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { accessories } from '../data/accessories'
import { useI18n } from '../i18n/useI18n'
import './CatalogBrowse.css'

export function AccessoriesPage() {
  const { t, locale } = useI18n()
  const copy = t.accessoriesPage

  return (
    <>
      <Seo title={copy.seoTitle} description={copy.seoDescription} path="/accessoires" />
      <section className="oke-browse">
        <header className="oke-browse__head">
          <p className="oke-browse__eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="oke-browse__lede">{copy.lede}</p>
        </header>

        <ul className="oke-browse__grid">
          {accessories.map((item) => (
            <li key={item.id} className="oke-browse__card">
              <div className="oke-browse__media">
                <img
                  src={item.image}
                  alt={locale === 'nl' ? item.title.nl : item.title.en}
                  width={480}
                  height={600}
                  loading="lazy"
                />
              </div>
              <p className="oke-browse__tag">
                {locale === 'nl' ? item.tag.nl : item.tag.en}
              </p>
              <h2>{locale === 'nl' ? item.title.nl : item.title.en}</h2>
              <p>{locale === 'nl' ? item.body.nl : item.body.en}</p>
            </li>
          ))}
        </ul>

        <div className="oke-browse__footer">
          <p>{copy.ctaLede}</p>
          <div className="oke-browse__actions">
            <Button to="/aanvragen">{copy.cta}</Button>
            <Link to="/collectie" className="oke-browse__link">
              {t.nav.collection} →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
