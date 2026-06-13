/**
 * Datei: proxy.ts
 *
 * Zweck: Schützt /admin-Routen UND eingeloggte User-Bereiche (/konto, /meine-tools).
 * - Admin: Nicht eingeloggt → /admin/login; eingeloggt auf /admin/login → /admin (bzw. /).
 * - User: Nicht eingeloggt auf /konto oder /meine-tools → /einloggen (mit next-Rücksprung).
 *         Eingeloggt auf /einloggen → /konto.
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
  const isAdmin = user?.app_metadata?.role === 'admin'

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    if (!user) return NextResponse.redirect(new URL('/admin/login', request.url))
    if (!isAdmin) return NextResponse.redirect(new URL('/', request.url))
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/', request.url))
  }

  // ─── User-Bereiche (nach der Admin-Logik — Admin-Verhalten bleibt unverändert) ───

  const isUserRoute =
    request.nextUrl.pathname.startsWith('/konto') ||
    request.nextUrl.pathname.startsWith('/meine-tools')
  const isEinloggenPage = request.nextUrl.pathname === '/einloggen'

  // Geschützte User-Bereiche: ohne Login → /einloggen mit Rücksprung-Ziel
  if (isUserRoute && !user) {
    const loginUrl = new URL('/einloggen', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Eingeloggt auf /einloggen → direkt zum Konto
  if (isEinloggenPage && user) {
    return NextResponse.redirect(new URL('/konto', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/konto/:path*', '/meine-tools/:path*', '/einloggen'],
}
