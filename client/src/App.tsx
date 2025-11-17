import React, { useState } from 'react';
import { DiagramProvider } from './DiagramContext';
import Toolbar from './Toolbar';
import ERDCanvas from './ERDCanvas';
import JSONEditor from './JSONEditor';
import './App.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'json'>('diagram');

  return (
    <DiagramProvider>
      <div className="app">
        <Toolbar />
        
        {/* Tab Navigation */}
        <div className="tab-bar">
          <button 
            className={`tab-button ${activeTab === 'diagram' ? 'active' : ''}`}
            onClick={() => setActiveTab('diagram')}
          >
            📊 Diagram
          </button>
          <button 
            className={`tab-button ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            📝 JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="main-content">
          {activeTab === 'diagram' ? (
            <div className="canvas-panel">
              <ERDCanvas />
            </div>
          ) : (
            <div className="json-panel-full">
              <JSONEditor />
            </div>
          )}
        </div>
      </div>
    </DiagramProvider>
  );
};

export default App;
