export type ApplyTarget = 'text' | 'fill' | 'stroke'

export interface ColorItem {
  id: string
  name: string
  hex: string
}

export interface PaletteGroup {
  id: string
  name: string
  colors: ColorItem[]
}

export interface Palette {
  version: 1
  groups: PaletteGroup[]
  updatedAt: string
}
