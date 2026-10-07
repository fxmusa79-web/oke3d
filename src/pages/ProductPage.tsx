import { useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import {
  getProduct,
  productsInCategory,
} from '../data/products'
import { productTitle } from '../data/productTitles'
import { useI18n } from '../i18n/useI18n'
import { Button } from '../components/ui/Button'
import { ProductCard } from '../components/shop/ProductCard'
import { ProductGallery } from '../components/shop/ProductGallery'
import './ProductPage.css'

gsap.registerPlugin(useGSAP)

export function ProductPage() {
  const { slug = '' } = useParams()
  const { t, locale } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const product = getProduct(slug)

  useGSAP(
    () => {
      if (!product) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      gsap.from('.oke-product__reveal', {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      })
    },
    { scope: rootRef, dependencies: [slug] },
  )

  if (!product) {
    return <Navigate to="/collectie" replace />
  }

  const title = productTitle(product.id, locale, product.title)
  const categoryLabel = t.categories[product.category] ?? product.category
  const description = product.description[locale]
  const related = productsInCategory(product.category, product.id)

  return (
    <article ref={rootRef} className="oke-product">
      <div className="oke-product__layout">
        <div className="oke-product__gallery oke-product__reveal">
          <ProductGallery slides={product.gallery} title={title} />
        </div>

        <aside className="oke-product__info">
          <p className="oke-product__cat oke-product__reveal">{categoryLabel}</p>
          <h1 className="oke-product__title oke-product__reveal">{title}</h1>
          <p className="oke-product__status oke-product__reveal">
            {t.featured.requestStatus}
          </p>
          <p className="oke-product__desc oke-product__reveal">{description}</p>
          <div className="oke-product__actions oke-product__reveal">
            <Button to={`/aanvragen?product=${product.id}`}>
              {t.product.requestCta}
            </Button>
            <Link className="oke-product__back" to="/collectie">
              {t.product.backToCollection}
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="oke-product__related" aria-labelledby="related-title">
          <h2 id="related-title" className="oke-product__related-title">
            {t.product.inEdition}
          </h2>
          <div className="oke-product__related-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
