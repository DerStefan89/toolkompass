/**
 * Datei: app/konto/actions.ts
 *
 * Zweck: Server Actions für die Konto-Seite — Profil speichern und Abmelden.
 *
 * Wird aufgerufen von:
 * - components/auth/ProfileForm.tsx (updateProfile)
 * - app/konto/page.tsx (logout, via <form action>)
 *
 * Wichtig:
 * - updateProfile schreibt NUR auf die userId aus der Session, NIE aus FormData
 *   (sonst könnte ein Nutzer fremde Profile bearbeiten).
 * - logout braucht keinen Guard — signOut ist idempotent.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/require-user'
import { parseStr } from '@/lib/utils/form'

export type ProfileState = { error?: string; success?: boolean }

/**
 * Aktualisiert Vorname, Nachname und Firma des eingeloggten Nutzers.
 * @param _prev - vorheriger State (von useActionState, ungenutzt)
 * @param formData - firstName, lastName, company
 * @returns ProfileState — { success } oder { error }
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  let session
  try {
    session = await requireUser()
  } catch {
    return { error: 'Nicht eingeloggt.' }
  }

  // Leere Eingaben als null speichern (kein "" in der DB)
  const firstName = parseStr(formData, 'firstName') || null
  const lastName = parseStr(formData, 'lastName') || null
  const company = parseStr(formData, 'company') || null

  try {
    await prisma.user.update({
      where: { id: session.userId }, // userId aus Session, nie aus FormData
      data: { firstName, lastName, company },
    })
    revalidatePath('/konto')
    return { success: true }
  } catch (error) {
    console.error('[updateProfile]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Speichern fehlgeschlagen. Bitte versuche es erneut.' }
  }
}

/**
 * Meldet den aktuellen Nutzer ab und leitet zur Startseite.
 * Kein Guard nötig — signOut ist idempotent.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
