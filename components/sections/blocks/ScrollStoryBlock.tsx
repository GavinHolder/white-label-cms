'use client'

/**
 * ScrollStoryBlock — Scroll-pinned 3D storytelling block.
 *
 * Architecture:
 *   • outer div: height = multiLimit * 100vh → creates scroll room in the snap container
 *   • sticky inner div: position: sticky; top: 0; height: 100vh → stays fixed
 *   • Three.js canvas fills the sticky viewport
 *   • Text overlays fade in/out at configurable scroll-progress thresholds
 *   • Model rotation + camera Z are keyframe-interpolated from scroll progress
 *
 * Block props (all optional, sensible defaults):
 *   modelUrl         — GLB/GLTF URL (default: NASA astronaut)
 *   modelScale       — uniform scale applied after normalisation (default: 1)
 *   bgColor          — canvas background (default: #060612)
 *   accentColor      — fill/accent hex (default: #6366f1)
 *   textOverlays     — JSON array of TextOverlay objects
 *   keyframes        — JSON array of Keyframe objects (rotateY, rotateX, cameraZ, scale)
 *   showProgress     — show sidebar progress indicator (default: true)
 */

import { useEffect, useRef, useState } from 'react'

interface TextOverlay {
  text: string
  subtext?: string
  entryProgress: number   // 0-1: progress at which overlay fades in
  exitProgress: number    // 0-1: progress at which overlay fades out
  position?: 'left' | 'right' | 'center'
  color?: string
}

interface Keyframe {
  progress: number    // 0-1
  rotateY?: number    // degrees
  rotateX?: number    // degrees
  cameraZ?: number    // camera distance
  scale?: number      // model scale multiplier (on top of normalisation)
}

interface Props {
  block: { props?: Record<string, unknown> }
}

