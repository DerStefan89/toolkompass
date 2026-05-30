/**
 * Datei: app/vergleichen/[slug]/opengraph-image.tsx
 *
 * Zweck: Dynamisches OG-Image pro Vergleich — zeigt "ToolA vs ToolB".
 * Node.js Runtime wegen Prisma-Datenbankzugriff.
 */

import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      toolA: { include: { translations: { where: { locale: 'de' } } } },
      toolB: { include: { translations: { where: { locale: 'de' } } } },
    },
  })

  const toolAName = comparison?.toolA.translations[0]?.name ?? 'Tool A'
  const toolBName = comparison?.toolB.translations[0]?.name ?? 'Tool B'
  const verdict = comparison?.verdict ?? ''
  const subtext = verdict.length > 100 ? verdict.slice(0, 100) + '…' : verdict

  return new ImageResponse(
    (
      <div style={{
        width: '1200px',
        height: '630px',
        backgroundColor: '#f5f0e8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '80px',
      }}>
        <div style={{
          fontSize: '20px',
          color: '#8B7355',
          marginBottom: '32px',
          fontWeight: '600',
        }}>
          ToolSucher · Vergleich
        </div>
        <div style={{
          fontSize: '64px',
          fontWeight: '700',
          color: '#1a1a1a',
          lineHeight: '1.1',
          marginBottom: '24px',
        }}>
          {toolAName} vs {toolBName}
        </div>
        <div style={{
          fontSize: '26px',
          color: '#666666',
          maxWidth: '800px',
          lineHeight: '1.4',
        }}>
          {subtext}
        </div>
        <div style={{
          marginTop: '48px',
          backgroundColor: '#1e3a2a',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '18px',
          fontWeight: '600',
        }}>
          Vergleich lesen →
        </div>
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '80px',
          fontSize: '18px',
          color: '#8B7355',
        }}>
          toolsucher.de
        </div>
      </div>
    ),
    { ...size }
  )
}
