/**
 * Datei: components/admin/ArtikelForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Artikel-Erstellen und -Bearbeiten.
 * Wird sowohl in /admin/artikel/neu als auch /admin/artikel/[id] verwendet.
 *
 * Besonderheit:
 * - Sections (Abschnitte) sind dynamisch hinzufügbar/entfernbar.
 * - Die Sections werden als JSON in einem Hidden-Field übertragen.
 * - Titel und Slug sind kontrolliert; Slug wird automatisch aus dem Titel generiert.
 */

'use client'

import { useActionState, useState } from 'react'
import type { ActionState, SectionInput } from '@/app/admin/artikel/actions'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ArtikelFormDefaults = {
  title: string
  slug: string
  subtitle: string
  type: 'guide' | 'top_list' | 'comparison' | 'tutorial'
  published: boolean
  sections: SectionInput[]
}

type ArtikelFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: ArtikelFormDefaults
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Unterkomponenten ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-secondary)',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({
  label, hint, error, required, children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '6px',
        color: 'var(--color-text-primary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
      {error ? (
        <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{hint}</p>
      ) : null}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-btn)',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
    boxSizing: 'border-box',
    outline: 'none',
  }
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────

export default function ArtikelForm({ action, defaultValues }: ArtikelFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [subtitle, setSubtitle] = useState(defaultValues?.subtitle ?? '')
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [sections, setSections] = useState<SectionInput[]>(
    defaultValues?.sections.length ? defaultValues.sections : [{ heading: '', content: '' }]
  )

  const [slugIsManual, setSlugIsManual] = useState(!!defaultValues)

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    if (!slugIsManual) setSlug(toSlug(val))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugIsManual(true)
  }

  function addSection() {
    setSections(prev => [...prev, { heading: '', content: '' }])
  }

  function removeSection(index: number) {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  function updateSection(index: number, field: keyof SectionInput, value: string) {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction}>

      {/* Allgemeiner Fehler */}
      {state.error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          backgroundColor: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--color-error)',
          fontSize: '14px',
        }}>
          {state.error}
        </div>
      )}

      {/* Hidden-Field mit JSON-serialisierten Sections */}
      <input type="hidden" name="sections_json" value={JSON.stringify(sections)} />

      {/* ── Basisdaten ── */}
      <Section title="Basisdaten">
        <Field label="Titel" required error={fe.title}>
          <input
            type="text"
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="z. B. Die 10 besten CRM-Tools für Selbstständige"
            style={inputStyle(!!fe.title)}
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field
            label="Slug"
            required
            hint="URL-Kennung — wird automatisch aus dem Titel generiert"
            error={fe.slug}
          >
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="z. B. beste-crm-tools"
              style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Field>

          <Field label="Typ" required error={fe.type}>
            <select
              name="type"
              defaultValue={defaultValues?.type ?? 'guide'}
              style={{ ...inputStyle(!!fe.type), cursor: 'pointer' }}
            >
              <option value="guide">Guide</option>
              <option value="top_list">Top-Liste</option>
              <option value="comparison">Vergleich</option>
              <option value="tutorial">Anleitung</option>
            </select>
          </Field>
        </div>

        <Field label="Untertitel" required error={fe.subtitle}>
          <input
            type="text"
            name="subtitle"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Kurze Beschreibung für Listen und Übersichten"
            style={inputStyle(!!fe.subtitle)}
          />
        </Field>
      </Section>

      {/* ── Optionen ── */}
      <Section title="Optionen">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="published"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Veröffentlicht (sichtbar im Ratgeber-Bereich)
        </label>
      </Section>

      {/* ── Abschnitte (Sections) ── */}
      <Section title="Abschnitte">
        {fe.sections && (
          <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '-8px' }}>
            {fe.sections}
          </p>
        )}

        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '-8px' }}>
          Mindestens ein Abschnitt mit Inhalt ist erforderlich. Überschriften sind optional.
        </p>

        {sections.map((section, index) => (
          <div key={index} style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            backgroundColor: 'var(--color-bg-card)',
            position: 'relative',
          }}>
            {/* Abschnitt-Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                Abschnitt {index + 1}
              </span>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-error)',
                    borderRadius: 'var(--radius-btn)',
                    cursor: 'pointer',
                  }}
                >
                  Entfernen
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Überschrift" hint="Optional — leer lassen für Fließtext ohne Titel">
                <input
                  type="text"
                  value={section.heading}
                  onChange={e => updateSection(index, 'heading', e.target.value)}
                  placeholder="z. B. Was ist ein CRM-System?"
                  style={inputStyle(false)}
                />
              </Field>

              <Field label="Inhalt" required>
                <textarea
                  value={section.content}
                  onChange={e => updateSection(index, 'content', e.target.value)}
                  placeholder="Inhalt dieses Abschnitts …"
                  rows={6}
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                />
              </Field>
            </div>
          </div>
        ))}

        {/* Abschnitt hinzufügen */}
        <button
          type="button"
          onClick={addSection}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-btn)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          + Abschnitt hinzufügen
        </button>
      </Section>

      {/* ── Submit ── */}
      <div style={{
        display: 'flex',
        gap: '12px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border)',
      }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 24px',
            backgroundColor: isPending ? 'var(--color-text-secondary)' : 'var(--color-cta)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Wird gespeichert…' : 'Speichern'}
        </button>

        <a
          href="/admin/artikel"
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-btn)',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Abbrechen
        </a>
      </div>
    </form>
  )
}
