import { Link } from 'react-router-dom'
import { brandIcon } from '../../data/products'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitch } from './LanguageSwitch'
import './SiteFooter.css'

export function SiteFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="oke-footer">
      <div className="oke-footer__grid">
        <div className="oke-footer__brand">
          <Link to="/" className="oke-footer__logo">
            <img src={brandIcon} alt="" width={32} height={32} />
            <span>
              OKE<span>3D</span>.nl
            </span>
          </Link>
          <p>{t.footer.blurb}</p>
        </div>

        <div>
          <p className="oke-footer__heading">{t.footer.collection}</p>
          <ul>
            <li>
              <Link to="/collectie">{t.footer.links.collection}</Link>
            </li>
            <li>
              <Link to="/edities">{t.footer.links.editions}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="oke-footer__heading">{t.footer.custom}</p>
          <ul>
            <li>
              <Link to="/op-maat">{t.footer.links.custom}</Link>
            </li>
            <li>
              <Link to="/aanvragen">{t.footer.links.request}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="oke-footer__heading">{t.footer.info}</p>
          <ul>
            <li>
              <Link to="/over">{t.footer.links.about}</Link>
            </li>
            <li>
              <Link to="/faq">{t.footer.links.faq}</Link>
            </li>
            <li>
              <Link to="/contact">{t.footer.links.contact}</Link>
            </li>
            <li>
              <Link to="/privacy">{t.footer.links.privacy}</Link>
            </li>
            <li>
              <Link to="/voorwaarden">{t.footer.links.terms}</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="oke-footer__heading">{t.footer.language}</p>
          <LanguageSwitch />
        </div>
      </div>

      <div className="oke-footer__bottom">
        <p>
          © {year} OKE3D.nl · {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}
