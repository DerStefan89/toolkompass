/**
 * Datei: lib/data/tool-finder.ts
 *
 * Zweck: Query-Logik für den interaktiven Tool-Finder (/tool-finder).
 * Filtert publizierte Tools nach Kategorie und Budget.
 *
 * Wird aufgerufen von:
 * - app/tool-finder/actions.ts (Server Action, kommt in Task 1.2)
 *
 * Wichtig:
 * - Kein Affiliate-Boost in der Sortierung (Unabhängigkeits-Positionierung).
 * - Budget-Logik: "kostenlos" = hasFreePlan ODER startingPriceCents === 0.
 * - Gibt maximal 5 Tools zurück, sortiert nach Preis aufsteigend.
 */

import { cache } from 'react'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Budget-Stufen aus Schritt 2 des Tool-Finders.
 * - 'kostenlos' = nur Free-Plan oder Preis exakt 0
 * - 'bis20'     = bis 20 € / Monat (oder Free-Plan)
 * - 'bis50'     = bis 50 € / Monat (oder Free-Plan)
 * - 'egal'      = kein Preisfilter
 */
export type FinderBudget = 'kostenlos' | 'bis20' | 'bis50' | 'egal'

/**
 * Ein Tool-Ergebnis des Finders inkl. deutscher Übersetzung,
 * primärem Affiliate-Link (falls vorhanden) und erster Kategorie.
 * Nur die Relations-Form bestimmt den Typ — die where/take-Filter
 * der echten Query ändern die Shape nicht.
 */
export type FinderTool = Prisma.ToolGetPayload<{
  include: {
    translations: true
    affiliateLinks: true
    categories: { include: { category: { include: { translations: true } } } }
  }
}>

/**
 * Eine auswählbare Kategorie für Schritt 1 des Finders,
 * inkl. deutscher Übersetzung (Name + Beschreibung).
 */
export type FinderCategory = Prisma.CategoryGetPayload<{
  include: { translations: true }
}>

/**
 * Übersetzt eine Budget-Stufe in den passenden Prisma-Preisfilter.
 * Gibt `undefined` bei 'egal' zurück (= kein Filter).
 *
 * Hinweis zu null-Preisen ("Auf Anfrage"):
 * - 'bis20'/'bis50' nutzen `lte` — null matcht nie, wird also korrekt
 *   ausgeschlossen (wir wissen nicht, ob der Preis ins Budget passt).
 * - hasFreePlan-Tools werden bei 'bis20'/'bis50' immer inkludiert,
 *   da Free ja ≤ jedes Budget ist.
 *
 * @param budget - gewählte Budget-Stufe
 * @returns OR-Klausel für `where` oder `undefined` bei 'egal'
 */
function budgetWhere(budget: FinderBudget): Prisma.ToolWhereInput['OR'] {
  switch (budget) {
    case 'kostenlos':
      return [{ hasFreePlan: true }, { startingPriceCents: 0 }]
    case 'bis20':
      return [{ startingPriceCents: { lte: 2000 } }, { hasFreePlan: true }]
    case 'bis50':
      return [{ startingPriceCents: { lte: 5000 } }, { hasFreePlan: true }]
    case 'egal':
      return undefined
  }
}

/**
 * Findet bis zu 5 passende Tools für die gewählte Kategorie und das Budget.
 * Sortiert nach Einstiegspreis aufsteigend (null-Preise zuletzt — Prisma-Default).
 * Ergebnis wird pro Request gecached (React.cache).
 *
 * @param params.categoryId - ID der gewählten Kategorie (Schritt 1)
 * @param params.budget - gewählte Budget-Stufe (Schritt 2)
 * @returns Array von max. 5 Tools mit Translations, Primary-Affiliate-Link und Kategorie
 */
export const findToolsForFinder = cache(
  async ({
    categoryId,
    budget,
  }: {
    categoryId: string
    budget: FinderBudget
  }): Promise<FinderTool[]> => {
    const priceFilter = budgetWhere(budget)

    return prisma.tool.findMany({
      where: {
        published: true,
        categories: { some: { categoryId } },
        ...(priceFilter ? { OR: priceFilter } : {}),
      },
      include: {
        translations: { where: { locale: 'de' } },
        affiliateLinks: {
          where: { isActive: true },
          orderBy: { isPrimary: 'desc' },
          take: 1,
          skip: 0,
        },
        categories: {
          include: {
            category: {
              include: { translations: { where: { locale: 'de' } } },
            },
          },
          take: 1,
          skip: 0,
        },
      },
      orderBy: { startingPriceCents: 'asc' },
      take: 5,
      skip: 0,
    })
  }
)

/**
 * Lädt alle publizierten Kategorien mit deutschem Namen und Icon.
 * Für die Kategorie-Auswahl im Tool-Finder (Schritt 1).
 * Ergebnis wird pro Request gecached (React.cache).
 *
 * Sortierung erfolgt im Code nach dem deutschen Namen, da Prisma nicht
 * direkt über eine Relation (translations[0].name) sortieren kann.
 * Bei nur 17 Kategorien ist das unkritisch.
 *
 * @returns Kategorien sortiert nach Name (deutsch, lokalisierter Vergleich)
 */
export const getAllPublishedCategories = cache(
  async (): Promise<FinderCategory[]> => {
    const categories = await prisma.category.findMany({
      where: { published: true },
      include: { translations: { where: { locale: 'de' } } },
    })

    return categories.sort((a, b) =>
      (a.translations[0]?.name ?? '').localeCompare(
        b.translations[0]?.name ?? '',
        'de'
      )
    )
  }
)
