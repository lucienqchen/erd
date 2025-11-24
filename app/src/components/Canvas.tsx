import { FC, useCallback } from 'react';
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

interface CanvasProps {
    className?: string;
}

export const Canvas: FC<CanvasProps> = ({ className }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((edges) => addEdge(params, edges)),
        [setEdges]
    );

    return (
        <div className={`canvas-wrapper ${className || ''}`}>
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