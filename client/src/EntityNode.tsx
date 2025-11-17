import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Entity as EntityType } from './types';

interface EntityNodeProps {
  data: {
    entity: EntityType;
    onDelete: (id: string) => void;
    onEdit: (entity: EntityType) => void;
  };
}

const EntityNode: React.FC<EntityNodeProps> = ({ data }) => {
  const { entity, onDelete, onEdit } = data;

  return (
    <div 
      style={{
        background: 'white',
        border: '2px solid #222',
        borderRadius: '2px',
        minWidth: '200px',
        fontSize: '12px'
      }}
      onDoubleClick={() => onEdit(entity)}
    >
      {/* Header */}
      <div style={{
        background: '#4a90e2',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '0',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{entity.name}</span>
        <button
          onClick={() => onDelete(entity.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px'
          }}
          title="Delete entity"
        >
          ×
        </button>
      </div>

      {/* Attributes */}
      <div style={{ padding: '8px' }}>
        {entity.attributes.length === 0 ? (
          <div style={{ color: '#999', fontStyle: 'italic' }}>No attributes</div>
        ) : (
          entity.attributes.map((attr, idx) => (
            <div key={idx} style={{ 
              padding: '4px 8px',
              borderBottom: idx < entity.attributes.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <span style={{ fontWeight: attr.isPrimaryKey ? 'bold' : 'normal' }}>
                {attr.isPrimaryKey && '🔑 '}
                {attr.isForeignKey && '🔗 '}
                {attr.name}
              </span>
              <span style={{ color: '#666', marginLeft: '8px' }}>
                {attr.type}
              </span>
              {attr.references && (
                <span style={{ color: '#888', fontSize: '11px', marginLeft: '4px' }}>
                  → {attr.references}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default memo(EntityNode);
