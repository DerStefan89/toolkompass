/**
 * Datei: lib/data/user-tools.ts
 *
 * Zweck: Queries für den Tool-Stack eines Nutzers (UserTool).
 *
 * Wird aufgerufen von:
 * - app/meine-tools/page.tsx (Übersicht)
 * - components/tools/UseToolButton.tsx (via Server Action)
 *
 * Wichtig:
 * - Alle Funktionen erwarten eine bereits verifizierte userId (aus requireUser).
 * - Niemals userId aus Client-Input verwenden.
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'

/**
 * Lädt alle Tools im Stack eines Nutzers — inkl. deutscher Tool-Übersetzung
 * und (falls gewählt) dem zugeordneten Preistarif. Neueste zuerst.
 *
 * @param userId - verifizierte Prisma-User-id (aus requireUser)
 * @returns UserTool-Einträge mit Tool + Translation + PricingPlan
 */
export const getUserTools = cache(async (userId: string) => {
  return prisma.userTool.findMany({
    where: { userId },
    include: {
      tool: {
        include: {
          translations: { where: { locale: 'de' } },
          pricingPlans: { orderBy: { sortOrder: 'asc' } },
        },
      },
      pricingPlan: true,
    },
    orderBy: { createdAt: 'desc' },
  })
})

/**
 * Prüft, ob ein Tool bereits im Stack des Nutzers liegt (für den Button-Zustand).
 *
 * @param userId - verifizierte Prisma-User-id (aus requireUser)
 * @param toolId - ID des Tools
 * @returns true, wenn das Tool im Stack ist
 */
export const isToolInUserStack = cache(
  async (userId: string, toolId: string): Promise<boolean> => {
    const entry = await prisma.userTool.findUnique({
      where: { userId_toolId: { userId, toolId } },
    })
    return !!entry
  }
)
