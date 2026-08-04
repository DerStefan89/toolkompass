/**
 * Datei: lib/data/pricing.ts
 *
 * Zweck: Leitet Tool.startingPriceCents aus den PricingPlan-Tarifen eines Tools ab,
 * für Tools bei denen mindestens ein Tarif gepflegt ist. Siehe ARCHITECTURE.md,
 * Abschnitt "Preis-Ableitung", für die vollständige Regel.
 *
 * Wird aufgerufen von:
 * - app/admin/tools/pricing-actions.ts (nach jeder PricingPlan-Mutation)
 *
 * Wichtig:
 * - Nur `monthly`-Tarife fließen in die Ableitung ein — startingPriceCents hat kein
 *   eigenes billingCycle-Feld und wird überall implizit als "/Monat" interpretiert.
 * - Gibt es Tarife, aber keinen mit billingCycle "monthly", wird startingPriceCents
 *   auf null gesetzt statt einen falsch etikettierten Jahres-/Einmalpreis zu zeigen.
 * - Wird der letzte verbleibende PricingPlan gelöscht, bleibt der zuletzt abgeleitete
 *   Wert unverändert stehen (kein Reset auf null) — er ist ab dann wieder ein normaler
 *   manueller Wert (state/plan-v2-pricing.md, Entscheidung zum Löschen-Rückweg).
 * - Läuft bewusst NICHT in derselben Transaktion wie der PricingPlan-Write — im Repo
 *   existiert aktuell kein `$transaction`-Pattern, das kurze Konsistenzfenster wird
 *   akzeptiert (state/plan-v2-pricing.md, Risiko 1).
 */

import { prisma } from '@/lib/prisma'

/**
 * Synchronisiert Tool.startingPriceCents mit den PricingPlan-Zeilen eines Tools.
 * @param toolId - ID des betroffenen Tools
 */
export async function syncStartingPrice(toolId: string): Promise<void> {
  const [totalCount, cheapestMonthly] = await Promise.all([
    prisma.pricingPlan.count({ where: { toolId } }),
    prisma.pricingPlan.findFirst({
      where: { toolId, billingCycle: 'monthly' },
      orderBy: { priceCents: 'asc' },
      select: { priceCents: true },
    }),
  ])

  // Keine Tarife mehr vorhanden (letzter Plan gelöscht) — Feld bleibt wie es ist,
  // wird ab jetzt wieder manuell gepflegt statt auf null zurückgesetzt.
  if (totalCount === 0) return

  await prisma.tool.update({
    where: { id: toolId },
    data: { startingPriceCents: cheapestMonthly?.priceCents ?? null },
  })
}
