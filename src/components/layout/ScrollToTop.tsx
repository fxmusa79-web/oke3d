import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset scroll on every client-side route change (works with Lenis). */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const lenis = window.__okeLenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [pathname, search])

  return null
}
