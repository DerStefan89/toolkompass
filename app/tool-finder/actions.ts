/**
 * Datei: app/tool-finder/actions.ts
 *
 * Zweck: Server Action für den interaktiven Tool-Finder.
 * Nimmt Kategorie + Budget aus dem Client-Wizard entgegen und liefert
 * passende Tools über den Data-Access-Layer (lib/data/tool-finder.ts).
 *
 * Wird aufgerufen von:
 * - components/tool-finder/ToolFinder.tsx (Schritt 3: Ergebnisse laden)
 *
 * Wichtig:
 * - Öffentliche Action — KEIN requireAdmin/requireUser. Der Tool-Finder
 *   ist bewusst ohne Login/Registrierung nutzbar (Phase-4-Scope).
 * - Read-only — kein revalidatePath (verändert keine Daten).
 */

'use server'

import { captureException } from '@sentry/nextjs'
import {
  findToolsForFinder,
  type FinderBudget,
  type FinderTool,
} from '@/lib/data/tool-finder'

/**
 * Diskriminierte Union als Rückgabetyp: entweder Ergebnisse oder eine
 * nutzerfreundliche Fehlermeldung — nie technische Details an den Client.
 */
export type FinderResult =
  | { ok: true; tools: FinderTool[] }
  | { ok: false; error: string }

/**
 * Lädt passende Tools für die im Wizard gewählte Kategorie und Budget-Stufe.
 *
 * @param categoryId - ID der gewählten Kategorie (Schritt 1)
 * @param budget - gewählte Budget-Stufe (Schritt 2)
 * @returns FinderResult — { ok: true, tools } oder { ok: false, error }
 */
export async function getFinderResults(
  categoryId: string,
  budget: FinderBudget
): Promise<FinderResult> {
  // Minimal-Validierung: ohne Kategorie kein sinnvolles Ergebnis
  if (!categoryId) {
    return { ok: false, error: 'Bitte zuerst eine Kategorie wählen.' }
  }

  try {
    const tools = await findToolsForFinder({ categoryId, budget })
    return { ok: true, tools }
  } catch (error) {
    console.error('[getFinderResults]', error)
    captureException(error)
    return {
      ok: false,
      error: 'Die Empfehlungen konnten nicht geladen werden. Bitte versuche es erneut.',
    }
  }
}
