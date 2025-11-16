import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Line, Group } from 'react-konva'
import Konva from 'konva'
import { useDiagram, Entity, Relationship } from '../context/DiagramContext'

// ============================================================================
// MODALS
// ============================================================================

interface CreateEntityModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, x: number, y: number) => void
}

function CreateEntityModal({ isOpen, onClose, onCreate }: CreateEntityModalProps) {
  const [name, setName] = useState('Entity')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name, 50, 50)
      setName('Entity')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '300px'
      }}>
        <h3 style={{ marginTop: 0 }}>Create New Entity</h3>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entity name"
            style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EditRelationshipModalProps {
  isOpen: boolean
  relationshipFrom: string | null
  relationshipTo: string | null
  onClose: () => void
  onCreate: (cardinality: '1-1' | '1-n' | 'n-n', label?: string) => void
  entityMap: { [id: string]: string }
}

function EditRelationshipModal({ isOpen, relationshipFrom, relationshipTo, onClose, onCreate, entityMap }: EditRelationshipModalProps) {
  const [cardinality, setCardinality] = useState<'1-1' | '1-n' | 'n-n'>('1-n')
  const [label, setLabel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(cardinality, label || undefined)
    setCardinality('1-n')
    setLabel('')
    onClose()
  }

  if (!isOpen || !relationshipFrom || !relationshipTo) return null

  const fromName = entityMap[relationshipFrom] || relationshipFrom
  const toName = entityMap[relationshipTo] || relationshipTo

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '350px'
      }}>
        <h3 style={{ marginTop: 0 }}>Create Relationship</h3>
        <p style={{ color: '#666', fontSize: '13px', margin: '0 0 12px 0' }}>
          <strong>{fromName}</strong> → <strong>{toName}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Cardinality:
          </label>
          <select
            value={cardinality}
            onChange={(e) => setCardinality(e.target.value as '1-1' | '1-n' | 'n-n')}
            style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="1-1">One-to-One (1-1)</option>
            <option value="1-n">One-to-Many (1-n)</option>
            <option value="n-n">Many-to-Many (n-n)</option>
          </select>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Label (optional):
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., 'contains', 'has'"
            style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// CANVAS CONSTANTS
// ============================================================================

const HEADER_HEIGHT = 28
const ROW_HEIGHT = 18
const ATTR_COL_WIDTH = 100
const TYPE_COL_WIDTH = 60
const TABLE_WIDTH = ATTR_COL_WIDTH + TYPE_COL_WIDTH + 16

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Draw crow's foot notation symbols at relationship endpoints
function drawCrowsFoot(x: number, y: number, angle: number, type: 'line' | 'foot'): number[] {
  const SIZE = 8

  if (type === 'line') {
    // Single perpendicular line (1-1 relationship)
    const perpX = Math.cos(angle + Math.PI / 2) * SIZE
    const perpY = Math.sin(angle + Math.PI / 2) * SIZE
    return [x - perpX, y - perpY, x + perpX, y + perpY]
  } else {
    // Crow's foot: three lines forming a fork
    const mainX = Math.cos(angle) * SIZE
    const mainY = Math.sin(angle) * SIZE
    const perpX = Math.cos(angle + Math.PI / 2) * (SIZE / 1.5)
    const perpY = Math.sin(angle + Math.PI / 2) * (SIZE / 1.5)

    return [
      x - mainX, y - mainY, x, y, // center line
      x - mainX, y - mainY, x - perpX, y - perpY, // top fork
      x - mainX, y - mainY, x + perpX, y + perpY, // bottom fork
    ]
  }
}

// Calculate intersection point between line and rectangle edge
function getEdgePoint(
  bounds: { left: number; right: number; top: number; bottom: number; centerX: number; centerY: number },
  angle: number,
  distance: number
): { x: number; y: number } {
  const PADDING = 2 // Slight inset from edge

  if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
    // More horizontal than vertical
    if (Math.cos(angle) > 0) {
      // Going right
      return { x: bounds.right + PADDING, y: bounds.centerY }
    } else {
      // Going left
      return { x: bounds.left - PADDING, y: bounds.centerY }
    }
  } else {
    // More vertical than horizontal
    if (Math.sin(angle) > 0) {
      // Going down
      return { x: bounds.centerX, y: bounds.bottom + PADDING }
    } else {
      // Going up
      return { x: bounds.centerX, y: bounds.top - PADDING }
    }
  }
}

