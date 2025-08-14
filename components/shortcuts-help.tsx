"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const shortcuts = [
    {
      category: "Tools",
      items: [
        { key: "V or 1", action: "Select tool" },
        { key: "H or 2", action: "Hand tool" },
        { key: "P or 3", action: "Pen tool" },
        { key: "L or 4", action: "Line tool" },
        { key: "R or 5", action: "Rectangle tool" },
        { key: "C or 6", action: "Circle tool" },
        { key: "A or 7", action: "Arrow tool" },
        { key: "T or 8", action: "Text tool" },
      ],
    },
    {
      category: "Canvas",
      items: [
        { key: "Ctrl + Z", action: "Undo" },
        { key: "Ctrl + Y", action: "Redo" },
        { key: "Ctrl + 0", action: "Reset zoom" },
        { key: "Ctrl + 1", action: "Fit to screen" },
        { key: "+ or =", action: "Zoom in" },
        { key: "-", action: "Zoom out" },
        { key: "Ctrl + Shift + Del", action: "Clear canvas" },
      ],
    },
    {
      category: "Selection",
      items: [
        { key: "Delete", action: "Delete selected" },
        { key: "Escape", action: "Clear selection" },
        { key: "Shift + Click", action: "Multi-select" },
      ],
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="absolute bottom-4 right-4 h-8 w-8 p-0" title="Keyboard Shortcuts">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-medium text-sm mb-2">{section.category}</h3>
              <div className="space-y-1">
                {section.items.map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{shortcut.action}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">{shortcut.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
