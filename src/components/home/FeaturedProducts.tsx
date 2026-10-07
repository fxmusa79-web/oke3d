import { Link } from 'react-router-dom'
import { featuredProducts } from '../../data/products'
import { useI18n } from '../../i18n/useI18n'
import { ProductCard } from '../shop/ProductCard'
import './HomeSections.css'

export function FeaturedProducts() {
  const { t } = useI18n()
  const items = featuredProducts(4)

  return (
    <section className="home-section" id="collectie" aria-labelledby="featured-title">
      <div className="home-section__intro home-section__intro--row">
        <div>
          <p className="home-section__eyebrow">{t.featured.eyebrow}</p>
          <h2 id="featured-title" className="home-section__title">
            {t.featured.title}
          </h2>
          <p className="home-section__lede">{t.featured.lede}</p>
        </div>
        <Link to="/collectie" className="home-section__link">
          {t.featured.viewAll} →
        </Link>
      </div>

      <div className="home-featured__rail" role="list">
        {items.map((product) => (
          <div key={product.id} className="home-featured__slide" role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
