import React, { useState } from 'react';
import { useDiagram } from './DiagramContext';
import { Entity, Attribute } from './types';

const Toolbar: React.FC = () => {
  const { addEntity } = useDiagram();
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [currentAttr, setCurrentAttr] = useState({ 
    name: '', 
    type: '', 
    isPrimaryKey: false, 
    isForeignKey: false,
    references: ''
  });

  const handleAddEntity = () => {
    if (!entityName.trim()) {
      alert('Please enter an entity name');
      return;
    }

    const newEntity: Entity = {
      id: `entity-${Date.now()}`,
      name: entityName,
      attributes: attributes,
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 }
    };

    addEntity(newEntity);
    
    // Reset form
    setEntityName('');
    setAttributes([]);
    setCurrentAttr({ name: '', type: '', isPrimaryKey: false, isForeignKey: false, references: '' });
    setShowAddEntity(false);
  };

  const handleAddAttribute = () => {
    if (!currentAttr.name.trim() || !currentAttr.type.trim()) {
      alert('Please enter attribute name and type');
      return;
    }

    const attrToAdd: Attribute = {
      name: currentAttr.name,
      type: currentAttr.type,
      isPrimaryKey: currentAttr.isPrimaryKey,
      isForeignKey: currentAttr.isForeignKey
    };
    
    if (currentAttr.isForeignKey && currentAttr.references) {
      attrToAdd.references = currentAttr.references;
    }
    
    setAttributes([...attributes, attrToAdd]);
    setCurrentAttr({ name: '', type: '', isPrimaryKey: false, isForeignKey: false, references: '' });
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <div style={{ 
      padding: '12px', 
      background: '#f5f5f5', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
      <button
        onClick={() => setShowAddEntity(!showAddEntity)}
        style={{
          padding: '8px 16px',
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        + Add Entity
      </button>

      {showAddEntity && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px'
        }}>
          <h3 style={{ marginTop: 0 }}>Add New Entity</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Entity Name:
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="e.g., User, Product"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Attributes:
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={currentAttr.name}
                  onChange={(e) => setCurrentAttr({ ...currentAttr, name: e.target.value })}
                  placeholder="Name"
                  style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={currentAttr.type}
                  onChange={(e) => setCurrentAttr({ ...currentAttr, type: e.target.value })}
                  placeholder="Type (e.g., INT, VARCHAR)"
                  style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={currentAttr.isPrimaryKey}
                    onChange={(e) => setCurrentAttr({ ...currentAttr, isPrimaryKey: e.target.checked })}
                  />
                  PK
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="checkbox"
                    checked={currentAttr.isForeignKey}
                    onChange={(e) => setCurrentAttr({ ...currentAttr, isForeignKey: e.target.checked })}
                  />
                  FK
                </label>
                
                {currentAttr.isForeignKey && (
                  <input
                    type="text"
                    value={currentAttr.references}
                    onChange={(e) => setCurrentAttr({ ...currentAttr, references: e.target.value })}
                    placeholder="References (e.g., User.id)"
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                )}
                
                <button
                  onClick={handleAddAttribute}
                  style={{
                    padding: '6px 12px',
                    background: '#5cb85c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            {attributes.length > 0 && (
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '8px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {attributes.map((attr, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '4px',
                    borderBottom: idx < attributes.length - 1 ? '1px solid #eee' : 'none'
                  }}>
                    <span>
                      {attr.isPrimaryKey && '🔑 '}
                      {attr.isForeignKey && '🔗 '}
                      <strong>{attr.name}</strong>: {attr.type}
                      {attr.references && <span style={{ color: '#666', fontSize: '12px' }}> → {attr.references}</span>}
                    </span>
                    <button
                      onClick={() => handleRemoveAttribute(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc3545',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowAddEntity(false);
                setEntityName('');
                setAttributes([]);
                setCurrentAttr({ name: '', type: '', isPrimaryKey: false, isForeignKey: false, references: '' });
              }}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntity}
              style={{
                padding: '8px 16px',
                background: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Create Entity
            </button>
          </div>
        </div>
      )}

      {showAddEntity && (
        <div
          onClick={() => setShowAddEntity(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      <div style={{ color: '#666', fontSize: '14px' }}>
        💡 Tip: Drag entities to position them, connect them by dragging from handles
      </div>
    </div>
  );
};

export default Toolbar;
