/**
 * Datei: app/auth/confirm/route.ts
 *
 * Zweck: Verarbeitet Magic-Link-Klicks (Supabase OTP-Verifizierung).
 * Der token_hash-Flow funktioniert geräteunabhängig — anders als PKCE,
 * das fehlschlägt wenn der Link auf einem anderen Gerät geöffnet wird.
 *
 * Wird aufgerufen von:
 * - Magic-Link-E-Mails (Template zeigt auf {{ .RedirectTo }}?token_hash=...)
 *
 * Wichtig:
 * - next-Parameter wird gegen Open-Redirect validiert (nur relative Pfade)
 * - Nach erfolgreichem Login wird die Prisma-User-Row per ensureUserRecord angelegt
 */

import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { ensureUserRecord } from '@/lib/data/users'

/**
 * Validiert den next-Parameter gegen Open-Redirects.
 * Erlaubt nur relative Pfade (Beginn mit "/", aber nicht "//", was sonst
 * als protokoll-relative externe URL interpretiert würde).
 *
 * @param raw - Roh-Wert aus searchParams
 * @returns sicherer relativer Pfad (Fallback: /konto)
 */
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw
  return '/konto'
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') as EmailOtpType | null) ?? 'email'
  const next = safeNext(searchParams.get('next'))

  if (!token_hash) {
    return NextResponse.redirect(new URL('/einloggen?fehler=link-ungueltig', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    return NextResponse.redirect(new URL('/einloggen?fehler=link-abgelaufen', request.url))
  }

  // Prisma-User-Row anlegen. Schlägt das fehl, brechen wir den Login NICHT ab —
  // requireUser ist selbstheilend und legt die Row beim nächsten Zugriff an.
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await ensureUserRecord(user)
  } catch (err) {
    console.error('[auth/confirm]', err)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(err)
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
