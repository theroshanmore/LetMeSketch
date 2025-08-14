"use client"

import { MousePointer2, Hand, Pen, Square, Circle, ArrowRight, Type, Minus, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCanvasStore } from "@/lib/canvas-store"
import { ColorPicker } from "./color-picker"
import { StrokeWidthPicker } from "./stroke-width-picker"
import { ThemeToggle } from "./theme-toggle"

const tools = [
  { id: "select", icon: MousePointer2, label: "Select (V)" },
  { id: "hand", icon: Hand, label: "Hand (H)" },
  { id: "pen", icon: Pen, label: "Pen (P)" },
  { id: "rectangle", icon: Square, label: "Rectangle (R)" },
  { id: "circle", icon: Circle, label: "Circle (C)" },
  { id: "arrow", icon: ArrowRight, label: "Arrow (A)" },
  { id: "line", icon: Minus, label: "Line (L)" },
  { id: "text", icon: Type, label: "Text (T)" },
] as const

export function DrawingToolbar() {
  const { tool, setTool, showGrid, setShowGrid } = useCanvasStore()

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-2 shadow-lg">
      {tools.map((toolItem) => (
        <Button
          key={toolItem.id}
          variant={tool === toolItem.id ? "default" : "ghost"}
          size="sm"
          onClick={() => setTool(toolItem.id)}
          title={toolItem.label}
          className="h-8 w-8 p-0"
        >
          <toolItem.icon className="h-4 w-4" />
        </Button>
      ))}

      <div className="w-px h-6 bg-border mx-1" />

      <ColorPicker />
      <StrokeWidthPicker />

      <div className="w-px h-6 bg-border mx-1" />

      {/* Grid Toggle Button */}
      <Button
        variant={showGrid ? "default" : "ghost"}
        size="sm"
        onClick={() => setShowGrid(!showGrid)}
        title="Toggle Grid (Ctrl+')"
        className="h-8 w-8 p-0"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1" />
      <ThemeToggle />
    </div>
  )
}
