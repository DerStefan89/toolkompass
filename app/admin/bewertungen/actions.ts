/**
 * Datei: app/admin/bewertungen/actions.ts
 *
 * Zweck: Server Actions für die Bewertungs-Moderation (freigeben/ablehnen).
 *
 * Wird aufgerufen von:
 * - components/admin/ModerationActions.tsx
 *
 * Wichtig:
 * - Ablehnen = löschen (Cascade entfernt die RatingScores). Eine abgelehnte
 *   Bewertung soll nicht erneut auftauchen — das Schema hat kein Reject-Flag.
 * - Nach jeder Mutation wird auch die betroffene Tool-Seite revalidiert.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr } from '@/lib/utils/form'

export type ModerationResult = { error?: string }

/** Gibt eine Bewertung frei (isApproved = true). */
export async function approveRating(formData: FormData): Promise<ModerationResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const id = parseStr(formData, 'ratingId')
  if (!id) return { error: 'Bewertung fehlt.' }

  try {
    const rating = await prisma.rating.update({
      where: { id },
      data: { isApproved: true },
      include: { tool: { select: { slug: true } } },
    })
    revalidatePath('/admin/bewertungen')
    revalidatePath(`/tools/${rating.tool.slug}`)
  } catch (error) {
    console.error('[approveRating]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Freigeben fehlgeschlagen. Bitte versuche es erneut.' }
  }

  return {}
}

/** Lehnt eine Bewertung ab und löscht sie (Scores via Cascade). */
export async function rejectRating(formData: FormData): Promise<ModerationResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const id = parseStr(formData, 'ratingId')
  if (!id) return { error: 'Bewertung fehlt.' }

  try {
    // Slug vor dem Löschen laden, damit die Tool-Seite revalidiert werden kann
    const rating = await prisma.rating.findUnique({
      where: { id },
      include: { tool: { select: { slug: true } } },
    })
    await prisma.rating.delete({ where: { id } })
    revalidatePath('/admin/bewertungen')
    if (rating) revalidatePath(`/tools/${rating.tool.slug}`)
  } catch (error) {
    console.error('[rejectRating]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Ablehnen fehlgeschlagen. Bitte versuche es erneut.' }
  }

  return {}
}
