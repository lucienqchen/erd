import React, { useState, useEffect } from 'react';
import { useDiagram } from './DiagramContext';
import { DiagramData, Entity, Relationship } from './types';

// Simplified JSON structure for display
interface SimplifiedEntity {
  name: string;
  attributes: Array<{
    name: string;
    type: string;
    PK?: boolean;
    FK?: boolean;
    references?: string;
  }>;
}

interface SimplifiedRelationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'one-and-only-one' | 'one-or-more' | 'zero-or-one' | 'zero-or-many' | 'many';
}

interface SimplifiedDiagram {
  entities: SimplifiedEntity[];
  relationships: SimplifiedRelationship[];
}

const JSONEditor: React.FC = () => {
  const { diagramData, updateDiagramData } = useDiagram();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Convert full diagram to simplified view
  const toSimplified = (data: DiagramData): SimplifiedDiagram => {
    const entityMap = new Map(data.entities.map(e => [e.id, e.name]));
    
    return {
      entities: data.entities.map(e => ({
        name: e.name,
        attributes: e.attributes.map(a => {
          const attr: any = { name: a.name, type: a.type };
          if (a.isPrimaryKey) attr.PK = true;
          if (a.isForeignKey) attr.FK = true;
          if (a.references) attr.references = a.references;
          return attr;
        })
      })),
      relationships: data.relationships.map(r => ({
        from: entityMap.get(r.source) || r.source,
        to: entityMap.get(r.target) || r.target,
        type: r.type
      }))
    };
  };

  // Convert simplified view back to full diagram
  const fromSimplified = (simplified: SimplifiedDiagram, currentData: DiagramData): DiagramData => {
    // Create a map of entity names to their current data (to preserve IDs and positions)
    const existingEntities = new Map(currentData.entities.map(e => [e.name, e]));
    
    const entities: Entity[] = simplified.entities.map((se, index) => {
      const existing = existingEntities.get(se.name);
      return {
        id: existing?.id || `entity-${Date.now()}-${index}`,
        name: se.name,
        attributes: se.attributes.map(a => ({
          name: a.name,
          type: a.type,
          isPrimaryKey: a.PK || false,
          isForeignKey: a.FK || false,
          references: a.references
        })),
        position: existing?.position || { 
          x: Math.random() * 400 + 50, 
          y: Math.random() * 300 + 50 
        }
      };
    });

    // Create entity name to ID map
    const nameToId = new Map(entities.map(e => [e.name, e.id]));
    
    const relationships: Relationship[] = simplified.relationships.map((sr, index) => {
      const sourceId = nameToId.get(sr.from);
      const targetId = nameToId.get(sr.to);
      
      if (!sourceId || !targetId) {
        throw new Error(`Invalid relationship: ${sr.from} -> ${sr.to}`);
      }
      
      return {
        id: `rel-${Date.now()}-${index}`,
        source: sourceId,
        target: targetId,
        type: sr.type
      };
    });

    return { entities, relationships };
  };

  // Update JSON text when diagram data changes
  useEffect(() => {
    const simplified = toSimplified(diagramData);
    setJsonText(JSON.stringify(simplified, null, 2));
    setError(null);
  }, [diagramData]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);

    // Try to parse and update diagram
    try {
      const parsed = JSON.parse(newText) as SimplifiedDiagram;
      
      // Validate structure
      if (!parsed.entities || !Array.isArray(parsed.entities)) {
        throw new Error('Invalid structure: entities must be an array');
      }
      if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
        throw new Error('Invalid structure: relationships must be an array');
      }

      const fullDiagram = fromSimplified(parsed, diagramData);
      updateDiagramData(fullDiagram);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'white'
    }}>
      <div style={{ 
        padding: '12px', 
        background: '#f5f5f5', 
        color: '#333',
        borderBottom: '1px solid #ddd',
        fontWeight: 'bold'
      }}>
        JSON Representation
      </div>
      
      {error && (
        <div style={{ 
          padding: '8px 12px', 
          background: '#f44336', 
          color: 'white',
          fontSize: '12px'
        }}>
          Error: {error}
        </div>
      )}

      <textarea
        value={jsonText}
        onChange={handleTextChange}
        style={{
          flex: 1,
          padding: '12px',
          fontFamily: 'monospace',
          fontSize: '13px',
          border: 'none',
          outline: 'none',
          resize: 'none',
          background: 'white',
          color: '#333',
          lineHeight: '1.5'
        }}
        spellCheck={false}
      />
    </div>
  );
};

export default JSONEditor;
