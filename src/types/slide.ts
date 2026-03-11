export type SlideElementType = 'text' | 'rectangle' | 'circle' | 'arrow'

export interface SlideElementStyle {
  textColor: string
  fillColor: string
  strokeColor: string
}

export interface SlideElement {
  id: string
  type: SlideElementType
  label: string
  text?: string
  x: number
  y: number
  width: number
  height: number
  style: SlideElementStyle
}
