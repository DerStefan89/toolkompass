/**
 * Datei: app/api/track/[linkId]/route.ts
 *
 * Zweck: Affiliate-Click-Tracking mit anschließendem Redirect zur echten Ziel-URL.
 *
 * Ablauf:
 *   1. AffiliateLink anhand der linkId aus der DB laden.
 *   2. AffiliateClick-Eintrag speichern (referrer aus Request-Header).
 *   3. 302-Redirect zur echten Affiliate-URL.
 *
 * Wichtig:
 * - Click wird VOR dem Redirect gespeichert — danach ist die Kontrolle weg.
 * - 302 (nicht 301) damit Browser den Redirect nicht dauerhaft cached.
 * - Inaktive oder unbekannte Links → Fallback-Redirect zur Startseite.
 * - sessionId wird noch nicht befüllt (kein User-Auth im MVP).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params

  const link = await prisma.affiliateLink.findUnique({
    where:  { id: linkId },
    select: { url: true, isActive: true },
  })

  // Unbekannter oder inaktiver Link → zur Startseite
  if (!link || !link.isActive) {
    return NextResponse.redirect(new URL('/', request.url), { status: 302 })
  }

  // Click vor dem Redirect persistieren
  const referrer = request.headers.get('referer') ?? null
  await prisma.affiliateClick.create({
    data: {
      affiliateLinkId: linkId,
      referrer,
      sessionId: null,
    },
  })

  return NextResponse.redirect(link.url, { status: 302 })
}
