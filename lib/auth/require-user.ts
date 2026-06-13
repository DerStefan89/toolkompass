/**
 * Datei: lib/auth/require-user.ts
 *
 * Zweck: Auth-Guard für eingeloggte Endnutzer (nicht Admin).
 * Blaupause: lib/auth/require-admin.ts — gleiche Struktur, gleiche AuthError.
 * Die AuthError-Klasse wird aus require-admin.ts importiert (nicht dupliziert).
 *
 * Wird aufgerufen von:
 * - User-Server-Actions (ab Phase 4.3) als erste Zeile
 * - eingeloggte User-Bereiche (/konto, /meine-tools)
 *
 * Wichtig:
 * - Prüft NICHT auf Admin-Rolle — Admins sind auch normale Nutzer.
 * - Selbstheilend: legt eine fehlende Prisma-User-Row per Upsert an
 *   (Edge Case: /auth/confirm wurde unterbrochen).
 */

import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/prisma'
import { ensureUserRecord } from '@/lib/data/users'

/**
 * Prüft ob ein User eingeloggt ist und gibt seine Prisma-User-Row zurück.
 * Wirft AuthError wenn nicht eingeloggt.
 *
 * @returns { userId, supabaseId, email } — userId ist die Prisma-User-id
 */
export async function requireUser(): Promise<{
  userId: string
  supabaseId: string
  email: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new AuthError()

  // Selbstheilend: fehlende Row anlegen (z. B. wenn /auth/confirm abbrach)
  let row = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!row) {
    row = await ensureUserRecord(user)
  }

  return { userId: row.id, supabaseId: user.id, email: row.email }
}
