/**
 * Datei: components/admin/ToolForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Tool-Erstellen und -Bearbeiten.
 * Wird sowohl in /admin/tools/neu als auch /admin/tools/[id] verwendet.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Ansicht mit allen Feldern)
 *
 * Produkt-Kontext:
 * Ermöglicht Redakteuren, Tools mit allen Metadaten zu pflegen.
 * Die Felder entsprechen direkt dem Prisma-Schema (Tool + ToolTranslation).
 *
 * Wichtig:
 * - Slug wird automatisch aus dem Name generiert, kann aber manuell überschrieben werden.
 * - shortDescription ist auf 160 Zeichen begrenzt (SEO-Meta-Description).
 * - Array-Felder (features, strengths, etc.) werden als ein Wert pro Zeile erfasst.
 */

'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { ActionState } from '@/lib/types/admin'
import { toSlug } from '@/lib/utils/form'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type VendorOption = {
  id: string
  name: string
}

export type CategoryOption = {
  id: string
  name: string
}

export type TagGroupOption = {
  id: string
  name: string
  tags: { id: string; name: string }[]
}

export type ToolFormDefaults = {
  name: string
  slug: string
  vendorId: string
  shortDescription: string
  longDescription: string | null
  startingPriceMonthly: number | null
  hasFreePlan: boolean
  isAffiliate: boolean
  published: boolean
  categoryIds: string[]
  tagIds: string[]
  features: string[]
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
  notIdealFor: string[]
}

type ToolFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  vendors: VendorOption[]
  categories: CategoryOption[]
  tagGroups?: TagGroupOption[]
  defaultValues?: ToolFormDefaults
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

