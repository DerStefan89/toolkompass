/**
 * Datei: lib/supabase/client.ts
 *
 * Zweck: Supabase Browser Client für Client Components.
 * Für Login, Logout und clientseitige Auth-Operationen.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
