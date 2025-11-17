import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  useNodesState,
  useEdgesState,
  Connection,
  NodeChange,
  EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagram } from './DiagramContext';
import EntityNode from './EntityNode';
import EntityEditor from './EntityEditor';
import RelationshipSelector from './RelationshipSelector';
import CrowsFootEdge from './CrowsFootEdge';
import { Entity } from './types';

const ERDCanvas: React.FC = () => {
  const { diagramData, updateEntity, deleteEntity, addRelationship, deleteRelationship } = useDiagram();
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  const handleEditEntity = useCallback((entity: Entity) => {
    setEditingEntity(entity);
  }, []);

  // Convert entities to ReactFlow nodes
  const initialNodes: Node[] = useMemo(() => 
    diagramData.entities.map(entity => ({
      id: entity.id,
      type: 'entityNode',
      position: entity.position,
      data: { 
        entity,
        onDelete: deleteEntity,
        onEdit: handleEditEntity
      }
    })),
    [diagramData.entities, deleteEntity, handleEditEntity]
  );

  // Helper function to create edge markers based on relationship type
  const getEdgeStyle = (type: string) => {
    // All edges use the same base style - we'll use CSS classes for different notations
    return {
      strokeWidth: 2,
      stroke: '#000000ff',
      strokeDasharray: type.includes('zero') ? '5,5' : undefined
    };
  };

  // Convert relationships to ReactFlow edges
  const initialEdges: Edge[] = useMemo(() =>
    diagramData.relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: 'crowsfoot', // Use custom edge
      style: getEdgeStyle(rel.type),
      data: { type: rel.type }
    })),
    [diagramData.relationships]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes back to context when they change
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // Update entity positions when nodes are dragged
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        updateEntity(change.id, { position: change.position });
      }
    });
  }, [onNodesChange, updateEntity]);

  // Sync edges back to context when they change
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
    
    // Handle edge deletion
    changes.forEach(change => {
      if (change.type === 'remove') {
        deleteRelationship(change.id);
      }
    });
  }, [onEdgesChange, deleteRelationship]);

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      setPendingConnection(connection);
    }
  }, []);

  const handleRelationshipTypeSelect = useCallback((type: string) => {
    if (pendingConnection && pendingConnection.source && pendingConnection.target) {
      const newRelationship = {
        id: `rel-${Date.now()}`,
        source: pendingConnection.source,
        target: pendingConnection.target,
        type: type as any
      };
      addRelationship(newRelationship);
      
      const newEdge: Edge = {
        id: newRelationship.id,
        source: newRelationship.source,
        target: newRelationship.target,
        type: 'crowsfoot', // Use custom edge
        style: getEdgeStyle(type),
        data: { type }
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    setPendingConnection(null);
  }, [pendingConnection, addRelationship, setEdges]);

  // Define custom node types
  const nodeTypes = useMemo(() => ({ entityNode: EntityNode }), []);
  
  // Define custom edge types
  const edgeTypes = useMemo(() => ({ crowsfoot: CrowsFootEdge }), []);

  // Update nodes when diagramData changes
  React.useEffect(() => {
    setNodes(diagramData.entities.map(entity => ({
      id: entity.id,
      type: 'entityNode',
      position: entity.position,
      data: { 
        entity,
        onDelete: deleteEntity,
        onEdit: handleEditEntity
      }
    })));
  }, [diagramData.entities, setNodes, deleteEntity, handleEditEntity]);

  // Update edges when diagramData changes
  React.useEffect(() => {
    setEdges(diagramData.relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: 'crowsfoot', // Use custom edge
      style: getEdgeStyle(rel.type),
      data: { type: rel.type }
    })));
  }, [diagramData.relationships, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Controls />
      </ReactFlow>
      
      {editingEntity && (
        <EntityEditor 
          entity={editingEntity} 
          onClose={() => setEditingEntity(null)} 
        />
      )}
      
      {pendingConnection && (
        <RelationshipSelector 
          onSelect={handleRelationshipTypeSelect}
          onCancel={() => setPendingConnection(null)}
        />
      )}
    </div>
  );
};

export default ERDCanvas;
