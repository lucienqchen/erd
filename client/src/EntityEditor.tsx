import React, { useState } from 'react';
import { useDiagram } from './DiagramContext';
import { Entity, Attribute } from './types';

interface EntityEditorProps {
  entity: Entity;
  onClose: () => void;
}

const EntityEditor: React.FC<EntityEditorProps> = ({ entity, onClose }) => {
  const { updateEntity, deleteEntity } = useDiagram();
  const [entityName, setEntityName] = useState(entity.name);
  const [attributes, setAttributes] = useState<Attribute[]>([...entity.attributes]);
  const [currentAttr, setCurrentAttr] = useState({ 
    name: '', 
    type: '', 
    isPrimaryKey: false, 
    isForeignKey: false,
    references: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = () => {
    if (!entityName.trim()) {
      alert('Please enter an entity name');
      return;
    }

    updateEntity(entity.id, {
      name: entityName,
      attributes: attributes
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${entity.name}"?`)) {
      deleteEntity(entity.id);
      onClose();
    }
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
    
    if (editingIndex !== null) {
      // Update existing attribute
      const newAttrs = [...attributes];
      newAttrs[editingIndex] = attrToAdd;
      setAttributes(newAttrs);
      setEditingIndex(null);
    } else {
      // Add new attribute
      setAttributes([...attributes, attrToAdd]);
    }
    
    setCurrentAttr({ name: '', type: '', isPrimaryKey: false, isForeignKey: false, references: '' });
  };

  const handleEditAttribute = (index: number) => {
    const attr = attributes[index];
    setCurrentAttr({
      name: attr.name,
      type: attr.type,
      isPrimaryKey: attr.isPrimaryKey || false,
      isForeignKey: attr.isForeignKey || false,
      references: attr.references || ''
    });
    setEditingIndex(index);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setCurrentAttr({ name: '', type: '', isPrimaryKey: false, isForeignKey: false, references: '' });
    setEditingIndex(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
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

      {/* Modal */}
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
        minWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Entity</h3>
        
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
                  background: editingIndex !== null ? '#f0ad4e' : '#5cb85c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              
              {editingIndex !== null && (
                <button
                  onClick={handleCancelEdit}
                  style={{
                    padding: '6px 12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {attributes.length > 0 && (
            <div style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              padding: '8px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {attributes.map((attr, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '4px',
                  borderBottom: idx < attributes.length - 1 ? '1px solid #eee' : 'none',
                  background: editingIndex === idx ? '#fff3cd' : 'transparent'
                }}>
                  <span>
                    {attr.isPrimaryKey && '🔑 '}
                    {attr.isForeignKey && '🔗 '}
                    <strong>{attr.name}</strong>: {attr.type}
                    {attr.references && <span style={{ color: '#666', fontSize: '12px' }}> → {attr.references}</span>}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditAttribute(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#4a90e2',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                      title="Edit attribute"
                    >
                      ✏️
                    </button>
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
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete Entity
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
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
              onClick={handleSave}
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntityEditor;
