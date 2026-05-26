/**
 * Datei: app/tools/[slug]/page.tsx
 *
 * Zweck: Tool-Detailseite — lädt echte Daten aus Prisma.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 *
 * Wichtig:
 * Layout bleibt unverändert zur Mock-Version.
 * Nur die Datenquelle wechselt: toolData → Prisma.
 */

import Link from 'next/link'
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
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: { translations: { where: { locale: 'de' } } },
  })
  if (!tool) return {}
  const t = tool.translations[0]
  if (!t) return {}
  const title = `${t.name} — ToolSucher`
  const description = t.shortDescription
  return { title, description, openGraph: { title, description } }
}

export async function generateStaticParams() {
  const tools = await prisma.tool.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return tools.map((t) => ({ slug: t.slug }))
}

export default async function ToolDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      vendor: true,
      categories: {
        include: {
          category: {
            include: { translations: { where: { locale: 'de' } } },
          },
        },
      },
      affiliateLinks: {
        where: { isActive: true },
        orderBy: { isPrimary: 'desc' },
        take: 1,
      },
      tags: { include: { tag: true } },
    },
  })

  if (!tool || !tool.published) notFound()

  const t = tool.translations[0]
  if (!t) notFound()

  const primaryLink = tool.affiliateLinks[0]
  // Tracking-URL wenn Affiliate-Link vorhanden, sonst Vendor-Website als Fallback
  const primaryUrl = primaryLink
    ? `/api/track/${primaryLink.id}`
    : (tool.vendor.website ?? '#')
  const categoryNames = tool.categories
    .map((tc) => tc.category.translations[0]?.name)
    .filter(Boolean)
    .join(' · ')

  const preisFormatted = formatPreis(tool.startingPriceMonthly)

  const tabs = ['Überblick', 'Funktionen', 'Preise', 'Vergleich', 'Alternativen', 'FAQ']

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</Link>
        {' › '}
        <Link href="/kategorien" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          {categoryNames || 'Tools'}
        </Link>
        {' › '}
        {t.name}
      </p>

      {/* ─── HERO: 3 Spalten ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '32px', marginBottom: '32px' }}>

        {/* Spalte 1: Tool-Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
              border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {tool.logoUrl ? (
                <img src={tool.logoUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: 'white', fontWeight: '700', fontSize: '28px' }}>
                  {t.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
                {t.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                {categoryNames}
              </p>
              {tool.published && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-badge-bg)',
                  border: '1px solid var(--color-border)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}>
                  ✓ Verifiziertes Tool
                </span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            {t.shortDescription}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {tool.hasFreePlan && (
              <span style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '3px 10px',
                borderRadius: '20px',
              }}>
                ✓ Free Plan
              </span>
            )}
            {tool.tags.map(({ tag }) => (
              <span key={tag.id} style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '3px 10px',
                borderRadius: '20px',
              }}>
                {tag.name}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer" style={{
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              Zum Anbieter ↗
            </a>
            <Link href="/vergleichen" style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid var(--color-border)',
            }}>
              Vergleichen
            </Link>
            {tool.isAffiliate && (
              <span style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '3px 10px',
                borderRadius: '20px',
              }}>
                Partnerlink
              </span>
            )}
          </div>
        </div>

        {/* Spalte 2: Screenshot */}
        <div style={{
          backgroundColor: 'var(--color-badge-bg)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {tool.screenshotUrl ? (
            <img
              src={tool.screenshotUrl}
              alt={`${t.name} Screenshot`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Tool-Screenshot
            </span>
          )}
        </div>

        {/* Spalte 3: Preisbox */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Plan & Preisdetails</span>
            {tool.hasFreePlan && (
              <span style={{
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '11px',
              }}>
                Kostenlos
              </span>
            )}
          </div>

          <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{preisFormatted}</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            pro Monat (Einstiegspreis)
          </p>

          {t.features.slice(0, 4).map((feature) => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-cta)' }}>✓</span>
              {feature}
            </div>
          ))}

          <a href={primaryUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'block',
            textAlign: 'center',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '16px',
            marginBottom: '8px',
          }}>
            Zum Anbieter ↗
          </a>
          {tool.isAffiliate && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '8px' }}>
              Affiliate-Link · Für dich keine Mehrkosten
            </p>
          )}
        </div>

      </div>

      {/* ─── TABS ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid var(--color-border)',
        marginBottom: '40px',
      }}>
        {tabs.map((tab, index) => (
          <a key={tab} href="#" style={{
            padding: '12px 20px',
            textDecoration: 'none',
            fontSize: '14px',
            color: index === 0 ? 'var(--color-cta)' : 'var(--color-text-secondary)',
            borderBottom: index === 0 ? '2px solid var(--color-cta)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: index === 0 ? '600' : '400',
          }}>
            {tab}
          </a>
        ))}
      </div>

      {/* ─── ÜBERBLICK ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '48px' }}>

        {/* Kurzfazit + Stärken/Schwächen */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
            Kurzfazit
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            {t.longDescription ?? t.shortDescription}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Stärken</p>
              {t.strengths.map((s) => (
                <div key={s} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: 'var(--color-error)' }}>Schwächen</p>
              {t.weaknesses.map((s) => (
                <div key={s} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-error)', flexShrink: 0 }}>✗</span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Für wen geeignet? */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
            Für wen geeignet?
          </h2>
          {t.bestFor.map((gruppe) => (
            <div key={gruppe} style={{ marginBottom: '12px', display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-cta)', flexShrink: 0 }}>✓</span>
              <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{gruppe}</span>
            </div>
          ))}
        </div>

        {/* Für wen nicht geeignet? */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
            Für wen eher nicht geeignet?
          </h2>
          {t.notIdealFor.map((n) => (
            <div key={n} style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span style={{ flexShrink: 0 }}>✗</span>{n}
            </div>
          ))}
        </div>

      </div>

      {/* ─── FUNKTIONEN ──────────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700' }}>Funktionen</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {t.features.map((feature) => (
            <div key={feature} style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '16px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✓</div>
              <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PREISE ──────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '48px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
          Preise
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Einstieg ab {preisFormatted} / Monat.
          {tool.hasFreePlan ? ' Kostenloser Plan verfügbar.' : ''}
          {' '}Aktuelle Preise und Tarife direkt beim Anbieter prüfen.
        </p>
        <a href={primaryUrl} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-cta)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 'var(--radius-btn)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          Alle Preispläne ansehen ↗
        </a>
      </div>

    </main>
  )
}
