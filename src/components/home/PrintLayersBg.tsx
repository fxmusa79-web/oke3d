import { useEffect, useRef, useState } from 'react'
import './PrintLayersBg.css'

const VIDEO_SRC = '/assets/video/printer-loop.webm'
const VIDEO_FALLBACK = '/assets/video/printer-loop.mp4'

/**
 * Ambient print background: optional loop video (muted, 0.4 opacity),
 * else CSS “layers building” animation (Lottie-style without the dep).
 */
export function PrintLayersBg() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [useVideo, setUseVideo] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let cancelled = false
    const probe = async () => {
      try {
        const res = await fetch(VIDEO_SRC, { method: 'HEAD' })
        if (!cancelled && res.ok) {
          const type = res.headers.get('content-type') ?? ''
          // SPA hosts may 200 HTML for missing assets
          if (type.includes('video') || type.includes('octet-stream')) {
            setUseVideo(true)
            return
          }
        }
      } catch {
        /* keep layers */
      }
      if (!cancelled) setUseVideo(false)
    }
    void probe()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !useVideo || reduced) return
    el.play().catch(() => setUseVideo(false))
  }, [useVideo, reduced])

  return (
    <div className="print-layers-bg" aria-hidden="true">
      {useVideo && !reduced ? (
        <video
          ref={videoRef}
          className="print-layers-bg__video"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onError={() => setUseVideo(false)}
        >
          <source src={VIDEO_SRC} type="video/webm" />
          <source src={VIDEO_FALLBACK} type="video/mp4" />
        </video>
      ) : (
        <div className={`print-layers-bg__stack${reduced ? ' is-static' : ''}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="print-layers-bg__layer"
              style={{ ['--i' as string]: i }}
            />
          ))}
          <span className="print-layers-bg__nozzle" />
        </div>
      )}
      <div className="print-layers-bg__wash" />
    </div>
  )
}
