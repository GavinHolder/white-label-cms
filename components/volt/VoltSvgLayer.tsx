'use client'
import type { VoltLayer, VoltLayerInstanceOverride } from '@/types/volt'

interface Props {
  layer: VoltLayer
  canvasWidth: number
  canvasHeight: number
  instanceOverride?: VoltLayerInstanceOverride
}

export default function VoltSvgLayer({ layer, canvasWidth, canvasHeight, instanceOverride }: Props) {
  const isVisible = instanceOverride?.visible !== undefined ? instanceOverride.visible : layer.visible
  if (!isVisible || layer.type !== 'vector' || !layer.vectorData) return null

  const { vectorData, opacity, blendMode, rotation, x, y, width, height } = layer
  const ax = (x / 100) * canvasWidth
  const ay = (y / 100) * canvasHeight
  const aw = (width / 100) * canvasWidth
  const ah = (height / 100) * canvasHeight
  const cx = ax + aw / 2
  const cy = ay + ah / 2

  const fills = vectorData.fills ?? []
  const stroke = vectorData.stroke
  const primaryFill = fills[0]
  let fillAttr = 'none'
  if (instanceOverride?.fill) {
    fillAttr = instanceOverride.fill
  } else if (primaryFill?.type === 'solid' && primaryFill.color) {
    fillAttr = primaryFill.color
  }

  const strokeAttr = stroke ? {
    stroke: stroke.color,
    strokeOpacity: stroke.opacity,
    strokeWidth: stroke.width,
    strokeLinecap: stroke.cap,
    strokeLinejoin: stroke.join,
    strokeDasharray: stroke.dash?.join(' ') ?? undefined,
  } : {}

  // pathData coords are in % space (0-100); scale to canvas pixel space
  const scaleTransform = `scale(${canvasWidth / 100}, ${canvasHeight / 100})`
  const rotateTransform = rotation ? `rotate(${rotation} ${cx} ${cy})` : undefined
  const transform = [rotateTransform, scaleTransform].filter(Boolean).join(' ')

  // Outer <g> receives the anime.js CSS-transform animations (translateX/Y, scale, rotate).
  // Inner <g> holds the SVG coordinate-mapping transforms (scale to canvas px, base rotation).
  // Separating them prevents anime CSS transforms from clobbering the SVG attribute transforms.
  return (
    <g
      id={`volt-layer-${layer.id}`}
      opacity={opacity}
      style={{ mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'] }}
    >
      <g transform={transform || undefined}>
        <path
          d={vectorData.pathData}
          fill={fillAttr}
          fillOpacity={primaryFill?.opacity ?? 1}
          {...strokeAttr}
        />
      </g>
    </g>
  )
}
