import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import { LanguageSwitch } from './LanguageSwitch'
import './MobileDrawer.css'

type Props = {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: Props) {
  const { t } = useI18n()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const links = [
    { to: '/collectie', label: t.nav.collection },
    { to: '/edities', label: t.nav.editions },
    { to: '/op-maat', label: t.nav.custom },
    { to: '/over', label: t.nav.about },
  ]

  return (
    <div
      className={`oke-drawer ${open ? 'is-open' : ''}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className="oke-drawer__backdrop"
        aria-label={t.nav.closeMenu}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="oke-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.openMenu}
        inert={!open ? true : undefined}
      >
        <div className="oke-drawer__top">
          <LanguageSwitch />
          <button
            type="button"
            className="oke-drawer__close"
            onClick={onClose}
          >
            {t.nav.closeMenu}
          </button>
        </div>
        <nav className="oke-drawer__nav" aria-label="Mobile">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="oke-drawer__link"
              onClick={onClose}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Button to="/collectie" className="oke-drawer__cta" onClick={onClose}>
          {t.nav.cta}
        </Button>
      </aside>
    </div>
  )
}
