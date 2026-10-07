import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  categories,
  darkProducts,
  type ProductCategory,
} from '../data/products'
import { useI18n } from '../i18n/useI18n'
import { ProductCard } from '../components/shop/ProductCard'
import { Seo } from '../components/seo/Seo'
import { Button } from '../components/ui/Button'
import './CollectionPage.css'

const DARK_CATS = new Set<ProductCategory | 'all'>([
  'all',
  'oke-collection',
  'monochrome',
  'bbq-edition',
])

export function CollectionPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const active = (params.get('cat') ?? 'all') as ProductCategory | 'all'
  const copy = t.collectionPage

  const filtered = useMemo(() => {
    const dark = darkProducts()
    const list =
      active === 'all' ? dark : dark.filter((p) => p.category === active)
    return list.filter((p) => !p.tags.includes('feet-only'))
  }, [active])

  const visibleCats = categories.filter((cat) => DARK_CATS.has(cat.id))

  const setCat = (id: ProductCategory | 'all') => {
    if (id === 'all') {
      setParams({})
      return
    }
    setParams({ cat: id })
  }

  return (
    <>
      <Seo title={copy.seoTitle} description={copy.seoDescription} path="/collectie" />
      <section className="oke-collection">
        <header className="oke-collection__head">
          <h1>{t.collection.title}</h1>
          <p className="home-section__lede">{t.collection.lede}</p>
          <p className="oke-collection__body">{copy.body}</p>
          <p className="oke-collection__note">{copy.craftNote}</p>
        </header>

        <div
          className="oke-collection__filters"
          role="toolbar"
          aria-label={t.collection.filterLabel}
        >
          {visibleCats.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`oke-collection__chip ${active === cat.id ? 'is-active' : ''}`}
              onClick={() => setCat(cat.id)}
              aria-pressed={active === cat.id}
            >
              {t.categories[cat.id] ?? cat.label}
            </button>
          ))}
        </div>

        <div className="oke-collection__grid">
          {filtered.length === 0 ? (
            <p className="oke-collection__empty">{t.collection.empty}</p>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        <aside className="oke-collection__related">
          <h2>{copy.related}</h2>
          <div className="oke-collection__related-actions">
            <Button to="/edities" variant="secondary">
              {t.nav.editions}
            </Button>
            <Link to="/accessoires">{t.nav.accessories} →</Link>
            <Link to="/aanvragen">{t.nav.request} →</Link>
          </div>
        </aside>
      </section>
    </>
  )
}
