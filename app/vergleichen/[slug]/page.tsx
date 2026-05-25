/**
 * Datei: app/vergleichen/[slug]/page.tsx
 *
 * Zweck: Vergleichs-Detailseite — lädt echte Daten aus Prisma.
 * Vergleichstabelle aus ComparisonRow, Stärken/Schwächen aus ToolTranslation.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 *
 * Wichtig:
 * Tool-Farben sind nicht in der DB — A bekommt CTA-Farbe, B eine Kontrastfarbe.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      toolA: { include: { translations: { where: { locale: 'de' } } } },
      toolB: { include: { translations: { where: { locale: 'de' } } } },
    },
  })
  if (!comparison) return {}
  const nameA = comparison.toolA.translations[0]?.name ?? comparison.toolA.slug
  const nameB = comparison.toolB.translations[0]?.name ?? comparison.toolB.slug
  const title = `${nameA} vs ${nameB} — ToolSucher`
  const description = `Vergleich: ${nameA} vs ${nameB}`
  return { title, description, openGraph: { title, description } }
}

export async function generateStaticParams() {
  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return comparisons.map((c) => ({ slug: c.slug }))
}

const TOOL_FARBEN = ['var(--color-cta)', '#c8a96e'] as const

export default async function VergleichDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      toolA: {
        include: {
          translations: { where: { locale: 'de' } },
          affiliateLinks: { where: { isActive: true }, orderBy: { isPrimary: 'desc' }, take: 1 },
          categories: {
            include: { category: { include: { translations: { where: { locale: 'de' } } } } },
            take: 1,
          },
        },
      },
      toolB: {
        include: {
          translations: { where: { locale: 'de' } },
          affiliateLinks: { where: { isActive: true }, orderBy: { isPrimary: 'desc' }, take: 1 },
        },
      },
      rows: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!comparison || !comparison.published) notFound()

  const tA = comparison.toolA.translations[0]
  const tB = comparison.toolB.translations[0]
  if (!tA || !tB) notFound()

  const kategorieName = comparison.toolA.categories[0]?.category.translations[0]?.name ?? 'Tools'

  const tools = [
    {
      name: tA.name,
      kuerzel: tA.name.charAt(0).toUpperCase(),
      farbe: TOOL_FARBEN[0],
      preis: formatPreis(comparison.toolA.startingPriceMonthly, { prefix: 'ab', suffix: '/ Monat' }),
      beschreibung: tA.shortDescription,
      vorteile: tA.strengths,
      nachteile: tA.weaknesses,
      passendeWenn: tA.bestFor,
      url: comparison.toolA.affiliateLinks[0]?.url ?? '#',
    },
    {
      name: tB.name,
      kuerzel: tB.name.charAt(0).toUpperCase(),
      farbe: TOOL_FARBEN[1],
      preis: formatPreis(comparison.toolB.startingPriceMonthly, { prefix: 'ab', suffix: '/ Monat' }),
      beschreibung: tB.shortDescription,
      vorteile: tB.strengths,
      nachteile: tB.weaknesses,
      passendeWenn: tB.bestFor,
      url: comparison.toolB.affiliateLinks[0]?.url ?? '#',
    },
  ]

  const [toolA, toolB] = tools

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/vergleichen" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Vergleichen</a>
        {' › '}
        {toolA.name} vs {toolB.name}
      </p>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '48px', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '42px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '12px',
          }}>
            {toolA.name} vs {toolB.name}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            {kategorieName}-Tools im Vergleich: Welche Lösung passt besser zu Selbstständigen, Freelancern und kleinen Teams?
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px 24px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '8px',
            backgroundColor: toolA.farbe, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '18px',
          }}>
            {toolA.kuerzel}
          </div>
          <span style={{ fontWeight: '700', color: 'var(--color-text-secondary)' }}>vs</span>
          <div style={{
            width: '48px', height: '48px', borderRadius: '8px',
            backgroundColor: toolB.farbe, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '18px',
          }}>
            {toolB.kuerzel}
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              {kategorieName}
            </p>
          </div>
        </div>
      </div>

      {/* ─── UNSER URTEIL ─────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '40px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
          Unser Urteil kurz gesagt
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
          {comparison.verdict}
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href={toolA.url} target="_blank" rel="noopener noreferrer" style={{
            backgroundColor: 'var(--color-cta)', color: 'white',
            padding: '10px 20px', borderRadius: 'var(--radius-btn)',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600',
          }}>
            {toolA.name} ansehen
          </a>
          <a href={toolB.url} target="_blank" rel="noopener noreferrer" style={{
            backgroundColor: 'transparent', color: 'var(--color-text-primary)',
            padding: '10px 20px', borderRadius: 'var(--radius-btn)',
            textDecoration: 'none', fontSize: '14px',
            border: '1px solid var(--color-border)',
          }}>
            {toolB.name} ansehen
          </a>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Affiliate-Link · Für dich keine Mehrkosten
          </span>
        </div>
      </div>

      {/* ─── WELCHES TOOL PASST BESSER? ───────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Welches Tool passt besser zu dir?
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
        {tools.map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '6px',
                backgroundColor: tool.farbe, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '14px',
              }}>
                {tool.kuerzel}
              </div>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{tool.name} passt besser, wenn du ...</p>
            </div>
            {tool.passendeWenn.map((punkt) => (
              <div key={punkt} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <span style={{ color: 'var(--color-cta)' }}>✓</span>{punkt}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ─── DIREKTVERGLEICH TABELLE ──────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Direktvergleich
      </h2>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '48px',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 0', color: 'var(--color-text-secondary)', fontWeight: '600', width: '30%' }}>Kriterium</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: '700', width: '35%' }}>{toolA.name}</th>
              <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: '700', width: '35%' }}>{toolB.name}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((zeile) => (
              <tr key={zeile.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 0', color: 'var(--color-text-secondary)' }}>{zeile.criterion}</td>
                <td style={{ padding: '12px 16px' }}>{zeile.toolAValue}</td>
                <td style={{ padding: '12px 0' }}>{zeile.toolBValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '16px' }}>
          Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.
        </p>
      </div>

      {/* ─── PREISE ───────────────────────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Preise im Vergleich
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
        {tools.map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                backgroundColor: tool.farbe, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '16px', flexShrink: 0,
              }}>
                {tool.kuerzel}
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{tool.name}</p>
                <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{tool.preis}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{tool.beschreibung}</p>
              </div>
            </div>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{
              backgroundColor: 'var(--color-cta)', color: 'white',
              padding: '10px 16px', borderRadius: 'var(--radius-btn)',
              textDecoration: 'none', fontSize: '13px', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Zum Anbieter
            </a>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '48px' }}>
        Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.
      </p>

      {/* ─── VORTEILE & NACHTEILE ─────────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Vorteile und Nachteile
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {tools.map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '6px',
                backgroundColor: tool.farbe, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '14px',
              }}>
                {tool.kuerzel}
              </div>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{tool.name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Vorteile</p>
                {tool.vorteile.map((v) => (
                  <div key={v} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-cta)' }}>✓</span>{v}
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Nachteile</p>
                {tool.nachteile.map((n) => (
                  <div key={n} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-error)' }}>✗</span>{n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
