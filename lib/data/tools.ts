/**
 * Datei: lib/data/tools.ts
 *
 * Zweck: Zentraler Data-Access-Layer für Tool-Queries.
 * React.cache() dedupliziert identische Aufrufe innerhalb eines Request-Zyklus —
 * generateMetadata und die Page-Komponente teilen sich damit einen einzigen DB-Call.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx (generateMetadata + Page)
 * - app/tools/[slug]/opengraph-image.tsx
 *
 * Wichtig:
 * Neue Tool-Queries hier anlegen, nicht in Page-Dateien duplizieren (ARCHITECTURE.md §5).
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Lädt ein Tool mit allen Relationen für die Detailseite.
 * Ergebnis wird pro Request gecached (React.cache).
 *
 * @param slug - URL-Slug des Tools (z.B. "sevdesk")
 * @returns Tool mit Translations, Vendor, Kategorien, Affiliate-Links, Tags — oder null
 */
export const getToolBySlug = cache(async (slug: string) => {
  return prisma.tool.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      vendor: true,
      categories: {
        include: {
          category: {
            include: { translations: { where: { locale: 'de' } } },
          },
        },
      },
      affiliateLinks: {
        where: { isActive: true },
        orderBy: { isPrimary: 'desc' },
        take: 1,
        skip: 0,
      },
      tags: { include: { tag: true } },
    },
  })
})
