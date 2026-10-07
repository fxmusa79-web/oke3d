import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import './StickyMobileCta.css'

export function StickyMobileCta() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  const hideOn =
    pathname.startsWith('/aanvragen') || pathname.startsWith('/op-maat')

  useEffect(() => {
    if (hideOn) {
      setVisible(false)
      return
    }
    const onScroll = () => setVisible(window.scrollY > 420)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hideOn])

  if (hideOn || !visible) return null

  return (
    <div className="oke-sticky-cta" role="region" aria-label={t.stickyCta.label}>
      <Button to="/aanvragen" size="sm">
        {t.stickyCta.label}
      </Button>
    </div>
  )
}
