/**
 * Datei: app/tools/[slug]/bewerten/actions.ts
 *
 * Zweck: Server Action zum Einreichen/Aktualisieren einer Tool-Bewertung.
 *
 * Wird aufgerufen von:
 * - components/rating/RatingForm.tsx (useActionState)
 *
 * Wichtig (ARCHITECTURE §7):
 * - Der Kommentar ist NUTZERGENERIERTER Content: wird als Plain Text gespeichert,
 *   auf 2000 Zeichen gekappt und NIE als Markdown/HTML verarbeitet.
 * - Nur dem Tool zugewiesene Kriterien werden akzeptiert (keine Fremd-IDs).
 * - Jede Einreichung/Änderung setzt isApproved zurück auf false (Re-Moderation).
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { parseStr } from '@/lib/utils/form'
import { getToolCriteria } from '@/lib/data/ratings'

export type RatingState = { success?: boolean; error?: string; notLoggedIn?: boolean }

const MAX_COMMENT_LENGTH = 2000

/** Parst einen Score-String zu einer Ganzzahl 1–5 oder null. */
function parseScore(raw: string): number | null {
  const n = parseInt(raw, 10)
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
}

/**
 * Reicht eine Bewertung ein oder aktualisiert die bestehende des Nutzers.
 * Signatur ist useActionState-kompatibel (prevState, formData).
 *
 * @param _prev - vorheriger State (ungenutzt)
 * @param formData - toolId, overallScore, comment, criterion_<id>-Felder
 */
export async function submitRating(
  _prev: RatingState,
  formData: FormData
): Promise<RatingState> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { error: 'Bitte einloggen.', notLoggedIn: true }
  }

  const toolId = parseStr(formData, 'toolId')
  const overallScore = parseScore(parseStr(formData, 'overallScore'))
  // Plain Text — KEIN Markdown/HTML-Processing, nur kappen.
  const commentRaw = parseStr(formData, 'comment')
  const comment = commentRaw ? commentRaw.slice(0, MAX_COMMENT_LENGTH) : null

  if (!toolId) return { error: 'Tool fehlt.' }
  if (overallScore === null) return { error: 'Bitte gib eine Gesamtbewertung (1–5 Sterne) ab.' }

  try {
    // Tool muss existieren und veröffentlicht sein
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { published: true, slug: true },
    })
    if (!tool || !tool.published) {
      return { error: 'Dieses Tool kann nicht bewertet werden.' }
    }

    // Nur dem Tool zugewiesene Kriterien akzeptieren
    const criteria = await getToolCriteria(toolId)
    const validCriterionScores: { criterionId: string; score: number }[] = []
    for (const criterion of criteria) {
      const raw = parseStr(formData, `criterion_${criterion.id}`)
      if (raw === '') continue // Kriterium nicht bewertet → überspringen
      const score = parseScore(raw)
      if (score === null) {
        return { error: 'Eine Kriterien-Bewertung ist ungültig (nur 1–5 Sterne).' }
      }
      validCriterionScores.push({ criterionId: criterion.id, score })
    }

    // Upsert + Scores ersetzen in einer Transaktion. isApproved immer false.
    await prisma.$transaction(async (tx) => {
      const rating = await tx.rating.upsert({
        where: { toolId_userId: { toolId, userId: session.userId } },
        create: { toolId, userId: session.userId, score: overallScore, comment, isApproved: false },
        update: { score: overallScore, comment, isApproved: false },
      })
      await tx.ratingScore.deleteMany({ where: { ratingId: rating.id } })
      if (validCriterionScores.length > 0) {
        await tx.ratingScore.createMany({
          data: validCriterionScores.map((cs) => ({
            ratingId: rating.id,
            criterionId: cs.criterionId,
            score: cs.score,
          })),
        })
      }
    })

    revalidatePath(`/tools/${tool.slug}`)
    return { success: true }
  } catch (error) {
    console.error('[submitRating]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Speichern fehlgeschlagen. Bitte versuche es erneut.' }
  }
}
