/**
 * Datei: app/admin/bewertungskriterien/assign-actions.ts
 *
 * Zweck: Server Action zum Zuweisen eines Bewertungskriteriums zu den Tools
 * EINER Kategorie (ToolRatingCriterion).
 *
 * Wird aufgerufen von:
 * - components/admin/CriterionAssigner.tsx
 *
 * Wichtig:
 * - Es werden nur Tool-IDs akzeptiert, die wirklich zur gewählten Kategorie
 *   gehören (Schutz vor manipulierten Formularen).
 * - Die Zuweisung wird für genau diese Kategorie neu gesetzt (delete + create
 *   in einer Transaktion); Zuweisungen in ANDEREN Kategorien bleiben unberührt.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

export type AssignResult = { success?: boolean; error?: string }

/**
 * Setzt die Zuweisung eines Kriteriums für alle Tools einer Kategorie neu.
 *
 * @param criterionId - das zuzuweisende Kriterium
 * @param categoryId - die gewählte Kategorie (begrenzt den Wirkungsbereich)
 * @param toolIds - die im Formular angehakten Tool-IDs
 * @returns { success } oder { error }
 */
export async function assignCriterionToTools(
  criterionId: string,
  categoryId: string,
  toolIds: string[]
): Promise<AssignResult> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  if (!criterionId || !categoryId) {
    return { error: 'Kriterium oder Kategorie fehlt.' }
  }

  try {
    // Nur Tools dieser Kategorie sind gültig — Fremd-IDs aussortieren
    const categoryTools = await prisma.toolCategory.findMany({
      where: { categoryId },
      select: { toolId: true },
    })
    const validToolIds = categoryTools.map((t) => t.toolId)
    const validSet = new Set(validToolIds)
    const safeToolIds = toolIds.filter((id) => validSet.has(id))

    // Zuweisung für genau diese Kategorie neu setzen (andere Kategorien unberührt)
    await prisma.$transaction([
      prisma.toolRatingCriterion.deleteMany({
        where: { criterionId, toolId: { in: validToolIds } },
      }),
      prisma.toolRatingCriterion.createMany({
        data: safeToolIds.map((toolId) => ({ criterionId, toolId })),
        skipDuplicates: true,
      }),
    ])
  } catch (error) {
    console.error('[assignCriterionToTools]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Speichern fehlgeschlagen. Bitte versuche es erneut.' }
  }

  revalidatePath(`/admin/bewertungskriterien/${criterionId}`)
  revalidatePath('/admin/bewertungskriterien')
  return { success: true }
}
