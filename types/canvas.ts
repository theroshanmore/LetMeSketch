export type Tool = "select" | "hand" | "pen" | "line" | "rectangle" | "circle" | "arrow" | "text"

export interface CanvasPath {
  id: string
  points: number[]
  stroke: string
  strokeWidth: number
  fill?: string
  opacity?: number
}

export interface CanvasShape {
  id: string
  type: "rectangle" | "circle" | "arrow" | "text" | "line"
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  fontSize?: number
  points?: number[]
  stroke: string
  strokeWidth: number
  fill?: string
  opacity?: number
  rotation?: number
}

export interface CanvasObject {
  id: string
  type: "path" | "shape"
  data: CanvasPath | CanvasShape
  selected?: boolean
  zIndex: number
}
