export interface Entity {
    id: number;
    name: string;
    attributes: Attribute[];
    relationships: Relationship[];
}

export interface Attribute {
    id: number;
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
}

export interface Relationship {
    id: number;
    from: string;
    to: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}