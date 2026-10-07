/** OKE3D breakpoints — mirror of --oke-bp-* in tokens.css (CSS vars cannot drive @media). */
export const breakpoints = {
  sm: 560,
  md: 768,
  lg: 960,
  xl: 1100,
  '2xl': 1440,
} as const

export type Breakpoint = keyof typeof breakpoints

export function mq(bp: Breakpoint, type: 'min' | 'max' = 'min'): string {
  const px = breakpoints[bp]
  return type === 'min' ? `(min-width: ${px}px)` : `(max-width: ${px - 1}px)`
}
