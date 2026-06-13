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
