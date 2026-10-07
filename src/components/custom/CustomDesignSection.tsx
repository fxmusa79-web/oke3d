import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useI18n } from '../../i18n/useI18n'
import { CustomDesignModal } from './CustomDesignModal'
import './CustomDesignSection.css'

gsap.registerPlugin(useGSAP)

export function CustomDesignSection() {
  const { t } = useI18n()
  const rootRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  useGSAP(
    () => {
      const btn = btnRef.current
      if (!btn) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const enter = () =>
        gsap.to(btn, { scale: 1.04, duration: 0.28, ease: 'power2.out', overwrite: 'auto' })
      const leave = () =>
        gsap.to(btn, { scale: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto' })

      btn.addEventListener('pointerenter', enter)
      btn.addEventListener('pointerleave', leave)
      return () => {
        btn.removeEventListener('pointerenter', enter)
        btn.removeEventListener('pointerleave', leave)
      }
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
        <div className="custom-design__panel">
          <div className="custom-design__copy">
            <p className="custom-design__eyebrow">{t.customCta.eyebrow}</p>
            <h2 id="custom-design-title" className="custom-design__title">
              {t.customCta.title}
            </h2>
            <p className="custom-design__lede">{t.customCta.lede}</p>
          </div>

          <div className="custom-design__action">
            <button
              ref={btnRef}
              type="button"
              className="custom-design__btn"
              onClick={() => setOpen(true)}
            >
              {t.customCta.cta}
            </button>
          </div>
        </div>
      </section>

      <CustomDesignModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

/** @deprecated use CustomDesignSection */
export const CustomCTA = CustomDesignSection
