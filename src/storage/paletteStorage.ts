import { createDefaultPalette } from '../data/defaultPalette'
import type { ColorItem, Palette, PaletteGroup } from '../types/palette'
import { createId, isValidHex, normalizeHex } from '../utils/colorUtils'

const STORAGE_KEY = 'color-palette.taskpane.palette.v1'

type ImportResult =
  | { ok: true; palette: Palette }
  | { ok: false; error: string }

export function loadPalette(): Palette {
  const fallback = createDefaultPalette()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      savePalette(fallback)
      return fallback
    }

    const parsed = JSON.parse(stored) as unknown
    const palette = coercePalette(parsed)
    if (!palette) {
      savePalette(fallback)
      return fallback
    }

    return palette
  } catch {
    return fallback
  }
}

export function savePalette(palette: Palette): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(palette))
}

export function exportPaletteJson(palette: Palette): string {
  return JSON.stringify(palette, null, 2)
}

export function importPaletteJson(input: string): ImportResult {
  if (!input.trim()) {
    return { ok: false, error: 'JSON文字列が空です。' }
  }

  try {
    const parsed = JSON.parse(input) as unknown
    const palette = coercePalette(parsed)

    if (!palette) {
      return {
        ok: false,
        error:
          'パレット形式が不正です。groups[]、group.name、color.hex(#RRGGBB) を確認してください。',
      }
    }

    return { ok: true, palette }
  } catch {
    return { ok: false, error: 'JSONの構文が不正です。' }
  }
}

function coercePalette(value: unknown): Palette | null {
  if (!isRecord(value)) {
    return null
  }

  const rawGroups = value.groups
  if (!Array.isArray(rawGroups) || rawGroups.length === 0) {
    return null
  }

  const groups: PaletteGroup[] = []
  for (const rawGroup of rawGroups) {
    const group = coerceGroup(rawGroup)
    if (!group) {
      return null
    }
    groups.push(group)
  }

  return {
    version: 1,
    groups,
    updatedAt: new Date().toISOString(),
  }
}

function coerceGroup(value: unknown): PaletteGroup | null {
  if (!isRecord(value)) {
    return null
  }

  const name =
    typeof value.name === 'string' && value.name.trim()
      ? value.name.trim()
      : 'Untitled Group'

  const rawColors = value.colors
  if (!Array.isArray(rawColors)) {
    return null
  }

  const colors: ColorItem[] = []
  for (const rawColor of rawColors) {
    const color = coerceColor(rawColor)
    if (!color) {
      return null
    }
    colors.push(color)
  }

  return {
    id: typeof value.id === 'string' && value.id ? value.id : createId('group'),
    name,
    colors,
  }
}

function coerceColor(value: unknown): ColorItem | null {
  if (!isRecord(value)) {
    return null
  }

  if (typeof value.hex !== 'string') {
    return null
  }

  const hex = normalizeHex(value.hex)
  if (!isValidHex(hex)) {
    return null
  }

  const name =
    typeof value.name === 'string' && value.name.trim() ? value.name.trim() : hex

  return {
    id: typeof value.id === 'string' && value.id ? value.id : createId('color'),
    name,
    hex,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
