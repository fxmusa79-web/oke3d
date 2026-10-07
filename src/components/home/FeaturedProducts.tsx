import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { featuredProducts, type Product } from '../../data/products'
import { productTitle } from '../../data/productTitles'
import { useI18n } from '../../i18n/useI18n'
import './FeaturedProducts.css'

const MARQUEE = 'NEW DROP // OKE3D STUDIO // SMALL BATCH'
const MAX_TILT = 15

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

function MarqueeBar() {
  const reduced = useReducedMotion()
  const chunk = `${MARQUEE}  ·  `
  return (
    <div className="feat-marquee" aria-hidden="true">
      <div className={`feat-marquee__track${reduced ? ' is-static' : ''}`}>
        <span>{chunk.repeat(8)}</span>
        <span>{chunk.repeat(8)}</span>
      </div>
    </div>
  )
}

function TiltCard({
  product,
  badge,
  index,
}: {
  product: Product
  badge: 'sold' | 'edition'
  index: number
}) {
  const { t, locale } = useI18n()
  const reduced = useReducedMotion()
  const title = productTitle(product.id, locale, product.title)
  const categoryLabel = t.categories[product.category] ?? product.category

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sRx = useSpring(rx, { stiffness: 220, damping: 20 })
  const sRy = useSpring(ry, { stiffness: 220, damping: 20 })
  const glareX = useTransform(sRy, [-MAX_TILT, MAX_TILT], [20, 80])
  const glareY = useTransform(sRx, [-MAX_TILT, MAX_TILT], [80, 20])
  const glareBg = useTransform([glareX, glareY], ([gx, gy]) => {
    return `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.28), transparent 55%)`
  })

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    ry.set((px - 0.5) * 2 * MAX_TILT)
    rx.set((0.5 - py) * 2 * MAX_TILT)
  }

  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.article
      className="feat-card"
      data-cursor="collectible"
      style={{
        rotateX: reduced ? 0 : sRx,
        rotateY: reduced ? 0 : sRy,
        transformPerspective: 900,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className={`feat-card__badge feat-card__badge--${badge}`}>
        {badge === 'sold' ? 'Sold out' : 'Edition of 50'}
      </span>

      <Link to={`/product/${product.id}`} className="feat-card__media">
        <motion.img
          src={product.image}
          alt={title}
          width={480}
          height={600}
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          whileHover={reduced ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          draggable={false}
        />
        <motion.span className="feat-card__glare" style={{ background: glareBg }} aria-hidden="true" />
      </Link>

      <div className="feat-card__body">
        <p className="feat-card__meta">{categoryLabel}</p>
        <h3 className="feat-card__title">
          <Link to={`/product/${product.id}`}>{title}</Link>
        </h3>
        <p className="feat-card__status">{t.featured.requestStatus}</p>
      </div>
    </motion.article>
  )
}

export function FeaturedProducts() {
  const { t } = useI18n()
  const items = featuredProducts(8)
  const reduced = useReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragLeft, setDragLeft] = useState(0)
  const x = useMotionValue(0)

  useEffect(() => {
    const measure = () => {
      const view = viewportRef.current
      const track = trackRef.current
      if (!view || !track) return
      const max = Math.max(0, track.scrollWidth - view.clientWidth)
      setDragLeft(-max)
      if (x.get() < -max) x.set(-max)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (viewportRef.current) ro.observe(viewportRef.current)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [items.length, x])

  return (
    <section className="feat-section" id="collectie" aria-labelledby="featured-title">
      <MarqueeBar />

      <div className="feat-section__inner">
        <div className="feat-section__intro">
          <div>
            <p className="feat-section__eyebrow">{t.featured.eyebrow}</p>
            <h2 id="featured-title" className="feat-section__title">
              {t.featured.title}
            </h2>
            <p className="feat-section__lede">{t.featured.lede}</p>
          </div>
          <Link to="/collectie" className="feat-section__link">
            {t.featured.viewAll} →
          </Link>
        </div>

        <div ref={viewportRef} className="feat-carousel">
          <motion.div
            ref={trackRef}
            className="feat-carousel__track"
            style={{ x }}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: dragLeft, right: 0 }}
            dragElastic={0.08}
            dragTransition={{ bounceStiffness: 220, bounceDamping: 28 }}
            role="list"
          >
            {items.map((product, i) => (
              <div key={product.id} className="feat-carousel__slide" role="listitem">
                <TiltCard
                  product={product}
                  badge={i % 3 === 0 ? 'sold' : 'edition'}
                  index={i}
                />
              </div>
            ))}
          </motion.div>
        </div>

        <p className="feat-section__hint" aria-hidden="true">
          ← drag →
        </p>
      </div>
    </section>
  )
}
