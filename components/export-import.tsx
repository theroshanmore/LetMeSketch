"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCanvasStore } from "@/lib/store"
import { Download, Upload, Save, FolderOpen, Trash2 } from "lucide-react"

interface ExportImportProps {
  stageRef: React.RefObject<any>
}

export function ExportImport({ stageRef }: ExportImportProps) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isLoadOpen, setIsLoadOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    exportToJSON,
    importFromJSON,
    saveToLocalStorage,
    loadFromLocalStorage,
    getSavedDrawings,
    deleteSavedDrawing,
  } = useCanvasStore()

  // Export to PNG
  const exportToPNG = () => {
    const stage = stageRef.current
    if (!stage) return

    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality: 1,
      pixelRatio: 2, // Higher resolution
    })

    const link = document.createElement("a")
    link.download = `excalidraw-${Date.now()}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to SVG
  const exportToSVG = () => {
    const { paths, shapes } = useCanvasStore.getState()

    // Calculate bounds
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    paths.forEach((path) => {
      for (let i = 0; i < path.points.length; i += 2) {
        minX = Math.min(minX, path.points[i])
        maxX = Math.max(maxX, path.points[i])
        minY = Math.min(minY, path.points[i + 1])
        maxY = Math.max(maxY, path.points[i + 1])
      }
    })

    shapes.forEach((shape) => {
      minX = Math.min(minX, shape.x)
      maxX = Math.max(maxX, shape.x + (shape.width || 0))
      minY = Math.min(minY, shape.y)
      maxY = Math.max(maxY, shape.y + (shape.height || 0))
    })

    const padding = 20
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2

    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
    svgContent += `<rect width="100%" height="100%" fill="white"/>`

    // Add paths
    paths.forEach((path) => {
      const points = path.points
        .map((coord, i) => (i % 2 === 0 ? coord - minX + padding : coord - minY + padding))
        .join(" ")

      svgContent += `<polyline points="${points}" stroke="${path.stroke}" strokeWidth="${path.strokeWidth}" fill="none" opacity="${path.opacity || 1}"/>`
    })

    // Add shapes
    shapes.forEach((shape) => {
      const x = shape.x - minX + padding
      const y = shape.y - minY + padding

      switch (shape.type) {
        case "rectangle":
          svgContent += `<rect x="${x}" y="${y}" width="${shape.width || 0}" height="${shape.height || 0}" stroke="${shape.stroke}" strokeWidth="${shape.strokeWidth}" fill="${shape.fill || "none"}" opacity="${shape.opacity || 1}"/>`
          break
        case "circle":
          const radius = Math.abs((shape.width || 0) + (shape.height || 0)) / 4
          const cx = x + (shape.width || 0) / 2
          const cy = y + (shape.height || 0) / 2
          svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${shape.stroke}" strokeWidth="${shape.strokeWidth}" fill="${shape.fill || "none"}" opacity="${shape.opacity || 1}"/>`
          break
        case "text":
          svgContent += `<text x="${x}" y="${y + (shape.fontSize || 16)}" fontSize="${shape.fontSize || 16}" fill="${shape.fill || shape.stroke}" opacity="${shape.opacity || 1}">${shape.text || ""}</text>`
          break
        case "arrow":
          if (shape.points && shape.points.length >= 4) {
            const [x1, y1, x2, y2] = shape.points.map((coord, i) =>
              i % 2 === 0 ? coord - minX + padding : coord - minY + padding,
            )
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${shape.stroke}" strokeWidth="${shape.strokeWidth}" opacity="${shape.opacity || 1}" markerEnd="url(#arrowhead)"/>`
          }
          break
      }
    })

    // Add arrow marker definition
    svgContent += `<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="black"/></marker></defs>`
    svgContent += "</svg>"

    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `excalidraw-${Date.now()}.svg`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export to JSON
  const exportToJSONFile = () => {
    const jsonData = exportToJSON()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = `excalidraw-${Date.now()}.json`
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Import from file
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (importFromJSON(content)) {
        alert("Drawing imported successfully!")
      } else {
        alert("Failed to import drawing. Please check the file format.")
      }
    }
    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Save to localStorage
  const handleSave = () => {
    if (!saveName.trim()) return

    saveToLocalStorage(saveName.trim())
    setSaveName("")
    setIsSaveOpen(false)
    alert("Drawing saved successfully!")
  }

  // Load from localStorage
  const handleLoad = (name: string) => {
    if (loadFromLocalStorage(name)) {
      setIsLoadOpen(false)
      alert("Drawing loaded successfully!")
    } else {
      alert("Failed to load drawing.")
    }
  }

  // Delete saved drawing
  const handleDelete = (name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteSavedDrawing(name)
    }
  }

  const savedDrawings = getSavedDrawings()

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="flex gap-2">
        {/* Export Dialog */}
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Export Drawing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button onClick={exportToPNG} className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Export as PNG
              </Button>
              <Button onClick={exportToSVG} className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Export as SVG
              </Button>
              <Button onClick={exportToJSONFile} className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Button */}
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />

        {/* Save Dialog */}
        <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Save Drawing</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Enter drawing name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <Button onClick={handleSave} disabled={!saveName.trim()} className="w-full">
                Save Drawing
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Dialog */}
        <Dialog open={isLoadOpen} onOpenChange={setIsLoadOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <FolderOpen className="h-4 w-4" />
              Load
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Load Drawing</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedDrawings.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No saved drawings found</p>
              ) : (
                savedDrawings.map((name) => (
                  <div key={name} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate flex-1">{name}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleLoad(name)} className="h-7 px-2">
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(name)}
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
