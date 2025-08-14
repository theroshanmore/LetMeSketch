import { create } from "zustand"
import type { CanvasPath, CanvasShape, Tool } from "@/types/canvas"

interface CanvasStore {
  // Tools
  tool: Tool
  setTool: (tool: Tool) => void

  // Drawing state
  isDrawing: boolean
  setIsDrawing: (isDrawing: boolean) => void

  // Paths
  currentPath: number[]
  setCurrentPath: (path: number[]) => void
  paths: CanvasPath[]
  addPath: (path: CanvasPath) => void
  clearPaths: () => void

  // Shapes
  shapes: CanvasShape[]
  addShape: (shape: CanvasShape) => void
  updateShape: (id: string, updates: Partial<CanvasShape>) => void
  deleteShape: (id: string) => void
  clearShapes: () => void

  // Selection
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  addToSelection: (id: string) => void
  removeFromSelection: (id: string) => void
  clearSelection: () => void
  deleteSelected: () => void

  // Stage transform
  stagePos: { x: number; y: number }
  setStagePos: (pos: { x: number; y: number }) => void
  stageScale: number
  setStageScale: (scale: number) => void

  // History
  history: { paths: CanvasPath[]; shapes: CanvasShape[] }[]
  historyIndex: number
  undo: () => void
  redo: () => void
  saveToHistory: () => void

  // Properties
  strokeColor: string
  setStrokeColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  fillColor: string
  setFillColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void

  // Export/Import
  exportToJSON: () => string
  importFromJSON: (jsonData: string) => boolean
  saveToLocalStorage: (name: string) => void
  loadFromLocalStorage: (name: string) => boolean
  getSavedDrawings: () => string[]
  deleteSavedDrawing: (name: string) => void

  // Collaboration properties
  collaborationMode: boolean
  setCollaborationMode: (mode: boolean) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void
  userId: string | null
  setUserId: (id: string | null) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Tools
  tool: "pen",
  setTool: (tool) => set({ tool }),

  // Drawing state
  isDrawing: false,
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  // Paths
  currentPath: [],
  setCurrentPath: (currentPath) => set({ currentPath }),
  paths: [],
  addPath: (path) => {
    set((state) => ({ paths: [...state.paths, path] }))
    get().saveToHistory()
  },
  clearPaths: () => {
    set({ paths: [] })
    get().saveToHistory()
  },

  // Shapes
  shapes: [],
  addShape: (shape) => {
    set((state) => ({ shapes: [...state.shapes, shape] }))
    get().saveToHistory()
  },
  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape)),
    }))
    get().saveToHistory()
  },
  deleteShape: (id) => {
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
    }))
    get().saveToHistory()
  },
  clearShapes: () => {
    set({ shapes: [] })
    get().saveToHistory()
  },

  // Selection
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  addToSelection: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id) ? state.selectedIds : [...state.selectedIds, id],
    }))
  },
  removeFromSelection: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
    }))
  },
  clearSelection: () => set({ selectedIds: [] }),
  deleteSelected: () => {
    const { selectedIds } = get()
    set((state) => ({
      shapes: state.shapes.filter((shape) => !selectedIds.includes(shape.id)),
      paths: state.paths.filter((path) => !selectedIds.includes(path.id)),
      selectedIds: [],
    }))
    get().saveToHistory()
  },

  // Stage transform
  stagePos: { x: 0, y: 0 },
  setStagePos: (stagePos) => set({ stagePos }),
  stageScale: 1,
  setStageScale: (stageScale) => set({ stageScale }),

  // History
  history: [{ paths: [], shapes: [] }],
  historyIndex: 0,
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      set({
        paths: state.paths,
        shapes: state.shapes,
        historyIndex: newIndex,
      })
    }
  },
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      set({
        paths: state.paths,
        shapes: state.shapes,
        historyIndex: newIndex,
      })
    }
  },
  saveToHistory: () => {
    const { paths, shapes, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ paths: [...paths], shapes: [...shapes] })

    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      set({ historyIndex: newHistory.length - 1 })
    }

    set({ history: newHistory })
  },

  // Properties
  strokeColor: "#000000",
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  strokeWidth: 2,
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  fillColor: "transparent",
  setFillColor: (fillColor) => set({ fillColor }),
  opacity: 1,
  setOpacity: (opacity) => set({ opacity }),

  // Export/Import
  exportToJSON: () => {
    const { paths, shapes } = get()
    const exportData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      paths,
      shapes,
    }
    return JSON.stringify(exportData, null, 2)
  },

  importFromJSON: (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)

      // Validate data structure
      if (!data.paths || !data.shapes || !Array.isArray(data.paths) || !Array.isArray(data.shapes)) {
        return false
      }

      set({
        paths: data.paths,
        shapes: data.shapes,
        selectedIds: [],
      })

      get().saveToHistory()
      return true
    } catch (error) {
      console.error("Failed to import JSON:", error)
      return false
    }
  },

  saveToLocalStorage: (name: string) => {
    const jsonData = get().exportToJSON()
    const savedDrawings = JSON.parse(localStorage.getItem("excalidraw-drawings") || "{}")
    savedDrawings[name] = {
      data: jsonData,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("excalidraw-drawings", JSON.stringify(savedDrawings))
  },

  loadFromLocalStorage: (name: string) => {
    try {
      const savedDrawings = JSON.parse(localStorage.getItem("excalidraw-drawings") || "{}")
      const drawing = savedDrawings[name]

      if (drawing && drawing.data) {
        return get().importFromJSON(drawing.data)
      }
      return false
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return false
    }
  },

  getSavedDrawings: () => {
    try {
      const savedDrawings = JSON.parse(localStorage.getItem("excalidraw-drawings") || "{}")
      return Object.keys(savedDrawings).sort((a, b) => {
        const timeA = new Date(savedDrawings[a].timestamp).getTime()
        const timeB = new Date(savedDrawings[b].timestamp).getTime()
        return timeB - timeA // Most recent first
      })
    } catch (error) {
      console.error("Failed to get saved drawings:", error)
      return []
    }
  },

  deleteSavedDrawing: (name: string) => {
    try {
      const savedDrawings = JSON.parse(localStorage.getItem("excalidraw-drawings") || "{}")
      delete savedDrawings[name]
      localStorage.setItem("excalidraw-drawings", JSON.stringify(savedDrawings))
    } catch (error) {
      console.error("Failed to delete saved drawing:", error)
    }
  },

  // Collaboration state
  collaborationMode: false,
  setCollaborationMode: (collaborationMode) => set({ collaborationMode }),
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  userId: null,
  setUserId: (userId) => set({ userId }),
}))
