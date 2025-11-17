// Types for our ERD application
export interface Entity {
  id: string;
  name: string;
  attributes: Attribute[];
  position: { x: number; y: number };
}

export interface Attribute {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string; // Format: "EntityName.attributeName"
}

export interface Relationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'one-and-only-one' | 'one-or-more' | 'zero-or-one' | 'zero-or-many' | 'many';
  label?: string;
}

export interface DiagramData {
  entities: Entity[];
  relationships: Relationship[];
}
