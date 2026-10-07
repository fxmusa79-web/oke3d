import { Link } from 'react-router-dom'
import type { Product } from '../../data/products'
import { productTitle } from '../../data/productTitles'
import { useI18n } from '../../i18n/useI18n'
import './ProductCard.css'

export function ProductCard({ product }: { product: Product }) {
  const { t, locale } = useI18n()
  const categoryLabel = t.categories[product.category] ?? product.category
  const title = productTitle(product.id, locale, product.title)

  const isBbq = product.category === 'bbq-edition'

  return (
    <article
      className={`oke-card is-${product.kind}${isBbq ? ' is-bbq' : ''}`}
      data-cursor="collectible"
    >
      <Link to={`/product/${product.id}`} className="oke-card__media">
        <img
          src={product.image}
          alt={title}
          width={480}
          height={isBbq ? 480 : 600}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget
            if (img.dataset.fallback === '1') return
            img.dataset.fallback = '1'
            img.src = '/brand/logo-icon.png'
            img.classList.add('is-fallback')
          }}
        />
      </Link>
      <div className="oke-card__body">
        <p className="oke-card__meta">{categoryLabel}</p>
        <h3 className="oke-card__title">
          <Link to={`/product/${product.id}`}>{title}</Link>
        </h3>
        <p className="oke-card__status">{t.featured.requestStatus}</p>
      </div>
    </article>
  )
}
