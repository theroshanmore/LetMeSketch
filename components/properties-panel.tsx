"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useCanvasStore } from "@/lib/store"
import { X, Trash2, Copy } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { StrokeWidthPicker } from "./stroke-width-picker"

export function PropertiesPanel() {
  const { selectedIds, shapes, opacity, setOpacity, clearSelection, deleteSelected, updateShape } = useCanvasStore()

  if (selectedIds.length === 0) return null

  const selectedShapes = shapes.filter((shape) => selectedIds.includes(shape.id))
  const isMultiSelect = selectedIds.length > 1

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0] / 100
    setOpacity(newOpacity)

    // Update selected shapes
    selectedIds.forEach((id) => {
      updateShape(id, { opacity: newOpacity })
    })
  }

  const duplicateSelected = () => {
    selectedShapes.forEach((shape) => {
      const newShape = {
        ...shape,
        id: Date.now().toString() + Math.random(),
        x: shape.x + 20,
        y: shape.y + 20,
      }
      // This would need to be implemented in the store
      // addShape(newShape)
    })
  }

  return (
    <div className="absolute top-20 right-4 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">
          {isMultiSelect ? `${selectedIds.length} objects` : selectedShapes[0]?.type || "Object"}
        </h3>
        <Button variant="ghost" size="sm" onClick={clearSelection} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-1 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={duplicateSelected}
          className="flex-1 h-8 text-xs gap-1 bg-transparent"
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deleteSelected}
          className="flex-1 h-8 text-xs gap-1 bg-transparent"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>

      {/* Style Controls */}
      <div className="space-y-4">
        {/* Colors */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Colors</label>
          <div className="flex gap-2">
            <ColorPicker />
            <StrokeWidthPicker />
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Opacity: {Math.round(opacity * 100)}%
          </label>
          <Slider
            value={[opacity * 100]}
            onValueChange={handleOpacityChange}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Position (for single selection) */}
        {!isMultiSelect && selectedShapes[0] && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Position</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">X</label>
                <input
                  type="number"
                  value={Math.round(selectedShapes[0].x)}
                  onChange={(e) => updateShape(selectedShapes[0].id, { x: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedShapes[0].y)}
                  onChange={(e) => updateShape(selectedShapes[0].id, { y: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Size (for single selection with width/height) */}
        {!isMultiSelect && selectedShapes[0] && selectedShapes[0].width !== undefined && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Size</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">W</label>
                <input
                  type="number"
                  value={Math.round(selectedShapes[0].width || 0)}
                  onChange={(e) => updateShape(selectedShapes[0].id, { width: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">H</label>
                <input
                  type="number"
                  value={Math.round(selectedShapes[0].height || 0)}
                  onChange={(e) => updateShape(selectedShapes[0].id, { height: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-xs border border-border rounded bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
