import { Outlet } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { FloatActionMenu } from './FloatActionMenu'
import { SmoothScroll } from './SmoothScroll'
import './SiteShell.css'

export function SiteShell() {
  return (
    <SmoothScroll>
      <div className="oke-shell">
        <AnnouncementBar />
        <SiteHeader />
        <main className="oke-shell__main">
          <Outlet />
        </main>
        <SiteFooter />
        <FloatActionMenu />
      </div>
    </SmoothScroll>
  )
}
