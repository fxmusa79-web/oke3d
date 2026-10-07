import { Outlet } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { StickyMobileCta } from './StickyMobileCta'
import './SiteShell.css'

export function SiteShell() {
  return (
    <div className="oke-shell">
      <AnnouncementBar />
      <SiteHeader />
      <main className="oke-shell__main">
        <Outlet />
      </main>
      <SiteFooter />
      <StickyMobileCta />
    </div>
  )
}
