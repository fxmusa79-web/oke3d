import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

type Props = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

const SPRING = { stiffness: 280, damping: 22, mass: 0.55 }

/** Magnetic pull (max 15px) + scale 1.05 on hover — for primary CTAs. */
export function MagneticPrimary({ children, className = '', style }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const sx = useSpring(x, SPRING)
  const sy = useSpring(y, SPRING)
  const sScale = useSpring(scale, SPRING)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy) || 1
    const pull = Math.min(15, dist)
    x.set((dx / dist) * pull)
    y.set((dy / dist) * pull)
    scale.set(1.05)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
    scale.set(1)
  }

  return (
    <motion.div
      ref={rootRef}
      className={`oke-magnetic ${className}`.trim()}
      style={
        {
          x: reduced ? 0 : sx,
          y: reduced ? 0 : sy,
          scale: reduced ? 1 : sScale,
          display: 'inline-flex',
          ...style,
        } as CSSProperties
      }
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}
