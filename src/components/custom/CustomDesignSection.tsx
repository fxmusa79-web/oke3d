import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useI18n } from '../../i18n/useI18n'
import { Button } from '../ui/Button'
import { CustomDesignModal } from './CustomDesignModal'
import './CustomDesignSection.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function CustomDesignSection() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return
      const el = rootRef.current
      if (!el) return
      gsap.fromTo(
        el.querySelectorAll('.custom-design__reveal'),
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    { scope: rootRef },
  )

  return (
    <>
      <section
        ref={rootRef}
        className="custom-design"
        id="op-maat"
        aria-labelledby="custom-design-title"
      >
        <div className="custom-design__inner">
          <p className="custom-design__eyebrow custom-design__reveal">
            {t.customCta.eyebrow}
          </p>
          <div className="custom-design__row">
            <div className="custom-design__copy">
              <h2 id="custom-design-title" className="custom-design__title custom-design__reveal">
                {t.customCta.title}
              </h2>
              <p className="custom-design__lede custom-design__reveal">{t.customCta.lede}</p>
            </div>
            <div className="custom-design__action custom-design__reveal">
              <Button type="button" variant="primary" onClick={() => setOpen(true)}>
                {t.customCta.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CustomDesignModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

/** @deprecated use CustomDesignSection */
export const CustomCTA = CustomDesignSection
