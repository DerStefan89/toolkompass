/**
 * Datei: app/admin/anfragen/actions.ts
 *
 * Zweck: Server Action zum Ändern des Anfrage-Status (neu → beantwortet → abgelehnt).
 *
 * Wird aufgerufen von:
 * - app/admin/anfragen/[id]/page.tsx
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr } from '@/lib/utils/form'

export async function updateInquiryStatus(formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const id = parseStr(formData, 'id')
  const status = parseStr(formData, 'status')
  if (!id || !status) return { error: 'ID oder Status fehlt.' }

  try {
    await prisma.inquiry.update({ where: { id }, data: { status } })
    revalidatePath('/admin/anfragen')
    revalidatePath(`/admin/anfragen/${id}`)
    return {}
  } catch (error) {
    console.error('[updateInquiryStatus]', error)
    return { error: 'Speichern fehlgeschlagen.' }
  }
}
