/**
 * Datei: components/admin/AffiliateLinkManager.tsx
 *
 * Zweck: Inline-Verwaltung von Affiliate-Links pro Tool auf der Bearbeitungsseite.
 * Zeigt bestehende Links in einer Liste und erlaubt Hinzufügen, Aktivieren/Deaktivieren,
 * Als Primär markieren und Löschen — alles ohne Seitennavigation.
 *
 * Wichtig:
 * - Nach jeder Mutation wird router.refresh() aufgerufen, damit der Server
 *   Component die Seite mit frischen DB-Daten neu rendert und neue Props liefert.
 * - trackingSlug wird auto-generiert aus Tool-Slug + Label, ist aber editierbar.
 * - isPrimary-Exklusivität wird serverseitig garantiert (Transaktion).
 */

'use client'

import { useActionState, useTransition, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  createAffiliateLink,
  toggleAffiliateActive,
  setAffiliatePrimary,
  deleteAffiliateLink,
} from '@/app/admin/tools/affiliate-actions'
import type { AffiliateLinkActionState } from '@/app/admin/tools/affiliate-actions'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type AffiliateLinkData = {
  id: string
  label: string
  url: string
  trackingSlug: string
  isActive: boolean
  isPrimary: boolean
}

type Props = {
  toolId: string
  toolSlug: string
  links: AffiliateLinkData[]
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

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '7px 10px',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-btn)',
    fontSize: '13px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
    boxSizing: 'border-box',
    outline: 'none',
  }
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export default function AffiliateLinkManager({ toolId, toolSlug, links }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)

  // Formular-State für neuen Link
  const [addLabel, setAddLabel] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addSlugIsManual, setAddSlugIsManual] = useState(false)

  // Server Action für "Erstellen" — toolId wird eingebunden
  const boundCreate = createAffiliateLink.bind(null, toolId)
  const [createState, createFormAction, isCreating] = useActionState<AffiliateLinkActionState, FormData>(boundCreate, {})

  // Formular schließen und Seite auffrischen wenn Erstellen erfolgreich war
  useEffect(() => {
    if (createState.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowAddForm(false)
      setAddLabel('')
      setAddSlug('')
      setAddSlugIsManual(false)
      router.refresh()
    }
  }, [createState.success, router])

  function handleAddLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setAddLabel(val)
    if (!addSlugIsManual) setAddSlug(toSlug(`${toolSlug}-${val}`))
  }

  function handleAddSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddSlug(e.target.value)
    setAddSlugIsManual(true)
  }

  function handleToggleActive(link: AffiliateLinkData) {
    startTransition(async () => {
      await toggleAffiliateActive(link.id, toolId, !link.isActive)
      router.refresh()
    })
  }

  function handleSetPrimary(link: AffiliateLinkData) {
    if (link.isPrimary) return
    startTransition(async () => {
      await setAffiliatePrimary(link.id, toolId)
      router.refresh()
    })
  }

  function handleDelete(link: AffiliateLinkData) {
    if (!window.confirm(`Affiliate-Link "${link.label}" wirklich löschen?`)) return
    startTransition(async () => {
      await deleteAffiliateLink(link.id, toolId)
      router.refresh()
    })
  }

  const fe = createState.fieldErrors ?? {}

  return (
    <div style={{
      marginTop: '24px',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: links.length > 0 || showAddForm ? '1px solid var(--color-border)' : 'none',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div>
          <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Affiliate-Links
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {links.length === 0 ? 'Noch keine Links' : `${links.length} ${links.length === 1 ? 'Link' : 'Links'} · ${links.filter(l => l.isActive).length} aktiv`}
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '7px 16px',
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + Link hinzufügen
          </button>
        )}
      </div>

      {/* Bestehende Links */}
      {links.map((link, index) => (
        <div
          key={link.id}
          style={{
            padding: '14px 24px',
            borderBottom: index < links.length - 1 || showAddForm ? '1px solid var(--color-border)' : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {link.label}
              </span>
              {link.isPrimary && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                }}>
                  Primär
                </span>
              )}
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                backgroundColor: link.isActive ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
                color: link.isActive ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
                fontWeight: '600',
              }}>
                {link.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {link.url}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              Slug: {link.trackingSlug}
            </p>
          </div>

          {/* Aktionen */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            {/* Primär setzen */}
            {!link.isPrimary && (
              <button
                type="button"
                onClick={() => handleSetPrimary(link)}
                disabled={isPending}
                title="Als primären Link markieren"
                style={{
                  padding: '5px 10px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                Als Primär
              </button>
            )}

            {/* Aktiv/Inaktiv Toggle */}
            <button
              type="button"
              onClick={() => handleToggleActive(link)}
              disabled={isPending}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                color: link.isActive ? 'var(--color-text-secondary)' : 'var(--color-success-text)',
                backgroundColor: 'transparent',
                border: `1px solid ${link.isActive ? 'var(--color-border)' : 'var(--color-success-text)'}`,
                borderRadius: 'var(--radius-btn)',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {link.isActive ? 'Deaktivieren' : 'Aktivieren'}
            </button>

            {/* Löschen */}
            <button
              type="button"
              onClick={() => handleDelete(link)}
              disabled={isPending}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                color: 'var(--color-error)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-btn)',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              Löschen
            </button>
          </div>
        </div>
      ))}

      {/* Inline-Formular für neuen Link */}
      {showAddForm && (
        <form action={createFormAction} style={{ padding: '20px 24px' }}>

          {/* Allgemeiner Fehler */}
          {createState.error && (
            <div style={{
              padding: '10px 14px',
              marginBottom: '16px',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-btn)',
              color: 'var(--color-error)',
              fontSize: '13px',
            }}>
              {createState.error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {/* Label */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                Label <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                name="label"
                value={addLabel}
                onChange={handleAddLabelChange}
                placeholder="z. B. Hauptlink, Partner A"
                style={inputStyle(!!fe.label)}
              />
              {fe.label && <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '3px' }}>{fe.label}</p>}
            </div>

            {/* Tracking-Slug */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                Tracking-Slug <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                name="trackingSlug"
                value={addSlug}
                onChange={handleAddSlugChange}
                placeholder="wird automatisch generiert"
                style={{ ...inputStyle(!!fe.trackingSlug), fontFamily: 'monospace', fontSize: '12px' }}
              />
              {fe.trackingSlug && <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '3px' }}>{fe.trackingSlug}</p>}
            </div>
          </div>

          {/* URL */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
              Affiliate-URL <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              type="url"
              name="url"
              placeholder="https://partner.example.com/ref=..."
              style={inputStyle(!!fe.url)}
            />
            {fe.url && <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '3px' }}>{fe.url}</p>}
          </div>

          {/* isPrimary */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' }}>
            <input
              type="checkbox"
              name="isPrimary"
              style={{ width: '15px', height: '15px', cursor: 'pointer' }}
            />
            Als primären Link markieren
            {links.some(l => l.isPrimary) && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                (ersetzt aktuellen Primär-Link)
              </span>
            )}
          </label>

          {/* Submit / Abbrechen */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={isCreating}
              style={{
                padding: '8px 20px',
                backgroundColor: isCreating ? 'var(--color-text-secondary)' : 'var(--color-cta)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isCreating ? 'not-allowed' : 'pointer',
              }}
            >
              {isCreating ? 'Wird gespeichert…' : 'Link speichern'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setAddLabel('')
                setAddSlug('')
                setAddSlugIsManual(false)
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {links.length === 0 && !showAddForm && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
          Noch keine Affiliate-Links. Klicke auf &ldquo;Link hinzufügen&rdquo; um einen zu erstellen.
        </div>
      )}
    </div>
  )
}
