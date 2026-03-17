'use client'
import { nanoid } from 'nanoid'
import type { VoltLayer, VoltFill, VoltStroke, VoltObject3DData, LayerRole, SlotType, Volt3DAnimTrigger, Volt3DEasing } from '@/types/volt'

interface Props {
  selectedLayer: VoltLayer | null
  onUpdateLayer: (id: string, updates: Partial<VoltLayer>) => void
}

const ROLE_OPTIONS: LayerRole[] = ['background', 'structure', 'accent', 'content', 'overlay']
const SLOT_TYPES: SlotType[] = ['title', 'body', 'image', 'action', 'badge', 'icon', 'custom']

export default function VoltPropertyInspector({ selectedLayer, onUpdateLayer }: Props) {
  if (!selectedLayer) {
    return (
      <div style={{
        width: 240, background: '#12122a', borderLeft: '1px solid #1e1e3a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#3d3d5c', fontSize: 13 }}>Select a layer</span>
      </div>
    )
  }

  const { id, vectorData, slotData, opacity, role } = selectedLayer
  const fills = vectorData?.fills ?? []
  const stroke = vectorData?.stroke

  function updateVectorData(updates: Partial<NonNullable<VoltLayer['vectorData']>>) {
    if (!vectorData) return
    onUpdateLayer(id, { vectorData: { ...vectorData, ...updates } })
  }

  function updateFill(fillId: string, updates: Partial<VoltFill>) {
    updateVectorData({ fills: fills.map(f => f.id === fillId ? { ...f, ...updates } : f) })
  }

  function addFill() {
    updateVectorData({
      fills: [...fills, { id: nanoid(), type: 'solid', color: '#6366f1', opacity: 1, blendMode: 'normal' as const }],
    })
  }

  function removeFill(fillId: string) {
    updateVectorData({ fills: fills.filter(f => f.id !== fillId) })
  }

  function addStroke() {
    updateVectorData({
      stroke: { color: '#000000', opacity: 1, width: 1, align: 'center', cap: 'butt', join: 'miter' },
    })
  }

  function updateStroke(updates: Partial<VoltStroke>) {
    if (!stroke) return
    updateVectorData({ stroke: { ...stroke, ...updates } })
  }

  return (
    <div style={{
      width: 240, background: '#12122a', borderLeft: '1px solid #1e1e3a',
      overflowY: 'auto', flexShrink: 0,
    }}>
      <div style={{ padding: 12 }}>

        <Section label="Layer">
          <input
            value={selectedLayer.name}
            onChange={e => onUpdateLayer(id, { name: e.target.value })}
            style={inputStyle}
          />
        </Section>

        <Section label="Role">
          <select
            value={role}
            onChange={e => onUpdateLayer(id, { role: e.target.value as LayerRole })}
            style={inputStyle}
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Section>

        <Section label="Opacity">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="range" min={0} max={1} step={0.01}
              value={opacity}
              onChange={e => onUpdateLayer(id, { opacity: parseFloat(e.target.value) })}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8', width: 36, textAlign: 'right' }}>
              {Math.round(opacity * 100)}%
            </span>
          </div>
        </Section>

        {selectedLayer.type === 'vector' && (
          <>
            <Section label="Fill" action={<PlusBtn onClick={addFill} />}>
              {fills.length === 0 && (
                <button
                  onClick={addFill}
                  style={{
                    ...inputStyle, background: '#1e1e3a', border: '1px dashed #3d3d5c',
                    cursor: 'pointer', color: '#64748b', textAlign: 'center', padding: '6px',
                    width: '100%',
                  }}
                >
                  + Add fill
                </button>
              )}
              {fills.map(fill => (
                <div key={fill.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <input
                    type="color"
                    value={fill.color ?? '#6366f1'}
                    onChange={e => updateFill(fill.id, { color: e.target.value })}
                    style={{ width: 28, height: 28, border: 'none', borderRadius: 4,
                      cursor: 'pointer', padding: 2, background: 'transparent' }}
                  />
                  <input
                    value={fill.color ?? '#6366f1'}
                    onChange={e => {
                      const v = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateFill(fill.id, { color: v })
                    }}
                    style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                  />
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={fill.opacity}
                    onChange={e => updateFill(fill.id, { opacity: parseFloat(e.target.value) })}
                    style={{ width: 50 }}
                  />
                  <button
                    onClick={() => removeFill(fill.id)}
                    title="Remove fill"
                    style={{ background: 'none', border: 'none', color: '#64748b',
                      cursor: 'pointer', fontSize: 14, padding: 0 }}
                  >×</button>
                </div>
              ))}
            </Section>

            <Section
              label="Stroke"
              action={
                stroke
                  ? <button
                      onClick={() => updateVectorData({ stroke: undefined })}
                      style={{ background: 'none', border: 'none', color: '#64748b',
                        cursor: 'pointer', fontSize: 11 }}
                    >Remove</button>
                  : <PlusBtn onClick={addStroke} />
              }
            >
              {stroke && (
                <>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <input
                      type="color" value={stroke.color}
                      onChange={e => updateStroke({ color: e.target.value })}
                      style={{ width: 28, height: 28, border: 'none', borderRadius: 4,
                        cursor: 'pointer', padding: 2, background: 'transparent' }}
                    />
                    <input
                      value={stroke.color}
                      onChange={e => {
                        const v = e.target.value
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateStroke({ color: v })
                      }}
                      style={{ ...inputStyle, flex: 1, fontSize: 11 }}
                    />
                    <span style={{ color: '#64748b', fontSize: 11 }}>W</span>
                    <input
                      type="number" min={0.5} max={50} step={0.5}
                      value={stroke.width}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateStroke({ width: v }) }}
                      style={{ ...inputStyle, width: 44, textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['inside', 'center', 'outside'] as const).map(a => (
                      <button
                        key={a}
                        onClick={() => updateStroke({ align: a })}
                        title={`Stroke align: ${a}`}
                        style={{
                          ...pillStyle,
                          background: stroke.align === a ? '#6366f1' : '#1e1e3a',
                        }}
                      >
                        {a.slice(0, 2)}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {([['butt', 'Bt'], ['round', 'Rd'], ['square', 'Sq']] as const).map(([cap, label]) => (
                      <button
                        key={cap}
                        onClick={() => updateStroke({ cap })}
                        title={`Stroke cap: ${cap}`}
                        style={{
                          ...pillStyle,
                          background: stroke.cap === cap ? '#6366f1' : '#1e1e3a',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </Section>
          </>
        )}

        {selectedLayer.type === 'slot' && slotData && (
          <Section label="Slot Config">
            <div style={{ marginBottom: 6 }}>
              <label style={labelStyle}>Type</label>
              <select
                value={slotData.slotType}
                onChange={e => onUpdateLayer(id, {
                  slotData: { ...slotData, slotType: e.target.value as SlotType }
                })}
                style={inputStyle}
              >
                {SLOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={labelStyle}>Label</label>
              <input
                value={slotData.slotLabel}
                onChange={e => onUpdateLayer(id, {
                  slotData: { ...slotData, slotLabel: e.target.value }
                })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Maps to field</label>
              <input
                value={slotData.contentFieldHint}
                onChange={e => onUpdateLayer(id, {
                  slotData: { ...slotData, contentFieldHint: e.target.value }
                })}
                placeholder="e.g. heading, body, imageUrl"
                style={inputStyle}
              />
            </div>
          </Section>
        )}

        {selectedLayer.type === '3d-object' && (
          <Volt3DPanel
            data={selectedLayer.object3DData}
            onUpdate={updates => onUpdateLayer(id, {
              object3DData: { ...selectedLayer.object3DData!, ...updates },
            })}
          />
        )}

      </div>
    </div>
  )
}

// ── 3D Object inspector panel ─────────────────────────────────────────────────

function XYZRow({
  label, value, onChange,
}: {
  label: string
  value: { x: number; y: number; z: number }
  onChange: (v: { x: number; y: number; z: number }) => void
}) {
  function num(field: 'x' | 'y' | 'z', raw: string) {
    const n = parseFloat(raw)
    if (!isNaN(n)) onChange({ ...value, [field]: n })
  }
  return (
    <div style={{ marginBottom: 6 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 4 }}>
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} style={{ flex: 1 }}>
            <span style={{ ...labelStyle, textAlign: 'center', display: 'block' }}>{axis.toUpperCase()}</span>
            <input
              type="number" step={0.1}
              value={value[axis]}
              onChange={e => num(axis, e.target.value)}
              style={{ ...inputStyle, textAlign: 'center', padding: '3px 4px' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function Volt3DPanel({
  data, onUpdate,
}: {
  data: VoltObject3DData | undefined
  onUpdate: (updates: Partial<VoltObject3DData>) => void
}) {
  const d = data ?? {} as Partial<VoltObject3DData>
  const animTrigger = (d.animTrigger ?? 'none') as Volt3DAnimTrigger
  const easing      = (d.transitionEasing ?? 'easeOut') as Volt3DEasing
  const hasAnim     = animTrigger !== 'none'
  const isHover     = animTrigger === '3d-hover'
  const isAuto      = animTrigger === '3d-auto'

  return (
    <>
      <Section label="3D Asset">
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
          {d.assetName ?? 'No asset loaded'}
        </div>
      </Section>

      <Section label="Camera">
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {[['Azimuth', 'cameraAzimuth', 0, 360], ['Elevation', 'cameraElevation', -90, 90], ['Distance', 'cameraDistance', 0.5, 20]] .map(([lbl, key, min, max]) => (
            <div key={key as string} style={{ flex: 1 }}>
              <label style={labelStyle}>{lbl as string}</label>
              <input
                type="number" min={min as number} max={max as number} step={0.5}
                value={(d as any)[key] ?? 0}
                onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ [key as string]: n } as any) }}
                style={{ ...inputStyle, textAlign: 'center', padding: '3px 4px' }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section label="Lighting">
        <div style={{ display: 'flex', gap: 4 }}>
          {[['Ambient', 'ambientIntensity', 0, 5], ['Key', 'keyLightIntensity', 0, 5], ['Angle°', 'keyLightAngle', 0, 360]] .map(([lbl, key, min, max]) => (
            <div key={key as string} style={{ flex: 1 }}>
              <label style={labelStyle}>{lbl as string}</label>
              <input
                type="number" min={min as number} max={max as number} step={0.1}
                value={(d as any)[key] ?? 0}
                onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ [key as string]: n } as any) }}
                style={{ ...inputStyle, textAlign: 'center', padding: '3px 4px' }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section label="Animation Trigger">
        <div style={{ display: 'flex', gap: 4 }}>
          {(['none', '3d-hover', '3d-auto'] as Volt3DAnimTrigger[]).map(t => (
            <button
              key={t}
              onClick={() => onUpdate({ animTrigger: t })}
              style={{
                ...pillStyle, flex: 1,
                background: animTrigger === t ? '#6366f1' : '#1e1e3a',
              }}
            >
              {t === 'none' ? 'None' : t === '3d-hover' ? 'Hover' : 'Auto'}
            </button>
          ))}
        </div>
      </Section>

      {hasAnim && (
        <Section label="Transition">
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Easing</label>
            <select
              value={easing}
              onChange={e => onUpdate({ transitionEasing: e.target.value as Volt3DEasing })}
              style={inputStyle}
            >
              {(['linear', 'easeIn', 'easeOut', 'easeInOut', 'spring'] as Volt3DEasing[]).map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          {!isAuto && (
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Duration (ms)</label>
                <input
                  type="number" min={50} max={5000} step={50}
                  value={d.transitionDuration ?? 600}
                  onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ transitionDuration: n }) }}
                  style={inputStyle}
                />
              </div>
              {isHover && (
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Delay (ms)</label>
                  <input
                    type="number" min={0} max={2000} step={50}
                    value={d.transitionDelay ?? 0}
                    onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ transitionDelay: n }) }}
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          )}
          {isAuto && (
            <div>
              <label style={labelStyle}>Period (ms)</label>
              <input
                type="number" min={200} max={10000} step={100}
                value={d.autoPeriod ?? 2000}
                onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ autoPeriod: n }) }}
                style={inputStyle}
              />
            </div>
          )}
        </Section>
      )}

      {hasAnim && (
        <Section label={isAuto ? 'State A (start)' : 'Start State (rest)'}>
          <XYZRow
            label="Position"
            value={d.positionStart ?? { x: 0, y: 0, z: 0 }}
            onChange={v => onUpdate({ positionStart: v })}
          />
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Scale</label>
            <input
              type="number" min={0.01} max={10} step={0.05}
              value={d.scaleStart ?? 1}
              onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ scaleStart: n }) }}
              style={inputStyle}
            />
          </div>
          <XYZRow
            label="Rotation (°)"
            value={d.rotationStart ?? { x: 0, y: 0, z: 0 }}
            onChange={v => onUpdate({ rotationStart: v })}
          />
        </Section>
      )}

      {hasAnim && (
        <Section label={isAuto ? 'State B (end)' : 'End State (hover)'}>
          <XYZRow
            label="Position"
            value={d.positionEnd ?? { x: 0, y: 0, z: 0 }}
            onChange={v => onUpdate({ positionEnd: v })}
          />
          <div style={{ marginBottom: 6 }}>
            <label style={labelStyle}>Scale</label>
            <input
              type="number" min={0.01} max={10} step={0.05}
              value={d.scaleEnd ?? 1}
              onChange={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onUpdate({ scaleEnd: n }) }}
              style={inputStyle}
            />
          </div>
          <XYZRow
            label="Rotation (°)"
            value={d.rotationEnd ?? { x: 0, y: 0, z: 0 }}
            onChange={v => onUpdate({ rotationEnd: v })}
          />
        </Section>
      )}
    </>
  )
}

function Section({
  label, children, action,
}: {
  label: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: '#64748b',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  )
}

function PlusBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        color: '#6366f1', cursor: 'pointer', fontSize: 16, lineHeight: 1,
      }}
    >
      +
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1e1e3a', border: '1px solid #2d2d44', borderRadius: 4,
  color: '#e2e8f0', fontSize: 12, padding: '4px 8px', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, color: '#64748b', marginBottom: 3,
}

const pillStyle: React.CSSProperties = {
  border: 'none', borderRadius: 3, color: '#e2e8f0',
  padding: '2px 6px', fontSize: 11, cursor: 'pointer', flex: 1,
}
