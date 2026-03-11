import { useEffect, useState } from 'react'
import { isValidHex, normalizeHex } from '../utils/colorUtils'

interface PaletteEditorModalProps {
  isOpen: boolean
  title: string
  initialName: string
  initialHex: string
  onClose: () => void
  onSave: (name: string, hex: string) => void
}

export function PaletteEditorModal({
  isOpen,
  title,
  initialName,
  initialHex,
  onClose,
  onSave,
}: PaletteEditorModalProps) {
  const [name, setName] = useState(initialName)
  const [hex, setHex] = useState(normalizeHex(initialHex))

  useEffect(() => {
    if (!isOpen) {
      return
    }
    setName(initialName)
    setHex(normalizeHex(initialHex))
  }, [initialHex, initialName, isOpen])

  if (!isOpen) {
    return null
  }

  const validHex = isValidHex(hex)

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h3>{title}</h3>
        <label className="field">
          <span>色名</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="色名"
          />
        </label>
        <label className="field">
          <span>カラーピッカー</span>
          <input
            type="color"
            value={validHex ? hex : '#000000'}
            onChange={(event) => setHex(normalizeHex(event.target.value))}
          />
        </label>
        <label className="field">
          <span>HEX (#RRGGBB)</span>
          <input
            type="text"
            value={hex}
            onChange={(event) => setHex(normalizeHex(event.target.value))}
          />
        </label>
        {!validHex && <p className="form-error">HEX形式は #RRGGBB で入力してください。</p>}
        <div className="modal-actions">
          <button type="button" className="secondary-btn" onClick={onClose}>
            キャンセル
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => onSave(name.trim() || hex, hex)}
            disabled={!validHex}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
