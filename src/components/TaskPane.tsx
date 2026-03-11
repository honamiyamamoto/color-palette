import { useMemo, useState } from 'react'
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
  onApplyColor: (target: ApplyTarget, hex: string) => void
  onSavePalette: (palette: Palette) => SaveResult
}

interface EditingColorRef {
  groupId: string
  colorId: string
}

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

export function TaskPane({ isOpen, palette, onApplyColor, onSavePalette }: TaskPaneProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [draftPalette, setDraftPalette] = useState<Palette>(() => clonePalette(palette))
  const [editingColorRef, setEditingColorRef] = useState<EditingColorRef | null>(null)
  const [paneMessage, setPaneMessage] = useState('')

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

  const updateDraftGroups = (updater: (groups: Palette['groups']) => Palette['groups']) => {
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
      setPaneMessage('')
      return
    }

    setIsEditMode(true)
    setDraftPalette(clonePalette(palette))
    setPaneMessage('')
  }

  const handleDiscardChanges = () => {
    setIsEditMode(false)
    setDraftPalette(clonePalette(palette))
    setEditingColorRef(null)
    setPaneMessage('')
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
    }
  }

  return (
    <aside className={`task-pane ${isOpen ? 'open' : ''}`}>
      <div className="task-pane-header">
        <h2 className="pane-title">カラーパレット</h2>
        <button
          type="button"
          className={`icon-btn ${isEditMode ? 'active' : ''}`}
          onClick={handleToggleEditMode}
        >
          ✎ {isEditMode ? '編集を終了' : '編集'}
        </button>
      </div>

      {!isEditMode && (
        <p className="pane-hint">A / ■ / □ を押して文字・塗り・枠線を個別に適用します。</p>
      )}

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
                      updateDraftGroups((prevGroups) => moveItem(prevGroups, groupIndex, 'up'))
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
                <div className="swatch-preview" style={{ backgroundColor: color.hex }} />
                <div className="color-meta">
                  <strong>{color.name}</strong>
                  <span>{color.hex}</span>
                </div>

                {!isEditMode && (
                  <div className="apply-action-set">
                    <button
                      type="button"
                      className="apply-target-btn"
                      title="文字色に適用"
                      onClick={() => onApplyColor('text', color.hex)}
                    >
                      <span className="target-icon text" style={{ color: color.hex }}>
                        A
                      </span>
                      <span className="target-label">文字</span>
                    </button>
                    <button
                      type="button"
                      className="apply-target-btn"
                      title="オブジェクト塗りつぶしに適用"
                      onClick={() => onApplyColor('fill', color.hex)}
                    >
                      <span
                        className="target-icon fill"
                        style={{ backgroundColor: color.hex, borderColor: color.hex }}
                      />
                      <span className="target-label">オブジェクト</span>
                    </button>
                    <button
                      type="button"
                      className="apply-target-btn"
                      title="図形の枠線に適用"
                      onClick={() => onApplyColor('stroke', color.hex)}
                    >
                      <span className="target-icon stroke" style={{ borderColor: color.hex }} />
                      <span className="target-label">枠線</span>
                    </button>
                  </div>
                )}

                {isEditMode && (
                  <div className="row-actions edit-row-actions">
                    <button
                      type="button"
                      className="mini-btn"
                      onClick={() => setEditingColorRef({ groupId: group.id, colorId: color.id })}
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
                              colors: currentGroup.colors.filter((item) => item.id !== color.id),
                            }
                          }),
                        )
                      }
                    >
                      削除
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
        key={editingColorRef?.colorId ?? 'palette-editor-closed'}
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
          setPaneMessage('')
        }}
      />
    </aside>
  )
}
