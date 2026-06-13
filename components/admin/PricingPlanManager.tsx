/**
 * Datei: components/admin/PricingPlanManager.tsx
 *
 * Zweck: Inline-Verwaltung der Preistarife (PricingPlan) pro Tool auf der
 * Bearbeitungsseite. Zeigt bestehende Tarife in einer Liste und erlaubt
 * Hinzufügen, Bearbeiten und Löschen — alles ohne Seitennavigation.
 *
 * Wird aufgerufen von:
 * - app/admin/tools/[id]/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-Import: Daten kommen als bereits gemappte PricingPlanData-Props.
 * - Preise werden in Euro eingegeben ("19,90"), nicht in Cent.
 * - Nach jeder Mutation router.refresh(), damit die Server-Component-Seite
 *   mit frischen DB-Daten neu rendert (gleiches Muster wie AffiliateLinkManager).
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatPreis } from '@/lib/utils/format'
import {
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
} from '@/app/admin/tools/pricing-actions'

// ─── Typen ──────────────────────────────────────────────────────────────────

/** Lokale Billing-Zyklus-Werte — bewusst ohne Prisma-Import im Client. */
export type BillingCycleValue = 'monthly' | 'yearly' | 'one_time'

export type PricingPlanData = {
  id: string
  name: string
  priceCents: number
  billingCycle: BillingCycleValue
  features: string[]
  isHighlighted: boolean
  sortOrder: number
}

type Props = {
  toolId: string
  /** Wird von der Seite übergeben; die Revalidierung des Public-Pfads lädt den
   *  Slug serverseitig (pricing-actions.ts), daher hier nicht client-seitig genutzt. */
  toolSlug: string
  plans: PricingPlanData[]
}

// ─── Konstanten ──────────────────────────────────────────────────────────────

const CYCLE_LABELS: Record<BillingCycleValue, string> = {
  monthly: 'Monatlich',
  yearly: 'Jährlich',
  one_time: 'Einmalig',
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  marginBottom: '4px',
  color: 'var(--color-text-primary)',
}

/** Wandelt Cent in eine Euro-Eingabe für das Formular ("1990" → "19,90"). */
function centsToEuroInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

// ─── Haupt-Komponente ──────────────────────────────────────────────────────────

