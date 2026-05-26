/**
 * Datei: components/admin/VendorForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Vendor-Erstellen und -Bearbeiten.
 * Wird sowohl in /admin/vendors/neu als auch /admin/vendors/[id] verwendet.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Anbieter-Abschnitt)
 *
 * Produkt-Kontext:
 * Vendors sind die Hersteller/Anbieter hinter den Tools.
 * Jedes Tool ist genau einem Vendor zugeordnet.
 *
 * Wichtig:
 * - Slug wird automatisch aus dem Name generiert, kann aber manuell überschrieben werden.
 * - Im Bearbeitungsmodus wird der Slug nicht auto-überschrieben.
 */

'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { ActionState } from '@/lib/types/admin'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type VendorFormDefaults = {
  name: string
  slug: string
  website: string
  description: string
}

type VendorFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  defaultValues?: VendorFormDefaults
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Wandelt einen beliebigen String in einen URL-sicheren Slug um
function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── Unterkomponenten ────────────────────────────────────────────────────────

// Formular-Abschnitt mit Trennlinie und Bezeichner
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

// Einzelnes Formularfeld mit Label, optionalem Hinweis und Fehleranzeige
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

// Gemeinsame Input-Styles — Fehler färbt den Rahmen rot
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

export default function VendorForm({ action, defaultValues }: VendorFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})

  // Kontrollierter Zustand für Felder mit Live-Abhängigkeiten
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')

  // Im Bearbeitungsmodus: Slug ist bereits gesetzt → nicht mehr auto-überschreiben
  const [slugIsManual, setSlugIsManual] = useState(!!defaultValues)

  // Wenn der Name sich ändert, Slug automatisch ableiten (nur im Erstellen-Modus)
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (!slugIsManual) setSlug(toSlug(val))
  }

  // Sobald der Nutzer den Slug anfasst, Auto-Generierung deaktivieren
  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value)
    setSlugIsManual(true)
  }

  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction}>

      {/* Allgemeiner Fehler (z. B. Datenbankfehler) */}
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

      {/* ── Basisdaten ── */}
      <Section title="Basisdaten">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Name" required error={fe.name}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="z. B. Zapier Inc."
              style={inputStyle(!!fe.name)}
            />
          </Field>

          <Field
            label="Slug"
            required
            hint="URL-Kennung — wird automatisch aus dem Name generiert"
            error={fe.slug}
          >
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              placeholder="z. B. zapier"
              style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Field>
        </div>

        <Field
          label="Website"
          hint="Offizielle Unternehmenswebsite (optional)"
          error={fe.website}
        >
          <input
            type="url"
            name="website"
            defaultValue={defaultValues?.website ?? ''}
            placeholder="https://zapier.com"
            style={inputStyle(!!fe.website)}
          />
        </Field>

        <Field label="Beschreibung" hint="Kurzbeschreibung des Unternehmens (optional)">
          <textarea
            name="description"
            defaultValue={defaultValues?.description ?? ''}
            placeholder="Kurze Beschreibung des Anbieters..."
            rows={3}
            style={{ ...inputStyle(false), resize: 'vertical' }}
          />
        </Field>
      </Section>

      {/* ── Submit-Bereich ── */}
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
          href="/admin/vendors"
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