// ============================================================================
// ENTITY TABLE COMPONENT
// ============================================================================

interface EntityTableProps {
  entity: Entity
  isSelected: boolean
  onClickEntity: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void
  onDragStart: (id: string) => void
  onDragEnd: (entity: Entity, group: Konva.Group | null) => void
}

function EntityTable({ entity, isSelected, onClickEntity, onDragStart, onDragEnd }: EntityTableProps) {
  let groupRef: Konva.Group | null = null

  const TABLE_HEIGHT = HEADER_HEIGHT + Math.max(1, entity.attributes.length) * ROW_HEIGHT

  return (
    <Group
      x={entity.x}
      y={entity.y}
      onClick={(e) => onClickEntity(e, entity.id)}
      onDragStart={() => onDragStart(entity.id)}
      onDragEnd={() => onDragEnd(entity, groupRef)}
      draggable
      ref={(el) => { groupRef = el }}
    >
      {/* Main border */}
      <Rect
        x={0}
        y={0}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
        fill="white"
        stroke={isSelected ? '#FF1493' : '#333'}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={2}
      />

      {/* Header background */}
      <Rect
        x={0}
        y={0}
        width={TABLE_WIDTH}
        height={HEADER_HEIGHT}
        fill={isSelected ? '#FFB6D9' : '#E0E0E0'}
        stroke={isSelected ? '#FF1493' : '#333'}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Entity name in header */}
      <Text
        x={4}
        y={5}
        text={entity.name}
        fontSize={12}
        fontStyle="bold"
        fill="#000"
        width={TABLE_WIDTH - 8}
      />

      {/* Header divider */}
      <Line
        points={[0, HEADER_HEIGHT, TABLE_WIDTH, HEADER_HEIGHT]}
        stroke="#333"
        strokeWidth={1}
      />

      {/* Attributes */}
      {entity.attributes.map((attr, index) => (
        <Group key={attr.id}>
          {/* Row separator */}
          <Line
            points={[0, HEADER_HEIGHT + (index + 1) * ROW_HEIGHT, TABLE_WIDTH, HEADER_HEIGHT + (index + 1) * ROW_HEIGHT]}
            stroke="#ddd"
            strokeWidth={1}
          />

          {/* PK indicator */}
          {attr.isPK && (
            <Text
              x={2}
              y={HEADER_HEIGHT + index * ROW_HEIGHT + 2}
              text="🔑"
              fontSize={11}
              width={12}
            />
          )}

          {/* Attribute name */}
          <Text
            x={attr.isPK ? 16 : 4}
            y={HEADER_HEIGHT + index * ROW_HEIGHT + 2}
            text={attr.name}
            fontSize={10}
            fill="#000"
            width={ATTR_COL_WIDTH - (attr.isPK ? 20 : 8)}
          />

          {/* Type */}
          <Text
            x={ATTR_COL_WIDTH + 4}
            y={HEADER_HEIGHT + index * ROW_HEIGHT + 2}
            text={attr.type}
            fontSize={9}
            fill="#666"
            width={TYPE_COL_WIDTH - 8}
          />

          {/* FK indicator */}
          {attr.isFK && (
            <Text
              x={TABLE_WIDTH - 12}
              y={HEADER_HEIGHT + index * ROW_HEIGHT + 2}
              text="🔗"
              fontSize={10}
              width={10}
            />
          )}
        </Group>
      ))}

      {/* Empty attributes placeholder */}
      {entity.attributes.length === 0 && (
        <Text
          x={4}
          y={HEADER_HEIGHT + 1}
          text="(no attributes)"
          fontSize={9}
          fill="#999"
        />
      )}
    </Group>
  )
}

// ============================================================================
// RELATIONSHIP LINE COMPONENT
// ============================================================================

interface RelationshipLineProps {
  rel: Relationship
  fromEntity: Entity
  toEntity: Entity
  onDelete: (id: string) => void
}

