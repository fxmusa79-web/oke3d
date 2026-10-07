import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import type { Dictionary } from '../i18n/types'
import './PlaceholderPage.css'

type TitleKey =
  | 'nav.editions'
  | 'nav.custom'
  | 'nav.about'
  | 'footer.links.request'
  | 'footer.links.contact'
  | 'footer.links.faq'
  | 'footer.links.privacy'
  | 'footer.links.terms'
  | 'featured.title'

type Props = {
  titleKey: TitleKey
  body?: string
}

function resolveTitle(t: Dictionary, key: TitleKey): string {
  switch (key) {
    case 'nav.editions':
      return t.nav.editions
    case 'nav.custom':
      return t.nav.custom
    case 'nav.about':
      return t.nav.about
    case 'footer.links.request':
      return t.footer.links.request
    case 'footer.links.contact':
      return t.footer.links.contact
    case 'footer.links.faq':
      return t.footer.links.faq
    case 'footer.links.privacy':
      return t.footer.links.privacy
    case 'footer.links.terms':
      return t.footer.links.terms
    case 'featured.title':
      return t.featured.title
  }
}

export function PlaceholderPage({ titleKey, body }: Props) {
  const { t } = useI18n()
  return (
    <section className="oke-placeholder">
      <p className="oke-placeholder__eyebrow">OKE3D</p>
      <h1>{resolveTitle(t, titleKey)}</h1>
      <p>{body ?? t.placeholder.body}</p>
      <div className="oke-placeholder__actions">
        <Link to="/collectie">{t.nav.cta}</Link>
        <Link to="/aanvragen">{t.custom.primaryCta}</Link>
      </div>
    </section>
  )
}
