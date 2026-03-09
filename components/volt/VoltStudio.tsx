'use client'
import { useReducer, useEffect, useCallback } from 'react'
import type { VoltElementData, VoltLayer, VoltTool } from '@/types/volt'
import { voltReducer, createInitialState } from '@/lib/volt/volt-reducer'
import { createNewVoltElement } from '@/lib/volt/volt-defaults'
import VoltToolbar from './VoltToolbar'
import VoltCanvas from './VoltCanvas'
import VoltLayerPanel from './VoltLayerPanel'
import VoltPropertyInspector from './VoltPropertyInspector'

interface Props {
  initialElement?: VoltElementData
  authorId: string
  onSave?: (element: VoltElementData) => Promise<void>
}

const STATE_TABS = ['rest', 'hover', 'focus', 'active'] as const

export default function VoltStudio({ initialElement, authorId, onSave }: Props) {
  const element = initialElement ?? createNewVoltElement(authorId)
  const [state, dispatch] = useReducer(voltReducer, createInitialState(element))

  useEffect(() => {
    const TOOL_SHORTCUTS: Record<string, VoltTool> = {
      v: 'select', r: 'rectangle', e: 'ellipse', l: 'line', p: 'pen', s: 'slot', h: 'hand',
    }
    function onKeyDown(ev: KeyboardEvent) {
      const tag = (ev.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const tool = TOOL_SHORTCUTS[ev.key.toLowerCase()]
      if (tool) { dispatch({ type: 'SET_TOOL', tool }); return }

      if ((ev.metaKey || ev.ctrlKey) && ev.key === 'z') {
        ev.preventDefault()
        if (ev.shiftKey) dispatch({ type: 'REDO' })
        else dispatch({ type: 'UNDO' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    await onSave(state.element)
    dispatch({ type: 'MARK_SAVED' })
  }, [state.element, onSave])

  const selectedLayer = state.element.layers.find(l => l.id === state.selectedLayerId) ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a1a', color: '#e2e8f0' }}>
      {/* Top Bar */}
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        background: '#12122a', borderBottom: '1px solid #1e1e3a', flexShrink: 0,
      }}>
        <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 16 }}>&#9889;</span>

        <input
          value={state.element.name}
          onChange={e => dispatch({ type: 'SET_ELEMENT_NAME', name: e.target.value })}
          style={{
            background: 'transparent', border: '1px solid transparent', borderRadius: 4,
            color: '#e2e8f0', fontSize: 14, fontWeight: 600, padding: '2px 6px', minWidth: 120,
          }}
          onFocus={e => { e.target.style.borderColor = '#6366f1' }}
          onBlur={e => { e.target.style.borderColor = 'transparent' }}
        />

        {state.isDirty && <span style={{ color: '#f59e0b', fontSize: 12 }}>&#9679; unsaved</span>}

        <div style={{ flex: 1 }} />

        {/* State tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#1e1e3a', borderRadius: 6, padding: 3 }}>
          {STATE_TABS.map(s => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_ACTIVE_STATE', state: s })}
              style={{
                background: state.activeState === s ? '#6366f1' : 'transparent',
                border: 'none', borderRadius: 4,
                color: state.activeState === s ? '#fff' : '#94a3b8',
                padding: '3px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleSave}
          disabled={!state.isDirty}
          style={{
            background: state.isDirty ? '#6366f1' : '#2d2d44',
            border: 'none', borderRadius: 6, color: '#fff',
            padding: '6px 16px', fontSize: 13, fontWeight: 600,
            cursor: state.isDirty ? 'pointer' : 'default',
          }}
        >
          Save
        </button>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <VoltLayerPanel
          layers={state.element.layers}
          selectedLayerId={state.selectedLayerId}
          onSelectLayer={id => dispatch({ type: 'SELECT_LAYER', id })}
          onToggleVisibility={id => dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', id })}
          onToggleLock={id => dispatch({ type: 'TOGGLE_LAYER_LOCK', id })}
          onDeleteLayer={id => dispatch({ type: 'DELETE_LAYER', id })}
          onReorderLayers={layers => dispatch({ type: 'REORDER_LAYERS', layers })}
        />

        <div style={{ flex: 1, position: 'relative' }}>
          <VoltToolbar
            activeTool={state.activeTool}
            onSelectTool={tool => dispatch({ type: 'SET_TOOL', tool })}
          />
          <VoltCanvas
            element={state.element}
            activeTool={state.activeTool}
            selectedLayerId={state.selectedLayerId}
            zoom={state.zoom}
            panX={state.panX}
            panY={state.panY}
            onAddLayer={layer => dispatch({ type: 'ADD_LAYER', layer })}
            onSelectLayer={id => dispatch({ type: 'SELECT_LAYER', id })}
            onUpdateLayer={(id, updates) => dispatch({ type: 'UPDATE_LAYER', id, updates })}
          />
        </div>

        <VoltPropertyInspector
          selectedLayer={selectedLayer}
          onUpdateLayer={(id, updates) => dispatch({ type: 'UPDATE_LAYER', id, updates })}
        />
      </div>
    </div>
  )
}
