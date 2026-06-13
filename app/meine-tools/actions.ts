/**
 * Datei: app/meine-tools/actions.ts
 *
 * Zweck: Server Action zum Entfernen eines Tools aus dem Stack des Nutzers.
 *
 * Wird aufgerufen von:
 * - components/tools/RemoveToolButton.tsx
 *
 * Wichtig:
 * - Eigentums-Prüfung: ein UserTool wird nur gelöscht, wenn es dem
 *   eingeloggten Nutzer gehört (userId aus Session, nie aus Client-Input).
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth/require-user'

export type RemoveToolResult = { success?: boolean; error?: string }

/**
 * Entfernt einen Stack-Eintrag des eingeloggten Nutzers.
 *
 * @param userToolId - ID des UserTool-Eintrags
 * @returns { success } oder { error }
 */
export async function removeUserTool(userToolId: string): Promise<RemoveToolResult> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { error: 'Bitte einloggen.' }
  }

  try {
    // Eigentums-Prüfung: gehört der Eintrag wirklich diesem Nutzer?
    const entry = await prisma.userTool.findUnique({
      where: { id: userToolId },
      select: { userId: true },
    })
    if (!entry || entry.userId !== session.userId) {
      return { error: 'Eintrag nicht gefunden.' }
    }

    await prisma.userTool.delete({ where: { id: userToolId } })
    revalidatePath('/meine-tools')
    return { success: true }
  } catch (error) {
    console.error('[removeUserTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Entfernen fehlgeschlagen. Bitte versuche es erneut.' }
  }
}
