"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { useCanvasStore } from "@/lib/store"

export function StrokeWidthPicker() {
  const { strokeWidth, setStrokeWidth } = useCanvasStore()
  const [isOpen, setIsOpen] = useState(false)

  const PRESET_WIDTHS = [1, 2, 4, 8, 12]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 gap-1 bg-transparent">
          <div className="flex items-center gap-1">
            <div
              className="bg-foreground rounded-full"
              style={{
                width: Math.min(strokeWidth * 2 + 2, 12),
                height: Math.min(strokeWidth * 2 + 2, 12),
              }}
            />
            <span className="text-xs">{strokeWidth}px</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="space-y-3">
          <div className="text-sm font-medium">Stroke Width</div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => setStrokeWidth(value[0])}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Preset Widths */}
          <div className="flex gap-1">
            {PRESET_WIDTHS.map((width) => (
              <Button
                key={width}
                variant={strokeWidth === width ? "default" : "outline"}
                size="sm"
                onClick={() => setStrokeWidth(width)}
                className="flex-1 h-8 p-0"
              >
                <div
                  className="bg-current rounded-full"
                  style={{
                    width: Math.min(width * 2 + 2, 12),
                    height: Math.min(width * 2 + 2, 12),
                  }}
                />
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
