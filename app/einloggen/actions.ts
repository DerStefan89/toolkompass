/**
 * Datei: app/einloggen/actions.ts
 *
 * Zweck: Server Action für den Magic-Link-Login (Supabase signInWithOtp).
 *
 * Wird aufgerufen von:
 * - components/auth/LoginForm.tsx (useActionState)
 *
 * Wichtig:
 * - Öffentliche Action — KEIN requireAdmin/requireUser.
 * - Nach außen nie technische Fehlerdetails (keine Account-Enumeration).
 * - accepted_terms_at wandert in user_metadata, weil der Magic Link auf einem
 *   anderen Gerät geöffnet werden kann (Checkbox-Zustand dort nicht verfügbar).
 */

'use server'

import { createClient } from '@/lib/supabase/server'

export type MagicLinkState = { error?: string; success?: boolean }

/**
 * Versendet einen Magic Link an die eingegebene E-Mail.
 * Signatur ist useActionState-kompatibel (prevState, formData).
 *
 * @param _prev - vorheriger State (von useActionState, ungenutzt)
 * @param formData - email, acceptedTerms
 * @returns MagicLinkState — { success } oder { error } (nie technische Details)
 */
export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = ((formData.get('email') as string) ?? '').trim().slice(0, 254)
  const acceptedTerms = formData.get('acceptedTerms') === 'on'

  // Einfache Format-Validierung (muss @ und . enthalten)
  if (!email.includes('@') || !email.includes('.')) {
    return { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' }
  }

  if (!acceptedTerms) {
    return { error: 'Bitte akzeptiere die Datenschutzerklärung.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
        data: {
          accepted_terms_at: new Date().toISOString(),
        },
        shouldCreateUser: true,
      },
    })

    if (error) {
      // Supabase-Fehler nicht durchreichen (keine Account-Enumeration / Rate-Hinweise)
      console.error('[sendMagicLink]', error)
      return { error: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.' }
    }

    return { success: true }
  } catch (error) {
    console.error('[sendMagicLink]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.' }
  }
}

// NEXT_PUBLIC_SITE_URL muss in .env.local und Vercel gesetzt sein:
// Lokal: NEXT_PUBLIC_SITE_URL=http://localhost:3000
// Production: NEXT_PUBLIC_SITE_URL=https://www.toolsucher.de
