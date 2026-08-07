/**
 * Datei: app/api/search/route.ts
 *
 * Zweck: Öffentliche Autocomplete-API — liefert max. 5 Tool-Vorschläge
 *        für einen Suchbegriff (≥ 2 Zeichen, ≤ 100 Zeichen), case-insensitive.
 *
 * Sicherheit:
 * - Kein requireAdmin — öffentliche Route.
 * - Rate-Limit: max 30 Requests pro IP pro 60 Sekunden (in-memory, sliding window).
 * - Query-Länge auf 100 Zeichen begrenzt (verhindert teure ILIKE-Queries).
 *
 * Wird aufgerufen von:
 * - components/SearchInput.tsx (Autocomplete-Dropdown)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Such-API: Node-Runtime (Prisma) und nie cachen.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Validierung ──────────────────────────────────────────────────────────────

/**
 * Nur Typ-Prüfung (string | null) — q ist über die Web-API bereits statisch so
 * typisiert, das Schema ändert kein Verhalten (Konsistenz mit den anderen drei
 * Routen, siehe specs/zod-eingabevalidierung.md V7-V9). Kürzung auf
 * MAX_QUERY_LENGTH und der Mindestlängen-Check bleiben eigenständige
 * Anwendungslogik-Schritte danach.
 */
const searchQuerySchema = z.string().nullable()

// ─── Rate-Limit (gleiche Architektur wie app/api/track/[linkId]/route.ts) ────

const RATE_LIMIT_MAX       = 30
const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_QUERY_LENGTH     = 100

const requestTimestamps = new Map<string, number[]>()

function getIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

function isRateLimited(ip: string): boolean {
  const now    = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const times  = (requestTimestamps.get(ip) ?? []).filter(t => t > cutoff)

  if (times.length >= RATE_LIMIT_MAX) {
    requestTimestamps.set(ip, times)
    return true
  }
  times.push(now)
  requestTimestamps.set(ip, times)
  return false
}

// ─── Type ────────────────────────────────────────────────────────────────────

export type SearchSuggestion = {
  slug: string
  name: string
  shortDescription: string | null
  logoUrl: string | null
  categoryName: string | null
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Rate-Limit prüfen
  const ip = getIp(request)
  if (ip && isRateLimited(ip)) {
    return new NextResponse(null, { status: 429 })
  }

  // Typ-Prüfung (Konsistenz mit den anderen Routen, keine Verhaltensänderung — siehe V7-V9)
  const parsedQuery = searchQuerySchema.safeParse(request.nextUrl.searchParams.get('q'))
  if (!parsedQuery.success) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  // Query kappen und validieren
  const q = (parsedQuery.data?.trim() ?? '').slice(0, MAX_QUERY_LENGTH)

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        published: true,
        // Eine kombinierte Subquery: Postgres joint die Translation-Tabelle nur
        // einmal (statt zweimal über zwei OR-Zweige).
        translations: {
          some: {
            locale: 'de',
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { shortDescription: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      },
      // select statt include: nur die fürs Dropdown nötigen Felder laden
      // (weniger DB-Last + kleinere JSON-Antwort).
      select: {
        slug: true,
        logoUrl: true,
        translations: {
          where: { locale: 'de' },
          select: { name: true, shortDescription: true },
        },
        categories: {
          take: 1,
          skip: 0,
          select: {
            category: {
              select: {
                translations: {
                  where: { locale: 'de' },
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      take: 5,
      skip: 0,
    })

    const results: SearchSuggestion[] = tools.map((tool) => ({
      slug: tool.slug,
      name: tool.translations[0]?.name ?? tool.slug,
      shortDescription: tool.translations[0]?.shortDescription ?? null,
      logoUrl: tool.logoUrl,
      categoryName: tool.categories[0]?.category.translations[0]?.name ?? null,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('[search]', error)
    return NextResponse.json([], { status: 500 })
  }
}
