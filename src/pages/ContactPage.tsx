import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import { siteContact } from '../data/contact'
import { useI18n } from '../i18n/useI18n'
import './InfoPage.css'

export function ContactPage() {
  const { t } = useI18n()
  const c = t.contactPage

  return (
    <>
      <Seo title={c.seoTitle} description={c.seoDescription} path="/contact" />
      <article className="oke-info">
        <header className="oke-info__head">
          <p className="oke-info__eyebrow">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className="oke-info__lede">{c.lede}</p>
        </header>

        <div className="oke-info__grid">
          <div className="oke-info__block">
            <h2>{c.emailLabel}</h2>
            <a className="oke-info__link" href={`mailto:${siteContact.email}`}>
              {siteContact.email}
            </a>
            <p>{c.emailBody}</p>
          </div>
          <div className="oke-info__block">
            <h2>{c.studioLabel}</h2>
            <p>{c.studioBody}</p>
          </div>
        </div>

        <div className="oke-info__actions">
          <Button to="/op-maat">{c.ctaCustom}</Button>
          <Button to="/aanvragen" variant="secondary">
            {c.ctaRequest}
          </Button>
        </div>
      </article>
    </>
  )
}
