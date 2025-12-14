import { useCallback, useMemo, useState, useRef, type FC } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    type Connection,
    type NodeMouseHandler,
    type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './Canvas.css';
import { EntityNode, type EntityNodeType } from './EntityNode';
import { CrowsFootEdge, type CrowsFootEdgeType, type Cardinality } from './CrowsFootEdge';
import { CanvasToolbar } from './CanvasToolbar';
import { AddTableModal } from './AddTableModal';
import { RelationshipModal } from './RelationshipModal';
import type { Entity, Attribute } from '../types';

interface CanvasProps {
    className?: string;
}

// Edit state types
interface EditingNode {
    nodeId: string;
    entity: Entity;
}

interface EditingEdge {
    edgeId: string;
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
    label?: string;
    source: string;
    target: string;
}

export const Canvas: FC<CanvasProps> = ({ className }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeType>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<CrowsFootEdgeType>([]);
    const [nextEntityId, setNextEntityId] = useState(1);
    const [nextEdgeId, setNextEdgeId] = useState(1);
    
    // Ref for export functionality
    const reactFlowRef = useRef<HTMLDivElement>(null);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
    
    // Edit states
    const [editingNode, setEditingNode] = useState<EditingNode | null>(null);
    const [editingEdge, setEditingEdge] = useState<EditingEdge | null>(null);

    const nodeTypes = useMemo(() => ({ entityNode: EntityNode }), []);
    const edgeTypes = useMemo(() => ({ crowsFootEdge: CrowsFootEdge }), []);

    // Get canvas element for export
    const getCanvasElement = useCallback(() => {
        return reactFlowRef.current?.querySelector('.react-flow__viewport') as HTMLElement | null;
    }, []);

    // Get entity names for the relationship modal
    const getEntityName = useCallback((nodeId: string | null) => {
        if (!nodeId) return 'Unknown';
        const node = nodes.find(n => n.id === nodeId);
        return node?.data?.entity?.name || 'Unknown';
    }, [nodes]);

    const onConnect = useCallback(
        (params: Connection) => {
            // Store the pending connection and open the relationship modal
            setPendingConnection(params);
            setIsRelationshipModalOpen(true);
        },
        []
    );

    const handleRelationshipSubmit = useCallback(
        (sourceCardinality: Cardinality, targetCardinality: Cardinality, label?: string) => {
            if (!pendingConnection) return;

            const newEdge: CrowsFootEdgeType = {
                id: `edge-${nextEdgeId}`,
                source: pendingConnection.source!,
                target: pendingConnection.target!,
                sourceHandle: pendingConnection.sourceHandle,
                targetHandle: pendingConnection.targetHandle,
                type: 'crowsFootEdge',
                data: {
                    sourceCardinality,
                    targetCardinality,
                    label,
                },
            };

            setEdges((edges) => [...edges, newEdge]);
            setNextEdgeId((id) => id + 1);
            setPendingConnection(null);
            setIsRelationshipModalOpen(false);
        },
        [pendingConnection, nextEdgeId, setEdges]
    );

    const handleRelationshipModalClose = useCallback(() => {
        setPendingConnection(null);
        setEditingEdge(null);
        setIsRelationshipModalOpen(false);
    }, []);

    const handleOpenModal = useCallback(() => {
        setEditingNode(null);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setEditingNode(null);
        setIsModalOpen(false);
    }, []);

    // Handle table creation (new table)
    const handleCreateTable = useCallback(
        (tableName: string, attributes: Omit<Attribute, 'id'>[]) => {
            const newEntity: Entity = {
                id: nextEntityId,
                name: tableName,
                attributes: attributes.map((attr, index) => ({
                    ...attr,
                    id: nextEntityId * 100 + index + 1,
                })),
                relationships: [],
            };

            const newNode: EntityNodeType = {
                id: String(nextEntityId),
                type: 'entityNode',
                position: {
                    x: 100 + (nodes.length * 50),
                    y: 100 + (nodes.length * 50),
                },
                data: { entity: newEntity },
            };

            setNodes((nodes) => [...nodes, newNode]);
            setNextEntityId((id) => id + 1);
            setIsModalOpen(false);
        },
        [nextEntityId, nodes.length, setNodes]
    );

    // Handle table update (edit existing table)
    const handleUpdateTable = useCallback(
        (tableName: string, attributes: Omit<Attribute, 'id'>[]) => {
            if (!editingNode) return;

            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === editingNode.nodeId) {
                        const updatedEntity: Entity = {
                            ...editingNode.entity,
                            name: tableName,
                            attributes: attributes.map((attr, index) => ({
                                ...attr,
                                id: editingNode.entity.id * 100 + index + 1,
                            })),
                        };
                        return {
                            ...node,
                            data: { ...node.data, entity: updatedEntity },
                        };
                    }
                    return node;
                })
            );
            setEditingNode(null);
            setIsModalOpen(false);
        },
        [editingNode, setNodes]
    );

    // Handle relationship update (edit existing edge)
    const handleUpdateRelationship = useCallback(
        (sourceCardinality: Cardinality, targetCardinality: Cardinality, label?: string) => {
            if (!editingEdge) return;

            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.id === editingEdge.edgeId) {
                        return {
                            ...edge,
                            data: {
                                ...edge.data,
                                sourceCardinality,
                                targetCardinality,
                                label,
                            },
                        };
                    }
                    return edge;
                })
            );
            setEditingEdge(null);
            setIsRelationshipModalOpen(false);
        },
        [editingEdge, setEdges]
    );

    // Double-click handler for nodes (tables)
    const handleNodeDoubleClick: NodeMouseHandler<EntityNodeType> = useCallback(
        (_event, node) => {
            setEditingNode({
                nodeId: node.id,
                entity: node.data.entity,
            });
            setIsModalOpen(true);
        },
        []
    );

    // Double-click handler for edges (relationships)
    const handleEdgeDoubleClick: EdgeMouseHandler<CrowsFootEdgeType> = useCallback(
        (_event, edge) => {
            setEditingEdge({
                edgeId: edge.id,
                sourceCardinality: edge.data?.sourceCardinality || 'one',
                targetCardinality: edge.data?.targetCardinality || 'one-or-many',
                label: edge.data?.label,
                source: edge.source,
                target: edge.target,
            });
            setIsRelationshipModalOpen(true);
        },
        []
    );

    return (
        <div className={`canvas-wrapper ${className || ''}`} ref={reactFlowRef}>
            <CanvasToolbar onAddEntity={handleOpenModal} getCanvasElement={getCanvasElement} />
            <AddTableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={editingNode ? handleUpdateTable : handleCreateTable}
                editMode={!!editingNode}
                initialTableName={editingNode?.entity.name}
                initialAttributes={editingNode?.entity.attributes}
            />
            <RelationshipModal
                isOpen={isRelationshipModalOpen}
                onClose={handleRelationshipModalClose}
                onSubmit={editingEdge ? handleUpdateRelationship : handleRelationshipSubmit}
                sourceName={editingEdge ? getEntityName(editingEdge.source) : getEntityName(pendingConnection?.source ?? null)}
                targetName={editingEdge ? getEntityName(editingEdge.target) : getEntityName(pendingConnection?.target ?? null)}
                editMode={!!editingEdge}
                initialSourceCardinality={editingEdge?.sourceCardinality}
                initialTargetCardinality={editingEdge?.targetCardinality}
                initialLabel={editingEdge?.label}
            />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeDoubleClick={handleEdgeDoubleClick}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls />
            </ReactFlow>
        </div>
    );
};