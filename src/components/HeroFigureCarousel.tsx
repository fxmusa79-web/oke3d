import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import './HeroFigureCarousel.css'

gsap.registerPlugin(useGSAP)

/** Dark-only whitelist figures for hero carousel. */
const FIGURES = [
  {
    id: 'black-fitness-kettlebell',
    src: '/assets/dark/black-fitness-kettlebell.png',
    alt: 'OKE black fitness kettlebell',
  },
  {
    id: 'winter-single',
    src: '/assets/dark/winter-single.png',
    alt: 'OKE monochrome winter collectible',
  },
  {
    id: 'bbq-apron',
    src: '/assets/dark/bbq-apron.png',
    alt: 'OKE BBQ apron edition',
  },
] as const

export function HeroFigureCarousel() {
  const rootRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  const animateSlideIn = (slideEl: HTMLElement | null) => {
    if (!slideEl) return
    const figure = slideEl.querySelector<HTMLElement>('.hero-figure__img')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      if (figure) gsap.set(figure, { clearProps: 'all', opacity: 1, scale: 1 })
      return
    }

    if (figure) {
      gsap.fromTo(
        figure,
        { opacity: 0.35, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' },
      )
    }
  }

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const pills = gsap.utils.toArray<HTMLElement>('.hero-figure__pill')
      pills.forEach((pill, i) => {
        gsap.fromTo(
          pill,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.55, delay: 0.25 + i * 0.1, ease: 'power2.out' },
        )
        gsap.to(pill, {
          y: i % 2 === 0 ? -4 : 4,
          duration: 2.6 + i * 0.2,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.9,
        })
      })
    },
    { scope: rootRef },
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onEnter = () => swiperRef.current?.autoplay?.stop()
    const onLeave = () => swiperRef.current?.autoplay?.start()
    root.addEventListener('pointerenter', onEnter)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      root.removeEventListener('pointerenter', onEnter)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className="hero-figure">
      <div className="hero-figure__card">
        <Swiper
          className="hero-figure__swiper"
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={650}
          loop
          grabCursor
          simulateTouch
          allowTouchMove
          touchRatio={1.2}
          resistanceRatio={0.65}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            el: '.hero-figure__pagination',
            clickable: true,
            bulletClass: 'hero-figure__dot',
            bulletActiveClass: 'is-active',
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
            swiper.autoplay?.start()
            animateSlideIn(swiper.slides[swiper.activeIndex] as HTMLElement)
          }}
          onSlideChange={(swiper) => {
            animateSlideIn(swiper.slides[swiper.activeIndex] as HTMLElement)
          }}
        >
          {FIGURES.map((figure, i) => (
            <SwiperSlide key={figure.id}>
              <div className="hero-figure__frame">
                <img
                  className="hero-figure__img"
                  src={figure.src}
                  alt={figure.alt}
                  width={900}
                  height={1125}
                  decoding="async"
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  draggable={false}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pills live on the card shell so they stay inside and never clip */}
        <span className="hero-figure__pill hero-figure__pill--a">
          Kleine oplages
        </span>
        <span className="hero-figure__pill hero-figure__pill--b">
          Op aanvraag
        </span>
      </div>

      <div className="hero-figure__pagination" aria-label="Hero figures" />
    </div>
  )
}
