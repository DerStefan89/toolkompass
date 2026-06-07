/**
 * Datei: components/admin/MarkdownTextarea.tsx
 *
 * Zweck: Drop-in-Ersatz für <textarea> mit B/I/U-Toolbar.
 * Speicherformat bleibt Markdown (** für fett, * für kursiv, <u> für
 * unterstrichen) — wird auf der Tool-Detailseite via react-markdown gerendert.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Ansicht)
 *
 * Wichtig:
 * - Controlled Component (value/onChange) — notwendig, damit die Toolbar
 *   die Selection nach dem Einfügen der Marker gezielt setzen kann.
 * - Markierten Text umschließen → Marker um Selection legen, Auswahl auf
 *   den eingeschlossenen Text setzen. Keine Auswahl → Marker einfügen,
 *   Cursor zwischen die Marker setzen (sofortiges Weitertippen möglich).
 */

'use client'

import { useRef } from 'react'

type Props = {
  name?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

type PendingSelection = { start: number; end: number }

const TOOLBAR_BUTTONS: { label: string; title: string; before: string; after: string; style: React.CSSProperties }[] = [
  { label: 'B', title: 'Fett (**Text**)',          before: '**',  after: '**',   style: { fontWeight: 700 } },
  { label: 'I', title: 'Kursiv (*Text*)',          before: '*',   after: '*',    style: { fontStyle: 'italic' } },
  { label: 'U', title: 'Unterstrichen (<u>Text</u>)', before: '<u>', after: '</u>', style: { textDecoration: 'underline' } },
]

export default function MarkdownTextarea({ name, value, onChange, placeholder, rows = 4 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<PendingSelection | null>(null)

  // Setzt die gewünschte Selection NACH dem Re-Render mit dem neuen `value` —
  // direkt nach onChange() steht der DOM-Wert noch auf dem alten Stand.
  function applyPendingSelection() {
    const sel = pendingSelection.current
    const textarea = textareaRef.current
    if (!sel || !textarea) return
    pendingSelection.current = null
    textarea.focus()
    textarea.setSelectionRange(sel.start, sel.end)
  }

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)

    pendingSelection.current = selected
      ? { start: start + before.length, end: start + before.length + selected.length }
      : { start: start + before.length, end: start + before.length }

    onChange(newValue)
    // requestAnimationFrame statt useEffect — Selection muss exakt nach dem
    // Commit dieses einen Updates gesetzt werden, nicht bei jeder value-Änderung
    requestAnimationFrame(applyPendingSelection)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {TOOLBAR_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            aria-label={btn.title}
            onClick={() => wrapSelection(btn.before, btn.after)}
            style={{
              width: '30px',
              height: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn)',
              cursor: 'pointer',
              ...btn.style,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-btn)',
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-card)',
          boxSizing: 'border-box',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
