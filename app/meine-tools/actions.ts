/**
 * Datei: app/meine-tools/actions.ts
 *
 * Zweck: Server Action zum Entfernen eines Tools aus dem Stack des Nutzers.
 *
 * Wird aufgerufen von:
 * - components/tools/RemoveToolButton.tsx
 *
 * Wichtig:
 * - Eigentums-Prüfung: ein UserTool wird nur gelöscht, wenn es dem
 *   eingeloggten Nutzer gehört (userId aus Session, nie aus Client-Input).
 */

'use server'

import { prisma } from '@/lib/prisma'
import { BillingCycle } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { parseStr } from '@/lib/utils/form'

export type RemoveToolResult = { success?: boolean; error?: string }
export type UpdatePriceResult = { success?: boolean; error?: string }

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/** Validiert einen Roh-String gegen das BillingCycle-Enum (Fallback: monthly). */
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

/** Wandelt eine Euro-Eingabe ("12,90") in Cent (>= 0) um, sonst null. */
function euroToCents(raw: string): number | null {
  if (raw === '') return null
  const cents = Math.round(parseFloat(raw.replace(',', '.')) * 100)
  if (Number.isNaN(cents) || cents < 0) return null
  return cents
}

/**
 * Entfernt einen Stack-Eintrag des eingeloggten Nutzers.
 *
 * @param userToolId - ID des UserTool-Eintrags
 * @returns { success } oder { error }
 */
export async function removeUserTool(userToolId: string): Promise<RemoveToolResult> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { error: 'Bitte einloggen.' }
  }

  try {
    // Eigentums-Prüfung: gehört der Eintrag wirklich diesem Nutzer?
    const entry = await prisma.userTool.findUnique({
      where: { id: userToolId },
      select: { userId: true },
    })
    if (!entry || entry.userId !== session.userId) {
      return { error: 'Eintrag nicht gefunden.' }
    }

    await prisma.userTool.delete({ where: { id: userToolId } })
    revalidatePath('/meine-tools')
    return { success: true }
  } catch (error) {
    console.error('[removeUserTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Entfernen fehlgeschlagen. Bitte versuche es erneut.' }
  }
}

/**
 * Setzt den Preis-Modus eines Stack-Eintrags: vorhandenen Tarif wählen,
 * eigenen Preis eintragen oder auf den Standardpreis zurücksetzen.
 *
 * @param formData - userToolId, mode ('plan'|'custom'|'standard'),
 *   pricingPlanId (mode=plan), customPriceEuro + billingCycle (mode=custom)
 * @returns { success } oder { error }
 */
export async function updateUserToolPrice(formData: FormData): Promise<UpdatePriceResult> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { error: 'Bitte einloggen.' }
  }

  const userToolId = parseStr(formData, 'userToolId')
  const mode = parseStr(formData, 'mode')
  if (!userToolId) return { error: 'Eintrag fehlt.' }

  try {
    // Eigentums-Prüfung
    const entry = await prisma.userTool.findUnique({
      where: { id: userToolId },
      select: { userId: true, toolId: true },
    })
    if (!entry || entry.userId !== session.userId) {
      return { error: 'Eintrag nicht gefunden.' }
    }

    if (mode === 'plan') {
      const pricingPlanId = parseStr(formData, 'pricingPlanId')
      if (!pricingPlanId) return { error: 'Bitte einen Tarif wählen.' }
      // Plan muss zu DIESEM Tool gehören
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: pricingPlanId },
        select: { toolId: true },
      })
      if (!plan || plan.toolId !== entry.toolId) {
        return { error: 'Ungültiger Tarif.' }
      }
      await prisma.userTool.update({
        where: { id: userToolId },
        data: { pricingPlanId, customPriceCents: null },
      })
    } else if (mode === 'custom') {
      const cents = euroToCents(parseStr(formData, 'customPriceEuro'))
      if (cents === null) return { error: 'Ungültiger Preis (z. B. 12,90).' }
      const billingCycle = parseBillingCycle(parseStr(formData, 'billingCycle'))
      await prisma.userTool.update({
        where: { id: userToolId },
        data: { customPriceCents: cents, billingCycle, pricingPlanId: null },
      })
    } else if (mode === 'standard') {
      await prisma.userTool.update({
        where: { id: userToolId },
        data: { pricingPlanId: null, customPriceCents: null },
      })
    } else {
      return { error: 'Unbekannter Modus.' }
    }

    revalidatePath('/meine-tools')
    return { success: true }
  } catch (error) {
    console.error('[updateUserToolPrice]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Speichern fehlgeschlagen. Bitte versuche es erneut.' }
  }
}
