/**
 * Datei: components/tools/ToolPriceEditor.tsx
 *
 * Zweck: Einklappbarer Editor pro Stack-Eintrag (/meine-tools), mit dem der
 * Nutzer wählt, was er zahlt: Standardpreis, vorhandener Tarif oder eigener Preis.
 * Client Component wegen useState/useTransition.
 *
 * Wird aufgerufen von:
 * - app/meine-tools/page.tsx (pro Tool-Zeile)
 *
 * Wichtig:
 * - Kein Prisma-Import — die Action kommt als RPC-Referenz; lokaler
 *   BillingCycleValue-Typ statt @prisma/client.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatPreis } from '@/lib/utils/format'
import { updateUserToolPrice } from '@/app/meine-tools/actions'
import styles from './ToolPriceEditor.module.css'

export type BillingCycleValue = 'monthly' | 'yearly' | 'one_time'
type Mode = 'standard' | 'plan' | 'custom'

interface PlanOption {
  id: string
  name: string
  priceCents: number
  billingCycle: BillingCycleValue
}

interface ToolPriceEditorProps {
  userToolId: string
  /** Vom Server übergeben; Plan-Validierung passiert serverseitig. */
  toolId: string
  availablePlans: PlanOption[]
  currentPricingPlanId: string | null
  currentCustomPriceCents: number | null
  currentBillingCycle: BillingCycleValue
}

const CYCLE_SUFFIX: Record<BillingCycleValue, string> = {
  monthly: '/ Monat',
  yearly: '/ Jahr',
  one_time: 'einmalig',
}

/** Leitet den initial vorausgewählten Modus aus dem aktuellen Zustand ab. */
function initialMode(planId: string | null, custom: number | null): Mode {
  if (planId) return 'plan'
  if (custom != null) return 'custom'
  return 'standard'
}

export default function ToolPriceEditor({
  userToolId,
  availablePlans,
  currentPricingPlanId,
  currentCustomPriceCents,
  currentBillingCycle,
}: ToolPriceEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>(initialMode(currentPricingPlanId, currentCustomPriceCents))
  const [planId, setPlanId] = useState(currentPricingPlanId ?? availablePlans[0]?.id ?? '')
  const [customEuro, setCustomEuro] = useState(
    currentCustomPriceCents != null
      ? (currentCustomPriceCents / 100).toFixed(2).replace('.', ',')
      : ''
  )
  const [cycle, setCycle] = useState<BillingCycleValue>(currentBillingCycle)
  const [error, setError] = useState<string | null>(null)

  const hasPlans = availablePlans.length > 0

  function handleSave() {
    setError(null)
    const fd = new FormData()
    fd.set('userToolId', userToolId)
    fd.set('mode', mode)
    if (mode === 'plan') fd.set('pricingPlanId', planId)
    if (mode === 'custom') {
      fd.set('customPriceEuro', customEuro)
      fd.set('billingCycle', cycle)
    }
    startTransition(async () => {
      const res = await updateUserToolPrice(fd)
      if (res.success) {
        setOpen(false)
        router.refresh()
      } else {
        setError(res.error ?? 'Speichern fehlgeschlagen.')
      }
    })
  }

  if (!open) {
    return (
      <button type="button" className={styles.toggle} onClick={() => setOpen(true)}>
        Preis anpassen ▾
      </button>
    )
  }

  return (
    <div className={styles.editor}>
      {error && <p className={styles.error}>{error}</p>}

      {/* Standardpreis */}
      <label className={styles.option}>
        <input
          type="radio"
          name={`mode-${userToolId}`}
          checked={mode === 'standard'}
          onChange={() => setMode('standard')}
        />
        <span>Standardpreis verwenden</span>
      </label>

      {/* Tarif wählen — nur wenn Pläne existieren */}
      {hasPlans && (
        <>
          <label className={styles.option}>
            <input
              type="radio"
              name={`mode-${userToolId}`}
              checked={mode === 'plan'}
              onChange={() => setMode('plan')}
            />
            <span>Tarif wählen</span>
          </label>
          {mode === 'plan' && (
            <select
              className={styles.select}
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} – {formatPreis(p.priceCents)}
                  {p.priceCents > 0 ? ` ${CYCLE_SUFFIX[p.billingCycle]}` : ''}
                </option>
              ))}
            </select>
          )}
        </>
      )}

      {/* Eigener Preis */}
      <label className={styles.option}>
        <input
          type="radio"
          name={`mode-${userToolId}`}
          checked={mode === 'custom'}
          onChange={() => setMode('custom')}
        />
        <span>Eigener Preis</span>
      </label>
      {mode === 'custom' && (
        <div className={styles.customRow}>
          <input
            type="text"
            inputMode="decimal"
            className={styles.priceInput}
            placeholder="z. B. 12,90"
            value={customEuro}
            onChange={(e) => setCustomEuro(e.target.value)}
          />
          <select
            className={styles.select}
            value={cycle}
            onChange={(e) => setCycle(e.target.value as BillingCycleValue)}
          >
            <option value="monthly">/ Monat</option>
            <option value="yearly">/ Jahr</option>
            <option value="one_time">einmalig</option>
          </select>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={isPending}>
          {isPending ? 'Speichern …' : 'Speichern'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
