import React, { useState, useMemo, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useDiagram } from '../context/DiagramContext'

export default function RAEditor() {
  const { diagram } = useDiagram()
  const [value, setValue] = useState<string>('')

  // Generate RA representation from diagram
  const generateRAFromDiagram = useMemo(() => {
    if (diagram.entities.length === 0) {
      return '// No entities defined. Create entities in the Diagram tab to generate RA representation.'
    }

    let ra = '// Relational Algebra representation of your ERD\n'
    ra += '// Entities (Relations):\n\n'

    // List all entities with their attributes
    diagram.entities.forEach(entity => {
      const attrs = entity.attributes
        .map(a => `${a.name}:${a.type}${a.isPK ? ' PK' : ''}${a.isFK ? ' FK' : ''}`)
        .join(', ')
      ra += `${entity.name} = {${attrs}}\n`
    })

    ra += '\n// Relationships:\n\n'

    // List all relationships using join notation
    if (diagram.relationships.length === 0) {
      ra += '// (No relationships defined yet)\n'
    } else {
      diagram.relationships.forEach(rel => {
        const fromEntity = diagram.entities.find(e => e.id === rel.fromEntityId)
        const toEntity = diagram.entities.find(e => e.id === rel.toEntityId)
        const cardinalitySymbol = 
          rel.cardinality === '1-1' ? '1:1' :
          rel.cardinality === '1-n' ? '1:N' :
          'M:N'
        
        ra += `${fromEntity?.name} ${cardinalitySymbol} ${toEntity?.name}`
        if (rel.label) ra += ` [${rel.label}]`
        ra += '\n'
      })
    }

    return ra
  }, [diagram])

  // Initialize or update RA when diagram changes
  useEffect(() => {
    if (value === '') {
      setValue(generateRAFromDiagram)
    }
  }, [])

  // Symbol insertion helper
  const insertSymbol = (symbol: string) => {
    const textarea = document.querySelector('[data-testid="editor-textarea"]') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + symbol + value.substring(end)
      setValue(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + symbol.length
        textarea.focus()
      }, 0)
    }
  }

  // Insert symbol at cursor position in Monaco editor
  const insertSymbolInMonaco = (symbol: string) => {
    const editor = document.querySelector('.monaco-editor') as any
    if (editor && editor.monaco) {
      // For Monaco, we'll just append to the value and let onChange handle it
      setValue(prev => prev + symbol)
    } else {
      setValue(prev => prev + symbol)
    }
  }

  const symbols = [
    { label: 'π', name: 'projection', symbol: 'π' },
    { label: 'σ', name: 'selection', symbol: 'σ' },
    { label: 'ρ', name: 'rename', symbol: 'ρ' },
    { label: '⨝', name: 'join', symbol: '⨝' },
    { label: '∪', name: 'union', symbol: '∪' },
    { label: '−', name: 'difference', symbol: '−' },
    { label: '×', name: 'product', symbol: '×' },
    { label: '→', name: 'maps-to', symbol: '→' },
  ]

  const getSchemaHint = useMemo(() => {
    if (diagram.entities.length === 0) return ''
    return diagram.entities
      .map(e => `${e.name}(${e.attributes.map(a => a.name).join(', ')})`)
      .join('  |  ')
  }, [diagram.entities])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Info Bar */}
      <div style={{ padding: '12px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>Schema:</strong> {getSchemaHint || 'No entities defined'}
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          This view shows the relational algebra representation of your diagram. Edit to reorganize your schema structure.
        </div>
      </div>

      {/* Symbol Toolbar */}
      <div style={{ padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #ddd', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', marginRight: '4px', color: '#666' }}>Insert symbol:</span>
        {symbols.map(sym => (
          <button
            key={sym.name}
            onClick={() => insertSymbolInMonaco(sym.symbol)}
            title={sym.name}
            style={{
              padding: '4px 8px',
              fontSize: '14px',
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '3px',
              cursor: 'pointer',
              minWidth: '32px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              color: '#2196F3'
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget
              btn.style.background = '#2196F3'
              btn.style.color = 'white'
              btn.style.borderColor = '#1976D2'
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget
              btn.style.background = 'white'
              btn.style.color = '#2196F3'
              btn.style.borderColor = '#ccc'
            }}
          >
            {sym.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={value}
          onChange={(v) => setValue(v || '')}
          options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: '"Courier New", monospace',
          }}
        />
      </div>

      {/* Info Footer */}
      <div style={{ padding: '12px', background: '#f9f9f9', borderTop: '1px solid #ddd', fontSize: '11px', color: '#666' }}>
        <strong>Note:</strong> This is a text representation of your diagram. Edit relationships and attributes here. Changes to the diagram will be reflected above.
      </div>
    </div>
  )
}
