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
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ─── Validierung ──────────────────────────────────────────────────────────────

/**
 * E-Mail-Prüfung bewusst so einfach wie app/einloggen/actions.ts:38
 * (enthält @ und .), nicht RFC-strikt.
 */
const inquirySchema = z.object({
  name: z.string().trim().min(1),
  email: z
    .string()
    .trim()
    .min(1)
    .refine((value) => value.includes('@') && value.includes('.')),
  description: z.string().trim().min(1),
  companyType: z.string().trim().nullish(),
  targetUsers: z.string().trim().nullish(),
  features: z.string().trim().nullish(),
  examples: z.string().trim().nullish(),
  budget: z.string().trim().nullish(),
  timeline: z.string().trim().nullish(),
})

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

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }
  const body = json as Record<string, unknown>

  // Honeypot: befülltes Feld = Bot → still verwerfen (kein Fehler)
  // Bewusst außerhalb des Zod-Schemas, lose Koerzion bleibt unverändert
  // (Bot-Filter-Verhalten ist Bestandsschutz, keine Eingabevalidierung).
  const honeypot = String(body._honeypot ?? '')
  if (honeypot.length > 0) {
    return NextResponse.json({ success: true })
  }

  const parsed = inquirySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Name, E-Mail und Beschreibung sind Pflichtfelder.' },
      { status: 400 }
    )
  }
  const { name, email, description, companyType, targetUsers, features, examples, budget, timeline } =
    parsed.data

  try {
    await prisma.inquiry.create({
      data: {
        name,
        email,
        companyType: companyType || null,
        description,
        targetUsers: targetUsers || null,
        features: features || null,
        examples: examples || null,
        budget: budget || null,
        timeline: timeline || null,
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
