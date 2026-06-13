/**
 * Datei: lib/data/users.ts
 *
 * Zweck: Synchronisiert Supabase-Auth-User mit der Prisma-User-Tabelle.
 *
 * Wird aufgerufen von:
 * - app/auth/confirm/route.ts (nach Magic-Link-Verifizierung)
 * - lib/auth/require-user.ts (selbstheilender Fallback)
 */

import { prisma } from '@/lib/prisma'
import type { User as SupabaseUser } from '@supabase/supabase-js'

/**
 * Legt die Prisma-User-Row für einen Supabase-Auth-User an (idempotent).
 * acceptedTermsAt kommt aus user_metadata (wird beim signInWithOtp gesetzt,
 * weil der Magic Link auf einem anderen Gerät geöffnet werden kann und
 * der Checkbox-Zustand der Login-Seite dort nicht verfügbar wäre).
 *
 * @param supabaseUser - Der User aus supabase.auth.getUser()
 * @returns Die Prisma-User-Row
 */
export async function ensureUserRecord(supabaseUser: SupabaseUser) {
  const acceptedTermsRaw = supabaseUser.user_metadata?.accepted_terms_at
  const acceptedTermsAt =
    typeof acceptedTermsRaw === 'string' ? new Date(acceptedTermsRaw) : null

  return prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    create: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email ?? '',
      locale: 'de',
      ...(acceptedTermsAt ? { acceptedTermsAt } : {}),
    },
    update: {
      // E-Mail-Änderungen in Supabase nachziehen
      email: supabaseUser.email ?? '',
      // acceptedTermsAt wird im Update NICHT angefasst — der einmal gesetzte
      // Zustimmungszeitpunkt darf nicht überschrieben werden.
    },
  })
}
