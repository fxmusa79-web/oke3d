import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import 'swiper/css'
import 'swiper/css/pagination'
import './PrintIdeasSection.css'

const IDEAS = [
  {
    id: 'grinder',
    src: '/assets/ideas/grinder.jpg',
    titleNl: 'Grinder',
    titleEn: 'Grinder',
    bodyNl: 'Compacte, stevige onderdelen met zichtbare printlagen.',
    bodyEn: 'Compact, durable parts with visible print layers.',
  },
  {
    id: 'cup',
    src: '/assets/ideas/cup.jpg',
    titleNl: 'Drinkbeker',
    titleEn: 'Drink cup',
    bodyNl: 'Functioneel object met een duidelijk studio-karakter.',
    bodyEn: 'A functional object with clear studio character.',
  },
  {
    id: 'phone-stand',
    src: '/assets/ideas/phone-stand.jpg',
    titleNl: 'Telefoonhouder',
    titleEn: 'Phone stand',
    bodyNl: 'Minimalistische vorm, gemaakt om dagelijks te gebruiken.',
    bodyEn: 'Minimal form, made for everyday use.',
  },
  {
    id: 'keychain',
    src: '/assets/ideas/keychain.jpg',
    titleNl: 'Sleutelhanger',
    titleEn: 'Keychain',
    bodyNl: 'Kleine oplages en personaliseerbare charms.',
    bodyEn: 'Small runs and personalisable charms.',
  },
  {
    id: 'organizer',
    src: '/assets/ideas/organizer.jpg',
    titleNl: 'Desk organizer',
    titleEn: 'Desk organizer',
    bodyNl: 'Praktisch bureau-object met strakke geometrie.',
    bodyEn: 'A practical desk object with clean geometry.',
  },
] as const

function useMobileCarousel(breakpoint = 900) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : true,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [breakpoint])

  return mobile
}

export function PrintIdeasSection() {
  const { t, locale } = useI18n()
  const copy = t.printIdeas
  const isMobile = useMobileCarousel()
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderCard = (idea: (typeof IDEAS)[number]) => (
    <article className="print-ideas__card">
      <div className="print-ideas__media">
        <img
          src={idea.src}
          alt={locale === 'nl' ? idea.titleNl : idea.titleEn}
          width={480}
          height={640}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <h3>{locale === 'nl' ? idea.titleNl : idea.titleEn}</h3>
      <p>{locale === 'nl' ? idea.bodyNl : idea.bodyEn}</p>
    </article>
  )

  return (
    <section className="print-ideas" id="inspiratie" aria-labelledby="print-ideas-title">
      <div className="print-ideas__intro">
        <p className="print-ideas__eyebrow">{copy.eyebrow}</p>
        <h2 id="print-ideas-title" className="print-ideas__title">
          {copy.title}
        </h2>
        <p className="print-ideas__lede">{copy.lede}</p>
      </div>

      {isMobile ? (
        <div className="print-ideas__carousel">
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1.15}
            spaceBetween={14}
            centeredSlides
            loop
            speed={700}
            autoplay={
              reduced
                ? false
                : {
                    delay: 3200,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
            }
            pagination={{ clickable: true }}
            className="print-ideas__swiper"
          >
            {IDEAS.map((idea) => (
              <SwiperSlide key={idea.id}>{renderCard(idea)}</SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <ul className="print-ideas__grid">
          {IDEAS.map((idea) => (
            <li key={idea.id}>{renderCard(idea)}</li>
          ))}
        </ul>
      )}

      <div className="print-ideas__actions">
        <Button to="/aanvragen">{copy.cta}</Button>
        <Link to="/collectie" className="print-ideas__link">
          {copy.secondary} →
        </Link>
      </div>
    </section>
  )
}
