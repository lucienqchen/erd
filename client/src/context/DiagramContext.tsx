import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'

export interface Attribute {
  id: string
  name: string
  type: string
  isPK: boolean
  isFK: boolean
}

export interface Entity {
  id: string
  name: string
  x: number
  y: number
  attributes: Attribute[]
}

export interface Relationship {
  id: string
  fromEntityId: string
  toEntityId: string
  cardinality: '1-1' | '1-n' | 'n-n'
  label?: string
}

export interface DiagramSchema {
  entities: Entity[]
  relationships: Relationship[]
}

type Action =
  | { type: 'ADD_ENTITY'; payload: Entity }
  | { type: 'UPDATE_ENTITY'; payload: Entity }
  | { type: 'DELETE_ENTITY'; payload: string }
  | { type: 'ADD_RELATIONSHIP'; payload: Relationship }
  | { type: 'UPDATE_RELATIONSHIP'; payload: Relationship }
  | { type: 'DELETE_RELATIONSHIP'; payload: string }
  | { type: 'ADD_ATTRIBUTE'; payload: { entityId: string; attr: Attribute } }
  | { type: 'UPDATE_ATTRIBUTE'; payload: { entityId: string; attrId: string; attr: Attribute } }
  | { type: 'DELETE_ATTRIBUTE'; payload: { entityId: string; attrId: string } }
  | { type: 'SET_DIAGRAM'; payload: DiagramSchema }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }

const initialState: DiagramSchema = {
  entities: [],
  relationships: []
}

interface HistoryState {
  current: DiagramSchema
  undo: DiagramSchema[]
  redo: DiagramSchema[]
}

