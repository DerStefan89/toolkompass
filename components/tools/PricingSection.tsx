/**
 * Datei: components/tools/PricingSection.tsx
 *
 * Zweck: Zeigt die Preistarife (PricingPlan) eines Tools als Card-Grid auf der
 * Tool-Detailseite. Wird nur gerendert, wenn mindestens ein Tarif existiert —
 * sonst bleibt die bestehende Einstiegspreis-Anzeige im Hero unverändert.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (allgemeine Struktur)
 *   Für die Pricing-Cards keine explizite Referenz — bestehende Design-Tokens
 *   und das Card-Pattern der Seite.
 *
 * Wichtig:
 * - Server Component (kein 'use client') — rein darstellend.
 * - Keine neuen Farben/Schatten/Rundungen, nur Tokens aus globals.css.
 */

import type { PricingPlan, BillingCycle } from '@prisma/client'
import { formatPreis } from '@/lib/utils/format'
import styles from './PricingSection.module.css'

interface PricingSectionProps {
  plans: PricingPlan[] // aus getToolBySlug, bereits nach sortOrder sortiert
  toolName: string
}

/** Zyklus-Suffix hinter dem Preis (nur bei priceCents > 0 angezeigt). */
const CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: '/ Monat',
  yearly: '/ Jahr',
  one_time: 'einmalig',
}

export default function PricingSection({ plans, toolName }: PricingSectionProps) {
  // Defensive: ohne Tarife rendert die Sektion nichts (Fallback greift in der Page).
  if (plans.length === 0) return null

  // Spaltenzahl nach Anzahl der Tarife begrenzen (1 / 2 / max. 3).
  const colClass =
    plans.length === 1 ? styles.cols1 : plans.length === 2 ? styles.cols2 : styles.cols3

  return (
    <section className={styles.section} aria-label={`Preise und Tarife von ${toolName}`}>
      <h2 className={styles.title}>Preise &amp; Tarife</h2>

      <div className={`${styles.grid} ${colClass}`}>
        {plans.map((plan) => {
          const isFree = plan.priceCents === 0
          return (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.isHighlighted ? styles.cardHighlighted : ''}`}
            >
              {plan.isHighlighted && <span className={styles.badge}>Empfohlen</span>}

              <p className={styles.planName}>{plan.name}</p>

              <p className={styles.priceRow}>
                <span className={styles.price}>
                  {formatPreis(plan.priceCents, { hasFreePlan: false })}
                </span>
                {!isFree && (
                  <span className={styles.cycle}>{CYCLE_SUFFIX[plan.billingCycle]}</span>
                )}
              </p>

              {plan.features.length > 0 && (
                <ul className={styles.featureList}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={styles.featureItem}>
                      <span className={styles.featureCheck} aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
