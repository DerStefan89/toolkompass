/**
 * Datei: lib/utils/stack-costs.ts
 *
 * Zweck: Berechnet die monatlichen und einmaligen Kosten eines Tool-Stacks.
 *
 * Regeln:
 * - Jahres-Tarife werden für die Monatssumme durch 12 geteilt.
 * - Einmalkäufe (one_time) fließen NICHT in die Monatssumme,
 *   sondern werden separat als Einmalkosten summiert.
 * - Preis-Priorität pro Tool:
 *   1. customPriceCents (selbst eingetragen) — falls gesetzt
 *   2. pricingPlan.priceCents (gewählter Tarif)
 *   3. tool.startingPriceCents (Fallback)
 *   4. 0 (wenn nichts bekannt)
 */

import type { BillingCycle } from '@prisma/client'

/**
 * Minimale Struktur eines Stack-Eintrags, die für die Kostenberechnung
 * gebraucht wird. Das Ergebnis von getUserTools ist hierzu strukturell
 * kompatibel (zusätzliche Felder stören nicht).
 */
export type StackCostEntry = {
  customPriceCents: number | null
  billingCycle: BillingCycle
  pricingPlan: { priceCents: number; billingCycle: BillingCycle } | null
  tool: { startingPriceCents: number | null }
}

export type StackCosts = {
  monthlyCents: number // Summe aller monatlichen Kosten (yearly /12 eingerechnet)
  oneTimeCents: number // Summe aller Einmalkäufe
  monthlyCount: number // Anzahl Tools mit laufenden Kosten
  oneTimeCount: number // Anzahl Einmalkäufe
}

/**
 * Ermittelt den effektiven Preis eines einzelnen Stack-Eintrags nach
 * Priorität: customPriceCents → pricingPlan → tool.startingPriceCents → 0.
 *
 * @param entry - Stack-Eintrag (UserTool mit Tool + PricingPlan)
 * @returns { cents, cycle } — effektiver Preis und zugehöriger Abrechnungszyklus
 */
export function getEffectivePrice(entry: StackCostEntry): {
  cents: number
  cycle: BillingCycle
} {
  if (entry.customPriceCents != null) {
    return { cents: entry.customPriceCents, cycle: entry.billingCycle }
  }
  if (entry.pricingPlan) {
    return { cents: entry.pricingPlan.priceCents, cycle: entry.pricingPlan.billingCycle }
  }
  if (entry.tool.startingPriceCents != null) {
    // Annahme: Startpreis ist monatlich
    return { cents: entry.tool.startingPriceCents, cycle: 'monthly' }
  }
  return { cents: 0, cycle: 'monthly' }
}

/**
 * Summiert die Kosten eines ganzen Stacks.
 * Jahres-Tarife werden für die Monatssumme durch 12 geteilt; Einmalkäufe
 * werden separat ausgewiesen.
 *
 * @param entries - alle Stack-Einträge des Nutzers
 * @returns Monats- und Einmalsummen samt Anzahl
 */
export function calculateStackCosts(entries: StackCostEntry[]): StackCosts {
  let monthlyCents = 0
  let oneTimeCents = 0
  let monthlyCount = 0
  let oneTimeCount = 0

  for (const entry of entries) {
    const { cents, cycle } = getEffectivePrice(entry)
    if (cycle === 'one_time') {
      oneTimeCents += cents
      oneTimeCount += 1
    } else if (cycle === 'yearly') {
      monthlyCents += Math.round(cents / 12)
      monthlyCount += 1
    } else {
      monthlyCents += cents
      monthlyCount += 1
    }
  }

  return { monthlyCents, oneTimeCents, monthlyCount, oneTimeCount }
}
