/**
 * Datei: middleware.ts
 *
 * Zweck: Auth-Schutz für alle /admin-Routen via Supabase SSR.
 * Nicht eingeloggt  → Redirect zu /admin/login.
 * Eingeloggt + /admin/login → Redirect zu /admin.
 *
 * Wichtig:
 * Middleware kann nicht cookies() aus next/headers verwenden —
 * stattdessen werden request.cookies direkt gelesen und
 * supabaseResponse benutzt, damit die Session-Cookies korrekt
 * weitergeleitet werden (Supabase SSR-Anforderung).
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // supabaseResponse muss neu zugewiesen werden können (siehe setAll)
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cookies in den Request schreiben (damit getAll() aktuell bleibt)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Response neu erstellen und Cookies dort setzen
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // WICHTIG: Kein Code zwischen createServerClient und getUser() —
  // sonst können Session-Refresh-Bugs entstehen (Supabase-Anforderung).
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Nicht eingeloggt → Login-Seite (außer bereits dort)
  if (!user && !pathname.startsWith('/admin/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Eingeloggt + Login-Seite → Admin-Dashboard
  if (user && pathname === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
