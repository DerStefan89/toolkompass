/**
 * Datei: components/admin/VergleichForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Vergleich-Erstellen und -Bearbeiten.
 *
 * Wichtig:
 * - Tool A und Tool B sind kontrollierte Selects, weil der Slug auto-generiert wird
 *   und Tool B die gewählte Tool-A-Option ausfiltert.
 * - Rows werden in React-State verwaltet (dynamisch hinzufügen/entfernen).
 *   Beim Submit überträgt FormData die row-Inputs als parallele Arrays
 *   (name="criterion", name="toolAValue", name="toolBValue") — gleicher Index = gleiche Zeile.
 * - published ist kontrolliert (Checkbox-Reset-Bug nach Validation-Fehler).
 * - verdict ist unkontrolliert (defaultValue), da kein programmatischer Zugriff nötig.
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

type RowData = {
  key: string
  criterion: string
  toolAValue: string
  toolBValue: string
}

export type VergleichFormDefaults = {
  toolAId: string
  toolBId: string
  slug: string
  verdict: string
  published: boolean
  rows: Array<{ criterion: string; toolAValue: string; toolBValue: string }>
}

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  tools: ToolOption[]
  defaultValues?: VergleichFormDefaults
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function genSlug(toolAId: string, toolBId: string, tools: ToolOption[]): string {
  const a = tools.find(t => t.id === toolAId)?.slug ?? ''
  const b = tools.find(t => t.id === toolBId)?.slug ?? ''
  return a && b ? `${a}-vs-${b}` : ''
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

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export default function VergleichForm({ action, tools, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [toolAId, setToolAId] = useState(defaultValues?.toolAId ?? '')
  const [toolBId, setToolBId] = useState(defaultValues?.toolBId ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugIsManual, setSlugIsManual] = useState(!!defaultValues)
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [rows, setRows] = useState<RowData[]>(
    defaultValues?.rows.map((r, i) => ({ key: String(i), ...r })) ?? []
  )

  function handleToolAChange(id: string) {
    setToolAId(id)
    if (!slugIsManual) setSlug(genSlug(id, toolBId, tools))
  }

  function handleToolBChange(id: string) {
    setToolBId(id)
    if (!slugIsManual) setSlug(genSlug(toolAId, id, tools))
  }

  function addRow() {
    setRows(prev => [
      ...prev,
      { key: String(Date.now()), criterion: '', toolAValue: '', toolBValue: '' },
    ])
  }

  function removeRow(key: string) {
    setRows(prev => prev.filter(r => r.key !== key))
  }

  function updateRow(key: string, field: keyof Omit<RowData, 'key'>, value: string) {
    setRows(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r))
  }

  const fe = state.fieldErrors ?? {}

  const toolAName = tools.find(t => t.id === toolAId)?.name ?? 'Tool A'
  const toolBName = tools.find(t => t.id === toolBId)?.name ?? 'Tool B'

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

      {/* ── Verglichene Tools ── */}
      <Section title="Verglichene Tools">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          <Field label="Tool A" required error={fe.toolAId}>
            <select
              name="toolAId"
              value={toolAId}
              onChange={e => handleToolAChange(e.target.value)}
              style={inputStyle(!!fe.toolAId)}
            >
              <option value="">— Tool wählen —</option>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Tool B" required error={fe.toolBId}>
            <select
              name="toolBId"
              value={toolBId}
              onChange={e => handleToolBChange(e.target.value)}
              style={inputStyle(!!fe.toolBId)}
            >
              <option value="">— Tool wählen —</option>
              {/* Tool A wird aus der Tool-B-Auswahl ausgefiltert */}
              {tools.filter(t => t.id !== toolAId).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

        </div>
      </Section>

      {/* ── Basisdaten ── */}
      <Section title="Basisdaten">

        <Field
          label="Slug"
          required
          hint="URL-Kennung — wird automatisch aus den Tool-Slugs generiert"
          error={fe.slug}
        >
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugIsManual(true) }}
            placeholder="z. B. notion-vs-obsidian"
            style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
          />
        </Field>

        <Field
          label="Fazit (Verdict)"
          required
          hint="Markdown erlaubt — abschließende Empfehlung für den Leser"
          error={fe.verdict}
        >
          <textarea
            name="verdict"
            defaultValue={defaultValues?.verdict ?? ''}
            placeholder="Welches Tool empfehlen wir und für wen? …"
            rows={6}
            style={{ ...inputStyle(!!fe.verdict), resize: 'vertical' }}
          />
        </Field>

      </Section>

      {/* ── Vergleichszeilen ── */}
      <Section title="Vergleichszeilen">

        {rows.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 36px',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '4px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Kriterium
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {toolAName}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {toolBName}
            </span>
            <span />
          </div>
        )}

        {rows.map(row => (
          <div
            key={row.key}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 36px',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              name="criterion"
              value={row.criterion}
              onChange={e => updateRow(row.key, 'criterion', e.target.value)}
              placeholder="z. B. Preis, Benutzerfreundlichkeit"
              style={inputStyle(false)}
            />
            <input
              type="text"
              name="toolAValue"
              value={row.toolAValue}
              onChange={e => updateRow(row.key, 'toolAValue', e.target.value)}
              placeholder="Wert für Tool A"
              style={inputStyle(false)}
            />
            <input
              type="text"
              name="toolBValue"
              value={row.toolBValue}
              onChange={e => updateRow(row.key, 'toolBValue', e.target.value)}
              placeholder="Wert für Tool B"
              style={inputStyle(false)}
            />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              title="Zeile entfernen"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-btn)',
                color: 'var(--color-error)',
                fontSize: '16px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          style={{
            alignSelf: 'flex-start',
            padding: '7px 16px',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-btn)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + Zeile hinzufügen
        </button>

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
          href="/admin/vergleiche"
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
