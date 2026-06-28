'use client'

import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

// ─── Konfiguration ───────────────────────────────────────────────────────────

const ENDPOINT = 'https://formspree.io/f/mwvzndgj'

const OPTIONS = [
  {
    label:       'Seite korrigieren oder ergänzen',
    type:        'Seite verbessern',
    placeholder: 'Was ist unklar, falsch oder fehlt?',
  },
  {
    label:       'Tool vorschlagen',
    type:        'Tool hinzufügen',
    placeholder: 'Welches Tool fehlt und wofür nutzt du es?',
  },
  {
    label:       'Tool-Auswahl anfragen',
    type:        'Tool-Beratung',
    placeholder: 'Beschreibe kurz, was du vorhast und welche Tools du bisher nutzt.',
  },
]

type Status = 'idle' | 'sending' | 'success' | 'error'

// ─── Komponente ──────────────────────────────────────────────────────────────

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [email, setEmail]       = useState('')
  const [message, setMessage]   = useState('')
  const [status, setStatus]     = useState<Status>('idle')

  if (pathname.startsWith('/admin')) return null

  function handleClose() {
    setOpen(false)
    setSelected(null)
    setEmail('')
    setMessage('')
    setStatus('idle')
  }

  function handleSelect(index: number) {
    setSelected(index)
    setEmail('')
    setMessage('')
    setStatus('idle')
  }

  async function handleSend() {
    if (selected === null) return
    setStatus('sending')

    try {
      const res = await fetch(ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _honeypot: '',
          type:    OPTIONS[selected].type,
          email:   email.trim() || undefined,
          message: message.trim(),
        }),
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(handleClose, 3000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width:           '100%',
    padding:         '8px 10px',
    fontSize:        '13px',
    border:          '1px solid var(--color-border)',
    borderRadius:    'var(--radius-btn)',
    backgroundColor: 'var(--color-bg)',
    color:           'var(--color-text-primary)',
    boxSizing:       'border-box',
    outline:         'none',
    lineHeight:      '1.5',
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
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            padding:        '14px 16px',
            borderBottom:   '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Was fehlt oder passt noch nicht?
            </span>
            <button
              onClick={handleClose}
              aria-label="Schließen"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-text-secondary)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Erfolg */}
          {status === 'success' ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '14px', color: 'var(--color-text-primary)' }}>
              Danke für den Hinweis. Wir schauen es uns an.
            </div>
          ) : (
            <>
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

              {/* Felder — erscheinen nach Auswahl */}
              {selected !== null && (
                <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Deine E-Mail, falls wir antworten sollen"
                    style={inputStyle}
                  />
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={OPTIONS[selected].placeholder}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />

                  {status === 'error' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-error)', margin: 0 }}>
                      Die Nachricht konnte gerade nicht gesendet werden. Bitte versuche es noch einmal.
                    </p>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={status === 'sending'}
                    style={{
                      padding:         '9px',
                      fontSize:        '13px',
                      fontWeight:      '600',
                      backgroundColor: status === 'sending' ? 'var(--color-text-secondary)' : 'var(--color-cta)',
                      color:           '#ffffff',
                      border:          'none',
                      borderRadius:    'var(--radius-btn)',
                      cursor:          status === 'sending' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {status === 'sending' ? 'Wird gesendet ...' : 'Absenden'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Trigger-Button ────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Feedback zu ToolSucher geben"
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
