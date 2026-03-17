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
  const containerRef = useRef<HTMLDivElement>(null)
  // Track in-flight animations so cleanup can cancel them (anime v4 pattern).
  const activeAnimationsRef = useRef<AnimeAnimation[]>([])
  const { layers, states, canvasWidth, canvasHeight } = voltElement
  const sortedLayers = sortLayersByZ(layers)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    async function transitionToState(targetStateName: string) {
      const { animate } = await import('animejs')
      const targetState = states.find(s => s.name === targetStateName)
      // Allow 'rest' to proceed even without an explicit state entry (resets to defaults)
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

        // On rest transition: reset any layer that has animatable properties, even without
        // an explicit rest override — prevents layers sticking in hover state on mouse-leave.
        if (!override && !isRest) continue
        if (!override && isRest && !anyAnimates) continue

        const layerEl = el?.querySelector(`#volt-layer-${layer.id}`)
        if (!layerEl) continue

        const { duration, ease, delay } = personalityToAnimeConfig(layer.animation)
        const targets: Record<string, unknown> = {}

        if (animates.opacity) {
          targets.opacity = isRest
            ? (override?.opacity ?? layer.opacity)
            : (override?.opacity ?? layer.opacity)
        }
        if (animates.scale) {
          targets.scale = isRest ? (override?.scale ?? 1) : (override?.scale ?? 1)
        }
        if (animates.position) {
          // translateX/Y are CSS-space pixel offsets applied to the outer <g> wrapper.
          // Returning to rest always snaps back to 0 unless the rest state says otherwise.
          targets.translateX = isRest ? (override?.translateX ?? 0) : (override?.translateX ?? 0)
          targets.translateY = isRest ? (override?.translateY ?? 0) : (override?.translateY ?? 0)
        }
        if (animates.rotation) {
          // 'rotate' animates the CSS rotate property on the outer <g>.
          // Base layer.rotation is already baked into the inner SVG transform — this is a delta.
          targets.rotate = isRest
            ? `${override?.rotation ?? 0}deg`
            : `${override?.rotation ?? 0}deg`
        }

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

    const onEnter = () => { transitionToState('hover'); onHoverChange?.(true) }
    const onLeave = () => { transitionToState('rest');  onHoverChange?.(false) }
    const onFocus  = () => { transitionToState('focus'); onHoverChange?.(true) }
    const onBlur   = () => { transitionToState('rest');  onHoverChange?.(false) }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('focusin',    onFocus)
    el.addEventListener('focusout',   onBlur)

    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('focusin',    onFocus)
      el.removeEventListener('focusout',   onBlur)
      // Cancel any in-flight animations (anime v4: Animation.cancel()).
      activeAnimationsRef.current.forEach(anim => anim.cancel())
      activeAnimationsRef.current = []
    }
  }, [voltElement])

  const aspectRatio = `${canvasWidth} / ${canvasHeight}`

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', aspectRatio, overflow: 'hidden', ...style }}
    >
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
