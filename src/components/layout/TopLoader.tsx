import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './TopLoader.css'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 140,
  minimum: 0.12,
  easing: 'ease',
  speed: 320,
})

/** Thin top progress bar on client-side navigations. */
export function TopLoader() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    NProgress.start()
    const done = window.setTimeout(() => NProgress.done(), 360)
    return () => {
      window.clearTimeout(done)
      NProgress.done()
    }
  }, [pathname, search])

  return null
}
