/**
 * Datei: components/admin/FaqEditor.tsx
 *
 * Zweck: Client-Component zum Bearbeiten von FAQ-Einträgen im Tool-Formular.
 * Rendert eine dynamische Liste von Frage/Antwort-Paaren.
 * Speichert den State als JSON in einem hidden Input (name="faqItems"),
 * das beim Form-Submit von actions.ts ausgelesen wird.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 *
 * Wichtig:
 * Muss innerhalb eines <form>-Elements gerendert werden (ToolForm.tsx).
 */

'use client'

import { useState } from 'react'

export type FaqItem = {
  question: string
  answer: string
}

type Props = {
  initialFaqs: FaqItem[]
}

export default function FaqEditor({ initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs)

  function addFaq() {
    setFaqs((prev) => [...prev, { question: '', answer: '' }])
  }

  function removeFaq(index: number) {
    setFaqs((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, value: string) {
    setFaqs((prev) => prev.map((item, i) => i === index ? { ...item, question: value } : item))
  }

  function updateAnswer(index: number, value: string) {
    setFaqs((prev) => prev.map((item, i) => i === index ? { ...item, answer: value } : item))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-btn)',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div>
      {/* hidden input überträgt den gesamten FAQ-Array als JSON */}
      <input type="hidden" name="faqItems" value={JSON.stringify(faqs)} />

      {faqs.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          Noch keine FAQ-Einträge. Klicke auf &quot;FAQ hinzufügen&quot;.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              padding: '16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--color-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                FAQ {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeFaq(index)}
                style={{
                  padding: '3px 10px',
                  fontSize: '12px',
                  color: 'var(--color-error)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-error-border)',
                  borderRadius: 'var(--radius-btn)',
                  cursor: 'pointer',
                }}
              >
                Entfernen
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                Frage
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateQuestion(index, e.target.value)}
                placeholder="z. B. Gibt es eine kostenlose Testversion?"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                Antwort
              </label>
              <textarea
                value={faq.answer}
                onChange={(e) => updateAnswer(index, e.target.value)}
                placeholder="Antwort auf die Frage..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addFaq}
        style={{
          marginTop: '12px',
          padding: '7px 16px',
          fontSize: '13px',
          fontWeight: '500',
          color: 'var(--color-cta)',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-cta)',
          borderRadius: 'var(--radius-btn)',
          cursor: 'pointer',
        }}
      >
        + FAQ hinzufügen
      </button>
    </div>
  )
}
