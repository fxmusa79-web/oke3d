import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useI18n } from '../../i18n/useI18n'
import './ProcessTimeline.css'

function StepBlock({
  index,
  title,
  body,
  progress,
  total,
}: {
  index: number
  title: string
  body: string
  progress: MotionValue<number>
  total: number
}) {
  const start = index / total
  const end = (index + 1) / total
  const mid = (start + end) / 2

  const opacity = useTransform(progress, [start, mid, end], [0.35, 1, 0.55])
  const y = useTransform(progress, [start, mid, end], [28, 0, 8])
  const numColor = useTransform(
    progress,
    [start, mid, end],
    ['#9aa3ad', '#0a0a0a', '#1570d8'],
  )
  const numScale = useTransform(progress, [start, mid, end], [0.92, 1.12, 1])

  const label = String(index + 1).padStart(2, '0')

  return (
    <motion.li className="process-tl__step" style={{ opacity, y }}>
      <motion.span className="process-tl__num" style={{ color: numColor, scale: numScale }}>
        {label}
      </motion.span>
      <h3>{title}</h3>
      <p>{body}</p>
    </motion.li>
  )
}

/** Sticky scroll timeline — title left, progressive steps + fill line right. */
export function ProcessTimeline() {
  const { t } = useI18n()
  const steps = t.process.steps.slice(0, 3)
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 28, restDelta: 0.001 })
  const lineScale = useTransform(smooth, [0, 1], [0, 1])

  return (
    <section
      ref={ref}
      className="process-tl"
      id="proces"
      aria-labelledby="process-title"
    >
      <div className="process-tl__sticky">
        <div className="process-tl__layout">
          <header className="process-tl__intro">
            <p className="process-tl__eyebrow">{t.process.eyebrow}</p>
            <h2 id="process-title" className="process-tl__title">
              {t.process.title}
            </h2>
          </header>

          <div className="process-tl__track">
            <div className="process-tl__line" aria-hidden="true">
              <motion.span
                className="process-tl__line-fill"
                style={{ scaleY: lineScale }}
              />
            </div>
            <ol className="process-tl__steps">
              {steps.map((step, i) => (
                <StepBlock
                  key={step.title}
                  index={i}
                  title={step.title}
                  body={step.body}
                  progress={smooth}
                  total={steps.length}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
