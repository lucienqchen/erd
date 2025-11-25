import { FC, memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Entity } from '../types';
import './EntityNode.css';

export interface EntityNodeProps {
    entity: Entity;
}

export const EntityNode: FC<NodeProps<EntityNodeProps>> = memo(({ data, selected }) => {
    const { entity } = data;

    return (
        <div className={`entity-node ${selected ? 'selected' : ''}`}>
            <div className="entity-header">
                <strong>{entity.name}</strong>
            </div>
            <div className="entity-body">
                {entity.attributes.map((attr) => (
                    <div key={attr.id} className="entity-attribute">
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`${attr.id}-target`}
                            style={{ top: 'auto' }}
                        />
                        <span className={attr.isPrimaryKey ? 'pk' : ''}>
                            {attr.isPrimaryKey && '🔑'}
                            {attr.isForeignKey && '🔗'}
                            {attr.name}
                        </span>
                        <span className="attribute-type">{attr.type}</span>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`${attr.id}-source`}
                            style={{ top: 'auto' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});

EntityNode.displayName = 'EntityNode';