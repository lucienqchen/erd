# ERD - Entity Relationship Diagram Tool

A minimal web-based application for creating entity-relationship diagrams with a synchronized JSON editor. Perfect for data scientists and developers who need to visualize database schemas and table relationships.

## Features

- **Drag-and-Drop Interface**: Create and position entities on an interactive canvas
- **Entity Management**: Define tables with attributes (name, type, primary keys, foreign keys)
- **Edit Entities**: Double-click any entity to edit its name and attributes
- **Crow's Foot Notation**: Professional ER diagram symbols for relationships
  - One-to-One: Single line on both sides
  - One-to-Many: Single line to crow's foot
  - Many-to-Many: Crow's foot on both sides
  - Optional relationships: Circle symbol for zero or optional
  - Mandatory relationships: Double line for exactly one
- **Relationship Type Selection**: Choose from 8 different relationship types when connecting entities
- **Tabbed Interface**: Switch between visual diagram and JSON views
- **Bidirectional JSON Sync**: 
  - Changes in the diagram automatically update the JSON editor
  - Edit the JSON directly to update the diagram in real-time
- **Extensible Architecture**: Designed to support future features like relational algebra operations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Diagram Library**: React Flow (for drag-and-drop functionality)
- **Backend**: Node.js + Express (minimal server for future API extensions)

## Project Structure

```
erd/
├── client/          # React frontend application
│   ├── src/
│   │   ├── App.tsx           # Main application component
│   │   ├── DiagramContext.tsx # State management for diagram data
│   │   ├── ERDCanvas.tsx      # Interactive diagram canvas
│   │   ├── EntityNode.tsx     # Custom node component for entities
│   │   ├── JSONEditor.tsx     # JSON text editor with sync
│   │   ├── Toolbar.tsx        # UI for adding entities
│   │   └── types.ts           # TypeScript type definitions
│   └── package.json
└── server/          # Express backend server
    ├── index.js
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd erd
   ```

2. **Install dependencies for both client and server**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start the development servers**

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:5000

   **Terminal 2 - Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:3000

4. **Open your browser**
   Navigate to http://localhost:3000

### Quick Start (Alternative)

Use the provided start script:
```bash
./start.sh
```

This will install dependencies (if needed) and start both servers automatically.

## Usage Guide

### Creating Entities

1. Click the **"+ Add Entity"** button in the toolbar
2. Enter the entity name (e.g., "User", "Product")
3. Add attributes by filling in:
   - **Name**: Attribute name (e.g., "id", "email", "name")
   - **Type**: Data type (e.g., "INT", "VARCHAR", "UUID")
   - **PK checkbox**: Mark if it's a primary key
   - **FK checkbox**: Mark if it's a foreign key
   - **References**: Specify the reference (e.g., "User.id")
4. Click **"Add"** to add each attribute
5. Click **"Create Entity"** to add the entity to the diagram

### Editing Entities

1. **Double-click** any entity on the diagram
2. The entity editor modal opens
3. Edit the entity name
4. **Add new attributes** using the form at the top
5. **Edit existing attributes** by clicking the ✏️ icon
6. **Delete attributes** by clicking the × button
7. Click **"Save Changes"** to apply, or **"Delete Entity"** to remove it

### Creating Relationships

1. Hover over an entity to see connection handles (small circles on all sides)
2. Click and drag from a handle on one entity to a handle on another entity
3. A relationship type selector dialog appears
4. Choose the relationship type:
   - **One to One** (1:1) - Single line on both sides
   - **One to Many** (1:N) - Single line to crow's foot
   - **Many to Many** (N:M) - Crow's foot on both sides
   - **One and Only One** - Double line (mandatory)
   - **One or More** - Line plus crow's foot
   - **Zero or One** - Circle plus line (optional)
   - **Zero or Many** - Circle plus crow's foot
   - **Many** - Just crow's foot
5. Click **"Create Relationship"**
6. The connection appears with proper crow's foot notation symbols

### Switching Views

- Click **"📊 Diagram"** tab to work with the visual ERD
- Click **"📝 JSON"** tab to view/edit the JSON representation
- Changes in either view sync automatically to the other

### Working with JSON

- The **JSON tab** shows a simplified JSON representation of your diagram
- **Editing the JSON directly** will update the diagram in real-time
- Useful for:
  - Bulk editing entities and relationships
  - Copying diagram structure
  - Version control and sharing diagrams
  - Importing existing schemas

**Try the example:** Copy the contents of `examples/blog-schema.json` and paste it into the JSON editor to see a sample blog database schema!

### JSON Schema

```json
{
  "entities": [
    {
      "id": "entity-123456",
      "name": "User",
      "attributes": [
        {
          "name": "id",
          "type": "UUID",
          "isPrimaryKey": true
        },
        {
          "name": "email",
          "type": "VARCHAR(255)"
        }
      ],
      "position": { "x": 100, "y": 100 }
    }
  ],
  "relationships": [
    {
      "id": "rel-123456",
      "source": "entity-123456",
      "target": "entity-789012",
      "type": "one-to-many",
      "label": "one-to-many"
    }
  ]
}
```

## Future Enhancements

The architecture is designed to support:

- **Relational Algebra Operations**: Query and transform diagrams using relational algebra
- **Diagram Persistence**: Save and load diagrams via backend API
- **Export Capabilities**: Generate SQL DDL, documentation, or images
- **Collaboration**: Real-time multi-user editing
- **Advanced Relationship Types**: Composite keys, self-referencing relationships
- **Schema Validation**: Validate diagram structure and constraints

## Development

### Available Scripts

**Client (Frontend)**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server (Backend)**
- `npm start` - Start server
- `npm run dev` - Start server with auto-reload (requires nodemon)

### Architecture Notes

- **DiagramContext**: Centralized state management using React Context API
- **Bidirectional Sync**: Changes flow through the context, ensuring both the visual diagram and JSON editor stay synchronized
- **React Flow**: Provides the canvas, node positioning, and connection handling
- **Minimal Backend**: Express server is ready for future API endpoints (diagram storage, relational algebra processing)

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.