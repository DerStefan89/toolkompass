/**
 * Datei: lib/supabase/admin.ts
 *
 * Zweck: Supabase Admin Client mit Service Role Key.
 * Bypassed RLS vollständig — nur in Server-Kontext verwenden.
 *
 * Wichtig:
 * SUPABASE_SERVICE_ROLE_KEY ist ein Secret (kein NEXT_PUBLIC_).
 * Dieser Client darf NIEMALS in Client Components importiert werden.
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
