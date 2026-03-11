interface RibbonBarProps {
  isPaneOpen: boolean
  onTogglePane: () => void
}

export function RibbonBar({ isPaneOpen, onTogglePane }: RibbonBarProps) {
  return (
    <header className="ribbon-bar">
      <button
        type="button"
        className={`ribbon-button ${isPaneOpen ? 'active' : ''}`}
        onClick={onTogglePane}
      >
        <span className="ribbon-icon" aria-hidden="true">
          ▦
        </span>
        カラーパレット
      </button>
    </header>
  )
}
