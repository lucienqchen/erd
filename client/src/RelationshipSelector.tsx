import React, { useState } from 'react';

interface RelationshipSelectorProps {
  onSelect: (type: string) => void;
  onCancel: () => void;
}

const RelationshipSelector: React.FC<RelationshipSelectorProps> = ({ onSelect, onCancel }) => {
  const [selectedType, setSelectedType] = useState('one-to-one');

  const relationshipTypes = [
    { value: 'one-to-one', label: 'One to One', description: '1:1' },
    { value: 'one-to-many', label: 'One to Many (Mandatory)', description: '1:N' },
    { value: 'many', label: 'Many', description: 'N' },
    { value: 'one-and-only-one', label: 'One and Only One (Mandatory)', description: '1 (mandatory)' },
    { value: 'one-or-more', label: 'One or More (Mandatory)', description: '1..N' },
    { value: 'zero-or-one', label: 'Zero or One (Optional)', description: '0..1' },
    { value: 'zero-or-many', label: 'Zero or Many (Optional)', description: '0..N' },
    { value: 'many-to-many', label: 'Many to Many', description: 'N:M' }
  ];

  const handleConfirm = () => {
    onSelect(selectedType);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
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
        minWidth: '400px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Select Relationship Type</h3>
        
        <div style={{ marginBottom: '20px' }}>
          {relationshipTypes.map((type) => (
            <label
              key={type.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                background: selectedType === type.value ? '#e3f2fd' : 'transparent',
                marginBottom: '4px'
              }}
            >
              <input
                type="radio"
                name="relationship"
                value={type.value}
                checked={selectedType === type.value}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{type.label}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{type.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
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
            onClick={handleConfirm}
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
            Create Relationship
          </button>
        </div>
      </div>
    </>
  );
};

export default RelationshipSelector;
