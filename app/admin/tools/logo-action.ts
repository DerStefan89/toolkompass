/**
 * Datei: app/admin/tools/logo-action.ts
 *
 * Zweck: Server Action zum Speichern der Logo-URL nach erfolgreichem
 *        Supabase-Storage-Upload in der LogoUpload-Komponente.
 *
 * Wird aufgerufen von:
 * - components/admin/LogoUpload.tsx (nach Client-seitigem Upload)
 *
 * Wichtig:
 * - Der eigentliche Upload findet client-seitig via Supabase Storage statt.
 *   Diese Action speichert nur die resultierende Public-URL in der DB.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateToolLogo(
  toolId: string,
  logoUrl: string
): Promise<{ error?: string }> {
  try {
    await prisma.tool.update({
      where: { id: toolId },
      data:  { logoUrl },
    })
  } catch {
    return { error: 'Datenbankfehler beim Speichern der Logo-URL.' }
  }

  revalidatePath(`/admin/tools/${toolId}`)
  return {}
}