export default function PricingPlanManager({ toolId, plans }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // null = Formular geschlossen, '' = neuer Tarif, sonst = ID des bearbeiteten Tarifs
  const [editing, setEditing] = useState<string | null>(null)

  // Formularfelder
  const [name, setName] = useState('')
  const [priceEuro, setPriceEuro] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycleValue>('monthly')
  const [features, setFeatures] = useState('')
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [sortOrder, setSortOrder] = useState('0')

  // Fehler aus der Server Action
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function resetForm() {
    setEditing(null)
    setName('')
    setPriceEuro('')
    setBillingCycle('monthly')
    setFeatures('')
    setIsHighlighted(false)
    setSortOrder('0')
    setError(null)
    setFieldErrors({})
  }

  function openAdd() {
    resetForm()
    setEditing('')
  }

  function openEdit(plan: PricingPlanData) {
    setEditing(plan.id)
    setName(plan.name)
    setPriceEuro(centsToEuroInput(plan.priceCents))
    setBillingCycle(plan.billingCycle)
    setFeatures(plan.features.join('\n'))
    setIsHighlighted(plan.isHighlighted)
    setSortOrder(String(plan.sortOrder))
    setError(null)
    setFieldErrors({})
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const fd = new FormData()
    fd.set('toolId', toolId)
    fd.set('name', name)
    fd.set('priceEuro', priceEuro)
    fd.set('billingCycle', billingCycle)
    fd.set('features', features)
    if (isHighlighted) fd.set('isHighlighted', 'on')
    fd.set('sortOrder', sortOrder)

    const isEdit = editing !== '' && editing !== null
    if (isEdit) fd.set('id', editing)

    startTransition(async () => {
      const result = isEdit ? await updatePricingPlan(fd) : await createPricingPlan(fd)
      if (result.success) {
        resetForm()
        router.refresh()
      } else {
        setError(result.error ?? null)
        setFieldErrors(result.fieldErrors ?? {})
      }
    })
  }

  function handleDelete(plan: PricingPlanData) {
    if (!window.confirm(`Preistarif "${plan.name}" wirklich löschen?`)) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', plan.id)
      fd.set('toolId', toolId)
      await deletePricingPlan(fd)
      router.refresh()
    })
  }

  const formOpen = editing !== null
  const fe = fieldErrors

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
        borderBottom: plans.length > 0 || formOpen ? '1px solid var(--color-border)' : 'none',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div>
          <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Preistarife
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {plans.length === 0 ? 'Noch keine Tarife' : `${plans.length} ${plans.length === 1 ? 'Tarif' : 'Tarife'}`}
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openAdd}
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
            + Tarif hinzufügen
          </button>
        )}
      </div>

      {/* Bestehende Tarife */}
      {plans.map((plan, index) => (
        <div
          key={plan.id}
          style={{
            padding: '14px 24px',
            borderBottom: index < plans.length - 1 || formOpen ? '1px solid var(--color-border)' : 'none',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {plan.name}
              </span>
              {plan.isHighlighted && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                }}>
                  Hervorgehoben
                </span>
              )}
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-badge-bg)',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
              }}>
                {CYCLE_LABELS[plan.billingCycle]}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '600', marginBottom: '2px' }}>
              {formatPreis(plan.priceCents)}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {plan.features.length === 0
                ? 'Keine Features'
                : `${plan.features.length} ${plan.features.length === 1 ? 'Feature' : 'Features'}`}
            </p>
          </div>

          {/* Aktionen */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => openEdit(plan)}
              disabled={isPending}
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
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => handleDelete(plan)}
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

      {/* Inline-Formular für neuen / bearbeiteten Tarif */}
      {formOpen && (
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>

          {/* Allgemeiner Fehler */}
          {error && (
            <div style={{
              padding: '10px 14px',
              marginBottom: '16px',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-btn)',
              color: 'var(--color-error)',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {/* Name */}
            <div>
              <label style={labelStyle}>
                Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Starter, Pro, Enterprise"
                style={inputStyle(!!fe.name)}
              />
              {fe.name && <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '3px' }}>{fe.name}</p>}
            </div>

            {/* Preis in Euro */}
            <div>
              <label style={labelStyle}>
                Preis in Euro <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={priceEuro}
                onChange={(e) => setPriceEuro(e.target.value)}
                placeholder="z. B. 19,90 (0 = kostenlos)"
                style={inputStyle(!!fe.priceEuro)}
              />
              {fe.priceEuro && <p style={{ fontSize: '11px', color: 'var(--color-error)', marginTop: '3px' }}>{fe.priceEuro}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {/* Billing-Zyklus */}
            <div>
              <label style={labelStyle}>Abrechnung</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycleValue)}
                style={inputStyle(false)}
              >
                <option value="monthly">Monatlich</option>
                <option value="yearly">Jährlich</option>
                <option value="one_time">Einmalig</option>
              </select>
            </div>

            {/* Sortierung */}
            <div>
              <label style={labelStyle}>Sortierung</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={inputStyle(false)}
              />
            </div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>Features (eine pro Zeile)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
              placeholder={'5 Nutzer\n10 GB Speicher\nE-Mail-Support'}
              style={{ ...inputStyle(false), resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* isHighlighted */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px' }}>
            <input
              type="checkbox"
              checked={isHighlighted}
              onChange={(e) => setIsHighlighted(e.target.checked)}
              style={{ width: '15px', height: '15px', cursor: 'pointer' }}
            />
            Als hervorgehobenen Tarif markieren
          </label>

          {/* Submit / Abbrechen */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '8px 20px',
                backgroundColor: isPending ? 'var(--color-text-secondary)' : 'var(--color-cta)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Wird gespeichert…' : 'Tarif speichern'}
            </button>
            <button
              type="button"
              onClick={resetForm}
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
      {plans.length === 0 && !formOpen && (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
          Noch keine Preistarife angelegt.
        </div>
      )}
    </div>
  )
}
