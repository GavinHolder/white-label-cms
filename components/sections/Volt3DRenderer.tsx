'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { VoltObject3DData, Volt3DEasing } from '@/types/volt'

interface Props {
  data: VoltObject3DData
  x: number
  y: number
  width: number
  height: number
  sectionRef: React.RefObject<HTMLElement | null>
  /** Driven by VoltBlock from VoltRenderer's onHoverChange */
  isHovered?: boolean
}

// ── Easing helpers ────────────────────────────────────────────────────────────
function applyEase(t: number, easing: Volt3DEasing): number {
  switch (easing) {
    case 'easeIn':    return t * t
    case 'easeOut':   return 1 - (1 - t) * (1 - t)
    case 'easeInOut': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    default:          return t // linear (spring handled separately in tick)
  }
}

/** Per-frame lerp alpha so lerp(current, target, alpha) reaches within 0.1% of target in `durationMs`. */
function lerpAlpha(durationMs: number): number {
  const fps = 1000 / 60
  return 1 - Math.pow(0.001, fps / Math.max(1, durationMs))
}

// ── Spring state for one scalar ───────────────────────────────────────────────
interface SpringState { value: number; velocity: number }

function stepSpring(s: SpringState, target: number): number {
  const stiffness = 0.12
  const damping   = 0.75
  s.velocity += (target - s.value) * stiffness
  s.velocity *= damping
  s.value    += s.velocity
  return s.value
}

