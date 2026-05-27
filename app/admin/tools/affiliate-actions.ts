/**
 * Datei: app/admin/tools/affiliate-actions.ts
 *
 * Zweck: Server Actions für Affiliate-Link-Verwaltung pro Tool.
 *
 * Wird aufgerufen von:
 * - components/admin/AffiliateLinkManager.tsx
 *
 * Wichtig:
 * - trackingSlug muss global eindeutig sein (@@unique im Schema).
 * - isPrimary-Logik: setAffiliatePrimary setzt alle anderen Links des Tools
 *   auf isPrimary: false bevor der gewählte auf true gesetzt wird (Transaktion).
 * - revalidatePath nach jeder Mutation, kein redirect (Inline-Management).
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { toSlug, parseStr } from '@/lib/utils/form'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type AffiliateLinkActionState = {
  error?: string
  fieldErrors?: Record<string, string>
  success?: boolean
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt einen neuen Affiliate-Link für ein Tool.
// toolId wird per .bind(null, toolId) in AffiliateLinkManager vorgefüllt.
export async function createAffiliateLink(
  toolId: string,
  _prev: AffiliateLinkActionState,
  formData: FormData
): Promise<AffiliateLinkActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const label        = parseStr(formData, 'label')
  const url          = parseStr(formData, 'url')
  const trackingSlug = parseStr(formData, 'trackingSlug') || toSlug(`${toolId.slice(0, 6)}-${label}`)
  const isPrimary    = formData.get('isPrimary') === 'on'

  const errors: Record<string, string> = {}
  if (!label) errors.label = 'Label ist erforderlich.'
  if (!url) {
    errors.url = 'URL ist erforderlich.'
  } else if (!/^https?:\/\/.+/.test(url)) {
    errors.url = 'Gültige URL erforderlich (beginnt mit http:// oder https://).'
  }
  if (!trackingSlug) {
    errors.trackingSlug = 'Tracking-Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(trackingSlug)) {
    errors.trackingSlug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }

  if (Object.keys(errors).length > 0) return { fieldErrors: errors }

  // trackingSlug auf Eindeutigkeit prüfen
  const duplicate = await prisma.affiliateLink.findUnique({
    where: { trackingSlug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { trackingSlug: 'Dieser Tracking-Slug ist bereits vergeben.' } }

  try {
    await prisma.$transaction(async (tx) => {
      // Wenn als primär markiert: alle anderen Links dieses Tools zurücksetzen
      if (isPrimary) {
        await tx.affiliateLink.updateMany({
          where: { toolId },
          data:  { isPrimary: false },
        })
      }
      await tx.affiliateLink.create({
        data: { toolId, label, url, trackingSlug, isPrimary, isActive: true },
      })
    })
  } catch (error) {
    console.error('[createAffiliateLink]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath(`/admin/tools/${toolId}`)
  return { success: true }
}

// Schaltet isActive eines Links um.
// Der neue Zielwert wird direkt übergeben (der Client kennt den aktuellen Zustand).
export async function toggleAffiliateActive(id: string, toolId: string, isActive: boolean): Promise<void> {
  try {
    await requireAdmin()
  } catch {
    return
  }

  await prisma.affiliateLink.update({
    where: { id },
    data:  { isActive },
  })
  revalidatePath(`/admin/tools/${toolId}`)
}

// Setzt einen Link als primären Link des Tools.
// Alle anderen Links dieses Tools werden auf isPrimary: false gesetzt (Transaktion).
export async function setAffiliatePrimary(id: string, toolId: string): Promise<void> {
  try {
    await requireAdmin()
  } catch {
    return
  }

  await prisma.$transaction([
    prisma.affiliateLink.updateMany({
      where: { toolId, NOT: { id } },
      data:  { isPrimary: false },
    }),
    prisma.affiliateLink.update({
      where: { id },
      data:  { isPrimary: true },
    }),
  ])
  revalidatePath(`/admin/tools/${toolId}`)
}

// Löscht einen Affiliate-Link dauerhaft.
export async function deleteAffiliateLink(id: string, toolId: string): Promise<void> {
  try {
    await requireAdmin()
  } catch {
    return
  }

  await prisma.affiliateLink.delete({ where: { id } })
  revalidatePath(`/admin/tools/${toolId}`)
}
