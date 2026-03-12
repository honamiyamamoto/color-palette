import type { SlideElement } from '../types/slide'

interface SlideCanvasProps {
  elements: SlideElement[]
  selectedElementIds: string[]
  onSelectElement: (id: string, options?: { additive?: boolean }) => void
  onClearSelection: () => void
}

export function SlideCanvas({
  elements,
  selectedElementIds,
  onSelectElement,
  onClearSelection,
}: SlideCanvasProps) {
  return (
    <section className="canvas-surface" onClick={onClearSelection}>
      <div className="slide-sheet">
        {elements.map((element) => {
          const isSelected = selectedElementIds.includes(element.id)
          const itemStyle = {
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
          }

          return (
            <div
              key={element.id}
              className={`slide-item ${isSelected ? 'is-selected' : ''}`}
              style={itemStyle}
              onClick={(event) => {
                event.stopPropagation()
                onSelectElement(element.id, {
                  additive: event.ctrlKey || event.metaKey || event.shiftKey,
                })
              }}
            >
              {element.type === 'text' && (
                <div
                  className="text-box-shape"
                  style={{
                    color: element.style.textColor,
                    backgroundColor: element.style.fillColor,
                    borderColor: element.style.strokeColor,
                  }}
                >
                  {element.text}
                </div>
              )}

              {element.type === 'rectangle' && (
                <div
                  className="shape-box rectangle-shape"
                  style={{
                    borderColor: element.style.strokeColor,
                    backgroundColor: element.style.fillColor,
                  }}
                >
                  <span style={{ color: element.style.textColor }}>{element.label}</span>
                </div>
              )}

              {element.type === 'circle' && (
                <div
                  className="shape-box circle-shape"
                  style={{
                    borderColor: element.style.strokeColor,
                    backgroundColor: element.style.fillColor,
                  }}
                >
                  <span style={{ color: element.style.textColor }}>{element.label}</span>
                </div>
              )}

              {element.type === 'arrow' && (
                <div
                  className="arrow-shape"
                  style={{
                    backgroundColor: element.style.strokeColor,
                  }}
                >
                  <div
                    className="arrow-shape-inner"
                    style={{
                      backgroundColor: element.style.fillColor,
                      color: element.style.textColor,
                    }}
                  >
                    {element.text}
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="selection-handles" aria-hidden="true">
                  <span className="handle top-left" />
                  <span className="handle top-right" />
                  <span className="handle bottom-left" />
                  <span className="handle bottom-right" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
