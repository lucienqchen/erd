import { FC, useCallback, useState } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    MiniMap,
    Panel
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
                <MiniMap />
                <Background color="#aaa" gap={16} />

                <Panel position="top-left">
                    <div className="canvas-info"></div>
                </Panel>
            </ReactFlow>
        </div>
    );
};