import React, { useState } from 'react'
import { useDiagram } from '../context/DiagramContext'

export default function Inspector({ selectedEntityId }: { selectedEntityId: string | null }) {
  const { diagram, updateEntity, deleteEntity, addAttribute, updateAttribute, deleteAttribute, updateRelationship, deleteRelationship } = useDiagram()
  const [newAttrName, setNewAttrName] = useState('')
  const [newAttrType, setNewAttrType] = useState('string')

  const entity = selectedEntityId ? diagram.entities.find(e => e.id === selectedEntityId) : null
  
  // Find all relationships involving this entity
  const outgoingRelationships = selectedEntityId ? diagram.relationships.filter(r => r.fromEntityId === selectedEntityId) : []
  const incomingRelationships = selectedEntityId ? diagram.relationships.filter(r => r.toEntityId === selectedEntityId) : []

  const handleAddAttribute = () => {
    if (entity && newAttrName.trim()) {
      addAttribute(entity.id, newAttrName, newAttrType)
      setNewAttrName('')
      setNewAttrType('string')
    }
  }

  const sqlTypes = ['string', 'integer', 'varchar', 'text', 'double', 'float', 'decimal', 'date', 'datetime', 'timestamp', 'boolean', 'blob', 'json']

  const getEntityName = (entityId: string) => {
    return diagram.entities.find(e => e.id === entityId)?.name || entityId
  }

  if (!entity) {
    return (
      <aside className="inspector">
        <h3>Inspector</h3>
        <div style={{ color: '#999' }}>No entity selected</div>
      </aside>
    )
  }

  return (
    <aside className="inspector">
      <h3>Inspector</h3>
      <div style={{ marginBottom: '12px' }}>
        <label>Entity Name:</label>
        <input
          type="text"
          value={entity.name}
          onChange={(e) => updateEntity({ ...entity, name: e.target.value })}
          style={{ width: '100%', padding: '4px', marginTop: '4px', boxSizing: 'border-box' }}
        />
      </div>
      <button onClick={() => deleteEntity(entity.id)} style={{ background: '#f44336', color: 'white', width: '100%', padding: '8px', marginBottom: '12px' }}>Delete Entity</button>
      
      <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Attributes</h4>
      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '12px' }}>
        {entity.attributes.length === 0 && <div style={{ fontSize: '12px', color: '#999' }}>No attributes</div>}
        {entity.attributes.map(attr => (
          <div key={attr.id} style={{ padding: '8px', background: '#f0f0f0', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
            {/* Attribute Name */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '2px' }}>Name:</label>
              <input
                type="text"
                value={attr.name}
                onChange={(e) => updateAttribute(entity.id, attr.id, e.target.value, attr.type, attr.isPK, attr.isFK)}
                placeholder="Attribute name"
                style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
              />
            </div>

            {/* Type Dropdown */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '2px' }}>Type:</label>
              <select
                value={attr.type}
                onChange={(e) => updateAttribute(entity.id, attr.id, attr.name, e.target.value, attr.isPK, attr.isFK)}
                style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
              >
                {sqlTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Delete Button */}
            <div style={{ marginBottom: '8px' }}>
              <button 
                onClick={() => deleteAttribute(entity.id, attr.id)} 
                style={{ width: '100%', padding: '6px', fontSize: '11px', background: '#f44336', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Remove Attribute
              </button>
            </div>

            {/* PK/FK Checkboxes */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={attr.isPK} 
                  onChange={(e) => updateAttribute(entity.id, attr.id, attr.name, attr.type, e.target.checked, attr.isFK)}
                  style={{ cursor: 'pointer' }}
                /> 
                <span>Primary Key</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={attr.isFK} 
                  onChange={(e) => updateAttribute(entity.id, attr.id, attr.name, attr.type, attr.isPK, e.target.checked)}
                  style={{ cursor: 'pointer' }}
                /> 
                <span>Foreign Key</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #ddd' }}>
        <label style={{ fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Add Attribute:</label>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '2px' }}>Name:</label>
          <input
            type="text"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="Attribute name"
            style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '2px' }}>Type:</label>
          <select
            value={newAttrType}
            onChange={(e) => setNewAttrType(e.target.value)}
            style={{ width: '100%', padding: '6px', fontSize: '12px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            <option value="">Select a type...</option>
            {sqlTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAddAttribute} style={{ width: '100%', padding: '8px', background: '#4CAF50', color: 'white', fontSize: '12px', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Add Attribute</button>
      </div>

      {(outgoingRelationships.length > 0 || incomingRelationships.length > 0) && (
        <>
          <h4 style={{ marginTop: '0', marginBottom: '8px' }}>Relationships</h4>
          {outgoingRelationships.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>Outgoing:</label>
              {outgoingRelationships.map(rel => (
                <div key={rel.id} style={{ padding: '6px', background: '#e3f2fd', marginBottom: '4px', borderRadius: '4px', fontSize: '11px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    → {getEntityName(rel.toEntityId)} <span style={{ color: '#2196F3', fontWeight: 'bold' }}>({rel.cardinality})</span>
                  </div>
                  {rel.label && <div style={{ color: '#666', marginBottom: '4px' }}>Label: {rel.label}</div>}
                  <button onClick={() => deleteRelationship(rel.id)} style={{ padding: '2px 6px', fontSize: '10px', background: '#f44336', color: 'white' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
          {incomingRelationships.length > 0 && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>Incoming:</label>
              {incomingRelationships.map(rel => (
                <div key={rel.id} style={{ padding: '6px', background: '#f3e5f5', marginBottom: '4px', borderRadius: '4px', fontSize: '11px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    {getEntityName(rel.fromEntityId)} → <span style={{ color: '#9C27B0', fontWeight: 'bold' }}>({rel.cardinality})</span>
                  </div>
                  {rel.label && <div style={{ color: '#666', marginBottom: '4px' }}>Label: {rel.label}</div>}
                  <button onClick={() => deleteRelationship(rel.id)} style={{ padding: '2px 6px', fontSize: '10px', background: '#f44336', color: 'white' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  )
}
