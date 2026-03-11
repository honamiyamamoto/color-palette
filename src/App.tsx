import { useEffect, useRef, useState } from 'react'
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
  const [palette, setPalette] = useState<Palette>(() => loadPalette())
  const [slideElements, setSlideElements] =
    useState<SlideElement[]>(INITIAL_SLIDE_ELEMENTS)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isTaskPaneOpen, setIsTaskPaneOpen] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

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
      selectedElementId,
      target,
      hex,
    })

    if (!result.applied) {
      showToast(result.message ?? '色を適用できませんでした。')
      return
    }

    setSlideElements(result.elements)
  }

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
      <main className={`workspace-body ${isTaskPaneOpen ? 'pane-open' : ''}`}>
        <div className="slide-region">
          <SlideCanvas
            elements={slideElements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        </div>
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
