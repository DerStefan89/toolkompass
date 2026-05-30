/**
 * Datei: app/opengraph-image.tsx
 *
 * Zweck: Default OG-Image für die Startseite — statisch, Edge Runtime.
 * Wird automatisch als og:image und twitter:image eingebunden.
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ToolSucher — Digitale Business-Tools entdecken'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#f5f0e8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div style={{
          fontSize: '20px',
          color: '#8B7355',
          marginBottom: '24px',
          fontWeight: '600',
        }}>
          ToolSucher
        </div>
        <div style={{
          fontSize: '64px',
          fontWeight: '700',
          color: '#1a1a1a',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '800px',
        }}>
          Digitale Business-Tools entdecken & vergleichen
        </div>
        <div style={{
          fontSize: '24px',
          color: '#666666',
          maxWidth: '700px',
        }}>
          Kuratierte Tools für Gründer, Selbstständige und kleine Teams in Deutschland
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
