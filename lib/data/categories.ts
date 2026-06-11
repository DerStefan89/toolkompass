/**
 * Datei: lib/data/categories.ts
 *
 * Zweck: Zentraler Data-Access-Layer für Kategorie-Queries.
 * React.cache() dedupliziert identische Aufrufe innerhalb eines Request-Zyklus.
 *
 * Wird aufgerufen von:
 * - app/kategorien/[slug]/page.tsx (generateMetadata + Page)
 *
 * Wichtig:
 * Neue Kategorie-Queries hier anlegen, nicht in Page-Dateien duplizieren (ARCHITECTURE.md §5).
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Lädt eine Kategorie mit allen Tools und Tags für die Detailseite.
 * Ergebnis wird pro Request gecached (React.cache).
 *
 * @param slug - URL-Slug der Kategorie (z.B. "buchhaltung")
 * @returns Kategorie mit Translations, Tools (published), Tags — oder null
 */
export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      tools: {
        where: { tool: { published: true } },
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              tags: { include: { tag: true } },
              affiliateLinks: {
                where: { isActive: true },
                orderBy: { isPrimary: 'desc' },
                take: 1,
                skip: 0,
              },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  })
})
