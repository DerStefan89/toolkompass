/**
 * Datei: components/admin/StackForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Stack-Erstellen und -Bearbeiten.
 * Ermöglicht Auswahl der enthaltenen Tools per Checkbox.
 */

'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { ActionState } from '@/lib/types/admin'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ToolOption = {
  id: string
  name: string
  slug: string
}

export type StackFormDefaults = {
  name: string
  slug: string
  description: string | null
  targetAudience: string
  published: boolean
  toolIds: string[]
}

type StackFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  tools: ToolOption[]
  defaultValues?: StackFormDefaults
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

export default function StackForm({ action, tools, defaultValues }: StackFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [published, setPublished] = useState(defaultValues?.published ?? false)
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

      {/* ── Basisdaten ── */}
      <Section title="Basisdaten">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Name" required error={fe.name}>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              placeholder="z. B. Freelancer-Starter-Stack"
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
              placeholder="z. B. freelancer-starter-stack"
              style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
            />
          </Field>
        </div>

        <Field label="Zielgruppe" required error={fe.targetAudience}>
          <input
            type="text"
            name="targetAudience"
            defaultValue={defaultValues?.targetAudience ?? ''}
            placeholder="z. B. Freelancer, Solopreneure, kleine Agenturen"
            style={inputStyle(!!fe.targetAudience)}
          />
        </Field>

        <Field label="Beschreibung" hint="Optional — wird auf der Stack-Detailseite angezeigt">
          <textarea
            name="description"
            defaultValue={defaultValues?.description ?? ''}
            placeholder="Kurze Beschreibung des Stacks und seiner Stärken …"
            rows={4}
            style={{ ...inputStyle(false), resize: 'vertical' }}
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
          Veröffentlicht (sichtbar auf der Plattform)
        </label>
      </Section>

      {/* ── Tools ── */}
      <Section title="Tools im Stack">
        {tools.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Keine Tools vorhanden. Erst Tools anlegen.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '8px',
          }}>
            {tools.map(tool => (
              <label key={tool.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  name="toolIds"
                  value={tool.id}
                  defaultChecked={defaultValues?.toolIds.includes(tool.id) ?? false}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>{tool.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                  {tool.slug}
                </span>
              </label>
            ))}
          </div>
        )}
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

        <Link
          href="/admin/stacks"
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
