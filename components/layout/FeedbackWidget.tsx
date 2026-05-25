'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

// ─── Konfiguration ───────────────────────────────────────────────────────────

const OPTIONS = [
  {
    label:       'Seite verbessern / erweitern',
    subject:     'Feedback: Seite verbessern',
    placeholder: 'Was würdest du an dieser Seite verbessern oder ergänzen?',
  },
  {
    label:       'Tool hinzufügen',
    subject:     'Tool hinzufügen',
    placeholder: 'Welches Tool fehlt dir? Bitte Name und Kategorie angeben.',
  },
  {
    label:       'Tool-Beratung anfragen',
    subject:     'Tool-Beratung anfragen',
    placeholder: 'Beschreibe kurz, welche Tools du für deinen Anwendungsfall suchst.',
  },
]

// ─── Komponente ──────────────────────────────────────────────────────────────

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen]           = useState(false)
  const [selected, setSelected]   = useState<number | null>(null)
  const [message, setMessage]     = useState('')

  if (pathname.startsWith('/admin')) return null

  function handleClose() {
    setOpen(false)
    setSelected(null)
    setMessage('')
  }

  function handleSelect(index: number) {
    setSelected(index)
    setMessage('')
  }

  function handleSend() {
    if (selected === null) return
    const opt     = OPTIONS[selected]
    const subject = encodeURIComponent(opt.subject)
    const body    = encodeURIComponent(message.trim() || opt.placeholder)
    window.location.href = `mailto:toolsucher@gmail.com?subject=${subject}&body=${body}`
    handleClose()
  }

  return (
    <>
      {/* ── Popup ─────────────────────────────────────────── */}
      {open && (
        <div style={{
          position:        'fixed',
          bottom:          '72px',
          right:           '24px',
          width:           '300px',
          backgroundColor: 'var(--color-bg-card)',
          border:          '1px solid var(--color-border)',
          borderRadius:    'var(--radius-card)',
          boxShadow:       '0 4px 24px rgba(0,0,0,0.12)',
          zIndex:          51,
          overflow:        'hidden',
        }}>

          {/* Header */}
          <div style={{
            display:         'flex',
            justifyContent:  'space-between',
            alignItems:      'center',
            padding:         '14px 16px',
            borderBottom:    '1px solid var(--color-border)',
          }}>
            <span style={{
              fontSize:   '14px',
              fontWeight: '600',
              color:      'var(--color-text-primary)',
            }}>
              Wie können wir helfen?
            </span>
            <button
              onClick={handleClose}
              aria-label="Schließen"
              style={{
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                padding:    '2px',
                color:      'var(--color-text-secondary)',
                display:    'flex',
                lineHeight: 1,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Optionen */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {OPTIONS.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={{
                  padding:         '9px 12px',
                  fontSize:        '13px',
                  textAlign:       'left',
                  borderRadius:    'var(--radius-btn)',
                  border:          `1px solid ${selected === i ? 'var(--color-cta)' : 'var(--color-border)'}`,
                  backgroundColor: selected === i ? 'var(--color-cta)' : 'transparent',
                  color:           selected === i ? '#ffffff' : 'var(--color-text-primary)',
                  cursor:          'pointer',
                  fontWeight:      selected === i ? '600' : '400',
                  transition:      'all 0.1s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Textarea — erscheint nach Auswahl */}
          {selected !== null && (
            <div style={{ padding: '0 16px 12px' }}>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={OPTIONS[selected].placeholder}
                rows={3}
                style={{
                  width:           '100%',
                  padding:         '8px 10px',
                  fontSize:        '13px',
                  border:          '1px solid var(--color-border)',
                  borderRadius:    'var(--radius-btn)',
                  backgroundColor: 'var(--color-bg)',
                  color:           'var(--color-text-primary)',
                  resize:          'vertical',
                  boxSizing:       'border-box',
                  outline:         'none',
                  lineHeight:      '1.5',
                }}
              />
              <button
                onClick={handleSend}
                style={{
                  marginTop:       '8px',
                  width:           '100%',
                  padding:         '9px',
                  fontSize:        '13px',
                  fontWeight:      '600',
                  backgroundColor: 'var(--color-cta)',
                  color:           '#ffffff',
                  border:          'none',
                  borderRadius:    'var(--radius-btn)',
                  cursor:          'pointer',
                }}
              >
                Absenden
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Trigger-Button ────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Feedback geben"
        style={{
          position:        'fixed',
          bottom:          '24px',
          right:           '24px',
          display:         'flex',
          alignItems:      'center',
          gap:             '6px',
          padding:         '9px 14px',
          backgroundColor: 'var(--color-cta)',
          color:           '#ffffff',
          border:          'none',
          borderRadius:    '20px',
          fontSize:        '13px',
          fontWeight:      '600',
          cursor:          'pointer',
          boxShadow:       '0 2px 8px rgba(0,0,0,0.18)',
          zIndex:          50,
          opacity:         open ? 1 : 0.9,
          transition:      'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.opacity = '0.9' }}
      >
        <MessageSquare size={15} />
        Feedback
      </button>
    </>
  )
}
