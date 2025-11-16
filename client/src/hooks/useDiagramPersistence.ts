import { useEffect } from 'react'
import { useDiagram, DiagramSchema } from '../context/DiagramContext'

const STORAGE_KEY = 'erd-diagram'

export function useDiagramPersistence() {
  const { diagram, loadDiagram } = useDiagram()

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const schema = JSON.parse(saved) as DiagramSchema
        loadDiagram(schema)
      } catch (e) {
        console.error('Failed to load diagram from localStorage:', e)
      }
    }
  }, [])

  // Autosave to localStorage whenever diagram changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram))
  }, [diagram])
}

export function useExportDiagram() {
  const { getDiagramJSON } = useDiagram()

  const exportJSON = () => {
    const json = getDiagramJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagram-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const schema = JSON.parse(e.target?.result as string) as DiagramSchema
        // TODO: wire to loadDiagram via context
      } catch (err) {
        console.error('Failed to parse JSON:', err)
      }
    }
    reader.readAsText(file)
  }

  return { exportJSON, importJSON }
}
