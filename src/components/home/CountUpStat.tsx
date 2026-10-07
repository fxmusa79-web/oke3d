import { useEffect, useRef, useState } from 'react'
import './CountUpStat.css'

type Props = {
  value: number
  suffix?: string
  label: string
  durationMs?: number
}

export function CountUpStat({ value, suffix = '', label, durationMs = 1400 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return
        setStarted(true)
        if (reduced) {
          setDisplay(value)
          return
        }
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / durationMs)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(value * eased))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.45 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [durationMs, started, value])

  return (
    <div ref={ref} className="oke-stat">
      <p className="oke-stat__value">
        <span>{display}</span>
        {suffix}
      </p>
      <p className="oke-stat__label">{label}</p>
    </div>
  )
}
