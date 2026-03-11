import { useEffect, useMemo, useState } from 'react'
import { exportPaletteJson, importPaletteJson } from '../storage/paletteStorage'
import type { ApplyTarget, Palette } from '../types/palette'
import { clonePalette, createId } from '../utils/colorUtils'
import { PaletteEditorModal } from './PaletteEditorModal'

interface SaveResult {
  ok: boolean
  message: string
}

interface TaskPaneProps {
  isOpen: boolean
  palette: Palette
  applyTarget: ApplyTarget
  onApplyTargetChange: (target: ApplyTarget) => void
  onApplyColor: (target: ApplyTarget, hex: string) => void
  onSavePalette: (palette: Palette) => SaveResult
}

interface EditingColorRef {
  groupId: string
  colorId: string
}

const APPLY_LABELS: Record<ApplyTarget, string> = {
  text: '文字',
  fill: '塗り',
  stroke: '枠線',
}

const APPLY_TARGETS: ApplyTarget[] = ['text', 'fill', 'stroke']

function moveItem<T>(items: T[], index: number, direction: 'up' | 'down'): T[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= items.length) {
    return items
  }

  const next = [...items]
  const [picked] = next.splice(index, 1)
  next.splice(targetIndex, 0, picked)
  return next
}

export function TaskPane({
  isOpen,
  palette,
  applyTarget,
  onApplyTargetChange,
  onApplyColor,
  onSavePalette,
}: TaskPaneProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [draftPalette, setDraftPalette] = useState<Palette>(() => clonePalette(palette))
  const [editingColorRef, setEditingColorRef] = useState<EditingColorRef | null>(null)
  const [paneMessage, setPaneMessage] = useState('')
  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  useEffect(() => {
    if (!isEditMode) {
      setDraftPalette(clonePalette(palette))
    }
  }, [palette, isEditMode])

  const viewingPalette = isEditMode ? draftPalette : palette

  const editingColor = useMemo(() => {
    if (!editingColorRef) {
      return null
    }

    const group = draftPalette.groups.find((item) => item.id === editingColorRef.groupId)
    if (!group) {
      return null
    }

    return group.colors.find((item) => item.id === editingColorRef.colorId) ?? null
  }, [draftPalette.groups, editingColorRef])

  const updateDraftGroups = (
    updater: (groups: Palette['groups']) => Palette['groups'],
  ) => {
    setDraftPalette((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      groups: updater(prev.groups),
    }))
  }

  const handleToggleEditMode = () => {
    if (isEditMode) {
      setIsEditMode(false)
      setDraftPalette(clonePalette(palette))
      setEditingColorRef(null)
      setPaneMessage('編集モードを終了しました。未保存変更は破棄されます。')
      return
    }

    setIsEditMode(true)
    setDraftPalette(clonePalette(palette))
    setPaneMessage('編集モードに切り替えました。保存で確定します。')
  }

  const handleDiscardChanges = () => {
    setIsEditMode(false)
    setDraftPalette(clonePalette(palette))
    setEditingColorRef(null)
    setPaneMessage('変更を破棄しました。')
  }

  const handleSaveChanges = () => {
    const payload: Palette = {
      ...draftPalette,
      version: 1,
      updatedAt: new Date().toISOString(),
    }
    const result = onSavePalette(payload)
    setPaneMessage(result.message)
    if (result.ok) {
      setIsEditMode(false)
      setEditingColorRef(null)
      setImportError('')
    }
  }

  const handleCopyExportText = async () => {
    if (!exportText) {
      return
    }

    try {
      await navigator.clipboard.writeText(exportText)
      setPaneMessage('エクスポートJSONをコピーしました。')
    } catch {
      setPaneMessage('コピーに失敗しました。')
    }
  }

  const handleImport = () => {
    const result = importPaletteJson(importText)
    if (!result.ok) {
      setImportError(result.error)
      return
    }

    setDraftPalette(result.palette)
    setImportError('')
    setPaneMessage('インポート内容を編集データへ反映しました。保存で確定します。')
  }

  return (
    <aside className={`task-pane ${isOpen ? 'open' : ''}`}>
      <div className="task-pane-header">
        <div>
          <h2 className="pane-title">カラーパレット</h2>
          <p className="pane-subtitle">{isEditMode ? '編集モード' : '通常モード'}</p>
        </div>
        <button
          type="button"
          className={`icon-btn ${isEditMode ? 'active' : ''}`}
          onClick={handleToggleEditMode}
        >
          ✎ 編集
        </button>
      </div>

      <div className="target-segment">
        {APPLY_TARGETS.map((target) => (
          <button
            key={target}
            type="button"
            className={`segment-btn ${applyTarget === target ? 'active' : ''}`}
            onClick={() => onApplyTargetChange(target)}
          >
            {APPLY_LABELS[target]}
          </button>
        ))}
      </div>

      {paneMessage && <p className="pane-message">{paneMessage}</p>}

      <div className="task-pane-body">
        {viewingPalette.groups.map((group, groupIndex) => (
          <section key={group.id} className="group-card">
            <div className="group-header">
              {isEditMode ? (
                <input
                  className="group-name-input"
                  value={group.name}
                  onChange={(event) =>
                    updateDraftGroups((prevGroups) =>
                      prevGroups.map((item) =>
                        item.id === group.id ? { ...item, name: event.target.value } : item,
                      ),
                    )
                  }
                />
              ) : (
                <h3>{group.name}</h3>
              )}

              {isEditMode && (
                <div className="row-actions">
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() =>
                      updateDraftGroups((prevGroups) =>
                        moveItem(prevGroups, groupIndex, 'up'),
                      )
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() =>
                      updateDraftGroups((prevGroups) =>
                        moveItem(prevGroups, groupIndex, 'down'),
                      )
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="mini-btn danger"
                    onClick={() =>
                      updateDraftGroups((prevGroups) =>
                        prevGroups.filter((item) => item.id !== group.id),
                      )
                    }
                    disabled={viewingPalette.groups.length <= 1}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>

            {group.colors.map((color, colorIndex) => (
              <div key={color.id} className="color-row">
                <button
                  type="button"
                  className="swatch-btn"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => onApplyColor(applyTarget, color.hex)}
                  aria-label={`${color.name}を適用`}
                />
                <div className="color-meta">
                  <strong>{color.name}</strong>
                  <span>{color.hex}</span>
                </div>

                {isEditMode ? (
                  <div className="row-actions">
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() =>
                        setEditingColorRef({ groupId: group.id, colorId: color.id })
                      }
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() =>
                        updateDraftGroups((prevGroups) =>
                          prevGroups.map((currentGroup) => {
                            if (currentGroup.id !== group.id) {
                              return currentGroup
                            }
                            return {
                              ...currentGroup,
                              colors: moveItem(currentGroup.colors, colorIndex, 'up'),
                            }
                          }),
                        )
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() =>
                        updateDraftGroups((prevGroups) =>
                          prevGroups.map((currentGroup) => {
                            if (currentGroup.id !== group.id) {
                              return currentGroup
                            }
                            return {
                              ...currentGroup,
                              colors: moveItem(currentGroup.colors, colorIndex, 'down'),
                            }
                          }),
                        )
                      }
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="mini-btn danger"
                      onClick={() =>
                        updateDraftGroups((prevGroups) =>
                          prevGroups.map((currentGroup) => {
                            if (currentGroup.id !== group.id) {
                              return currentGroup
                            }
                            return {
                              ...currentGroup,
                              colors: currentGroup.colors.filter(
                                (item) => item.id !== color.id,
                              ),
                            }
                          }),
                        )
                      }
                    >
                      削除
                    </button>
                  </div>
                ) : (
                  <div className="row-actions compact">
                    <button
                      type="button"
                      className="mini-btn icon-target"
                      onClick={() => onApplyColor('text', color.hex)}
                      title="文字色に適用"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      className="mini-btn icon-target"
                      onClick={() => onApplyColor('fill', color.hex)}
                      title="図形の塗りに適用"
                    >
                      ■
                    </button>
                    <button
                      type="button"
                      className="mini-btn icon-target"
                      onClick={() => onApplyColor('stroke', color.hex)}
                      title="図形の枠線に適用"
                    >
                      □
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isEditMode && (
              <button
                type="button"
                className="secondary-btn add-btn"
                onClick={() =>
                  updateDraftGroups((prevGroups) =>
                    prevGroups.map((currentGroup) => {
                      if (currentGroup.id !== group.id) {
                        return currentGroup
                      }
                      return {
                        ...currentGroup,
                        colors: [
                          ...currentGroup.colors,
                          {
                            id: createId('color'),
                            name: 'New Color',
                            hex: '#000000',
                          },
                        ],
                      }
                    }),
                  )
                }
              >
                + 色を追加
              </button>
            )}
          </section>
        ))}

        {isEditMode && (
          <>
            <button
              type="button"
              className="secondary-btn add-group-btn"
              onClick={() =>
                updateDraftGroups((prevGroups) => [
                  ...prevGroups,
                  {
                    id: createId('group'),
                    name: `新規グループ ${prevGroups.length + 1}`,
                    colors: [
                      {
                        id: createId('color'),
                        name: 'New Color',
                        hex: '#000000',
                      },
                    ],
                  },
                ])
              }
            >
              + グループを追加
            </button>

            <section className="io-panel">
              <h3>JSON エクスポート / インポート</h3>
              <div className="io-row">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setExportText(exportPaletteJson(draftPalette))}
                >
                  エクスポート表示
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  disabled={!exportText}
                  onClick={() => void handleCopyExportText()}
                >
                  コピー
                </button>
              </div>

              {exportText && (
                <textarea className="json-area" value={exportText} readOnly rows={7} />
              )}

              <label className="import-label" htmlFor="import-json">
                インポート(JSON)
              </label>
              <textarea
                id="import-json"
                className="json-area"
                rows={7}
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="ここにJSONを貼り付け"
              />
              <button type="button" className="secondary-btn" onClick={handleImport}>
                インポート反映
              </button>
              {importError && <p className="form-error">{importError}</p>}
            </section>
          </>
        )}
      </div>

      {isEditMode && (
        <div className="editor-footer">
          <button type="button" className="secondary-btn" onClick={handleDiscardChanges}>
            破棄して戻る
          </button>
          <button type="button" className="primary-btn" onClick={handleSaveChanges}>
            保存
          </button>
        </div>
      )}

      <PaletteEditorModal
        isOpen={Boolean(editingColor)}
        title="色を編集"
        initialName={editingColor?.name ?? ''}
        initialHex={editingColor?.hex ?? '#000000'}
        onClose={() => setEditingColorRef(null)}
        onSave={(name, hex) => {
          if (!editingColorRef) {
            return
          }
          updateDraftGroups((prevGroups) =>
            prevGroups.map((group) => {
              if (group.id !== editingColorRef.groupId) {
                return group
              }
              return {
                ...group,
                colors: group.colors.map((color) =>
                  color.id === editingColorRef.colorId ? { ...color, name, hex } : color,
                ),
              }
            }),
          )
          setEditingColorRef(null)
          setPaneMessage('色を更新しました。保存で確定します。')
        }}
      />
    </aside>
  )
}