function lerpVal(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function interpolateKF(frames: Keyframe[], prop: keyof Keyframe, p: number): number {
  if (!frames.length) return 0
  if (p <= frames[0].progress) return (frames[0][prop] as number) ?? 0
  if (p >= frames[frames.length - 1].progress) return (frames[frames.length - 1][prop] as number) ?? 0
  for (let i = 0; i < frames.length - 1; i++) {
    if (p >= frames[i].progress && p <= frames[i + 1].progress) {
      const t  = (p - frames[i].progress) / (frames[i + 1].progress - frames[i].progress)
      const a  = (frames[i][prop] as number) ?? 0
      const b  = (frames[i + 1][prop] as number) ?? 0
      return lerpVal(a, b, t)
    }
  }
  return 0
}

export default function ScrollStoryBlock({ block }: Props) {
  const p = block.props || {}

  const modelUrl     = (p.modelUrl as string)     || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  const modelScale   = typeof p.modelScale === 'number' ? p.modelScale : 1
  const bgColor      = (p.bgColor as string)      || '#060612'
  const accentColor  = (p.accentColor as string)  || '#6366f1'
  const showProgress = p.showProgress !== false
  const textOverlays: TextOverlay[] = Array.isArray(p.textOverlays) ? (p.textOverlays as TextOverlay[]) : []
  const keyframes: Keyframe[] = Array.isArray(p.keyframes)
    ? (p.keyframes as Keyframe[])
    : [
        { progress: 0,   rotateY: 0,   cameraZ: 5.5 },
        { progress: 0.5, rotateY: 180, cameraZ: 4   },
        { progress: 1,   rotateY: 360, cameraZ: 5.5 },
      ]

  const mountRef    = useRef<HTMLDivElement>(null)
  const outerRef    = useRef<HTMLDivElement>(null)
  const targetRef   = useRef(0)   // raw scroll progress (updated by scroll event)
  const smoothRef   = useRef(0)   // lerped progress (used by Three.js)
  const rafRef      = useRef<number>(0)
  const clockRef    = useRef(0)
  const rendererRef = useRef<any>(null)
  const modelRef    = useRef<any>(null)
  const cameraRef   = useRef<any>(null)
  const [progress, setProgress] = useState(0)   // React state — drives overlay opacity

  // ── Scroll progress tracker ─────────────────────────────────────────────────
  useEffect(() => {
    const snapContainer = document.getElementById('snap-container')
    if (!snapContainer) return

    const onScroll = () => {
      const sectionEl = outerRef.current?.closest('section') as HTMLElement | null
      if (!sectionEl) return

      const snapRect = snapContainer.getBoundingClientRect()
      const secRect  = sectionEl.getBoundingClientRect()
      // Position of the section's top edge in snap-container scroll space
      const sectionTop = secRect.top - snapRect.top + snapContainer.scrollTop
      const sectionH   = sectionEl.offsetHeight
      const range      = sectionH - window.innerHeight
      if (range <= 0) return

      const raw = (snapContainer.scrollTop - sectionTop) / range
      const clamped = Math.max(0, Math.min(1, raw))
      targetRef.current = clamped
      setProgress(Math.round(clamped * 1000) / 1000)
    }

    snapContainer.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // compute initial progress
    return () => snapContainer.removeEventListener('scroll', onScroll)
  }, [])

  // ── Three.js scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    let renderer: any = null

    async function setup() {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      if (cancelled || !mountRef.current) return

      const mount = mountRef.current
      const W = mount.clientWidth  || 800
      const H = mount.clientHeight || 600

      // Scene + camera
      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200)
      camera.position.set(0, 0.4, 5.5)
      camera.lookAt(0, 0, 0)
      cameraRef.current = camera

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      rendererRef.current = renderer
      mount.appendChild(renderer.domElement)

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(ambientLight)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.8)
      keyLight.position.set(4, 8, 6)
      scene.add(keyLight)
      const fillLight = new THREE.DirectionalLight(accentColor, 0.6)
      fillLight.position.set(-6, -3, -4)
      scene.add(fillLight)
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
      rimLight.position.set(0, -6, -4)
      scene.add(rimLight)

      // Faint grid floor
      const grid = new THREE.GridHelper(20, 30, accentColor, accentColor)
      ;(grid.material as any).opacity = 0.06
      ;(grid.material as any).transparent = true
      grid.position.y = -1.8
      scene.add(grid)

      // Load GLB model
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          const loader = new GLTFLoader()
          loader.load(modelUrl, resolve, undefined, reject)
        })
        const model = gltf.scene

        // Normalise to unit scale
        const box   = new THREE.Box3().setFromObject(model)
        const size  = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const s      = (2.2 / maxDim) * modelScale
        model.scale.setScalar(s)

        // Centre
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center.clone().multiplyScalar(s))
        model.position.y -= 0.2

        scene.add(model)
        modelRef.current = model
      } catch {
        // Procedural fallback: torus knot
        const geo = new THREE.TorusKnotGeometry(0.9, 0.3, 140, 18)
        const mat = new THREE.MeshStandardMaterial({
          color: accentColor, roughness: 0.15, metalness: 0.85,
        })
        const mesh = new THREE.Mesh(geo, mat)
        scene.add(mesh)
        modelRef.current = mesh
      }

      // Resize observer
      const ro = new ResizeObserver(entries => {
        const { width: rw, height: rh } = entries[0].contentRect
        if (cancelled || !renderer) return
        camera.aspect = rw / rh
        camera.updateProjectionMatrix()
        renderer.setSize(rw, rh)
      })
      ro.observe(mount)

      // Render loop
      function animate(ts: number) {
        if (cancelled) return
        rafRef.current = requestAnimationFrame(animate)
        const dt = Math.min(ts - clockRef.current, 50)
        clockRef.current = ts

        // Smooth lerp toward target progress (lag coefficient)
        smoothRef.current = lerpVal(smoothRef.current, targetRef.current, 1 - Math.pow(0.03, dt / 16))
        const sp = smoothRef.current

        if (modelRef.current) {
          const rotY  = interpolateKF(keyframes, 'rotateY', sp) * (Math.PI / 180)
          const rotX  = interpolateKF(keyframes, 'rotateX', sp) * (Math.PI / 180)
          const kfZ   = interpolateKF(keyframes, 'cameraZ', sp)

          modelRef.current.rotation.y = rotY
          modelRef.current.rotation.x = rotX
          // Gentle idle bob on top of scroll-driven Y rotation
          modelRef.current.position.y = (modelRef.current.position.y || 0) + (Math.sin(ts * 0.0007) * 0.0005)

          if (kfZ) camera.position.z = lerpVal(camera.position.z, kfZ, 0.04)
        }

        renderer.render(scene, camera)
      }
      requestAnimationFrame(animate)
    }

    setup()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (renderer) {
        renderer.dispose()
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement)
        }
      }
      rendererRef.current = null
      modelRef.current    = null
      cameraRef.current   = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, modelScale, accentColor])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={outerRef}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Sticky viewport — pins for the full height of the parent grid cell */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: bgColor,
        }}
      >
        {/* Three.js canvas mount */}
        <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Radial accent glow at model position */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 60% 55% at 50% 50%, ${accentColor}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Text overlays — appear/disappear based on scroll progress */}
        {textOverlays.map((overlay, i) => {
          const visible  = progress >= overlay.entryProgress && progress < overlay.exitProgress
          const isLeft   = !overlay.position || overlay.position === 'left'
          const isRight  = overlay.position === 'right'
          const isCenter = overlay.position === 'center'

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: '22%',
                ...(isLeft   ? { left: '7%' }  : {}),
                ...(isRight  ? { right: '7%' } : {}),
                ...(isCenter ? { left: '50%', transform: `translateX(-50%) translateY(${visible ? '0' : '28px'})` } : { transform: `translateY(${visible ? '0' : '28px'})` }),
                maxWidth: '38vw',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.7s ease, transform 0.7s ease',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {overlay.subtext && (
                <p style={{
                  color: overlay.color || accentColor,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  margin: '0 0 10px',
                  textAlign: isCenter ? 'center' : isRight ? 'right' : 'left',
                }}>
                  {overlay.subtext}
                </p>
              )}
              <h2 style={{
                color: '#ffffff',
                fontSize: 'clamp(20px, 2.8vw, 44px)',
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.15,
                textAlign: isCenter ? 'center' : isRight ? 'right' : 'left',
                textShadow: '0 2px 24px rgba(0,0,0,0.6)',
              }}>
                {overlay.text}
              </h2>
            </div>
          )
        })}

        {/* Sidebar progress rail */}
        {showProgress && (
          <div
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '2px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${progress * 100}%`,
                  background: accentColor,
                  borderRadius: '2px',
                  transition: 'height 0.1s linear',
                }}
              />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '9px', fontFamily: 'monospace' }}>
              {Math.round(progress * 100)}%
            </span>
          </div>
        )}

        {/* Scroll cue — fades out once scrolling begins */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: progress < 0.08 ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Scroll
          </span>
          <div
            style={{
              width: '1px',
              height: '36px',
              background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
