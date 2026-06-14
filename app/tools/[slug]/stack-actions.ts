/**
 * Datei: app/tools/[slug]/stack-actions.ts
 *
 * Zweck: Server Action zum Hinzufügen/Entfernen eines Tools im Stack des Nutzers.
 *
 * Wird aufgerufen von:
 * - components/tools/UseToolButton.tsx
 *
 * Wichtig:
 * - userId kommt IMMER aus requireUser() (Session), NIE aus den Parametern.
 *   toolId/slug sind reine Referenzen — der Nutzer kann nur seinen eigenen
 *   Stack ändern, weil die userId serverseitig aus der Session stammt.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'
import { isToolInUserStack } from '@/lib/data/user-tools'

export type ToggleUserToolResult =
  | { success: true; inStack: boolean }
  | { success: false; error: string; notLoggedIn?: boolean }

/**
 * Schaltet ein Tool im Stack des eingeloggten Nutzers um (hinzufügen/entfernen).
 *
 * @param toolId - ID des Tools (Referenz, kein Sicherheitsrisiko)
 * @param slug - Slug des Tools (für revalidatePath der Detailseite)
 * @returns neuer Zustand { success, inStack } oder { success: false, error }
 */
export async function toggleUserTool(
  toolId: string,
  slug: string
): Promise<ToggleUserToolResult> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { success: false, error: 'Bitte einloggen.', notLoggedIn: true }
  }

  try {
    const existing = await prisma.userTool.findUnique({
      where: { userId_toolId: { userId: session.userId, toolId } },
    })

    let inStack: boolean
    if (existing) {
      await prisma.userTool.delete({ where: { id: existing.id } })
      inStack = false
    } else {
      // Nur userId (aus Session) + toolId — Rest default/null
      await prisma.userTool.create({
        data: { userId: session.userId, toolId },
      })
      inStack = true
    }

    revalidatePath(`/tools/${slug}`)
    revalidatePath('/meine-tools')
    return { success: true, inStack }
  } catch (error) {
    console.error('[toggleUserTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { success: false, error: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.' }
  }
}

/**
 * Liefert den Stack-Status des aktuellen Nutzers für ein Tool.
 * Wird vom (clientseitigen) UseToolButton beim Mounten aufgerufen, damit die
 * Tool-Detailseite selbst keinen Pro-User-State hat und per ISR cachebar bleibt.
 *
 * @param toolId - ID des Tools
 * @returns { isLoggedIn, inStack } — beides false, wenn nicht eingeloggt
 */
export async function getMyStackStatus(
  toolId: string
): Promise<{ isLoggedIn: boolean; inStack: boolean }> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { isLoggedIn: false, inStack: false }
  }
  const inStack = await isToolInUserStack(session.userId, toolId)
  return { isLoggedIn: true, inStack }
}
