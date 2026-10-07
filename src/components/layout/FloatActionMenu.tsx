import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { siteContact } from '../../data/contact'
import { useI18n } from '../../i18n/useI18n'
import './FloatActionMenu.css'

export function FloatActionMenu() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const hideOn =
    pathname.startsWith('/aanvragen') || pathname.startsWith('/op-maat')

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('touchstart', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('touchstart', onPointer)
    }
  }, [open])

  if (hideOn) return null

  const menu = t.floatMenu
  if (!menu) return null

  const phone = siteContact.phone.trim()
  const phoneHref = phone ? `tel:${phone}` : '/contact'
  const phoneLabel = phone
    ? siteContact.phoneDisplay || phone
    : menu.contact

  return (
    <div
      ref={rootRef}
      className={`oke-fab ${open ? 'is-open' : ''}`}
      role="region"
      aria-label={menu.label}
    >
      <div
        className="oke-fab__menu"
        id={menuId}
        hidden={!open}
        role="menu"
      >
        {phone ? (
          <a className="oke-fab__item" role="menuitem" href={phoneHref}>
            <span className="oke-fab__icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            <span className="oke-fab__text">
                <span className="oke-fab__title">{menu.call}</span>
                <span className="oke-fab__sub">{phoneLabel}</span>
              </span>
            </a>
        ) : (
          <Link
            className="oke-fab__item"
            role="menuitem"
            to="/contact"
            onClick={() => setOpen(false)}
          >
            <span className="oke-fab__icon" aria-hidden="true">
              <PhoneIcon />
            </span>
            <span className="oke-fab__text">
              <span className="oke-fab__title">{menu.call}</span>
              <span className="oke-fab__sub">{menu.contact}</span>
            </span>
          </Link>
        )}

        <Link
          className="oke-fab__item"
          role="menuitem"
          to="/aanvragen"
          onClick={() => setOpen(false)}
        >
          <span className="oke-fab__icon" aria-hidden="true">
            <DesignIcon />
          </span>
          <span className="oke-fab__text">
            <span className="oke-fab__title">{menu.design}</span>
            <span className="oke-fab__sub">{menu.designSub}</span>
          </span>
        </Link>

        <Link
          className="oke-fab__item"
          role="menuitem"
          to="/collectie"
          onClick={() => setOpen(false)}
        >
          <span className="oke-fab__icon" aria-hidden="true">
            <GridIcon />
          </span>
          <span className="oke-fab__text">
            <span className="oke-fab__title">{menu.collection}</span>
            <span className="oke-fab__sub">{menu.collectionSub}</span>
          </span>
        </Link>
      </div>

      <button
        type="button"
        className="oke-fab__trigger"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? menu.close : menu.open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="oke-fab__trigger-icon" aria-hidden="true">
          {open ? <CloseIcon /> : <PlusIcon />}
        </span>
      </button>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2A15 15 0 0 1 4.5 7.5c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DesignIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20l4.5-1.2L19 8.3a2.1 2.1 0 0 0-3-3L5.5 15.8 4 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
