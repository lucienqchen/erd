import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { CanvasPage } from './pages/CanvasPage'
import { EditorPage } from './pages/EditorPage'
import { ROUTES } from './constants/routes'
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar appName="ERD Studio" />

        <main>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.CANVAS} element={<CanvasPage />} />
            <Route path={ROUTES.EDITOR} element={<EditorPage />} />
          </Routes>
        </main>
        
      </div>
    </BrowserRouter>
  )
}

export default App
