import React, { useState } from 'react'
import { DiagramProvider } from './context/DiagramContext'
import { useDiagramPersistence } from './hooks/useDiagramPersistence'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import Inspector from './components/Inspector'
import RAEditor from './components/RAEditor'
import InfoTab from './components/InfoTab'

function AppContent() {
  const [tab, setTab] = useState<'diagram'|'ra'|'info'>('diagram')
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  useDiagramPersistence()

  return (
    <div className="app-root">
      <div className="topbar">
        <div className="logo">ERD Tool</div>
        <div className="top-actions">
          <button onClick={() => setTab('diagram')}>Diagram</button>
          <button onClick={() => setTab('ra')}>Relational Algebra</button>
          <button onClick={() => setTab('info')}>Info</button>
        </div>
      </div>
      <div className="layout">
        <Sidebar />
        <main className="main-canvas">
          {tab === 'diagram' && <Canvas onSelectEntity={setSelectedEntityId} />}
          {tab === 'ra' && <RAEditor />}
          {tab === 'info' && <InfoTab />}
        </main>
        <Inspector selectedEntityId={selectedEntityId} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <DiagramProvider>
      <AppContent />
    </DiagramProvider>
  )
}
