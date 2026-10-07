import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useI18n } from '../../i18n/useI18n'
import { MOTION } from '../../lib/animations/motion'
import './FloatActionMenu.css'

export function FloatActionMenu() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const root = itemsRef.current
    if (!root || !open) return

    const items = root.querySelectorAll<HTMLElement>('.oke-fab__item')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(items, { clearProps: 'all', opacity: 1, y: 0 })
      return
    }

    gsap.fromTo(
      items,
      { opacity: 0, y: 14, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: MOTION.small,
        stagger: 0.07,
        ease: MOTION.ease.out,
        overwrite: true,
      },
    )
  }, [open])

  if (hideOn) return null

  const menu = t.floatMenu
  if (!menu) return null

  const links = [
    {
      to: '/collectie',
      title: menu.collection,
      sub: menu.collectionSub,
      icon: <GridIcon />,
    },
    {
      to: '/aanvragen',
      title: menu.design,
      sub: menu.designSub,
      icon: <UploadIcon />,
    },
    {
      to: '/contact',
      title: menu.contact,
      sub: menu.contactSub,
      icon: <MailIcon />,
    },
  ] as const

  return (
    <div
      ref={rootRef}
      className={`oke-fab ${open ? 'is-open' : ''}`}
      role="region"
      aria-label={menu.label}
    >
      <div
        ref={itemsRef}
        className="oke-fab__menu"
        id={menuId}
        hidden={!open}
        role="menu"
      >
        {links.map((item) => (
          <Link
            key={item.to}
            className="oke-fab__item"
            role="menuitem"
            to={item.to}
            onClick={() => setOpen(false)}
          >
            <span className="oke-fab__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="oke-fab__text">
              <span className="oke-fab__title">{item.title}</span>
              <span className="oke-fab__sub">{item.sub}</span>
            </span>
          </Link>
        ))}
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

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 16V5M12 5l-4 4M12 5l4 4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
