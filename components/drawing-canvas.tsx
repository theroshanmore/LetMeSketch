"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { useCanvasStore } from "@/lib/canvas-store"
import { useTheme } from "next-themes"
import { DrawingToolbar } from "./drawing-toolbar"
import { CollaborationPanel } from "./collaboration-panel"
import { PropertiesPanel } from "./properties-panel"
import { CanvasOperations } from "./canvas-operations"
import { KeyboardShortcuts } from "./keyboard-shortcuts"
import { ShortcutsHelp } from "./shortcuts-help"
import { CustomDialog } from "./custom-dialog"
import { CreatorAttribution } from "./creator-attribution"
import { ExportImport } from "./export-import"
import type { CanvasShape, CanvasPath } from "@/types/canvas"

// Perfect Freehand implementation
function getStroke(points: number[][], options: any = {}) {
  const { size = 8, thinning = 0.5, smoothing = 0.5, streamline = 0.5, simulatePressure = true } = options

  const inputPoints = points.map((point, i) => {
    const pressure = simulatePressure ? Math.min(1, 1 - Math.abs(i - points.length / 2) / (points.length / 2)) : 0.5
    return [point[0], point[1], pressure]
  })

  const strokePoints: number[][] = []

  for (let i = 0; i < inputPoints.length; i++) {
    const [x, y, pressure] = inputPoints[i]
    const currentSize = size * (1 - thinning * (1 - pressure))

    if (i === 0) {
      strokePoints.push([x - currentSize / 2, y - currentSize / 2])
      strokePoints.push([x + currentSize / 2, y - currentSize / 2])
    } else {
      const prevPoint = inputPoints[i - 1]
      const angle = Math.atan2(y - prevPoint[1], x - prevPoint[0])
      const perpAngle = angle + Math.PI / 2

      strokePoints.push([x + (Math.cos(perpAngle) * currentSize) / 2, y + (Math.sin(perpAngle) * currentSize) / 2])
    }
  }

  for (let i = inputPoints.length - 1; i >= 0; i--) {
    const [x, y, pressure] = inputPoints[i]
    const currentSize = size * (1 - thinning * (1 - pressure))
    const angle = i > 0 ? Math.atan2(y - inputPoints[i - 1][1], x - inputPoints[i - 1][0]) : 0
    const perpAngle = angle - Math.PI / 2

    strokePoints.push([x + (Math.cos(perpAngle) * currentSize) / 2, y + (Math.sin(perpAngle) * currentSize) / 2])
  }

  return strokePoints
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
  const [lastPanPoint, setLastPanPoint] = useState<{ x: number; y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [currentPath, setCurrentPath] = useState<number[][]>([])
  const [currentShape, setCurrentShape] = useState<CanvasShape | null>(null)
  const [editingText, setEditingText] = useState<{
    id: string
    x: number
    y: number
    text: string
    fontSize: number
  } | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogConfig, setDialogConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
    onCancel?: () => void
  } | null>(null)

  const { resolvedTheme } = useTheme()

  const {
    tool,
    paths,
    shapes,
    selectedIds,
    stagePos,
    stageScale,
    strokeColor,
    strokeWidth,
    fillColor,
    opacity,
    collaborationMode,
    showGrid,
    addPath,
    addShape,
    updateShape,
    deleteSelected,
    setSelectedIds,
    clearSelection,
    setStagePos,
    setStageScale,
    clearCanvas,
  } = useCanvasStore()

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Get canvas coordinates
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      return {
        x: (clientX - rect.left - stagePos.x) / stageScale,
        y: (clientY - rect.top - stagePos.y) / stageScale,
      }
    },
    [stagePos, stageScale],
  )

  // Find shape at position
  const findShapeAtPosition = useCallback(
    (x: number, y: number): CanvasShape | null => {
      // Check shapes in reverse order (top to bottom)
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        if (x >= shape.x && x <= shape.x + (shape.width || 0) && y >= shape.y && y <= shape.y + (shape.height || 0)) {
          return shape
        }
      }
      return null
    },
    [shapes],
  )

  // Get resize handle at position
  const getResizeHandle = useCallback(
    (x: number, y: number, shape: CanvasShape): string | null => {
      const handleSize = 8 / stageScale
      const handles = [
        { name: "nw", x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 },
        { name: "ne", x: shape.x + (shape.width || 0) - handleSize / 2, y: shape.y - handleSize / 2 },
        { name: "sw", x: shape.x - handleSize / 2, y: shape.y + (shape.height || 0) - handleSize / 2 },
        {
          name: "se",
          x: shape.x + (shape.width || 0) - handleSize / 2,
          y: shape.y + (shape.height || 0) - handleSize / 2,
        },
        { name: "n", x: shape.x + (shape.width || 0) / 2 - handleSize / 2, y: shape.y - handleSize / 2 },
        {
          name: "s",
          x: shape.x + (shape.width || 0) / 2 - handleSize / 2,
          y: shape.y + (shape.height || 0) - handleSize / 2,
        },
        { name: "w", x: shape.x - handleSize / 2, y: shape.y + (shape.height || 0) / 2 - handleSize / 2 },
        {
          name: "e",
          x: shape.x + (shape.width || 0) - handleSize / 2,
          y: shape.y + (shape.height || 0) / 2 - handleSize / 2,
        },
      ]

      for (const handle of handles) {
        if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
          return handle.name
        }
      }
      return null
    },
    [stageScale],
  )

  // Custom confirmation dialog
  const showConfirmation = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setDialogConfig({ title, message, onConfirm, onCancel })
    setShowDialog(true)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e.clientX, e.clientY)

    // Check if double-clicking on existing text to edit it
    const clickedShape = findShapeAtPosition(pos.x, pos.y)
    if (clickedShape && clickedShape.type === "text") {
      startTextEditing(clickedShape)
      return
    }

    // Create new text at double-click position
    startTextCreation(pos)
  }

  const startTextCreation = (pos: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = pos.x * stageScale + stagePos.x + rect.left
    const screenY = pos.y * stageScale + stagePos.y + rect.top

    setEditingText({
      id: Date.now().toString(),
      x: screenX,
      y: screenY,
      text: "",
      fontSize: 16,
    })

    // Focus the input after a short delay
    setTimeout(() => {
      textInputRef.current?.focus()
    }, 10)
  }

  const startTextEditing = (shape: CanvasShape) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const screenX = shape.x * stageScale + stagePos.x + rect.left
    const screenY = shape.y * stageScale + stagePos.y + rect.top

    setEditingText({
      id: shape.id,
      x: screenX,
      y: screenY,
      text: shape.text || "",
      fontSize: shape.fontSize || 16,
    })

    setTimeout(() => {
      textInputRef.current?.focus()
      textInputRef.current?.select()
    }, 10)
  }

  const completeTextEditing = () => {
    if (!editingText) return

    if (editingText.text.trim()) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const canvasX = (editingText.x - rect.left - stagePos.x) / stageScale
      const canvasY = (editingText.y - rect.top - stagePos.y) / stageScale

      // Check if editing existing text or creating new
      const existingShape = shapes.find((s) => s.id === editingText.id)

      if (existingShape) {
        // Update existing text
        updateShape(editingText.id, {
          text: editingText.text,
        })
      } else {
        // Create new text
        const textShape: CanvasShape = {
          id: editingText.id,
          type: "text",
          x: canvasX,
          y: canvasY,
          text: editingText.text,
          stroke: strokeColor,
          strokeWidth: 0,
          fill: strokeColor,
          opacity,
          fontSize: editingText.fontSize,
          width: editingText.text.length * 8, // Approximate width
          height: editingText.fontSize,
        }
        addShape(textShape)
      }
    }

    setEditingText(null)
  }

  // Draw everything on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context
    ctx.save()

    // Apply transformations
    ctx.translate(stagePos.x, stagePos.y)
    ctx.scale(stageScale, stageScale)

    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx)
    }

    // Draw paths with realistic strokes
    paths.forEach((path) => drawRealisticPath(ctx, path))

    // Draw shapes
    shapes.forEach((shape) => drawShape(ctx, shape))

    // Draw current path with realistic stroke
    if (isDrawing && tool === "pen" && currentPath.length > 0) {
      drawCurrentRealisticPath(ctx)
    }

    // Draw current shape
    if (currentShape) {
      drawShape(ctx, currentShape)
    }

    // Restore context
    ctx.restore()
  }, [
    paths,
    shapes,
    currentPath,
    currentShape,
    isDrawing,
    tool,
    stagePos,
    stageScale,
    strokeColor,
    strokeWidth,
    opacity,
    selectedIds,
    showGrid,
    resolvedTheme,
  ])

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const gridSize = 20
    const isDark = resolvedTheme === "dark"

    // More visible grid colors
    ctx.strokeStyle = isDark ? "#374151" : "#d1d5db"
    ctx.lineWidth = 0.5
    ctx.globalAlpha = isDark ? 0.4 : 0.6

    const startX = Math.floor(-stagePos.x / stageScale / gridSize) * gridSize
    const startY = Math.floor(-stagePos.y / stageScale / gridSize) * gridSize
    const endX = startX + dimensions.width / stageScale + gridSize
    const endY = startY + dimensions.height / stageScale + gridSize

    ctx.beginPath()
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const drawRealisticPath = (ctx: CanvasRenderingContext2D, path: CanvasPath) => {
    if (path.points.length < 4) return

    const points: number[][] = []
    for (let i = 0; i < path.points.length; i += 2) {
      points.push([path.points[i], path.points[i + 1]])
    }

    if (points.length < 2) return

    const strokeOutline = getStroke(points, {
      size: path.strokeWidth * 2,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })

    if (strokeOutline.length === 0) return

    ctx.fillStyle = path.stroke
    ctx.globalAlpha = path.opacity || 1

    ctx.beginPath()
    ctx.moveTo(strokeOutline[0][0], strokeOutline[0][1])

    for (let i = 1; i < strokeOutline.length; i++) {
      ctx.lineTo(strokeOutline[i][0], strokeOutline[i][1])
    }

    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  const drawCurrentRealisticPath = (ctx: CanvasRenderingContext2D) => {
    if (currentPath.length < 2) return

    const strokeOutline = getStroke(currentPath, {
      size: strokeWidth * 2,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.5,
    })

    if (strokeOutline.length === 0) return

    ctx.fillStyle = strokeColor
    ctx.globalAlpha = opacity

    ctx.beginPath()
    ctx.moveTo(strokeOutline[0][0], strokeOutline[0][1])

    for (let i = 1; i < strokeOutline.length; i++) {
      ctx.lineTo(strokeOutline[i][0], strokeOutline[i][1])
    }

    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Draw shape
  const drawShape = (ctx: CanvasRenderingContext2D, shape: CanvasShape) => {
    ctx.strokeStyle = shape.stroke
    ctx.lineWidth = shape.strokeWidth
    ctx.fillStyle = shape.fill || "transparent"
    ctx.globalAlpha = shape.opacity || 1

    const isSelected = selectedIds.includes(shape.id)

    switch (shape.type) {
      case "rectangle":
        ctx.beginPath()
        ctx.rect(shape.x, shape.y, shape.width || 0, shape.height || 0)
        if (shape.fill && shape.fill !== "transparent") ctx.fill()
        ctx.stroke()
        break

      case "circle":
        const centerX = shape.x + (shape.width || 0) / 2
        const centerY = shape.y + (shape.height || 0) / 2
        const radius = Math.abs((shape.width || 0) + (shape.height || 0)) / 4
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        if (shape.fill && shape.fill !== "transparent") ctx.fill()
        ctx.stroke()
        break

      case "arrow":
        if (shape.points && shape.points.length >= 4) {
          const [x1, y1, x2, y2] = shape.points
          drawArrow(ctx, x1, y1, x2, y2)
        }
        break

      case "text":
        ctx.font = `${shape.fontSize || 16}px Arial`
        ctx.fillStyle = shape.fill || shape.stroke
        ctx.fillText(shape.text || "", shape.x, shape.y + (shape.fontSize || 16))
        break
    }

    if (isSelected) {
      ctx.strokeStyle = "#007acc"
      ctx.lineWidth = 2 / stageScale
      ctx.setLineDash([5 / stageScale, 5 / stageScale])
      ctx.strokeRect(
        shape.x - 5 / stageScale,
        shape.y - 5 / stageScale,
        (shape.width || 0) + 10 / stageScale,
        (shape.height || 0) + 10 / stageScale,
      )
      ctx.setLineDash([])

      // Draw resize handles
      const handleSize = 8 / stageScale
      const handles = [
        { x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 }, // nw
        { x: shape.x + (shape.width || 0) - handleSize / 2, y: shape.y - handleSize / 2 }, // ne
        { x: shape.x - handleSize / 2, y: shape.y + (shape.height || 0) - handleSize / 2 }, // sw
        { x: shape.x + (shape.width || 0) - handleSize / 2, y: shape.y + (shape.height || 0) - handleSize / 2 }, // se
        { x: shape.x + (shape.width || 0) / 2 - handleSize / 2, y: shape.y - handleSize / 2 }, // n
        { x: shape.x + (shape.width || 0) / 2 - handleSize / 2, y: shape.y + (shape.height || 0) - handleSize / 2 }, // s
        { x: shape.x - handleSize / 2, y: shape.y + (shape.height || 0) / 2 - handleSize / 2 }, // w
        { x: shape.x + (shape.width || 0) - handleSize / 2, y: shape.y + (shape.height || 0) / 2 - handleSize / 2 }, // e
      ]

      ctx.fillStyle = "#007acc"
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1 / stageScale

      handles.forEach((handle) => {
        ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
        ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
      })
    }

    ctx.globalAlpha = 1
  }

  // Draw arrow
  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headLength = 10
    const angle = Math.atan2(y2 - y1, x2 - x1)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6))
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6))
    ctx.stroke()
  }

  // Redraw when dependencies change
  useEffect(() => {
    draw()
  }, [draw])

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasCoordinates(e.clientX, e.clientY)

    if (tool === "hand") {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (tool === "select") {
      // Check for resize handles first
      for (const id of selectedIds) {
        const shape = shapes.find((s) => s.id === id)
        if (shape) {
          const handle = getResizeHandle(pos.x, pos.y, shape)
          if (handle) {
            setIsResizing(true)
            setResizeHandle(handle)
            setStartPos(pos)
            return
          }
        }
      }

      const clickedShape = findShapeAtPosition(pos.x, pos.y)

      if (clickedShape) {
        if (!selectedIds.includes(clickedShape.id)) {
          if (e.shiftKey) {
            setSelectedIds([...selectedIds, clickedShape.id])
          } else {
            setSelectedIds([clickedShape.id])
          }
        }

        // Start dragging
        setIsDragging(true)
        setStartPos(pos)
        setDragOffset({
          x: pos.x - clickedShape.x,
          y: pos.y - clickedShape.y,
        })
      } else {
        // Clear selection if clicking empty space
        if (!e.shiftKey) {
          clearSelection()
        }
      }
      return
    }

    // Enhanced drawing tool logic
    if (tool === "pen") {
      setIsDrawing(true)
      setCurrentPath([[pos.x, pos.y]])
    } else if (tool === "text") {
      startTextCreation(pos)
    } else if (["rectangle", "circle", "arrow", "line"].includes(tool)) {
      setIsDrawing(true)
      setStartPos(pos)
      setCurrentShape({
        id: Date.now().toString(),
        type: tool as "rectangle" | "circle" | "arrow" | "line",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor,
        strokeWidth,
        fill: tool === "rectangle" || tool === "circle" ? fillColor : undefined,
        opacity,
        points: tool === "arrow" || tool === "line" ? [pos.x, pos.y, pos.x, pos.y] : undefined,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && lastPanPoint) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y

      setStagePos({
        x: stagePos.x + deltaX,
        y: stagePos.y + deltaY,
      })

      setLastPanPoint({ x: e.clientX, y: e.clientY })
      return
    }

    if (isResizing && resizeHandle && selectedIds.length === 1 && startPos) {
      const pos = getCanvasCoordinates(e.clientX, e.clientY)
      const shape = shapes.find((s) => s.id === selectedIds[0])
      if (shape) {
        const deltaX = pos.x - startPos.x
        const deltaY = pos.y - startPos.y

        const newShape = { ...shape }

        switch (resizeHandle) {
          case "se":
            newShape.width = (shape.width || 0) + deltaX
            newShape.height = (shape.height || 0) + deltaY
            break
          case "sw":
            newShape.x = shape.x + deltaX
            newShape.width = (shape.width || 0) - deltaX
            newShape.height = (shape.height || 0) + deltaY
            break
          case "ne":
            newShape.y = shape.y + deltaY
            newShape.width = (shape.width || 0) + deltaX
            newShape.height = (shape.height || 0) - deltaY
            break
          case "nw":
            newShape.x = shape.x + deltaX
            newShape.y = shape.y + deltaY
            newShape.width = (shape.width || 0) - deltaX
            newShape.height = (shape.height || 0) - deltaY
            break
          case "n":
            newShape.y = shape.y + deltaY
            newShape.height = (shape.height || 0) - deltaY
            break
          case "s":
            newShape.height = (shape.height || 0) + deltaY
            break
          case "w":
            newShape.x = shape.x + deltaX
            newShape.width = (shape.width || 0) - deltaX
            break
          case "e":
            newShape.width = (shape.width || 0) + deltaX
            break
        }

        updateShape(selectedIds[0], newShape)
        setStartPos(pos)
      }
      return
    }

    if (isDragging && selectedIds.length > 0 && startPos) {
      const pos = getCanvasCoordinates(e.clientX, e.clientY)
      const deltaX = pos.x - startPos.x
      const deltaY = pos.y - startPos.y

      // Move all selected shapes
      selectedIds.forEach((id) => {
        const shape = shapes.find((s) => s.id === id)
        if (shape) {
          updateShape(id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY,
          })
        }
      })

      setStartPos(pos)
      return
    }

    if (!isDrawing) return

    const pos = getCanvasCoordinates(e.clientX, e.clientY)

    if (tool === "pen") {
      setCurrentPath((prev) => [...prev, [pos.x, pos.y]])
    } else if (currentShape && startPos) {
      const updatedShape = { ...currentShape }

      if (tool === "rectangle" || tool === "circle") {
        updatedShape.width = pos.x - startPos.x
        updatedShape.height = pos.y - startPos.y
      } else if (tool === "arrow" || tool === "line") {
        updatedShape.points = [startPos.x, startPos.y, pos.x, pos.y]
      }

      setCurrentShape(updatedShape)
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
    setLastPanPoint(null)

    if (!isDrawing) return

    setIsDrawing(false)

    if (tool === "pen" && currentPath.length > 0) {
      const flatPoints: number[] = []
      currentPath.forEach(([x, y]) => {
        flatPoints.push(x, y)
      })

      addPath({
        id: Date.now().toString(),
        points: flatPoints,
        stroke: strokeColor,
        strokeWidth,
        opacity,
      })
      setCurrentPath([])
    } else if (currentShape) {
      const hasSize =
        currentShape.width !== 0 ||
        currentShape.height !== 0 ||
        (currentShape.points &&
          currentShape.points.length === 4 &&
          (currentShape.points[0] !== currentShape.points[2] || currentShape.points[1] !== currentShape.points[3]))

      if (hasSize) {
        addShape(currentShape)
      }
      setCurrentShape(null)
    }

    setStartPos(null)
  }

  // Handle wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const direction = e.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.1, Math.min(5, stageScale + direction * 0.1))

    const mousePointTo = {
      x: (mouseX - stagePos.x) / stageScale,
      y: (mouseY - stagePos.y) / stageScale,
    }

    setStageScale(newScale)
    setStagePos({
      x: mouseX - mousePointTo.x * newScale,
      y: mouseY - mousePointTo.y * newScale,
    })
  }

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        showConfirmation(
          "Delete Objects",
          `Are you sure you want to delete ${selectedIds.length} object${selectedIds.length > 1 ? "s" : ""}?`,
          () => {
            deleteSelected()
          },
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIds, deleteSelected])

  const getCursorStyle = () => {
    if (isResizing) {
      switch (resizeHandle) {
        case "nw":
        case "se":
          return "nw-resize"
        case "ne":
        case "sw":
          return "ne-resize"
        case "n":
        case "s":
          return "ns-resize"
        case "w":
        case "e":
          return "ew-resize"
        default:
          return "default"
      }
    }

    switch (tool) {
      case "hand":
        return isPanning ? "grabbing" : "grab"
      case "select":
        return "default"
      case "pen":
        return "crosshair"
      case "text":
        return "text"
      default:
        return "crosshair"
    }
  }

  return (
    <div className="relative h-full w-full">
      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts />

      {/* Export/Import buttons at top left */}
      <div className="absolute top-4 left-4 z-10">
        <ExportImport />
      </div>

      {/* Collaboration Panel - Fixed positioning */}
      <div className="absolute top-4 right-4 z-10">
        <CollaborationPanel />
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <DrawingToolbar />
      </div>

      {/* Properties Panel */}
      <PropertiesPanel />

      {/* Canvas Operations */}
      <CanvasOperations
        onClearCanvas={() => {
          showConfirmation(
            "Clear Canvas",
            "Are you sure you want to clear the entire canvas? This action cannot be undone.",
            () => {
              clearCanvas()
            },
          )
        }}
      />

      {/* Shortcuts Help */}
      <ShortcutsHelp />

      {/* Selection Info */}
      {selectedIds.length > 0 && (
        <div className="absolute top-20 left-4 bg-card border border-border rounded-lg p-2 shadow-lg text-sm">
          {selectedIds.length} object{selectedIds.length > 1 ? "s" : ""} selected
          {selectedIds.length === 1 && " • Drag to move • Use handles to resize"}
        </div>
      )}

      {/* Collaboration Status */}
      {collaborationMode && (
        <div className="absolute top-32 right-4 bg-green-500/10 border border-green-500/50 text-green-700 dark:text-green-400 rounded-lg p-2 shadow-lg text-sm">
          🟢 Collaboration Active
        </div>
      )}

      {/* Creator Attribution */}
      <CreatorAttribution />

      {/* Custom Dialog */}
      {showDialog && dialogConfig && (
        <CustomDialog
          title={dialogConfig.title}
          message={dialogConfig.message}
          onConfirm={() => {
            dialogConfig.onConfirm()
            setShowDialog(false)
            setDialogConfig(null)
          }}
          onCancel={() => {
            dialogConfig.onCancel?.()
            setShowDialog(false)
            setDialogConfig(null)
          }}
        />
      )}

      {editingText && (
        <input
          ref={textInputRef}
          type="text"
          value={editingText.text}
          onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              completeTextEditing()
            } else if (e.key === "Escape") {
              setEditingText(null)
            }
          }}
          onBlur={completeTextEditing}
          className="absolute z-30 bg-transparent border-2 border-blue-500 outline-none text-foreground"
          style={{
            left: editingText.x,
            top: editingText.y - editingText.fontSize,
            fontSize: editingText.fontSize,
            fontFamily: "Arial",
            minWidth: "100px",
          }}
        />
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className={`cursor-${getCursorStyle()}`}
        style={{ display: "block" }}
      />
    </div>
  )
}
