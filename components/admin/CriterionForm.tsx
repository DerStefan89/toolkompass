/**
 * Datei: components/admin/CriterionForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Bewertungskriterien
 * (Erstellen und Bearbeiten). Wird in /admin/bewertungskriterien/neu und
 * /admin/bewertungskriterien/[id] verwendet.
 *
 * Wird aufgerufen von:
 * - app/admin/bewertungskriterien/neu/page.tsx  (createCriterion)
 * - app/admin/bewertungskriterien/[id]/page.tsx (updateCriterion.bind(null, id))
 *
 * Wichtig:
 * - Slug wird automatisch aus dem Namen generiert, kann manuell überschrieben werden.
 * - Im Bearbeitungsmodus wird der Slug nicht auto-überschrieben.
 */

'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { ActionState } from '@/lib/types/admin'

export type CriterionFormDefaults = {
  name: string
  slug: string
  sortOrder: string
}

type CriterionFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: CriterionFormDefaults
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

export default function CriterionForm({ action, defaultValues }: CriterionFormProps) {
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Name" required error={fe.name}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="z. B. DATEV-Anbindung"
              style={inputStyle(!!fe.name)}
            />
          </Field>

          <Field
            label="Slug"
            hint="wird aus dem Namen generiert wenn leer"
            error={fe.slug}
          >
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="z. B. datev-anbindung"
              style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Field>
        </div>

        <Field
          label="Sortierung"
          hint="Niedrigere Werte erscheinen zuerst"
          error={fe.sortOrder}
        >
          <input
            type="number"
            name="sortOrder"
            defaultValue={defaultValues?.sortOrder ?? '0'}
            style={{ ...inputStyle(!!fe.sortOrder), maxWidth: '160px' }}
          />
        </Field>
      </div>

      {/* Submit-Bereich */}
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

        <Link
          href="/admin/bewertungskriterien"
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
        </Link>
      </div>
    </form>
  )
}
