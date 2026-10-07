import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import './AnnouncementBar.css'

const SESSION_KEY = 'oke3d-announce-dismissed'

export function AnnouncementBar() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return
    } catch {
      /* ignore */
    }
    setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="oke-announce" role="region" aria-label={t.announce.message}>
      <p className="oke-announce__text">
        <span>{t.announce.message}</span>
        <Link to="/op-maat" className="oke-announce__cta">
          {t.announce.cta} →
        </Link>
      </p>
      <button
        type="button"
        className="oke-announce__close"
        onClick={dismiss}
        aria-label={t.announce.dismiss}
      >
        ×
      </button>
    </div>
  )
}
