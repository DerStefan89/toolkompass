/**
 * Datei: app/page-actions.ts
 *
 * Zweck: Server Action für die Startseiten-Stack-Vorschau (StackWidget).
 *
 * Wird aufgerufen von:
 * - components/home/StackWidget.tsx (clientseitig, im useEffect)
 *
 * Wichtig:
 * - Die Startseite ist per ISR gecacht — der nutzerspezifische Stack darf NICHT
 *   serverseitig in die Seite. Diese Action lädt ihn erst im Browser nach.
 * - userId kommt aus requireUser (Session), nie aus Client-Input.
 */

'use server'

import { requireUser } from '@/lib/auth/require-user'
import { getUserTools } from '@/lib/data/user-tools'
import { calculateStackCosts } from '@/lib/utils/stack-costs'

export type StackSummary = {
  isLoggedIn: boolean
  tools: { id: string; name: string; slug: string; logoUrl: string | null }[]
  monthlyCents: number
  count: number
}

/**
 * Lädt den Tool-Stack des eingeloggten Nutzers für die Startseiten-Vorschau.
 * @returns StackSummary — bei Gästen { isLoggedIn: false, leer }
 */
export async function getMyStackSummary(): Promise<StackSummary> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { isLoggedIn: false, tools: [], monthlyCents: 0, count: 0 }
  }

  const userTools = await getUserTools(session.userId)
  // userTools ist strukturell StackCostEntry[] (wie auf /meine-tools genutzt)
  const costs = calculateStackCosts(userTools)

  const tools = userTools.map((ut) => ({
    id: ut.id,
    name: ut.tool.translations[0]?.name ?? ut.tool.slug,
    slug: ut.tool.slug,
    logoUrl: ut.tool.logoUrl,
  }))

  return {
    isLoggedIn: true,
    tools,
    monthlyCents: costs.monthlyCents,
    count: tools.length,
  }
}
