import { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Navigation, Keyboard } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { GallerySlide } from '../../data/products'
import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/navigation'
import './ProductGallery.css'

gsap.registerPlugin(useGSAP)

type Props = {
  slides: GallerySlide[]
  title: string
}

export function ProductGallery({ slides, title }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [thumbs, setThumbs] = useState<SwiperType | null>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return
      gsap.from('.oke-gallery__main .swiper-slide-active img, .oke-gallery__main .oke-gallery__hotspot', {
        opacity: 0,
        y: 16,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
      })
    },
    { scope: rootRef, dependencies: [active] },
  )

  if (!slides.length) return null

  return (
    <div ref={rootRef} className="oke-gallery">
      <Swiper
        className="oke-gallery__main"
        modules={[Thumbs, Navigation, Keyboard]}
        thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
        navigation
        keyboard={{ enabled: true }}
        spaceBetween={12}
        onSlideChange={(s) => setActive(s.activeIndex)}
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={`${slide.src}-${i}`}>
            <div
              className={`oke-gallery__frame is-${slide.kind ?? 'studio'}`}
            >
              <img
                src={slide.src}
                alt={slide.alt ?? `${title} ${i + 1}`}
                width={1200}
                height={1500}
                decoding="async"
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
              {slide.hotspots?.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  className="oke-gallery__hotspot"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  aria-label={spot.label}
                  title={spot.label}
                >
                  <span>{spot.label}</span>
                </button>
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 ? (
        <Swiper
          className="oke-gallery__thumbs"
          modules={[Thumbs]}
          onSwiper={setThumbs}
          spaceBetween={10}
          slidesPerView={Math.min(slides.length, 4)}
          watchSlidesProgress
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={`thumb-${slide.src}-${i}`}>
              <button
                type="button"
                className={`oke-gallery__thumb is-${slide.kind ?? 'studio'} ${
                  i === active ? 'is-active' : ''
                }`}
                aria-label={`${title} thumbnail ${i + 1}`}
              >
                <img src={slide.src} alt="" width={160} height={200} loading="lazy" />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : null}
    </div>
  )
}
