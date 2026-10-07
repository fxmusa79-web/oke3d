import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { brandIcon } from '../../data/products'
import { useI18n } from '../../i18n/useI18n'
import { LanguageSwitch } from './LanguageSwitch'
import './SiteFooter.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function SiteFooter() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)
  const markRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const footer = footerRef.current
      const mark = markRef.current
      if (!footer || !mark) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      gsap.fromTo(
        mark,
        { xPercent: -8 },
        {
          xPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )
    },
    { scope: footerRef },
  )

  return (
    <footer ref={footerRef} className="oke-footer">
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
            <li>
              <Link to="/accessoires">{t.footer.links.accessories}</Link>
            </li>
            <li>
              <Link to="/materialen">{t.footer.links.materials}</Link>
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
            <li>
              <Link to="/over">{t.footer.links.about}</Link>
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

      <div className="oke-footer__mark-wrap" aria-hidden="true">
        <p ref={markRef} className="oke-footer__mark">
          OKE<span>3D</span>
        </p>
      </div>
    </footer>
  )
}
