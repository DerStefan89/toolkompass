/**
 * Datei: app/api/search/route.ts
 *
 * Zweck: Öffentliche Autocomplete-API — liefert max. 5 Tool-Vorschläge
 *        für einen Suchbegriff (≥ 2 Zeichen), case-insensitive.
 *
 * Kein requireAdmin — öffentliche Route.
 * Kein Caching — kurze dynamische Antworten.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export type SearchSuggestion = {
  slug: string
  name: string
  shortDescription: string | null
  logoUrl: string | null
  categoryName: string | null
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json([])
  }

  try {
    const tools = await prisma.tool.findMany({
      where: {
        published: true,
        OR: [
          { translations: { some: { locale: 'de', name: { contains: q, mode: 'insensitive' } } } },
          { translations: { some: { locale: 'de', shortDescription: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      include: {
        translations: { where: { locale: 'de' } },
        categories: {
          include: {
            category: {
              include: {
                translations: { where: { locale: 'de' } },
              },
            },
          },
          take: 1,
          skip: 0,
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
