/**
 * Datei: app/admin/tools/pricing-actions.ts
 *
 * Zweck: Server Actions für die Preistarif-Verwaltung (PricingPlan) pro Tool.
 *
 * Wird aufgerufen von:
 * - components/admin/PricingPlanManager.tsx
 *
 * Wichtig:
 * - Preise werden im Formular in Euro eingegeben ("19,90") und hier in Cent
 *   konvertiert (ARCHITECTURE.md §5 — Geld als Int/Cent).
 * - revalidatePath nach jeder Mutation auf Admin- UND Public-Pfad. Der Slug
 *   wird dafür serverseitig geladen (nicht aus dem Client übernommen).
 * - billingCycle wird gegen das Enum validiert (Fallback: monthly).
 * - Nach create/update/delete wird syncStartingPrice() aufgerufen — leitet
 *   Tool.startingPriceCents aus den Tarifen ab (siehe ARCHITECTURE.md,
 *   Abschnitt "Preis-Ableitung", und lib/data/pricing.ts).
 */

'use server'

import { prisma } from '@/lib/prisma'
import { BillingCycle } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr, parseLines } from '@/lib/utils/form'
import { syncStartingPrice } from '@/lib/data/pricing'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type PricingPlanActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/**
 * Validiert einen Roh-String gegen das BillingCycle-Enum.
 * @param raw - Wert aus dem Select-Feld
 * @returns gültiger BillingCycle-Wert (Fallback: monthly)
 */
function parseBillingCycle(raw: string): BillingCycle {
  switch (raw) {
    case BillingCycle.yearly:
      return BillingCycle.yearly
    case BillingCycle.one_time:
      return BillingCycle.one_time
    default:
      return BillingCycle.monthly
  }
}

/**
 * Wandelt eine Euro-Eingabe ("19,90" oder "19.90") in Cent um.
 * @param raw - Roh-Eingabe aus dem Formular
 * @returns Cent-Betrag (Int, >= 0) oder null bei ungültiger Eingabe
 */
function euroToCents(raw: string): number | null {
  if (raw === '') return null
  const normalized = raw.replace(',', '.')
  const cents = Math.round(parseFloat(normalized) * 100)
  if (Number.isNaN(cents) || cents < 0) return null
  return cents
}

/**
 * Revalidiert den Admin- und den öffentlichen Tool-Pfad nach einer Mutation.
 * Lädt den Slug serverseitig, damit /tools/[slug] korrekt invalidiert wird.
 * Revalidiert zusätzlich die Admin-Übersichtsliste, die startingPriceCents anzeigt
 * und sonst nach einer preisrelevanten Mutation veraltet bliebe.
 */
async function revalidateToolPaths(toolId: string): Promise<void> {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
    select: { slug: true },
  })
  revalidatePath(`/admin/tools/${toolId}`)
  revalidatePath('/admin/tools')
  if (tool) revalidatePath(`/tools/${tool.slug}`)
}

/** Gemeinsames Parsen der Formularfelder für Create und Update. */
function parsePlanForm(formData: FormData): {
  data: {
    name: string
    priceCents: number
    billingCycle: BillingCycle
    features: string[]
    isHighlighted: boolean
    sortOrder: number
  } | null
  errors: Record<string, string>
} {
  const name = parseStr(formData, 'name')
  const priceRaw = parseStr(formData, 'priceEuro')
  const billingCycle = parseBillingCycle(parseStr(formData, 'billingCycle'))
  const features = parseLines(formData, 'features')
  const isHighlighted = formData.get('isHighlighted') === 'on'
  const sortOrderParsed = parseInt(parseStr(formData, 'sortOrder'), 10)
  const sortOrder = Number.isNaN(sortOrderParsed) ? 0 : sortOrderParsed

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name ist erforderlich.'

  const priceCents = euroToCents(priceRaw)
  if (priceCents === null) errors.priceEuro = 'Ungültiger Preis (z. B. 19,90).'

  if (Object.keys(errors).length > 0 || priceCents === null) {
    return { data: null, errors }
  }

  return {
    data: { name, priceCents, billingCycle, features, isHighlighted, sortOrder },
    errors,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/**
 * Erstellt einen neuen Preistarif für ein Tool.
 * @param formData - toolId, name, priceEuro, billingCycle, features, isHighlighted, sortOrder
 */
export async function createPricingPlan(formData: FormData): Promise<PricingPlanActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const toolId = parseStr(formData, 'toolId')
  if (!toolId) return { error: 'Tool-ID fehlt.' }

  const { data, errors } = parsePlanForm(formData)
  if (!data) return { fieldErrors: errors }

  try {
    await prisma.pricingPlan.create({
      data: { toolId, ...data },
    })
  } catch (error) {
    console.error('[createPricingPlan]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  await syncStartingPrice(toolId)
  await revalidateToolPaths(toolId)
  return { success: true }
}

/**
 * Aktualisiert einen bestehenden Preistarif.
 * @param formData - id, toolId + dieselben Felder wie createPricingPlan
 */
export async function updatePricingPlan(formData: FormData): Promise<PricingPlanActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const id = parseStr(formData, 'id')
  const toolId = parseStr(formData, 'toolId')
  if (!id || !toolId) return { error: 'Tarif- oder Tool-ID fehlt.' }

  const { data, errors } = parsePlanForm(formData)
  if (!data) return { fieldErrors: errors }

  try {
    await prisma.pricingPlan.update({
      where: { id },
      data,
    })
  } catch (error) {
    console.error('[updatePricingPlan]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  await syncStartingPrice(toolId)
  await revalidateToolPaths(toolId)
  return { success: true }
}

/**
 * Löscht einen Preistarif dauerhaft.
 * @param formData - id, toolId
 */
export async function deletePricingPlan(formData: FormData): Promise<PricingPlanActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const id = parseStr(formData, 'id')
  const toolId = parseStr(formData, 'toolId')
  if (!id || !toolId) return { error: 'Tarif- oder Tool-ID fehlt.' }

  try {
    await prisma.pricingPlan.delete({ where: { id } })
  } catch (error) {
    console.error('[deletePricingPlan]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Löschen. Bitte versuche es erneut.' }
  }

  await syncStartingPrice(toolId)
  await revalidateToolPaths(toolId)
  return { success: true }
}

/**
 * Setzt die Reihenfolge mehrerer Preistarife neu (sortOrder = Index).
 * @param formData - toolId + ids (JSON-String eines geordneten string[])
 */
export async function reorderPricingPlans(formData: FormData): Promise<PricingPlanActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const toolId = parseStr(formData, 'toolId')
  if (!toolId) return { error: 'Tool-ID fehlt.' }

  let ids: string[]
  try {
    const parsed: unknown = JSON.parse(parseStr(formData, 'ids') || '[]')
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === 'string')) {
      return { error: 'Ungültige Sortier-Daten.' }
    }
    ids = parsed
  } catch {
    return { error: 'Ungültige Sortier-Daten.' }
  }

  try {
    await Promise.all(
      ids.map((id, index) =>
        prisma.pricingPlan.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )
  } catch (error) {
    console.error('[reorderPricingPlans]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Sortieren. Bitte versuche es erneut.' }
  }

  await revalidateToolPaths(toolId)
  return { success: true }
}