function diagramReducer(state: DiagramSchema, action: Action): DiagramSchema {
  switch (action.type) {
    case 'ADD_ENTITY':
      return { ...state, entities: [...state.entities, action.payload] }
    case 'UPDATE_ENTITY':
      return {
        ...state,
        entities: state.entities.map(e => e.id === action.payload.id ? action.payload : e)
      }
    case 'DELETE_ENTITY':
      return {
        ...state,
        entities: state.entities.filter(e => e.id !== action.payload),
        relationships: state.relationships.filter(r => r.fromEntityId !== action.payload && r.toEntityId !== action.payload)
      }
    case 'ADD_RELATIONSHIP':
      return { ...state, relationships: [...state.relationships, action.payload] }
    case 'UPDATE_RELATIONSHIP':
      return {
        ...state,
        relationships: state.relationships.map(r => r.id === action.payload.id ? action.payload : r)
      }
    case 'DELETE_RELATIONSHIP':
      return {
        ...state,
        relationships: state.relationships.filter(r => r.id !== action.payload)
      }
    case 'ADD_ATTRIBUTE': {
      return {
        ...state,
        entities: state.entities.map(e =>
          e.id === action.payload.entityId
            ? { ...e, attributes: [...e.attributes, action.payload.attr] }
            : e
        )
      }
    }
    case 'UPDATE_ATTRIBUTE': {
      return {
        ...state,
        entities: state.entities.map(e =>
          e.id === action.payload.entityId
            ? { ...e, attributes: e.attributes.map(a => a.id === action.payload.attrId ? action.payload.attr : a) }
            : e
        )
      }
    }
    case 'DELETE_ATTRIBUTE': {
      return {
        ...state,
        entities: state.entities.map(e =>
          e.id === action.payload.entityId
            ? { ...e, attributes: e.attributes.filter(a => a.id !== action.payload.attrId) }
            : e
        )
      }
    }
    case 'SET_DIAGRAM':
      return action.payload
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

function historyReducer(state: HistoryState, action: Action | { type: 'PUSH_HISTORY'; payload: DiagramSchema }): HistoryState {
  if (action.type === 'UNDO') {
    if (state.undo.length === 0) return state
    const newUndo = state.undo.slice(0, -1)
    const prevState = state.undo[state.undo.length - 1]
    return {
      current: prevState,
      undo: newUndo,
      redo: [state.current, ...state.redo]
    }
  }
  if (action.type === 'REDO') {
    if (state.redo.length === 0) return state
    const newRedo = state.redo.slice(1)
    const nextState = state.redo[0]
    return {
      current: nextState,
      undo: [...state.undo, state.current],
      redo: newRedo
    }
  }

  // For other actions, apply them to current diagram
  const newCurrent = diagramReducer(state.current, action as Action)
  if (newCurrent === state.current) return state // No change
  return {
    current: newCurrent,
    undo: [...state.undo, state.current],
    redo: []
  }
}

interface DiagramContextType {
  diagram: DiagramSchema
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  addEntity: (name: string, x: number, y: number) => void
  updateEntity: (entity: Entity) => void
  deleteEntity: (id: string) => void
  addRelationship: (fromId: string, toId: string, cardinality: '1-1' | '1-n' | 'n-n', label?: string) => void
  updateRelationship: (rel: Relationship) => void
  deleteRelationship: (id: string) => void
  addAttribute: (entityId: string, name: string, type: string) => void
  updateAttribute: (entityId: string, attrId: string, name: string, type: string, isPK: boolean, isFK: boolean) => void
  deleteAttribute: (entityId: string, attrId: string) => void
  loadDiagram: (schema: DiagramSchema) => void
  clearDiagram: () => void
  getDiagramJSON: () => string
}

const DiagramContext = createContext<DiagramContextType | undefined>(undefined)

const initialHistoryState: HistoryState = {
  current: initialState,
  undo: [],
  redo: []
}

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [historyState, historyDispatch] = useReducer(historyReducer, initialHistoryState)
  const diagram = historyState.current

  const dispatchAction = useCallback((action: Action) => {
    historyDispatch(action as any)
  }, [])

  const addEntity = useCallback((name: string, x: number, y: number) => {
    const id = 'entity-' + Date.now()
    dispatchAction({ type: 'ADD_ENTITY', payload: { id, name, x, y, attributes: [] } })
  }, [dispatchAction])

  const updateEntity = useCallback((entity: Entity) => {
    dispatchAction({ type: 'UPDATE_ENTITY', payload: entity })
  }, [dispatchAction])

  const deleteEntity = useCallback((id: string) => {
    dispatchAction({ type: 'DELETE_ENTITY', payload: id })
  }, [dispatchAction])

  const addRelationship = useCallback((fromId: string, toId: string, cardinality: '1-1' | '1-n' | 'n-n', label?: string) => {
    const id = 'rel-' + Date.now()
    dispatchAction({ type: 'ADD_RELATIONSHIP', payload: { id, fromEntityId: fromId, toEntityId: toId, cardinality, label } })
  }, [dispatchAction])

  const updateRelationship = useCallback((rel: Relationship) => {
    dispatchAction({ type: 'UPDATE_RELATIONSHIP', payload: rel })
  }, [dispatchAction])

  const deleteRelationship = useCallback((id: string) => {
    dispatchAction({ type: 'DELETE_RELATIONSHIP', payload: id })
  }, [dispatchAction])

  const addAttribute = useCallback((entityId: string, name: string, type: string) => {
    const attrId = 'attr-' + Date.now()
    dispatchAction({ type: 'ADD_ATTRIBUTE', payload: { entityId, attr: { id: attrId, name, type, isPK: false, isFK: false } } })
  }, [dispatchAction])

  const updateAttribute = useCallback((entityId: string, attrId: string, name: string, type: string, isPK: boolean, isFK: boolean) => {
    dispatchAction({ type: 'UPDATE_ATTRIBUTE', payload: { entityId, attrId, attr: { id: attrId, name, type, isPK, isFK } } })
  }, [dispatchAction])

  const deleteAttribute = useCallback((entityId: string, attrId: string) => {
    dispatchAction({ type: 'DELETE_ATTRIBUTE', payload: { entityId, attrId } })
  }, [dispatchAction])

  const loadDiagram = useCallback((schema: DiagramSchema) => {
    dispatchAction({ type: 'SET_DIAGRAM', payload: schema })
  }, [dispatchAction])

  const clearDiagram = useCallback(() => {
    dispatchAction({ type: 'CLEAR' })
  }, [dispatchAction])

  const getDiagramJSON = () => {
    return JSON.stringify(diagram, null, 2)
  }

  const undo = useCallback(() => {
    historyDispatch({ type: 'UNDO' })
  }, [])

  const redo = useCallback(() => {
    historyDispatch({ type: 'REDO' })
  }, [])

  return (
    <DiagramContext.Provider value={{
      diagram,
      canUndo: historyState.undo.length > 0,
      canRedo: historyState.redo.length > 0,
      undo,
      redo,
      addEntity,
      updateEntity,
      deleteEntity,
      addRelationship,
      updateRelationship,
      deleteRelationship,
      addAttribute,
      updateAttribute,
      deleteAttribute,
      loadDiagram,
      clearDiagram,
      getDiagramJSON
    }}>
      {children}
    </DiagramContext.Provider>
  )
}

export function useDiagram() {
  const ctx = useContext(DiagramContext)
  if (!ctx) throw new Error('useDiagram must be used within DiagramProvider')
  return ctx
}
