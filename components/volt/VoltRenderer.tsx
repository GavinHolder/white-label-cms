'use client'
import { useEffect, useRef } from 'react'
import type { VoltElementData, VoltSlots, VoltInstanceOverrides } from '@/types/volt'
import { sortLayersByZ } from '@/lib/volt/volt-utils'
import { personalityToAnimeConfig } from '@/lib/volt/personality-to-anime'
import VoltSvgLayer from './VoltSvgLayer'
import VoltSlotRenderer from './VoltSlotRenderer'

// Anime.js v4 animate() returns an Animation instance with a .cancel() method.
type AnimeAnimation = { cancel: () => void }

interface Props {
  voltElement: VoltElementData
  slots?: VoltSlots
  /** Per-instance layer overrides — applied without modifying the master Volt design */
  instanceOverrides?: VoltInstanceOverrides
  className?: string
  style?: React.CSSProperties
  /** Called whenever hover state changes — lets VoltBlock drive 3D hover animations */
  onHoverChange?: (hovered: boolean) => void
}

export default function VoltRenderer({ voltElement, slots = {}, instanceOverrides, className, style, onHoverChange }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const flipInnerRef  = useRef<HTMLDivElement>(null)  // flip3d preserve-3d container
  const frontFaceRef  = useRef<HTMLDivElement>(null)  // front face div (all types)
  const backFaceRef   = useRef<HTMLDivElement>(null)  // back face div (all types)
  const activeAnimationsRef = useRef<AnimeAnimation[]>([])
  const isFlippedRef  = useRef(false)
  const autoTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const { layers, states, canvasWidth, canvasHeight, flipCard } = voltElement
  const sortedLayers = sortLayersByZ(layers)

  const isFlip         = !!(flipCard?.enabled)
  const flipAnimType   = flipCard?.animType    ?? 'flip3d'
  const flipTrigger    = flipCard?.trigger     ?? 'hover'
  const flipAxis       = flipCard?.axis === 'x' ? 'rotateX' : 'rotateY'
  const flipDuration   = flipCard?.duration    ?? 600
  const flipEase       = flipCard?.ease        ?? 'easeInOut'
  const flipDirection  = flipCard?.direction   ?? 'right'
  const flipPerspective = flipCard?.perspective ?? 1200
  const flipAutoInterval = flipCard?.autoInterval ?? 3000

  // Layers split by face for flip card mode.
  const frontLayers = isFlip ? sortedLayers.filter(l => l.face !== 'back') : sortedLayers
  const backLayers  = isFlip ? sortedLayers.filter(l => l.face === 'back')  : []

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // ── Layer state transitions (hover/rest/focus) ─────────────────────────────
    async function transitionToState(targetStateName: string) {
      const { animate } = await import('animejs')
      const targetState = states.find(s => s.name === targetStateName)
      if (!targetState && targetStateName !== 'rest') return

      const overrides = targetState?.layerOverrides ?? {}
      const isRest = targetStateName === 'rest'

      const ROLE_ORDER = ['accent', 'structure', 'overlay', 'background', 'content']
      const staggeredLayers = [...layers].sort((a, b) =>
        ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
      )

      let staggerIndex = 0
      for (const layer of staggeredLayers) {
        const override = overrides[layer.id]
        const { animates } = layer.animation
        const anyAnimates = animates.opacity || animates.scale || animates.position || animates.rotation

        if (!override && !isRest) continue
        if (!override && isRest && !anyAnimates) continue

        const layerEl = el?.querySelector(`#volt-layer-${layer.id}`)
        if (!layerEl) continue

        const { duration, ease, delay } = personalityToAnimeConfig(layer.animation)
        const targets: Record<string, unknown> = {}

        if (animates.opacity)  targets.opacity   = isRest ? (override?.opacity   ?? layer.opacity)     : (override?.opacity   ?? layer.opacity)
        if (animates.scale)    targets.scale      = isRest ? (override?.scale     ?? 1)                 : (override?.scale     ?? 1)
        if (animates.position) { targets.translateX = isRest ? (override?.translateX ?? 0) : (override?.translateX ?? 0); targets.translateY = isRest ? (override?.translateY ?? 0) : (override?.translateY ?? 0) }
        if (animates.rotation) targets.rotate     = isRest ? `${override?.rotation ?? 0}deg`            : `${override?.rotation ?? 0}deg`

        if (Object.keys(targets).length === 0) continue

        const anim = animate(layerEl, {
          ...targets,
          duration,
          ease,
          delay: (delay ?? 0) + staggerIndex * 40,
        }) as AnimeAnimation
        activeAnimationsRef.current.push(anim)
        staggerIndex++
      }
    }

    // ── Flip animation dispatcher ──────────────────────────────────────────────
    async function animateFlip(toBack: boolean) {
      // Cancel any in-flight flip animations
      activeAnimationsRef.current.forEach(a => a.cancel())
      activeAnimationsRef.current = []

      const { animate } = await import('animejs')

      // ── flip3d ────────────────────────────────────────────────────────────────
      if (flipAnimType === 'flip3d') {
        const inner = flipInnerRef.current
        if (!inner) return
        const anim = animate(inner, {
          [flipAxis]: toBack ? '180deg' : '0deg',
          duration: flipDuration,
          ease: flipEase,
        }) as AnimeAnimation
        activeAnimationsRef.current.push(anim)

      // ── slide ─────────────────────────────────────────────────────────────────
      } else if (flipAnimType === 'slide') {
        const front = frontFaceRef.current
        const back  = backFaceRef.current
        if (!front || !back) return

        const isHoriz  = flipDirection === 'left' || flipDirection === 'right'
        const prop     = isHoriz ? 'translateX' : 'translateY'
        // Which direction the front slides OUT when going to back
        const outVal   = (flipDirection === 'right' || flipDirection === 'down') ? '-100%' : '100%'
        // Where the back starts before sliding IN
        const inStart  = (flipDirection === 'right' || flipDirection === 'down') ? '100%'  : '-100%'

        if (toBack) {
          // Reset back to off-screen start position
          if (isHoriz) back.style.transform = `translateX(${inStart})`
          else         back.style.transform = `translateY(${inStart})`
          const a1 = animate(front, { [prop]: outVal, duration: flipDuration, ease: flipEase }) as AnimeAnimation
          const a2 = animate(back,  { [prop]: '0%',   duration: flipDuration, ease: flipEase }) as AnimeAnimation
          activeAnimationsRef.current.push(a1, a2)
        } else {
          if (isHoriz) front.style.transform = `translateX(${inStart})`
          else         front.style.transform = `translateY(${inStart})`
          const a1 = animate(back,  { [prop]: outVal, duration: flipDuration, ease: flipEase }) as AnimeAnimation
          const a2 = animate(front, { [prop]: '0%',   duration: flipDuration, ease: flipEase }) as AnimeAnimation
          activeAnimationsRef.current.push(a1, a2)
        }

      // ── scalefade ─────────────────────────────────────────────────────────────
      } else if (flipAnimType === 'scalefade') {
        const front = frontFaceRef.current
        const back  = backFaceRef.current
        if (!front || !back) return

        const half = Math.round(flipDuration * 0.5)

        if (toBack) {
          // Phase 1: front shrinks + fades out
          const a1 = animate(front, { opacity: 0, scale: 0.85, duration: half, ease: 'easeIn' }) as AnimeAnimation
          activeAnimationsRef.current.push(a1)
          // Phase 2: back scales up + fades in
          const a2 = animate(back,  { opacity: 1, scale: 1,    duration: half, ease: 'easeOut', delay: half }) as AnimeAnimation
          activeAnimationsRef.current.push(a2)
        } else {
          const a1 = animate(back,  { opacity: 0, scale: 0.85, duration: half, ease: 'easeIn' }) as AnimeAnimation
          activeAnimationsRef.current.push(a1)
          const a2 = animate(front, { opacity: 1, scale: 1,    duration: half, ease: 'easeOut', delay: half }) as AnimeAnimation
          activeAnimationsRef.current.push(a2)
        }

      // ── swing (door hinge) ────────────────────────────────────────────────────
      } else if (flipAnimType === 'swing') {
        const front = frontFaceRef.current
        const back  = backFaceRef.current
        if (!front || !back) return

        const half = Math.round(flipDuration * 0.5)
        const rotProp = flipAxis  // 'rotateY' or 'rotateX'

        // transformOrigin: the edge that acts as the hinge
        const originMap: Record<string, string> = {
          right: '0% 50%',    // hinge on left edge, right side opens
          left:  '100% 50%',  // hinge on right edge, left side opens
          down:  '50% 0%',    // hinge on top edge, bottom opens
          up:    '50% 100%',  // hinge on bottom edge, top opens
        }
        const origin   = originMap[flipDirection] ?? '0% 50%'
        const frontOut = (flipDirection === 'right' || flipDirection === 'down') ? '-90deg' : '90deg'
        const backFrom = (flipDirection === 'right' || flipDirection === 'down') ? '90deg'  : '-90deg'

        front.style.transformOrigin = origin
        back.style.transformOrigin  = origin

        if (toBack) {
          // Reset back to its start angle
          back.style.transform = `${rotProp}(${backFrom})`
          const a1 = animate(front, { [rotProp]: frontOut, duration: half, ease: 'easeIn' }) as AnimeAnimation
          // Slight overlap (45% delay) for seamless transition
          const a2 = animate(back,  { [rotProp]: '0deg',   duration: half, ease: 'easeOut', delay: Math.round(flipDuration * 0.45) }) as AnimeAnimation
          activeAnimationsRef.current.push(a1, a2)
        } else {
          front.style.transform = `${rotProp}(${backFrom})`
          const a1 = animate(back,  { [rotProp]: frontOut, duration: half, ease: 'easeIn' }) as AnimeAnimation
          const a2 = animate(front, { [rotProp]: '0deg',   duration: half, ease: 'easeOut', delay: Math.round(flipDuration * 0.45) }) as AnimeAnimation
          activeAnimationsRef.current.push(a1, a2)
        }
      }

      isFlippedRef.current = toBack
    }

    // ── Event wiring ───────────────────────────────────────────────────────────
    const onEnter = () => {
      transitionToState('hover')
      onHoverChange?.(true)
      if (isFlip && flipTrigger === 'hover' && !isFlippedRef.current) animateFlip(true)
    }
    const onLeave = () => {
      transitionToState('rest')
      onHoverChange?.(false)
      if (isFlip && flipTrigger === 'hover' && isFlippedRef.current) animateFlip(false)
    }
    const onClick = () => {
      if (!isFlip || flipTrigger !== 'click') return
      const next = !isFlippedRef.current
      animateFlip(next)
      transitionToState(next ? 'hover' : 'rest')
      onHoverChange?.(next)
    }
    const onFocus = () => { if (flipTrigger !== 'click') { transitionToState('focus'); onHoverChange?.(true) } }
    const onBlur  = () => { if (flipTrigger !== 'click') { transitionToState('rest');  onHoverChange?.(false) } }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('click',      onClick)
    el.addEventListener('focusin',    onFocus)
    el.addEventListener('focusout',   onBlur)

    // Auto-trigger loop
    if (isFlip && flipTrigger === 'auto') {
      autoTimerRef.current = setInterval(() => {
        const next = !isFlippedRef.current
        animateFlip(next)
      }, flipAutoInterval)
    }

    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('click',      onClick)
      el.removeEventListener('focusin',    onFocus)
      el.removeEventListener('focusout',   onBlur)
      activeAnimationsRef.current.forEach(anim => anim.cancel())
      activeAnimationsRef.current = []
      if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null }
    }
  }, [voltElement, isFlip, flipAnimType, flipTrigger, flipAxis, flipDuration, flipEase, flipDirection, flipPerspective, flipAutoInterval])

  const aspectRatio = `${canvasWidth} / ${canvasHeight}`

  /** Glass overlay divs for vector layers whose primary fill is type 'glass'. */
  function renderGlassOverlays(layerList: typeof sortedLayers) {
    return layerList
      .filter(l => l.type === 'vector' && l.visible !== false && l.vectorData?.fills?.[0]?.type === 'glass')
      .map(layer => {
        const fill = layer.vectorData!.fills[0]
        const blur = fill.blur ?? 12
        const bgOpacity = fill.opacity ?? 0.15
        const borderOpacity = fill.borderOpacity ?? 0.3
        const radius = fill.glassBorderRadius ?? 12
        const bgColor = fill.color ?? '#ffffff'
        const r = parseInt(bgColor.slice(1, 3), 16) || 255
        const g = parseInt(bgColor.slice(3, 5), 16) || 255
        const b = parseInt(bgColor.slice(5, 7), 16) || 255
        return (
          <div
            key={`glass-${layer.id}`}
            style={{
              position: 'absolute',
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              width: `${layer.width}%`,
              height: `${layer.height}%`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              backgroundColor: `rgba(${r},${g},${b},${bgOpacity})`,
              border: `1px solid rgba(255,255,255,${borderOpacity})`,
              borderRadius: `${radius}px`,
              opacity: layer.opacity ?? 1,
              pointerEvents: 'none',
            }}
          />
        )
      })
  }

  /** Renders a single face's layers (vectors, slots, images). */
  function renderFaceContent(faceLayers: typeof sortedLayers) {
    return (
      <>
        {renderGlassOverlays(faceLayers)}
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          {faceLayers
            .filter(l => l.type === 'vector')
            .map(layer => (
              <VoltSvgLayer
                key={layer.id}
                layer={layer}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                instanceOverride={instanceOverrides?.[layer.id]}
              />
            ))}
        </svg>

        {faceLayers
          .filter(l => l.type === 'slot')
          .map(layer => (
            <VoltSlotRenderer
              key={layer.id}
              layer={layer}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              slots={slots}
            />
          ))}

        {faceLayers
          .filter(l => l.type === 'image' && l.visible !== false && l.imageData?.url)
          .map(layer => (
            <div
              key={layer.id}
              id={`volt-layer-${layer.id}`}
              style={{
                position: 'absolute',
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                width: `${layer.width}%`,
                height: `${layer.height}%`,
                opacity: layer.opacity ?? 1,
                transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={layer.imageData!.url}
                alt={layer.imageData!.alt ?? ''}
                style={{
                  width: '100%', height: '100%',
                  objectFit: layer.imageData!.mode === 'fit' ? 'contain' : 'cover',
                  display: 'block',
                }}
              />
            </div>
          ))}
      </>
    )
  }

  // ── Flip card mode ────────────────────────────────────────────────────────────
  if (isFlip) {
    const needs3DPerspective = flipAnimType === 'flip3d' || flipAnimType === 'swing'
    const clickable = flipTrigger === 'click'

    // Compute initial transforms for back face based on animation type
    let backInitTransform: string | undefined
    let backInitOpacity: number | undefined

    if (flipAnimType === 'flip3d') {
      backInitTransform = flipCard?.axis === 'x' ? 'rotateX(180deg)' : 'rotateY(180deg)'
    } else if (flipAnimType === 'slide') {
      const isHoriz = flipDirection === 'left' || flipDirection === 'right'
      const inStart = (flipDirection === 'right' || flipDirection === 'down') ? '100%' : '-100%'
      backInitTransform = isHoriz ? `translateX(${inStart})` : `translateY(${inStart})`
    } else if (flipAnimType === 'scalefade') {
      backInitTransform = 'scale(0.85)'
      backInitOpacity   = 0
    } else if (flipAnimType === 'swing') {
      const backFrom = (flipDirection === 'right' || flipDirection === 'down') ? '90deg' : '-90deg'
      backInitTransform = `${flipAxis}(${backFrom})`
    }

    if (flipAnimType === 'flip3d') {
      return (
        <div
          ref={containerRef}
          className={className}
          style={{
            position: 'relative', width: '100%', aspectRatio,
            perspective: `${flipPerspective}px`,
            cursor: clickable ? 'pointer' : undefined,
            ...style,
          }}
        >
          {/* preserve-3d container — animejs rotates this for the 3D flip */}
          <div
            ref={flipInnerRef}
            style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}
          >
            <div ref={frontFaceRef} style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden' }}>
              {renderFaceContent(frontLayers)}
            </div>
            <div
              ref={backFaceRef}
              style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden', transform: backInitTransform }}
            >
              {renderFaceContent(backLayers)}
            </div>
          </div>
        </div>
      )
    }

    // slide / scalefade / swing — both faces overlap, animated independently
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          position: 'relative', width: '100%', aspectRatio,
          overflow: flipAnimType === 'slide' ? 'hidden' : undefined,
          perspective: needs3DPerspective ? `${flipPerspective}px` : undefined,
          cursor: clickable ? 'pointer' : undefined,
          ...style,
        }}
      >
        <div
          ref={frontFaceRef}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
        >
          {renderFaceContent(frontLayers)}
        </div>
        <div
          ref={backFaceRef}
          style={{
            position: 'absolute', inset: 0, overflow: 'hidden',
            transform: backInitTransform,
            opacity: backInitOpacity,
          }}
        >
          {renderFaceContent(backLayers)}
        </div>
      </div>
    )
  }

  // ── Standard (non-flip) mode ──────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', aspectRatio, overflow: 'hidden', ...style }}
    >
      {renderGlassOverlays(sortedLayers)}
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        {sortedLayers
          .filter(l => l.type === 'vector')
          .map(layer => (
            <VoltSvgLayer
              key={layer.id}
              layer={layer}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              instanceOverride={instanceOverrides?.[layer.id]}
            />
          ))}
      </svg>

      {sortedLayers
        .filter(l => l.type === 'slot')
        .map(layer => (
          <VoltSlotRenderer
            key={layer.id}
            layer={layer}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            slots={slots}
          />
        ))}

      {sortedLayers
        .filter(l => l.type === 'image' && l.visible !== false && l.imageData?.url)
        .map(layer => (
          <div
            key={layer.id}
            id={`volt-layer-${layer.id}`}
            style={{
              position: 'absolute',
              left: `${layer.x}%`,
              top: `${layer.y}%`,
              width: `${layer.width}%`,
              height: `${layer.height}%`,
              opacity: layer.opacity ?? 1,
              transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.imageData!.url}
              alt={layer.imageData!.alt ?? ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: layer.imageData!.mode === 'fit' ? 'contain' : 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
    </div>
  )
}
