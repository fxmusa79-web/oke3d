import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { I18nProvider } from './i18n/I18nProvider'
import { SiteShell } from './components/layout/SiteShell'
import { HomePage } from './pages/HomePage'
import { CollectionPage } from './pages/CollectionPage'
import { ProductPage } from './pages/ProductPage'
import { RequestPage } from './pages/RequestPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { BbqEdition } from './components/bbq/BbqEdition'
import './App.css'

function RoutesTree() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="collectie" element={<CollectionPage />} />
        <Route
          path="edities"
          element={<PlaceholderPage titleKey="nav.editions" />}
        />
        <Route path="edities/bbq" element={<BbqEdition />} />
        <Route
          path="op-maat"
          element={<PlaceholderPage titleKey="nav.custom" />}
        />
        <Route path="aanvragen" element={<RequestPage />} />
        <Route
          path="over"
          element={<PlaceholderPage titleKey="nav.about" />}
        />
        <Route
          path="contact"
          element={<PlaceholderPage titleKey="footer.links.contact" />}
        />
        <Route
          path="faq"
          element={<PlaceholderPage titleKey="footer.links.faq" />}
        />
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
