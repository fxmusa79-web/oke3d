import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { primaryNav } from '../../data/navLinks'
import { brandIcon } from '../../data/products'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileDrawer } from './MobileDrawer'
import './SiteHeader.css'

export function SiteHeader() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = primaryNav.map((item) => ({
    to: item.to,
    label: t.nav[item.labelKey],
  }))

  return (
    <>
      <header className={`oke-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="oke-header__inner">
          <Link to="/" className="oke-header__brand" aria-label="OKE3D home">
            <img
              src={brandIcon}
              alt=""
              className="oke-header__icon"
              width={36}
              height={36}
            />
            <span className="oke-header__wordmark">
              OKE<span className="oke-header__accent">3D</span>
              <span className="oke-header__tld">.nl</span>
            </span>
          </Link>

          <nav className="oke-header__nav" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `oke-header__link${isActive ? ' is-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="oke-header__right">
            <LanguageSwitch />
            <Button to="/collectie" size="sm" className="oke-header__cta">
              {t.nav.cta}
            </Button>
            <Link
              to="/collectie"
              className="oke-header__cta-icon"
              aria-label={t.nav.cta}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10.5" y="1" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Link>
            <button
              type="button"
              className="oke-header__burger"
              aria-label={t.nav.openMenu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
