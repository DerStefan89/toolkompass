/**
 * Datei: lib/data/ratings.ts
 *
 * Zweck: Queries rund um Bewertungen (Rating, RatingCriterion, RatingScore).
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/bewerten/page.tsx (Formular-Daten)
 * - app/tools/[slug]/bewerten/actions.ts (Validierung der zugewiesenen Kriterien)
 *
 * Wichtig:
 * - Erwartet bereits verifizierte IDs (toolId aus DB, userId aus requireUser).
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Lädt die einem Tool zugewiesenen Bewertungskriterien (sortiert).
 *
 * @param toolId - ID des Tools
 * @returns Kriterien (RatingCriterion[]) nach sortOrder
 */
export const getToolCriteria = cache(async (toolId: string) => {
  const assignments = await prisma.toolRatingCriterion.findMany({
    where: { toolId },
    include: { criterion: true },
    orderBy: { criterion: { sortOrder: 'asc' } },
  })
  return assignments.map((a) => a.criterion)
})

/**
 * Lädt die bestehende Bewertung eines Nutzers für ein Tool (falls vorhanden).
 *
 * @param userId - verifizierte Prisma-User-id
 * @param toolId - ID des Tools
 * @returns Rating inkl. Scores oder null
 */
export const getUserRatingForTool = cache(async (userId: string, toolId: string) => {
  return prisma.rating.findUnique({
    where: { toolId_userId: { toolId, userId } },
    include: { scores: true },
  })
})

/** Aggregiertes Bewertungs-Ergebnis eines Tools (nur freigegebene Bewertungen). */
export type ToolRatingSummary = {
  count: number
  averageOverall: number | null
  criteriaAverages: {
    criterionId: string
    criterionName: string
    average: number
    count: number
  }[]
  comments: {
    id: string
    score: number
    comment: string
    createdAt: Date
    userName: string
  }[]
}

/** Rundet auf 1 Dezimalstelle. */
function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Lädt nur APPROVED Bewertungen eines Tools und aggregiert Durchschnitte
 * (gesamt + pro Kriterium) sowie die Kommentare. Eine Query, kein N+1.
 *
 * Datenschutz: öffentlich wird NIE die E-Mail gezeigt — nur firstName,
 * sonst "Nutzer".
 *
 * @param toolId - ID des Tools
 * @returns ToolRatingSummary
 */
export const getToolRatingSummary = cache(
  async (toolId: string): Promise<ToolRatingSummary> => {
    const ratings = await prisma.rating.findMany({
      where: { toolId, isApproved: true },
      include: {
        scores: { include: { criterion: true } },
        user: { select: { firstName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const count = ratings.length
    const averageOverall =
      count > 0 ? round1(ratings.reduce((sum, r) => sum + r.score, 0) / count) : null

    // Kriterien-Durchschnitte: über alle Scores nach criterionId gruppieren
    const critMap = new Map<
      string,
      { name: string; sortOrder: number; sum: number; n: number }
    >()
    for (const r of ratings) {
      for (const sc of r.scores) {
        const entry = critMap.get(sc.criterionId) ?? {
          name: sc.criterion.name,
          sortOrder: sc.criterion.sortOrder,
          sum: 0,
          n: 0,
        }
        entry.sum += sc.score
        entry.n += 1
        critMap.set(sc.criterionId, entry)
      }
    }
    const criteriaAverages = [...critMap.entries()]
      .sort((a, b) => a[1].sortOrder - b[1].sortOrder)
      .map(([criterionId, e]) => ({
        criterionId,
        criterionName: e.name,
        average: round1(e.sum / e.n),
        count: e.n,
      }))

    const comments = ratings
      .filter((r) => r.comment && r.comment.trim() !== '')
      .map((r) => ({
        id: r.id,
        score: r.score,
        comment: r.comment as string,
        createdAt: r.createdAt,
        userName: r.user.firstName?.trim() || 'Nutzer',
      }))

    return { count, averageOverall, criteriaAverages, comments }
  }
)
