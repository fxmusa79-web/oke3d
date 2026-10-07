import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './CustomCursor.css'

/** Desktop custom cursor — enlarges over collectible cards (`data-cursor="collectible"`). */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hoverCollectible, setHoverCollectible] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.35 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return
    setEnabled(true)
    document.documentElement.classList.add('oke-cursor-on')

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    const onOver = (e: PointerEvent) => {
      const t = e.target
      if (!(t instanceof Element)) return
      setHoverCollectible(Boolean(t.closest('[data-cursor="collectible"]')))
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      document.documentElement.classList.remove('oke-cursor-on')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <motion.div
      className={`oke-cursor${hoverCollectible ? ' is-collectible' : ''}${visible ? ' is-visible' : ''}`}
      style={{ x: sx, y: sy }}
      aria-hidden="true"
    />
  )
}
