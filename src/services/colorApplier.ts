import type { ApplyTarget } from '../types/palette'
import type { SlideElement } from '../types/slide'
import { isValidHex, normalizeHex } from '../utils/colorUtils'

interface ApplyColorParams {
  elements: SlideElement[]
  selectedElementId: string | null
  target: ApplyTarget
  hex: string
}

interface ApplyColorResult {
  elements: SlideElement[]
  applied: boolean
  message?: string
}

export function applyColor({
  elements,
  selectedElementId,
  target,
  hex,
}: ApplyColorParams): ApplyColorResult {
  if (!selectedElementId) {
    return {
      elements,
      applied: false,
      message: '対象を選択してから色を適用してください。',
    }
  }

  const normalizedHex = normalizeHex(hex)
  if (!isValidHex(normalizedHex)) {
    return {
      elements,
      applied: false,
      message: 'HEXカラー形式が不正です。',
    }
  }

  // モックでは状態更新で CSS に反映。将来はこの境界で Office.js / VSTO 連携に差し替える。
  const nextElements = elements.map((element) => {
    if (element.id !== selectedElementId) {
      return element
    }

    if (target === 'text') {
      return {
        ...element,
        style: {
          ...element.style,
          textColor: normalizedHex,
        },
      }
    }

    if (target === 'fill') {
      return {
        ...element,
        style: {
          ...element.style,
          fillColor: normalizedHex,
        },
      }
    }

    return {
      ...element,
      style: {
        ...element.style,
        strokeColor: normalizedHex,
      },
    }
  })

  return {
    elements: nextElements,
    applied: true,
  }
}
