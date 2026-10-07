import { Link } from 'react-router-dom'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n/useI18n'
import './CatalogBrowse.css'

const SWATCHES = [
  { id: 'pla-black', hex: '#111111', nameNl: 'PLA Black', nameEn: 'PLA Black' },
  { id: 'pla-white', hex: '#f4f1ea', nameNl: 'PLA Off-white', nameEn: 'PLA Off-white' },
  { id: 'petg-blue', hex: '#1570d8', nameNl: 'PETG Accent Blue', nameEn: 'PETG Accent Blue' },
  { id: 'pla-charcoal', hex: '#2a2e33', nameNl: 'PLA Charcoal', nameEn: 'PLA Charcoal' },
  { id: 'abs-grey', hex: '#6b7280', nameNl: 'ABS Grey', nameEn: 'ABS Grey' },
  { id: 'tpu-soft', hex: '#3d4450', nameNl: 'TPU Soft', nameEn: 'TPU Soft' },
] as const

export function MaterialsPage() {
  const { t, locale } = useI18n()
  const copy = t.materialsPage

  return (
    <>
      <Seo title={copy.seoTitle} description={copy.seoDescription} path="/materialen" />
      <section className="oke-browse">
        <header className="oke-browse__head">
          <p className="oke-browse__eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="oke-browse__lede">{copy.lede}</p>
        </header>

        <div className="oke-browse__prose">
          <p>{copy.body}</p>
          <p>{copy.body2}</p>
        </div>

        <ul className="oke-browse__swatches" aria-label={copy.swatchLabel}>
          {SWATCHES.map((s) => (
            <li key={s.id} className="oke-browse__swatch">
              <span className="oke-browse__chip" style={{ background: s.hex }} />
              <strong>{locale === 'nl' ? s.nameNl : s.nameEn}</strong>
            </li>
          ))}
        </ul>

        <div className="oke-browse__footer">
          <p>{copy.ctaLede}</p>
          <div className="oke-browse__actions">
            <Button to="/aanvragen">{copy.cta}</Button>
            <Link to="/over" className="oke-browse__link">
              {t.nav.about} →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
