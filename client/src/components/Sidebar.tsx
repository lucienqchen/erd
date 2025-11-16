import React from 'react'
import { useDiagram } from '../context/DiagramContext'

export default function Sidebar() {
  const { canUndo, canRedo, undo, redo } = useDiagram()

  return (
    <aside className="sidebar" style={{ height: '100%', minHeight: 0 }}>
      <h3 style={{ marginTop: 0, fontSize: '14px' }}>Tools</h3>
      <div className="tools">
        <button 
          onClick={undo} 
          disabled={!canUndo}
          style={{ 
            opacity: canUndo ? 1 : 0.5, 
            cursor: canUndo ? 'pointer' : 'not-allowed',
            padding: '8px 12px',
            marginBottom: '4px',
            width: '100%'
          }}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button 
          onClick={redo} 
          disabled={!canRedo}
          style={{ 
            opacity: canRedo ? 1 : 0.5, 
            cursor: canRedo ? 'pointer' : 'not-allowed',
            padding: '8px 12px',
            marginBottom: '4px',
            width: '100%'
          }}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
        <hr style={{ margin: '8px 0' }} />
        <div style={{ fontSize: '11px', color: '#666', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Tips:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>Click "+ Entity" to create entities</li>
            <li>Click an entity to select it</li>
            <li>Drag entities to move them</li>
            <li>Use "+ Relationship" to connect entities</li>
            <li>Delete key to remove selected entity</li>
          </ul>
        </div>
      </div>
    </aside>
  )
}