function RelationshipLine({ rel, fromEntity, toEntity, onDelete }: RelationshipLineProps) {
  // Calculate entity bounds
  const fromBounds = {
    left: fromEntity.x,
    right: fromEntity.x + TABLE_WIDTH,
    top: fromEntity.y,
    bottom: fromEntity.y + HEADER_HEIGHT + Math.max(1, fromEntity.attributes.length) * ROW_HEIGHT,
    centerX: fromEntity.x + TABLE_WIDTH / 2,
    centerY: fromEntity.y + HEADER_HEIGHT / 2
  }

  const toBounds = {
    left: toEntity.x,
    right: toEntity.x + TABLE_WIDTH,
    top: toEntity.y,
    bottom: toEntity.y + HEADER_HEIGHT + Math.max(1, toEntity.attributes.length) * ROW_HEIGHT,
    centerX: toEntity.x + TABLE_WIDTH / 2,
    centerY: toEntity.y + HEADER_HEIGHT / 2
  }

  // Calculate angle between centers
  const dx = toBounds.centerX - fromBounds.centerX
  const dy = toBounds.centerY - fromBounds.centerY
  const angle = Math.atan2(dy, dx)
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Calculate edge points (find where line intersects entity boundaries)
  const fromEdge = getEdgePoint(fromBounds, angle, distance)
  const toEdge = getEdgePoint(toBounds, angle + Math.PI, distance)

  // Calculate label position at midpoint
  const labelX = (fromEdge.x + toEdge.x) / 2 - 40
  const labelY = (fromEdge.y + toEdge.y) / 2 - 12

  // Determine crow's foot symbols based on cardinality
  const getSymbols = (card: string) => {
    switch (card) {
      case '1-1':
        return { start: 'line', end: 'line' }
      case '1-n':
        return { start: 'line', end: 'foot' }
      case 'n-n':
        return { start: 'foot', end: 'foot' }
      default:
        return { start: 'line', end: 'line' }
    }
  }

  const symbols = getSymbols(rel.cardinality)

  return (
    <Group
      key={rel.id}
      onContextMenu={(e: Konva.KonvaEventObject<any>) => {
        e.evt.preventDefault()
        onDelete(rel.id)
      }}
    >
      {/* Main relationship line */}
      <Line
        points={[fromEdge.x, fromEdge.y, toEdge.x, toEdge.y]}
        stroke="#666"
        strokeWidth={2}
        lineCap="round"
      />

      {/* Start symbol (at from entity) */}
      <Line
        points={drawCrowsFoot(fromEdge.x, fromEdge.y, angle + Math.PI, symbols.start as 'line' | 'foot')}
        stroke="#333"
        strokeWidth={1.5}
        lineCap="round"
      />

      {/* End symbol (at to entity - crow's foot notation) */}
      <Line
        points={drawCrowsFoot(toEdge.x, toEdge.y, angle, symbols.end as 'line' | 'foot')}
        stroke="#333"
        strokeWidth={1.5}
        lineCap="round"
      />

      {/* Cardinality label */}
      <Text
        x={labelX}
        y={labelY}
        text={rel.cardinality}
        fontSize={10}
        fontStyle="bold"
        fill="#333"
        width={80}
        align="center"
      />

      {/* Relationship label (if provided) */}
      {rel.label && (
        <Text
          x={labelX}
          y={labelY + 12}
          text={rel.label}
          fontSize={9}
          fill="#666"
          width={80}
          align="center"
        />
      )}
    </Group>
  )
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export default function Canvas({ onSelectEntity }: { onSelectEntity?: (id: string | null) => void }) {
  const { diagram, updateEntity, deleteEntity, addEntity, deleteRelationship, addRelationship } = useDiagram()
  const stageRef = useRef<Konva.Stage>(null)
  const [mode, setMode] = useState<'select' | 'relationship'>('select')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [relationshipFrom, setRelationshipFrom] = useState<string | null>(null)
  const [relationshipTo, setRelationshipTo] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showRelationshipModal, setShowRelationshipModal] = useState(false)
  const [scale, setScale] = useState(1)

  const width = typeof window !== 'undefined' ? window.innerWidth - 300 : 800
  const height = typeof window !== 'undefined' ? window.innerHeight - 100 : 600

  const handleEntityClick = (e: Konva.KonvaEventObject<MouseEvent>, entityId: string) => {
    e.cancelBubble = true
    if (mode === 'relationship') {
      if (relationshipFrom === null) {
        setRelationshipFrom(entityId)
      } else if (relationshipFrom !== entityId) {
        setRelationshipTo(entityId)
        setShowRelationshipModal(true)
      } else {
        setRelationshipFrom(null)
      }
    } else {
      setSelectedEntityId(entityId)
      onSelectEntity?.(entityId)
    }
  }

  const handleCreateRelationship = (cardinality: '1-1' | '1-n' | 'n-n', label?: string) => {
    if (relationshipFrom && relationshipTo) {
      addRelationship(relationshipFrom, relationshipTo, cardinality, label)
      setRelationshipFrom(null)
      setRelationshipTo(null)
      setShowRelationshipModal(false)
      setMode('select')
    }
  }

  const handleEntityDragStart = (entityId: string) => {
    // Track which entity is being dragged
  }

  const handleEntityDragEnd = (entity: Entity, group: Konva.Group | null) => {
    if (group) {
      const pos = group.getPosition()
      updateEntity({ ...entity, x: pos.x, y: pos.y })
    }
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) {
      setSelectedEntityId(null)
      onSelectEntity?.(null)
      if (mode === 'relationship') {
        setRelationshipFrom(null)
        setRelationshipTo(null)
      }
    }
  }

  const handleStageWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const oldScale = scale
    const newScale = oldScale + (e.evt.deltaY > 0 ? -0.1 : 0.1)
    setScale(Math.max(0.5, Math.min(3, newScale)))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'SELECT') return

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEntityId) {
        e.preventDefault()
        deleteEntity(selectedEntityId)
        setSelectedEntityId(null)
        onSelectEntity?.(null)
      }

      if (e.key === 'Escape') {
        setRelationshipFrom(null)
        setRelationshipTo(null)
        setMode('select')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEntityId, deleteEntity, onSelectEntity])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ padding: '8px', borderBottom: '1px solid #ddd', display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => setShowCreateModal(true)} style={{ padding: '6px 12px', background: '#2196F3', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '3px' }}>+ Entity</button>
        <button
          onClick={() => {
            if (mode === 'relationship') {
              setMode('select')
              setRelationshipFrom(null)
              setRelationshipTo(null)
            } else {
              setMode('relationship')
            }
          }}
          style={{
            padding: '6px 12px',
            background: mode === 'relationship' ? '#4CAF50' : '#2196F3',
            color: 'white',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          {mode === 'relationship' ? '✓ Relationship Mode (ESC)' : '+ Relationship'}
        </button>
        {relationshipFrom && diagram.entities.find((e) => e.id === relationshipFrom) && (
          <span style={{ color: '#FF9800', fontSize: '12px', fontWeight: 'bold' }}>
            From: {diagram.entities.find((e) => e.id === relationshipFrom)?.name}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onWheel={handleStageWheel}
          onClick={handleStageClick}
          scaleX={scale}
          scaleY={scale}
          style={{ cursor: mode === 'relationship' ? 'crosshair' : 'default', display: 'block', background: '#fafafa' }}
        >
          <Layer>
            {/* Relationships first (render behind entities) */}
            {diagram.relationships.map((rel) => {
              const fromEntity = diagram.entities.find((e) => e.id === rel.fromEntityId)
              const toEntity = diagram.entities.find((e) => e.id === rel.toEntityId)
              if (!fromEntity || !toEntity) return null
              return (
                <RelationshipLine
                  key={rel.id}
                  rel={rel}
                  fromEntity={fromEntity}
                  toEntity={toEntity}
                  onDelete={deleteRelationship}
                />
              )
            })}

            {/* Entities (table-style) */}
            {diagram.entities.map((entity) => (
              <EntityTable
                key={entity.id}
                entity={entity}
                isSelected={selectedEntityId === entity.id}
                onClickEntity={handleEntityClick}
                onDragStart={handleEntityDragStart}
                onDragEnd={handleEntityDragEnd}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      <CreateEntityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={addEntity}
      />
      <EditRelationshipModal
        isOpen={showRelationshipModal}
        relationshipFrom={relationshipFrom}
        relationshipTo={relationshipTo}
        onClose={() => {
          setShowRelationshipModal(false)
          setRelationshipFrom(null)
          setRelationshipTo(null)
        }}
        onCreate={handleCreateRelationship}
        entityMap={Object.fromEntries(diagram.entities.map((e) => [e.id, e.name]))}
      />
    </div>
  )
}
