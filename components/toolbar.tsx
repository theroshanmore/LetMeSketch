"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCanvasStore } from "@/lib/store"
import { Pencil, Square, Circle, ArrowRight, Type, Hand, MousePointer, Minus, Sun, Moon } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { StrokeWidthPicker } from "./stroke-width-picker"
import { useTheme } from "next-themes"

export function Toolbar() {
  const { tool, setTool, strokeColor, strokeWidth } = useCanvasStore()
  const { theme, setTheme } = useTheme()

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "hand", icon: Hand, label: "Hand" },
    { id: "pen", icon: Pencil, label: "Pen" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "text", icon: Type, label: "Text" },
  ] as const

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2 shadow-lg">
      {/* Tools */}
      <div className="flex items-center gap-1">
        {tools.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant={tool === id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTool(id)}
            className="h-8 w-8 p-0"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Controls */}
      <div className="flex items-center gap-2">
        <ColorPicker />
        <StrokeWidthPicker />
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-8 w-8 p-0"
        title="Toggle theme"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
