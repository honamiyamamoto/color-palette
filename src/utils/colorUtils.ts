import type { Palette } from '../types/palette'

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

export function normalizeHex(value: string): string {
  const trimmed = value.trim()
  if (!trimmed.startsWith('#')) {
    return `#${trimmed.toUpperCase()}`
  }
  return trimmed.toUpperCase()
}

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value.trim())
}

export function createId(prefix = 'id'): string {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function clonePalette(palette: Palette): Palette {
  return JSON.parse(JSON.stringify(palette)) as Palette
}