export default function ToolForm({ action, vendors, categories, tagGroups = [], defaultValues }: ToolFormProps) {
  const [state, formAction, isPending] = useActionState(action, {})

  // Kontrollierter Zustand — alle müssen kontrolliert sein, damit sie bei
  // Validierungsfehlern nicht auf defaultChecked/defaultValue zurückspringen
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [shortDesc, setShortDesc] = useState(defaultValues?.shortDescription ?? '')
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [hasFreePlan, setHasFreePlan] = useState(defaultValues?.hasFreePlan ?? false)
  const [isAffiliate, setIsAffiliate] = useState(defaultValues?.isAffiliate ?? false)

  // Im Bearbeitungsmodus: Slug ist bereits gesetzt → nicht mehr auto-überschreiben
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
              placeholder="z. B. Zapier"
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

        <Field label="Anbieter" required error={fe.vendorId}>
          <select
            name="vendorId"
            defaultValue={defaultValues?.vendorId ?? ''}
            style={{ ...inputStyle(!!fe.vendorId), cursor: 'pointer' }}
          >
            <option value="">— Anbieter wählen —</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </Field>
      </Section>

      {/* ── Beschreibung ── */}
      <Section title="Beschreibung">
        <Field
          label="Kurzbeschreibung"
          required
          hint={`${shortDesc.length}/160 Zeichen`}
          error={fe.shortDescription}
        >
          <textarea
            name="shortDescription"
            value={shortDesc}
            onChange={e => setShortDesc(e.target.value)}
            placeholder="Prägnante Beschreibung für Listen und Meta-Tags"
            rows={2}
            style={{ ...inputStyle(!!fe.shortDescription), resize: 'vertical' }}
          />
        </Field>

        <Field label="Ausführliche Beschreibung" hint="Markdown wird unterstützt">
          <textarea
            name="longDescription"
            defaultValue={defaultValues?.longDescription ?? ''}
            placeholder="Detaillierte Beschreibung des Tools..."
            rows={6}
            style={{ ...inputStyle(false), resize: 'vertical' }}
          />
        </Field>
      </Section>

      {/* ── Preisgestaltung ── */}
      <Section title="Preisgestaltung">
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', alignItems: 'end' }}>
          <Field label="Preis ab (€/Monat)" error={fe.startingPriceMonthly}>
            <input
              type="number"
              name="startingPriceMonthly"
              defaultValue={defaultValues?.startingPriceMonthly ?? ''}
              placeholder="z. B. 19.99"
              step="0.01"
              min="0"
              style={inputStyle(!!fe.startingPriceMonthly)}
            />
          </Field>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '2px',
          }}>
            {/* Hidden input überträgt den React-State explizit — Checkbox-DOM-Serialisierung
                in React 19 / Next.js 16 ist bei controlled inputs nicht zuverlässig */}
            <input type="hidden" name="hasFreePlan" value={hasFreePlan ? 'on' : ''} />
            <input
              type="checkbox"
              checked={hasFreePlan}
              onChange={e => setHasFreePlan(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Hat einen kostenlosen Plan (Free Tier / Freemium)
          </label>
        </div>
      </Section>

      {/* ── Optionen ── */}
      <Section title="Optionen">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="hidden" name="isAffiliate" value={isAffiliate ? 'on' : ''} />
            <input
              type="checkbox"
              checked={isAffiliate}
              onChange={e => setIsAffiliate(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Affiliate-Link vorhanden (Provisionspartner)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="hidden" name="published" value={published ? 'on' : ''} />
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Veröffentlicht (sichtbar auf der Plattform)
          </label>
        </div>
      </Section>

      {/* ── Kategorien ── */}
      <Section title="Kategorien">
        {categories.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Keine Kategorien vorhanden. Erst Kategorien anlegen.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {categories.map(cat => (
              <label key={cat.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  defaultChecked={defaultValues?.categoryIds.includes(cat.id) ?? false}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        )}
      </Section>

      {/* ── Eigenschaften (Array-Felder, ein Eintrag pro Zeile) ── */}
      <Section title="Eigenschaften">
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '-8px' }}>
          Ein Eintrag pro Zeile. Leere Zeilen werden ignoriert.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Features" hint="Kernfunktionen des Tools">
            <textarea
              name="features"
              defaultValue={defaultValues?.features.join('\n') ?? ''}
              placeholder={'Automatisierung\nWebhook-Unterstützung\n...'}
              rows={5}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Field>

          <Field label="Stärken">
            <textarea
              name="strengths"
              defaultValue={defaultValues?.strengths.join('\n') ?? ''}
              placeholder={'Einfache Einrichtung\nGroße App-Bibliothek\n...'}
              rows={5}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Field>

          <Field label="Schwächen">
            <textarea
              name="weaknesses"
              defaultValue={defaultValues?.weaknesses.join('\n') ?? ''}
              placeholder={'Teuer bei hohem Volumen\n...'}
              rows={5}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Field>

          <Field label="Ideal für">
            <textarea
              name="bestFor"
              defaultValue={defaultValues?.bestFor.join('\n') ?? ''}
              placeholder={'Kleine Teams\nMarketing-Agenturen\n...'}
              rows={5}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Field>

          <Field label="Nicht ideal für">
            <textarea
              name="notIdealFor"
              defaultValue={defaultValues?.notIdealFor.join('\n') ?? ''}
              placeholder={'Entwickler, die API bevorzugen\n...'}
              rows={5}
              style={{ ...inputStyle(false), resize: 'vertical' }}
            />
          </Field>
        </div>
      </Section>

      {/* ── Tags ── */}
      <Section title="Tags">
        {tagGroups.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Keine Tag-Gruppen vorhanden.{' '}
            <Link href="/admin/tags" style={{ color: 'var(--color-cta)', textDecoration: 'none' }}>
              Tags anlegen →
            </Link>
          </p>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '-8px' }}>
              Optional. Mehrere Tags aus verschiedenen Gruppen können gewählt werden.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {tagGroups.map(group => (
                <div key={group.id}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                  }}>
                    {group.name}
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '6px',
                  }}>
                    {group.tags.map(tag => (
                      <label key={tag.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}>
                        <input
                          type="checkbox"
                          name="tagIds"
                          value={tag.id}
                          defaultChecked={defaultValues?.tagIds.includes(tag.id) ?? false}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
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
          href="/admin/tools"
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
