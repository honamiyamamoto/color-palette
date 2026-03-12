import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import './App.css'
import { RibbonBar } from './components/RibbonBar'
import { SlideCanvas } from './components/SlideCanvas'
import { TaskPane } from './components/TaskPane'
import { Toast } from './components/Toast'
import { INITIAL_SLIDE_ELEMENTS } from './data/initialSlideElements'
import { applyColor } from './services/colorApplier'
import { loadPalette, savePalette } from './storage/paletteStorage'
import type { ApplyTarget, Palette } from './types/palette'
import type { SlideElement } from './types/slide'

function App() {
  const TASK_PANE_MIN_WIDTH = 300
  const TASK_PANE_MAX_WIDTH = 520
  const TASK_PANE_DEFAULT_WIDTH = 300

  const [palette, setPalette] = useState<Palette>(() => loadPalette())
  const [slideElements, setSlideElements] =
    useState<SlideElement[]>(INITIAL_SLIDE_ELEMENTS)
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([])
  const [isTaskPaneOpen, setIsTaskPaneOpen] = useState(true)
  const [taskPaneWidth, setTaskPaneWidth] = useState(TASK_PANE_DEFAULT_WIDTH)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const isResizingRef = useRef(false)

  const showToast = (message: string) => {
    setToastMessage(message)
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null)
      toastTimerRef.current = null
    }, 2200)
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const handleApplyColor = (target: ApplyTarget, hex: string) => {
    const result = applyColor({
      elements: slideElements,
      selectedElementIds,
      target,
      hex,
    })

    if (!result.applied) {
      showToast(result.message ?? '色を適用できませんでした。')
      return
    }

    setSlideElements(result.elements)
  }

  const handleSelectElement = (id: string, options?: { additive?: boolean }) => {
    setSelectedElementIds((prev) => {
      if (options?.additive) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      }

      return prev.length === 1 && prev[0] === id ? prev : [id]
    })
  }

  const stopPaneResize = () => {
    isResizingRef.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const handlePaneResizeStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return
    }

    isResizingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizingRef.current) {
        return
      }

      const maxWidth = Math.max(
        TASK_PANE_MIN_WIDTH,
        Math.min(TASK_PANE_MAX_WIDTH, window.innerWidth - 240),
      )
      const nextWidth = window.innerWidth - event.clientX
      const boundedWidth = Math.min(Math.max(nextWidth, TASK_PANE_MIN_WIDTH), maxWidth)
      setTaskPaneWidth((prev) => (prev === boundedWidth ? prev : boundedWidth))
    }

    const handlePointerUp = () => {
      if (!isResizingRef.current) {
        return
      }

      stopPaneResize()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('blur', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('blur', handlePointerUp)
      stopPaneResize()
    }
  }, [])

  const handleSavePalette = (nextPalette: Palette) => {
    try {
      savePalette(nextPalette)
      setPalette(nextPalette)
      return { ok: true, message: 'パレットを保存しました。' }
    } catch {
      return {
        ok: false,
        message: '保存に失敗しました。ブラウザ設定を確認してください。',
      }
    }
  }

  return (
    <div className="app-shell">
      <RibbonBar
        isPaneOpen={isTaskPaneOpen}
        onTogglePane={() => setIsTaskPaneOpen((prev) => !prev)}
      />
      <main
        className={`workspace-body ${isTaskPaneOpen ? 'pane-open' : ''}`}
        style={
          {
            '--task-pane-width': `${taskPaneWidth}px`,
          } as CSSProperties
        }
      >
        <div className="slide-region">
          <SlideCanvas
            elements={slideElements}
            selectedElementIds={selectedElementIds}
            onSelectElement={handleSelectElement}
            onClearSelection={() => setSelectedElementIds([])}
          />
        </div>
        {isTaskPaneOpen && (
          <button
            type="button"
            className="task-pane-resizer"
            aria-label="右ペインの幅を調整"
            onPointerDown={handlePaneResizeStart}
          />
        )}
        <TaskPane
          isOpen={isTaskPaneOpen}
          palette={palette}
          onApplyColor={handleApplyColor}
          onSavePalette={handleSavePalette}
        />
      </main>
      <Toast message={toastMessage} />
    </div>
  )
}

export default App
