import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { useI18n } from '../i18n/useI18n'
import './InfoPage.css'

export function FaqPage() {
  const { t } = useI18n()
  const f = t.faqPage

  return (
    <>
      <Seo title={f.seoTitle} description={f.seoDescription} path="/faq" />
      <article className="oke-info">
        <header className="oke-info__head">
          <p className="oke-info__eyebrow">{f.eyebrow}</p>
          <h1>{f.title}</h1>
          <p className="oke-info__lede">{f.lede}</p>
        </header>

        <div className="oke-info__faq">
          {f.items.map((item) => (
            <details key={item.q} className="oke-info__details">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="oke-info__actions">
          <Button to="/op-maat">{f.cta}</Button>
          <Button to="/contact" variant="secondary">
            {t.footer.links.contact}
          </Button>
        </div>
      </article>
    </>
  )
}
