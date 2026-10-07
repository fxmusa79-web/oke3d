import { useEffect, useRef } from 'react'
import './HeroShaderBg.css'

/**
 * OKE3D hero ambient — Hero-Shader (U-G-Twohill) tuned calm.
 * Electric blue = filament accent only; cream base matches #FAFAF6 (no blue wash).
 */
const OKE_SHADER = {
  lineCount: 10,
  overallSpeed: 0.08,
  lineColor: [0.08, 0.44, 0.85, 0.32],
  bgColor1: [0.98, 0.98, 0.965, 1],
  bgColor2: [0.96, 0.965, 0.95, 1],
  minLineWidth: 0.014,
  maxLineWidth: 0.11,
  lineFrequency: 0.15,
  lineAmplitude: 0.75,
  glowSpread: 0.35,
  circleRadius: 0,
  circleBrightness: 0,
  warpFrequency: 0.4,
  warpAmplitude: 0.5,
  scale: 6.2,
  domainWarpDepth: 0,
  filmGrain: 0.025,
  vignette: 0.1,
  chromaticAberration: 0,
} as const

declare global {
  interface Window {
    __HERO_SHADER_MANUAL__?: boolean
    HeroShader?: {
      mount: (host?: HTMLElement | null) => void
      destroy: (host?: HTMLElement | null) => void
    }
  }
}

export function HeroShaderBg() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false

    window.__HERO_SHADER_MANUAL__ = true

    const boot = async () => {
      // Vendor IIFE (no ESM exports) — registers window.HeroShader.mount
      // @ts-expect-error side-effect vendor script
      await import('../lib/hero-shader/shader-bg.js')
      if (cancelled || !hostRef.current) return
      window.HeroShader?.mount(hostRef.current)
    }
    void boot()

    return () => {
      cancelled = true
      if (hostRef.current) window.HeroShader?.destroy(hostRef.current)
    }
  }, [])

  return (
    <div
      ref={hostRef}
      className="hero-shader-bg"
      data-shader={JSON.stringify(OKE_SHADER)}
      aria-hidden="true"
    />
  )
}
