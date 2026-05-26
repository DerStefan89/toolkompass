/**
 * Datei: lib/supabase/server.ts
 *
 * Zweck: Supabase Server Client für Next.js App Router.
 * Liest/schreibt die Auth-Session via Cookies.
 * Nur in Server Components, Route Handlers und Server Actions verwenden.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // Erwartetes Verhalten in Read-only Server Components.
            // Supabase SSR-Pattern: set() wirft hier bewusst — wir ignorieren es.
            if (process.env.NODE_ENV === 'development') {
              console.debug('[supabase/setAll] read-only context, ignoring:', error)
            }
          }
        },
      },
    }
  )
}
