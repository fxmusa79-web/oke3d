import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nProvider'
import { SiteShell } from './components/layout/SiteShell'
import { HomePage } from './pages/HomePage'
import { CollectionPage } from './pages/CollectionPage'
import { ProductPage } from './pages/ProductPage'
import { RequestPage } from './pages/RequestPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { EditionsPage } from './pages/EditionsPage'
import { BbqEdition } from './components/bbq/BbqEdition'
import { AdminPage } from './pages/AdminPage'
import { AboutPage } from './pages/AboutPage'
import { AccessoriesPage } from './pages/AccessoriesPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { CustomOnDemandPage } from './pages/CustomOnDemandPage'
import { ContactPage } from './pages/ContactPage'
import { FaqPage } from './pages/FaqPage'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { TopLoader } from './components/layout/TopLoader'
import { NoiseOverlay } from './components/layout/NoiseOverlay'
import './App.css'

function RoutesTree() {
  return (
    <>
      <NoiseOverlay />
      <ScrollToTop />
      <TopLoader />
      <Routes>
      <Route path="scotdejews" element={<AdminPage />} />
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="collectie" element={<CollectionPage />} />
        <Route path="edities" element={<EditionsPage />} />
        <Route path="edities/bbq" element={<BbqEdition />} />
        <Route path="accessoires" element={<AccessoriesPage />} />
        <Route path="materialen" element={<MaterialsPage />} />
        <Route path="op-maat" element={<CustomOnDemandPage />} />
        <Route path="aanvragen" element={<RequestPage />} />
        <Route path="over" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route
          path="privacy"
          element={<PlaceholderPage titleKey="footer.links.privacy" />}
        />
        <Route
          path="voorwaarden"
          element={<PlaceholderPage titleKey="footer.links.terms" />}
        />
        <Route path="product/:slug" element={<ProductPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <RoutesTree />
      </BrowserRouter>
    </I18nProvider>
  )
}
