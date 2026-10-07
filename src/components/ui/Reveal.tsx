import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOTION } from '../../lib/animations/motion'
import './Reveal.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type Props = {
  children: ReactNode
  className?: string
}

/** Subtle scroll reveal — skipped when prefers-reduced-motion. */
export function Reveal({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        gsap.set(el, { clearProps: 'all', opacity: 1, y: 0 })
        return
      }

      const rect = el.getBoundingClientRect()
      const alreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
      if (alreadyInView) {
        gsap.set(el, { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.medium,
          ease: MOTION.ease.out,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        },
      )
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={`oke-reveal ${className}`.trim()}>
      {children}
    </div>
  )
}
