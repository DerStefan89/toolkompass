/**
 * Datei: app/api/anfrage/route.ts
 *
 * Zweck: Speichert Tool-Entwicklungs-Anfragen in der Inquiry-Tabelle.
 * Keine Auth — öffentliche Route. Rate-Limit: max 3 Anfragen pro IP/Stunde.
 *
 * Wird aufgerufen von:
 * - components/InquiryForm.tsx (parallel zu Formspree)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Rate-Limit (in-memory, sliding window) ──────────────────────────────────

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 Stunde

const requestTimestamps = new Map<string, number[]>()

function getIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const times = (requestTimestamps.get(ip) ?? []).filter((t) => t > cutoff)

  if (times.length >= RATE_LIMIT_MAX) {
    requestTimestamps.set(ip, times)
    return true
  }
  times.push(now)
  requestTimestamps.set(ip, times)
  return false
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip = getIp(request)
  if (ip && isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
      { status: 429 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  // Honeypot: befülltes Feld = Bot → still verwerfen (kein Fehler)
  const honeypot = String(body._honeypot ?? '')
  if (honeypot.length > 0) {
    return NextResponse.json({ success: true })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const description = String(body.description ?? '').trim()

  if (!name || !email || !description) {
    return NextResponse.json(
      { error: 'Name, E-Mail und Beschreibung sind Pflichtfelder.' },
      { status: 400 }
    )
  }

  try {
    await prisma.inquiry.create({
      data: {
        name,
        email,
        companyType: String(body.companyType ?? '').trim() || null,
        description,
        targetUsers: String(body.targetUsers ?? '').trim() || null,
        features: String(body.features ?? '').trim() || null,
        examples: String(body.examples ?? '').trim() || null,
        budget: String(body.budget ?? '').trim() || null,
        timeline: String(body.timeline ?? '').trim() || null,
      },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[anfrage]', error)
    return NextResponse.json(
      { error: 'Speichern fehlgeschlagen.' },
      { status: 500 }
    )
  }
}
