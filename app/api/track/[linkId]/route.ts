/**
 * Datei: app/api/track/[linkId]/route.ts
 *
 * Zweck: Affiliate-Click-Tracking mit Bot-Filter, Rate-Limiting
 *        und DSGVO-konformem IP-Hashing.
 *
 * Ablauf:
 *   1. Bot-Erkennung via User-Agent und Accept-Language.
 *   2. Rate-Limit: max 10 Klicks pro IP pro 60 Sekunden (sliding window).
 *   3. AffiliateLink anhand linkId aus der DB laden.
 *   4. AffiliateClick speichern (gehashte IP, User-Agent, Referrer).
 *   5. 302-Redirect zur echten Ziel-URL.
 *
 * Wichtig:
 * - Bot-Filter und Rate-Limit laufen VOR jedem DB-Write.
 * - IP wird via SHA-256 gehasht — Klartext-IP wird nie persistiert (DSGVO).
 * - DB-Fehler blockieren den Redirect nicht — Tracking darf den User-Flow nie aufhalten.
 * - In-memory Rate-Limit resettet bei Serverless-Cold-Starts — im MVP vertretbar.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

// ─── Bot-Erkennung ────────────────────────────────────────────────────────────

const BOT_PATTERNS: string[] = [
  'bot',
  'crawler',
  'spider',
  'headless',
  'python',
  'curl',
  'wget',
  'scrapy',
]

function isBot(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') ?? ''
  if (!ua) return true
  const lower = ua.toLowerCase()
  if (BOT_PATTERNS.some(p => lower.includes(p))) return true
  if (!request.headers.get('accept-language')) return true
  return false
}

// ─── Rate-Limit (in-memory, sliding window) ──────────────────────────────────

const RATE_LIMIT_MAX       = 10
const RATE_LIMIT_WINDOW_MS = 60_000

// Module-scope Map: IP → Timestamps der letzten Klicks im Fenster
const clickTimestamps = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now    = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  // Veraltete Einträge rausfiltern (hält Memory sauber)
  const times  = (clickTimestamps.get(ip) ?? []).filter(t => t > cutoff)

  if (times.length >= RATE_LIMIT_MAX) {
    clickTimestamps.set(ip, times)
    return true
  }
  times.push(now)
  clickTimestamps.set(ip, times)
  return false
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function getIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params
  const home = new URL('/', request.url)

  const rawIp  = getIp(request)
  const ipHash = rawIp ? hashIp(rawIp) : null

  // Bot-Filter
  if (isBot(request)) {
    console.warn('[track] blocked:', 'bot', ipHash)
    return NextResponse.redirect(home, { status: 302 })
  }

  // Rate-Limit
  if (rawIp) {
    if (isRateLimited(rawIp)) {
      console.warn('[track] blocked:', 'rate-limit', ipHash)
      return new NextResponse(null, { status: 429 })
    }
  } else {
    console.warn('[track] no IP detectable')
  }

  // Link laden
  const link = await prisma.affiliateLink.findUnique({
    where:  { id: linkId },
    select: { url: true, isActive: true },
  })

  // Unbekannter oder inaktiver Link → zur Startseite
  if (!link || !link.isActive) {
    return NextResponse.redirect(home, { status: 302 })
  }

  // Click persistieren — Fehler blockieren den Redirect nicht
  try {
    const referrer  = request.headers.get('referer')      ?? null
    const userAgent = request.headers.get('user-agent')   ?? null
    await prisma.affiliateClick.create({
      data: {
        affiliateLinkId: linkId,
        referrer,
        sessionId: null,
        userAgent,
        ipHash,
      },
    })
  } catch (error) {
    console.error('[track]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
  }

  return NextResponse.redirect(link.url, { status: 302 })
}