export default function Volt3DRenderer({ data, x, y, width, height, sectionRef, isHovered = false }: Props) {
  const mountRef      = useRef<HTMLDivElement>(null)
  const rafRef        = useRef<number>(0)
  const isPlayingRef  = useRef(false)
  const mixerRef      = useRef<any>(null)
  const actionRef     = useRef<any>(null)
  const clockRef      = useRef<any>(null)
  const rendererRef   = useRef<any>(null)
  const observerRef   = useRef<IntersectionObserver | null>(null)

  // Refs for the live Three.js model position/scale/rotation so the tick function
  // can drive them smoothly without triggering React re-renders.
  const modelRef  = useRef<any>(null)
  const isHoveredRef = useRef(isHovered)

  // Timed animation: tracks elapsed for non-spring transitions
  const animStateRef = useRef({
    active: false,        // currently mid-transition
    startTime: 0,
    duration: 600,
    delayRemaining: 0,
    easing: 'easeOut' as Volt3DEasing,
    fromPos:  { x: 0, y: 0, z: 0 },
    toPos:    { x: 0, y: 0, z: 0 },
    fromScale: 1,
    toScale:   1,
    fromRot:  { x: 0, y: 0, z: 0 },
    toRot:    { x: 0, y: 0, z: 0 },
  })

  // Spring states for each axis (used only when easing === 'spring')
  const springPos   = useRef({ x: { value: 0, velocity: 0 } as SpringState, y: { value: 0, velocity: 0 } as SpringState, z: { value: 0, velocity: 0 } as SpringState })
  const springScale = useRef({ value: 1, velocity: 0 } as SpringState)
  const springRot   = useRef({ x: { value: 0, velocity: 0 } as SpringState, y: { value: 0, velocity: 0 } as SpringState, z: { value: 0, velocity: 0 } as SpringState })

  // Auto-loop time accumulator
  const autoTimeRef = useRef(0)

  const stopRender = useCallback(() => {
    isPlayingRef.current = false
    cancelAnimationFrame(rafRef.current)
    if (actionRef.current) actionRef.current.paused = true
  }, [])

  // Kick off a transition from current model state → target state
  const startTransition = useCallback((toActive: boolean) => {
    const d = data
    const now = performance.now()
    const duration   = d.transitionDuration ?? 600
    const easing     = d.transitionEasing   ?? 'easeOut'
    const delay      = d.transitionDelay    ?? 0

    const startPos   = { x: d.positionStart?.x ?? 0, y: d.positionStart?.y ?? 0, z: d.positionStart?.z ?? 0 }
    const endPos     = { x: d.positionEnd?.x   ?? 0, y: d.positionEnd?.y   ?? 0, z: d.positionEnd?.z   ?? 0 }
    const startScale = d.scaleStart ?? 1
    const endScale   = d.scaleEnd   ?? 1
    const startRot   = { x: (d.rotationStart?.x ?? 0) * (Math.PI / 180), y: (d.rotationStart?.y ?? 0) * (Math.PI / 180), z: (d.rotationStart?.z ?? 0) * (Math.PI / 180) }
    const endRot     = { x: (d.rotationEnd?.x   ?? 0) * (Math.PI / 180), y: (d.rotationEnd?.y   ?? 0) * (Math.PI / 180), z: (d.rotationEnd?.z   ?? 0) * (Math.PI / 180) }

    const model = modelRef.current
    const fromPos   = model ? { x: model.position.x, y: model.position.y, z: model.position.z } : (toActive ? startPos : endPos)
    const fromScale = model ? model.scale.x : (toActive ? startScale : endScale)
    const fromRot   = model ? { x: model.rotation.x, y: model.rotation.y, z: model.rotation.z } : (toActive ? startRot : endRot)

    const toPos   = toActive ? endPos   : startPos
    const toScale = toActive ? endScale : startScale
    const toRot   = toActive ? endRot   : startRot

    // Seed spring states to current values so spring picks up where we are
    if (easing === 'spring') {
      springPos.current.x.value  = fromPos.x;   springPos.current.x.velocity = 0
      springPos.current.y.value  = fromPos.y;   springPos.current.y.velocity = 0
      springPos.current.z.value  = fromPos.z;   springPos.current.z.velocity = 0
      springScale.current.value  = fromScale;   springScale.current.velocity = 0
      springRot.current.x.value  = fromRot.x;   springRot.current.x.velocity = 0
      springRot.current.y.value  = fromRot.y;   springRot.current.y.velocity = 0
      springRot.current.z.value  = fromRot.z;   springRot.current.z.velocity = 0
    }

    const anim = animStateRef.current
    anim.active         = true
    anim.startTime      = now + delay
    anim.duration       = duration
    anim.delayRemaining = delay
    anim.easing         = easing
    anim.fromPos        = fromPos
    anim.toPos          = toPos
    anim.fromScale      = fromScale
    anim.toScale        = toScale
    anim.fromRot        = fromRot
    anim.toRot          = toRot
  }, [data])

  useEffect(() => {
    let cancelled  = false
    let resizeObs: ResizeObserver | null = null
    let rendererLocal: any = null

    async function setup() {
      const THREE = await import('three')
      const { GLTFLoader }   = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      if (cancelled || !mountRef.current) return

      const mount = mountRef.current
      const w = mount.clientWidth
      const h = mount.clientHeight

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
      renderer.setPixelRatio(1)
      renderer.shadowMap.enabled = false
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setSize(w, h)
      mount.appendChild(renderer.domElement)
      rendererLocal      = renderer
      rendererRef.current = renderer

      // Background
      if (!data.transparent && data.backgroundColor) {
        renderer.setClearColor(data.backgroundColor, 1)
      } else {
        renderer.setClearColor(0x000000, 0)
      }

      // Scene
      const scene  = new THREE.Scene()

      // Camera
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000)
      const dist   = data.cameraDistance   ?? 4
      const elRad  = ((data.cameraElevation ?? 20) * Math.PI) / 180
      const azRad  = ((data.cameraAzimuth   ??  0) * Math.PI) / 180
      camera.position.set(
        dist * Math.cos(elRad) * Math.sin(azRad),
        dist * Math.sin(elRad),
        dist * Math.cos(elRad) * Math.cos(azRad)
      )
      camera.lookAt(0, 0, 0)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, data.ambientIntensity  ?? 0.8))
      const keyAngleRad = ((data.keyLightAngle ?? 45) * Math.PI) / 180
      const key = new THREE.DirectionalLight(0xffffff, data.keyLightIntensity ?? 1.5)
      key.position.set(3 * Math.cos(keyAngleRad), 5, 3 * Math.sin(keyAngleRad))
      scene.add(key)

      // OrbitControls — autoRotate only when animTrigger === 'none' or no anim system active
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableZoom   = false
      controls.enablePan    = false
      // Allow drag-rotate only when animTrigger is 'none' (or hover is active for '3d-hover')
      const hasAnim = data.animTrigger && data.animTrigger !== 'none'
      controls.enableRotate = !hasAnim
      controls.autoRotate      = !hasAnim && (data.autoRotateSpeed ?? 0) > 0
      controls.autoRotateSpeed = data.autoRotateSpeed ?? 0

      const clock = new THREE.Clock()
      clockRef.current = clock

      // ── Tick loop ──────────────────────────────────────────────────────────
      const tick = () => {
        if (!isPlayingRef.current) return
        rafRef.current = requestAnimationFrame(tick)

        const delta = clock.getDelta()
        mixerRef.current?.update(delta)
        controls.update()

        const model = modelRef.current
        if (model && data.animTrigger && data.animTrigger !== 'none') {
          const trigger  = data.animTrigger
          const easing   = data.transitionEasing ?? 'easeOut'
          const startPos = { x: data.positionStart?.x ?? 0, y: data.positionStart?.y ?? 0, z: data.positionStart?.z ?? 0 }
          const endPos   = { x: data.positionEnd?.x   ?? 0, y: data.positionEnd?.y   ?? 0, z: data.positionEnd?.z   ?? 0 }
          const startSc  = data.scaleStart ?? 1
          const endSc    = data.scaleEnd   ?? 1
          const startRot = { x: (data.rotationStart?.x ?? 0) * (Math.PI / 180), y: (data.rotationStart?.y ?? 0) * (Math.PI / 180), z: (data.rotationStart?.z ?? 0) * (Math.PI / 180) }
          const endRot   = { x: (data.rotationEnd?.x   ?? 0) * (Math.PI / 180), y: (data.rotationEnd?.y   ?? 0) * (Math.PI / 180), z: (data.rotationEnd?.z   ?? 0) * (Math.PI / 180) }

          if (trigger === '3d-auto') {
            // Smooth oscillation between start and end states
            autoTimeRef.current += delta * 1000
            const period = data.autoPeriod ?? 2000
            const rawT = (Math.sin((autoTimeRef.current / period) * Math.PI * 2 - Math.PI / 2) + 1) / 2
            const t    = applyEase(rawT, easing)

            model.position.set(
              startPos.x + (endPos.x - startPos.x) * t,
              startPos.y + (endPos.y - startPos.y) * t,
              startPos.z + (endPos.z - startPos.z) * t
            )
            const sc = startSc + (endSc - startSc) * t
            model.scale.setScalar(sc)
            model.rotation.set(
              startRot.x + (endRot.x - startRot.x) * t,
              startRot.y + (endRot.y - startRot.y) * t,
              startRot.z + (endRot.z - startRot.z) * t
            )
          } else if (trigger === '3d-hover') {
            const anim = animStateRef.current
            if (anim.active) {
              if (easing === 'spring') {
                // Drive spring toward target
                const target = isHoveredRef.current
                  ? { pos: anim.toPos, sc: anim.toScale, rot: anim.toRot }
                  : { pos: anim.fromPos, sc: anim.fromScale, rot: anim.fromRot }
                const px = stepSpring(springPos.current.x, target.pos.x)
                const py = stepSpring(springPos.current.y, target.pos.y)
                const pz = stepSpring(springPos.current.z, target.pos.z)
                const sc = stepSpring(springScale.current, target.sc)
                const rx = stepSpring(springRot.current.x, target.rot.x)
                const ry = stepSpring(springRot.current.y, target.rot.y)
                const rz = stepSpring(springRot.current.z, target.rot.z)
                model.position.set(px, py, pz)
                model.scale.setScalar(sc)
                model.rotation.set(rx, ry, rz)

                // Settle check — close enough to target on all axes
                const settled =
                  Math.abs(springPos.current.x.velocity) < 0.0001 &&
                  Math.abs(springPos.current.y.velocity) < 0.0001 &&
                  Math.abs(springPos.current.z.velocity) < 0.0001 &&
                  Math.abs(springScale.current.velocity) < 0.0001
                if (settled) anim.active = false
              } else {
                // Time-based lerp with easing
                const now = performance.now()
                if (now < anim.startTime) {
                  // Still in delay — hold at fromPos
                } else {
                  const elapsed = now - anim.startTime
                  const rawT = Math.min(1, elapsed / Math.max(1, anim.duration))
                  const t    = applyEase(rawT, anim.easing)
                  const alpha = lerpAlpha(anim.duration)
                  // Apply eased t for interpolation
                  model.position.set(
                    anim.fromPos.x + (anim.toPos.x - anim.fromPos.x) * t,
                    anim.fromPos.y + (anim.toPos.y - anim.fromPos.y) * t,
                    anim.fromPos.z + (anim.toPos.z - anim.fromPos.z) * t
                  )
                  const sc = anim.fromScale + (anim.toScale - anim.fromScale) * t
                  model.scale.setScalar(sc)
                  model.rotation.set(
                    anim.fromRot.x + (anim.toRot.x - anim.fromRot.x) * t,
                    anim.fromRot.y + (anim.toRot.y - anim.fromRot.y) * t,
                    anim.fromRot.z + (anim.toRot.z - anim.fromRot.z) * t
                  )
                  // Suppress unused variable warning
                  void alpha
                  if (rawT >= 1) {
                    anim.active = false
                    model.position.set(anim.toPos.x, anim.toPos.y, anim.toPos.z)
                    model.scale.setScalar(anim.toScale)
                    model.rotation.set(anim.toRot.x, anim.toRot.y, anim.toRot.z)
                  }
                }
              }
            }
          }
        }

        renderer.render(scene, camera)
      }

      const startRenderLocal = () => {
        if (isPlayingRef.current) return
        isPlayingRef.current = true
        if (actionRef.current) {
          actionRef.current.paused = false
          actionRef.current.play()
        }
        tick()
      }

      // IntersectionObserver
      if (sectionRef.current) {
        const obs = new IntersectionObserver(
          (entries) => {
            if (entries[0].intersectionRatio >= 0.3) {
              startRenderLocal()
            } else {
              stopRender()
            }
          },
          { threshold: [0, 0.3, 1] }
        )
        obs.observe(sectionRef.current)
        observerRef.current = obs
      }

      // ResizeObserver
      resizeObs = new ResizeObserver(() => {
        if (!mount) return
        const nw = mount.clientWidth
        const nh = mount.clientHeight
        camera.aspect = nw / nh
        camera.updateProjectionMatrix()
        renderer.setSize(nw, nh)
      })
      resizeObs.observe(mount)

      // Load GLB
      const loader = new GLTFLoader()
      loader.load(data.assetUrl, (gltf) => {
        if (cancelled) return

        const model = gltf.scene
        const box   = new THREE.Box3().setFromObject(model)
        const size  = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) model.scale.setScalar(2 / maxDim)

        if (data.customScale) {
          model.scale.x *= data.customScale.x
          model.scale.y *= data.customScale.y
          model.scale.z *= data.customScale.z
        }

        box.setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        if (data.wireframe) {
          const wireColor = new THREE.Color(data.wireframeColor ?? '#43a047')
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial({ wireframe: true, color: wireColor })
            }
          })
        }

        scene.add(model)
        modelRef.current = model

        // Apply start position/rotation/scale from animation data
        if (data.animTrigger && data.animTrigger !== 'none') {
          const startSc  = data.scaleStart ?? 1
          const startPos = { x: data.positionStart?.x ?? 0, y: data.positionStart?.y ?? 0, z: data.positionStart?.z ?? 0 }
          const startRot = { x: (data.rotationStart?.x ?? 0) * (Math.PI / 180), y: (data.rotationStart?.y ?? 0) * (Math.PI / 180), z: (data.rotationStart?.z ?? 0) * (Math.PI / 180) }
          model.position.set(startPos.x, startPos.y, startPos.z)
          model.scale.setScalar(startSc)
          model.rotation.set(startRot.x, startRot.y, startRot.z)
          // Seed spring to start state
          springPos.current.x.value  = startPos.x; springPos.current.x.velocity = 0
          springPos.current.y.value  = startPos.y; springPos.current.y.velocity = 0
          springPos.current.z.value  = startPos.z; springPos.current.z.velocity = 0
          springScale.current.value  = startSc;    springScale.current.velocity = 0
          springRot.current.x.value  = startRot.x; springRot.current.x.velocity = 0
          springRot.current.y.value  = startRot.y; springRot.current.y.velocity = 0
          springRot.current.z.value  = startRot.z; springRot.current.z.velocity = 0
        }

        // GLB animations
        const clips = gltf.animations ?? []
        if (clips.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model)
          const mappedTracks = Object.values(data.animationMap).filter(Boolean)
          let targetClip = clips[0]
          for (const mapped of mappedTracks) {
            if (!mapped) continue
            const found = clips.find((c) => c.name === mapped.trackName)
            if (found) { targetClip = found; break }
          }
          actionRef.current = mixerRef.current.clipAction(targetClip)
          actionRef.current.play()
        }

        startRenderLocal()
      })
    }

    setup()

    return () => {
      cancelled = true
      stopRender()
      observerRef.current?.disconnect()
      observerRef.current = null
      resizeObs?.disconnect()
      if (rendererLocal) {
        rendererLocal.dispose()
        if (mountRef.current && rendererLocal.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(rendererLocal.domElement)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.assetUrl, data.animationMap])

  // React to isHovered changes — trigger the transition
  useEffect(() => {
    isHoveredRef.current = isHovered
    if (data.animTrigger === '3d-hover') {
      startTransition(isHovered)
    }
  }, [isHovered, data.animTrigger, startTransition])

  const allowPointerEvents = data.animTrigger === '3d-hover' && isHovered

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        // Allow pointer events when hovered so user can drag-rotate
        pointerEvents: allowPointerEvents ? 'auto' : 'none',
        overflow: 'hidden',
      }}
    />
  )
}
