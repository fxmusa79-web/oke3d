import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF, useTexture } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Box3, Group, SRGBColorSpace, Vector3 } from 'three'
import './HeroFigurineR3F.css'

/** Drop your figurine at public/models/oke-figurine.glb */
export const HERO_GLB_URL = '/models/oke-figurine.glb'
const FALLBACK_PNG = '/assets/dark/black-fitness-kettlebell.png'

const ROTATE_SPEED = 0.3 // rad/s
const FLOAT_AMP = 0.15

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}

function MouseParallaxCamera({ reduced }: { reduced: boolean }) {
  const { camera, size } = useThree()
  const target = useRef({ x: 0, y: 0.15 })
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (reduced) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  useFrame((_, dt) => {
    const damp = 1 - Math.exp(-4 * dt)
    if (reduced) {
      target.current.x = 0
      target.current.y = 0.15
    } else {
      target.current.x += (pointer.current.x * 0.35 - target.current.x) * damp
      target.current.y += (0.15 + pointer.current.y * -0.18 - target.current.y) * damp
    }
    camera.position.x = target.current.x
    camera.position.y = target.current.y
    camera.position.z = size.width < 720 ? 3.1 : 2.65
    camera.lookAt(0, 0.05, 0)
  })

  return null
}

function FigureneMotion({
  reduced,
  children,
}: {
  reduced: boolean
  children: ReactNode
}) {
  const group = useRef<Group>(null)
  const t0 = useRef(0)

  useFrame((_, dt) => {
    if (!group.current) return
    if (reduced) {
      group.current.rotation.y = -0.25
      group.current.position.y = 0
      return
    }
    t0.current += dt
    group.current.rotation.y += ROTATE_SPEED * dt
    group.current.position.y = Math.sin(t0.current * 1.15) * FLOAT_AMP
  })

  return <group ref={group}>{children}</group>
}

function FittedGlb({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    const box = new Box3().setFromObject(clone)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    clone.position.sub(center)
    const maxDim = Math.max(size.x, size.y, size.z, 0.001)
    clone.scale.setScalar(1.65 / maxDim)
  }, [clone])

  return <primitive object={clone} />
}

function PngBillboardFallback() {
  const texture = useTexture(FALLBACK_PNG)
  texture.colorSpace = SRGBColorSpace
  return (
    <mesh position={[0, 0.05, 0]}>
      <planeGeometry args={[1.35, 1.7]} />
      <meshStandardMaterial map={texture} transparent roughness={0.55} metalness={0.05} />
    </mesh>
  )
}

class GlbErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError?.()
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

function SceneContent({ reduced }: { reduced: boolean }) {
  const [useFallback, setUseFallback] = useState(false)

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.4, 3.2, 2]} intensity={1.25} color="#ffffff" />
      <directionalLight position={[-2, 1.2, -1]} intensity={0.35} color="#1570d8" />
      <Environment preset="city" environmentIntensity={0.35} />
      <MouseParallaxCamera reduced={reduced} />
      <FigureneMotion reduced={reduced}>
        {useFallback ? (
          <PngBillboardFallback />
        ) : (
          <GlbErrorBoundary
            fallback={<PngBillboardFallback />}
            onError={() => setUseFallback(true)}
          >
            <Suspense fallback={<PngBillboardFallback />}>
              <FittedGlb url={HERO_GLB_URL} />
            </Suspense>
          </GlbErrorBoundary>
        )}
      </FigureneMotion>
      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.35}
        scale={4}
        blur={2.4}
        far={2.5}
        color="#0a0a0a"
      />
    </>
  )
}

const pillSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 22,
  mass: 0.7,
}

export function HeroFigurineR3F() {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="hero-r3f">
      <div className="hero-r3f__card">
        <div className="hero-r3f__canvas-wrap">
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0.15, 2.65], fov: 38, near: 0.1, far: 40 }}
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <SceneContent reduced={reduced} />
            </Suspense>
          </Canvas>
        </div>

        <motion.span
          className="hero-r3f__pill hero-r3f__pill--a"
          initial={reduced ? false : { opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...pillSpring, delay: 0.5 }}
        >
          Kleine oplages
        </motion.span>
        <motion.span
          className="hero-r3f__pill hero-r3f__pill--b"
          initial={reduced ? false : { opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...pillSpring, delay: 0.5 }}
        >
          Op aanvraag
        </motion.span>
      </div>
    </div>
  )
}
