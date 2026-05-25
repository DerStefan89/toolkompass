/**
 * Datei: app/vergleichen/page.tsx
 *
 * Zweck: Übersicht aller publizierten Vergleiche — lädt echte Daten aus Prisma.
 * Zeigt Vergleichskarten und eine Vorschau-Tabelle des ersten Vergleichs.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 */

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tool-Vergleiche — ToolSucher',
  description: 'Vergleiche die besten Business-Tools direkt nebeneinander und finde die passende Lösung für dein Team.',
  openGraph: {
    title: 'Tool-Vergleiche — ToolSucher',
    description: 'Vergleiche die besten Business-Tools direkt nebeneinander und finde die passende Lösung für dein Team.',
  },
}

export default async function VergleichenSeite() {
  // Promise.all: beide Queries laufen parallel — spart eine sequenzielle Wartezeit
  const [comparisons, featured] = await Promise.all([
    prisma.comparison.findMany({
      where: { published: true },
      include: {
        toolA: {
          include: {
            translations: { where: { locale: 'de' } },
            categories: {
              include: { category: { include: { translations: { where: { locale: 'de' } } } } },
              take: 1,
            },
          },
        },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.comparison.findFirst({
      where: { published: true },
      include: {
        toolA: { include: { translations: { where: { locale: 'de' } } } },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
        rows: { orderBy: { sortOrder: 'asc' }, take: 5 },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Seitentitel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Tools vergleichen
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Vergleiche beliebte Tools nach Preis, Funktionen, Einsatzbereich und Alternativen.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Tool A vs Tool B suchen ..."
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '40px',
        }}
      />

      {/* Beliebte Vergleiche */}
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '22px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        marginBottom: '20px',
      }}>
        Beliebte Vergleiche
      </h2>

      {comparisons.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '48px' }}>
          Noch keine Vergleiche vorhanden.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {comparisons.map((comp) => {
            const tA = comp.toolA.translations[0]
            const tB = comp.toolB.translations[0]
            if (!tA || !tB) return null

            const kategorieName = comp.toolA.categories[0]?.category.translations[0]?.name
            const beschreibung = kategorieName
              ? `${kategorieName} für Selbstständige und kleine Teams.`
              : `${tA.name} und ${tB.name} im direkten Vergleich.`

            return (
              <a
                key={comp.id}
                href={`/vergleichen/${comp.slug}`}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* Icon — erste Buchstaben beider Tools */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-badge-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                  color: 'var(--color-text-secondary)',
                }}>
                  {tA.name.charAt(0)}{tB.name.charAt(0)}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                    {tA.name} vs {tB.name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {beschreibung}
                  </p>
                </div>

                {/* Pfeil */}
                <span style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Ansehen →</span>
              </a>
            )
          })}
        </div>
      )}

      {/* Vergleichsdetail: Vorschau */}
      {featured && (() => {
        const tA = featured.toolA.translations[0]
        const tB = featured.toolB.translations[0]
        if (!tA || !tB) return null

        return (
          <>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '22px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '20px',
            }}>
              Vergleichsdetail: Vorschau
            </h2>

            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '24px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
                {tA.name} vs {tB.name}
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 0', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Kriterium</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: '600' }}>{tA.name}</th>
                    <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: '600' }}>{tB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {featured.rows.map((zeile) => (
                    <tr key={zeile.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 0', color: 'var(--color-text-secondary)' }}>{zeile.criterion}</td>
                      <td style={{ padding: '12px 16px' }}>{zeile.toolAValue}</td>
                      <td style={{ padding: '12px 0' }}>{zeile.toolBValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <a href={`/tools/${featured.toolA.slug}`} style={{
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}>
                  {tA.name} ansehen ↗
                </a>
                <a href={`/tools/${featured.toolB.slug}`} style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  border: '1px solid var(--color-border)',
                }}>
                  {tB.name} ansehen ↗
                </a>
              </div>
            </div>
          </>
        )
      })()}

    </main>
  )
}
