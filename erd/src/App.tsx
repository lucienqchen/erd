import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState<string>('home')

  const handleNavigation = (section: string) => {
    setActiveSection(section)
  }
  return (
    <div className="app-container">
      <Navbar 
        appName="ERD Studio"
        onNavClick={handleNavigation}
      />
    </div>
  )
}

export default App
