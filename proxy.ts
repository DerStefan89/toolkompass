/**
 * Datei: proxy.ts
 *
 * Zweck: Schützt alle /admin-Routen.
 * Nicht eingeloggte Nutzer werden auf /admin/login weitergeleitet.
 * Eingeloggte Nutzer auf /admin/login werden auf /admin weitergeleitet.
 *
 * Hinweis: Diese Datei heißt proxy.ts (vormals middleware.ts).
 * Next.js 16 hat die "middleware"-Konvention zugunsten von "proxy" abgelöst.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // Supabase SSR erfordert dieses Doppel-Set-Pattern:
        // 1. Cookies auf den Request schreiben, damit getUser() die frische Session sieht.
        // 2. supabaseResponse neu erstellen und Cookies dort ebenfalls setzen,
        //    damit der Browser das aktualisierte Session-Cookie erhält.
        // Ohne das zweite Set würde die Session nach kurzer Zeit automatisch ablaufen.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
