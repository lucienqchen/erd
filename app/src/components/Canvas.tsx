import { FC, useCallback, useMemo, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Canvas.css';
import { EntityNode, type EntityNodeProps } from './EntityNode';
import { CanvasToolbar } from './CanvasToolbar';
import type { Entity } from '../types';

interface CanvasProps {
    className?: string;
}

export const Canvas: FC<CanvasProps> = ({ className }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [nextEntityId, setNextEntityId] = useState(1);

    const nodeTypes = useMemo(() => ({ entityNode: EntityNode }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((edges) => addEdge(params, edges)),
        [setEdges]
    );

    const handleAddEntity = useCallback(() => {
        const newEntity: Entity = {
            id: nextEntityId,
            name: `Entity ${nextEntityId}`,
            attributes: [
                {
                    id: nextEntityId * 100 + 1,
                    name: 'id',
                    type: 'INTEGER',
                    isPrimaryKey: true,
                },
            ],
            relationships: [],
        };

        const newNode: Node<EntityNodeProps> = {
            id: String(nextEntityId),
            type: 'entityNode',
            position: {
                x: 100 + (nodes.length * 50),
                y: 100 + (nodes.length * 50),
            },
            data: { entity: newEntity},
        };
        
        setNodes((nodes) => [...nodes, newNode]);
        setNextEntityId((id) => id + 1);
    }, [nextEntityId, nodes.length, setNodes]);

    return (
        <div className={`canvas-wrapper ${className || ''}`}>
            <CanvasToolbar onAddEntity={handleAddEntity} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
                <Background 
                    variant={BackgroundVariant.Dots}
                    color="#aaa" 
                    gap={16}
                />
            </ReactFlow>
        </div>
    );
};