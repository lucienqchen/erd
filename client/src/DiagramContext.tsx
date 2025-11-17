import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DiagramData, Entity, Relationship } from './types';

interface DiagramContextType {
  diagramData: DiagramData;
  updateDiagramData: (data: DiagramData) => void;
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, entity: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  addRelationship: (relationship: Relationship) => void;
  deleteRelationship: (id: string) => void;
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const DiagramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diagramData, setDiagramData] = useState<DiagramData>({
    entities: [],
    relationships: []
  });

  const updateDiagramData = (data: DiagramData) => {
    setDiagramData(data);
  };

  const addEntity = (entity: Entity) => {
    setDiagramData(prev => ({
      ...prev,
      entities: [...prev.entities, entity]
    }));
  };

  const updateEntity = (id: string, updates: Partial<Entity>) => {
    setDiagramData(prev => ({
      ...prev,
      entities: prev.entities.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEntity = (id: string) => {
    setDiagramData(prev => ({
      entities: prev.entities.filter(e => e.id !== id),
      relationships: prev.relationships.filter(r => r.source !== id && r.target !== id)
    }));
  };

  const addRelationship = (relationship: Relationship) => {
    setDiagramData(prev => ({
      ...prev,
      relationships: [...prev.relationships, relationship]
    }));
  };

  const deleteRelationship = (id: string) => {
    setDiagramData(prev => ({
      ...prev,
      relationships: prev.relationships.filter(r => r.id !== id)
    }));
  };

  return (
    <DiagramContext.Provider value={{
      diagramData,
      updateDiagramData,
      addEntity,
      updateEntity,
      deleteEntity,
      addRelationship,
      deleteRelationship
    }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useDiagram = () => {
  const context = useContext(DiagramContext);
  if (!context) {
    throw new Error('useDiagram must be used within DiagramProvider');
  }
  return context;
};
