"use client"

import { useEffect } from "react"
import { useCanvasStore } from "@/lib/store"

export function KeyboardShortcuts() {
  const {
    tool,
    setTool,
    undo,
    redo,
    deleteSelected,
    clearSelection,
    clearPaths,
    clearShapes,
    stageScale,
    setStageScale,
    setStagePos,
  } = useCanvasStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrl = e.ctrlKey || e.metaKey
      const isShift = e.shiftKey

      // Undo/Redo
      if (isCtrl && e.key === "z" && !isShift) {
        e.preventDefault()
        undo()
        return
      }
      if (isCtrl && (e.key === "y" || (e.key === "z" && isShift))) {
        e.preventDefault()
        redo()
        return
      }

      // Tool shortcuts
      if (!isCtrl) {
        switch (e.key) {
          case "v":
          case "1":
            setTool("select")
            break
          case "h":
          case "2":
            setTool("hand")
            break
          case "p":
          case "3":
            setTool("pen")
            break
          case "l":
          case "4":
            setTool("line")
            break
          case "r":
          case "5":
            setTool("rectangle")
            break
          case "c":
          case "6":
            setTool("circle")
            break
          case "a":
          case "7":
            setTool("arrow")
            break
          case "t":
          case "8":
            setTool("text")
            break
        }
      }

      // Selection and deletion
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        deleteSelected()
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        clearSelection()
        return
      }

      // Select all (Ctrl+A)
      if (isCtrl && e.key === "a") {
        e.preventDefault()
        // This would need to be implemented in the store
        return
      }

      // Clear canvas (Ctrl+Shift+Delete)
      if (isCtrl && isShift && e.key === "Delete") {
        e.preventDefault()
        if (confirm("Clear entire canvas?")) {
          clearPaths()
          clearShapes()
          clearSelection()
        }
        return
      }

      // Zoom controls
      if (isCtrl) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault()
            setStageScale(Math.min(5, stageScale * 1.2))
            break
          case "-":
            e.preventDefault()
            setStageScale(Math.max(0.1, stageScale / 1.2))
            break
          case "0":
            e.preventDefault()
            setStageScale(1)
            setStagePos({ x: 0, y: 0 })
            break
          case "1":
            e.preventDefault()
            // Fit to screen - would need canvas bounds
            setStageScale(1)
            setStagePos({ x: 0, y: 0 })
            break
        }
      }

      // Zoom with +/- keys (without Ctrl)
      if (!isCtrl) {
        switch (e.key) {
          case "+":
          case "=":
            e.preventDefault()
            setStageScale(Math.min(5, stageScale * 1.2))
            break
          case "-":
            e.preventDefault()
            setStageScale(Math.max(0.1, stageScale / 1.2))
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    tool,
    setTool,
    undo,
    redo,
    deleteSelected,
    clearSelection,
    clearPaths,
    clearShapes,
    stageScale,
    setStageScale,
    setStagePos,
  ])

  return null // This component only handles keyboard events
}
