import { create } from "zustand"
import type { CanvasPath, CanvasShape } from "@/types/canvas"

export type Tool = "select" | "hand" | "pen" | "rectangle" | "circle" | "arrow" | "line" | "text"

interface CanvasState {
  // Tools
  tool: Tool
  setTool: (tool: Tool) => void

  // Drawing properties
  strokeColor: string
  setStrokeColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  fillColor: string
  setFillColor: (color: string) => void
  opacity: number
  setOpacity: (opacity: number) => void

  // Grid visibility toggle
  showGrid: boolean
  setShowGrid: (show: boolean) => void

  // Theme-aware stroke color method
  updateStrokeForTheme: (isDark: boolean) => void

  // Canvas elements
  paths: CanvasPath[]
  shapes: CanvasShape[]
  addPath: (path: CanvasPath) => void
  addShape: (shape: CanvasShape) => void
  updateShape: (id: string, updates: Partial<CanvasShape>) => void
  deleteShape: (id: string) => void
  deletePath: (id: string) => void

  // Selection
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  clearSelection: () => void
  deleteSelected: () => void

  // Canvas state
  stagePos: { x: number; y: number }
  setStagePos: (pos: { x: number; y: number }) => void
  stageScale: number
  setStageScale: (scale: number) => void

  // History
  history: Array<{ paths: CanvasPath[]; shapes: CanvasShape[] }>
  historyIndex: number
  saveToHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Canvas operations
  clearCanvas: () => void
  fitToScreen: () => void
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void

  // Collaboration
  collaborationMode: boolean
  setCollaborationMode: (mode: boolean) => void
  sessionId: string | null
  setSessionId: (id: string | null) => void

  // Export/Import
  exportToJSON: () => string
  importFromJSON: (data: string) => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Tools
  tool: "pen",
  setTool: (tool) => set({ tool }),

  // Drawing properties
  strokeColor: "#000000",
  setStrokeColor: (strokeColor) => set({ strokeColor }),
  strokeWidth: 2,
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  fillColor: "transparent",
  setFillColor: (fillColor) => set({ fillColor }),
  opacity: 1,
  setOpacity: (opacity) => set({ opacity }),

  // Grid visibility state
  showGrid: true,
  setShowGrid: (showGrid) => set({ showGrid }),

  // Theme-aware stroke color update
  updateStrokeForTheme: (isDark) => {
    const currentColor = get().strokeColor
    // Only update if using default black or white colors
    if (currentColor === "#000000" || currentColor === "#ffffff") {
      set({ strokeColor: isDark ? "#ffffff" : "#000000" })
    }
  },

  // Canvas elements
  paths: [],
  shapes: [],
  addPath: (path) => {
    set((state) => ({ paths: [...state.paths, path] }))
    get().saveToHistory()
  },
  addShape: (shape) => {
    set((state) => ({ shapes: [...state.shapes, shape] }))
    get().saveToHistory()
  },
  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) => (shape.id === id ? { ...shape, ...updates } : shape)),
    }))
  },
  deleteShape: (id) => {
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
    }))
    get().saveToHistory()
  },
  deletePath: (id) => {
    set((state) => ({
      paths: state.paths.filter((path) => path.id !== id),
    }))
    get().saveToHistory()
  },

  // Selection
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  clearSelection: () => set({ selectedIds: [] }),
  deleteSelected: () => {
    const { selectedIds, shapes, paths } = get()
    set({
      shapes: shapes.filter((shape) => !selectedIds.includes(shape.id)),
      paths: paths.filter((path) => !selectedIds.includes(path.id)),
      selectedIds: [],
    })
    get().saveToHistory()
  },

  // Canvas state
  stagePos: { x: 0, y: 0 },
  setStagePos: (stagePos) => set({ stagePos }),
  stageScale: 1,
  setStageScale: (stageScale) => set({ stageScale }),

  // History
  history: [],
  historyIndex: -1,
  saveToHistory: () => {
    const { paths, shapes, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ paths: [...paths], shapes: [...shapes] })

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      set({ historyIndex: historyIndex + 1 })
    }

    set({ history: newHistory })
  },
  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      set({
        paths: [...prevState.paths],
        shapes: [...prevState.shapes],
        historyIndex: historyIndex - 1,
        selectedIds: [],
      })
    }
  },
  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      set({
        paths: [...nextState.paths],
        shapes: [...nextState.shapes],
        historyIndex: historyIndex + 1,
        selectedIds: [],
      })
    }
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // Canvas operations
  clearCanvas: () => {
    set({ paths: [], shapes: [], selectedIds: [] })
    get().saveToHistory()
  },
  fitToScreen: () => {
    // Implementation for fit to screen
    set({ stagePos: { x: 0, y: 0 }, stageScale: 1 })
  },
  resetZoom: () => {
    set({ stageScale: 1 })
  },
  zoomIn: () => {
    const currentScale = get().stageScale
    const newScale = Math.min(currentScale * 1.2, 5) // Max zoom 5x
    set({ stageScale: newScale })
  },
  zoomOut: () => {
    const currentScale = get().stageScale
    const newScale = Math.max(currentScale / 1.2, 0.1) // Min zoom 0.1x
    set({ stageScale: newScale })
  },

  // Collaboration
  collaborationMode: false,
  setCollaborationMode: (collaborationMode) => set({ collaborationMode }),
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),

  // Export/Import
  exportToJSON: () => {
    const { paths, shapes } = get()
    return JSON.stringify({ paths, shapes }, null, 2)
  },
  importFromJSON: (data) => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.paths && parsed.shapes) {
        set({ paths: parsed.paths, shapes: parsed.shapes, selectedIds: [] })
        get().saveToHistory()
      }
    } catch (error) {
      console.error("Failed to import JSON:", error)
    }
  },
}))
