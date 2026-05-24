/**
 * Datei: components/admin/TagGroupForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für TagGroup-Erstellen und -Bearbeiten.
 * Tags werden als Textarea erfasst (ein Name pro Zeile) — Slugs werden serverseitig generiert.
 */

'use client'

import { useActionState, useState } from 'react'
import type { ActionState } from '@/app/admin/tags/actions'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type TagGroupFormDefaults = {
  name: string
  slug: string
  description: string | null
  sortOrder: number
  tagNames: string[]
}

type TagGroupFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: TagGroupFormDefaults
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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
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

export default function TagGroupForm({ action, defaultValues }: TagGroupFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugIsManual, setSlugIsManual] = useState(!!defaultValues)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (!slugIsManual) setSlug(toSlug(val))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugIsManual(true)
  }

  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction}>

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

      {/* ── Gruppe ── */}
      <FormSection title="Tag-Gruppe">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Name" required error={fe.name}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="z. B. Zielgruppe"
              style={inputStyle(!!fe.name)}
            />
          </Field>

          <Field
            label="Slug"
            required
            hint="URL-Kennung — wird automatisch generiert"
            error={fe.slug}
          >
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="z. B. zielgruppe"
              style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px' }}>
          <Field label="Beschreibung" hint="Optional">
            <input
              type="text"
              name="description"
              defaultValue={defaultValues?.description ?? ''}
              placeholder="z. B. Für welche Zielgruppen eignet sich das Tool?"
              style={inputStyle(false)}
            />
          </Field>

          <Field label="Reihenfolge" error={fe.sortOrder} hint="0 = erste Gruppe">
            <input
              type="number"
              name="sortOrder"
              defaultValue={defaultValues?.sortOrder ?? 0}
              min="0"
              step="1"
              style={inputStyle(!!fe.sortOrder)}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Tags ── */}
      <FormSection title="Tags">
        <Field
          label="Tag-Namen"
          hint="Ein Tag pro Zeile. Slugs werden automatisch generiert. Beim Speichern werden bestehende Tags ersetzt."
        >
          <textarea
            name="tags"
            defaultValue={defaultValues?.tagNames.join('\n') ?? ''}
            placeholder={'Freelancer\nKleinunternehmen\nAgentur\n...'}
            rows={10}
            style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
          />
        </Field>
      </FormSection>

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
          href="/admin/tags"
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
