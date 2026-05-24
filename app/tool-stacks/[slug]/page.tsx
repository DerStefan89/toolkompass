/**
 * Datei: app/tool-stacks/[slug]/page.tsx
 *
 * Zweck: Dynamische Detailseite für einen Tool-Stack aus der Datenbank.
 *
 * Design-Referenz:
 * - design-refs/5_Tool_Stacks.png
 *
 * Wichtig:
 * ToolStack hat kein Farb-Feld — Logos erhalten Farben aus LOGO_FARBEN per Index.
 * ToolStackItem.note wird als "Wofür"-Zeile angezeigt (optional).
 * Gesamtkosten = Summe aller startingPriceMonthly der Stack-Tools.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'

export const revalidate = 3600

export async function generateStaticParams() {
  const stacks = await prisma.toolStack.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return stacks.map((s) => ({ slug: s.slug }))
}

const LOGO_FARBEN = [
  'var(--color-cta)',
  '#c8a96e',
  '#2563eb',
  '#7c3aed',
  '#dc2626',
  '#0f172a',
] as const

export default async function ToolStackDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const stack = await prisma.toolStack.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      tools: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              categories: {
                include: {
                  category: { include: { translations: { where: { locale: 'de' } } } },
                },
              },
              tags: { include: { tag: true } },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  })

  if (!stack || !stack.published) notFound()

  const t = stack.translations[0]
  if (!t) notFound()

  const gesamtKosten = stack.tools.reduce(
    (sum, item) => sum + (item.tool.startingPriceMonthly ?? 0),
    0,
  )
  const preisGesamt = formatPreis(gesamtKosten, { prefix: 'ab' })

  const gridTemplateColumns = stack.tools.length <= 5
    ? `repeat(${stack.tools.length}, 1fr)`
    : 'repeat(3, 1fr)'

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/tool-stacks" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Tool-Stacks</a>
        {' › '}
        {t.name}
      </p>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-badge-bg)',
          border: '1px solid var(--color-border)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '16px',
        }}>
          {t.targetAudience}
        </span>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '42px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          lineHeight: '1.2',
          marginBottom: '16px',
        }}>
          {t.name}
        </h1>
        {t.description && (
          <p style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 24px',
          }}>
            {t.description}
          </p>
        )}
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Gesamtkosten:{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{preisGesamt} / Monat</strong>
        </p>
      </div>

      {/* Tool-Karten */}
      <div style={{ display: 'grid', gridTemplateColumns, gap: '16px', marginBottom: '48px' }}>
        {stack.tools.map((item, index) => {
          const tool = item.tool
          const tt = tool.translations[0]
          const farbe = LOGO_FARBEN[index % LOGO_FARBEN.length]
          const kuerzel = tt?.name.slice(0, 2).toUpperCase() ?? tool.slug.slice(0, 2).toUpperCase()
          const kategorie = tool.categories[0]?.category.translations[0]?.name ?? '—'
          const badges = tool.tags.map(({ tag }) => tag.name)
          const preis = formatPreis(tool.startingPriceMonthly, { prefix: 'ab', suffix: '/ Monat' })

          return (
            <div
              key={tool.id}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Nummer */}
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--color-text-secondary)',
                marginBottom: '12px',
                letterSpacing: '1px',
              }}>
                {index + 1} / {stack.tools.length}
              </p>

              {/* Logo */}
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '10px',
                backgroundColor: farbe,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
                marginBottom: '14px',
              }}>
                {kuerzel}
              </div>

              {/* Name + Kategorie */}
              <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '2px' }}>
                {tt?.name ?? tool.slug}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                {kategorie}
              </p>

              {/* Wofür (optional aus ToolStackItem.note) */}
              {item.note && (
                <p style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--color-cta)',
                  marginBottom: '12px',
                }}>
                  {item.note}
                </p>
              )}

              {/* Beschreibung */}
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
                marginBottom: '16px',
                flex: 1,
              }}>
                {tt?.shortDescription ?? ''}
              </p>

              {/* Preis */}
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: badges.length > 0 ? '12px' : '16px',
              }}>
                {preis}
              </p>

              {/* Badges */}
              {badges.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {badges.map((badge) => (
                    <span key={badge} style={{
                      backgroundColor: 'var(--color-badge-bg)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Button */}
              <a
                href={`/tools/${tool.slug}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Details ansehen
              </a>
            </div>
          )
        })}
      </div>

      {/* CTA Box */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧭</div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '12px',
        }}>
          Alles in einem Account managen
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.7',
          maxWidth: '500px',
          margin: '0 auto 32px',
        }}>
          Bald kannst du deinen Stack speichern, Kosten tracken, Kündigungsfristen im Blick behalten
          und alle deine Tools direkt von ToolKompass aus öffnen.
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          {[
            '✓ Stack speichern',
            '✓ Kosten tracken',
            '✓ Kündigungen erinnern',
            '✓ Alternativen entdecken',
            '✓ Tools direkt öffnen',
          ].map((feature) => (
            <span key={feature} style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
              {feature}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/einloggen" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
          }}>
            🔔 Benachrichtigen lassen
          </a>
          <a href="/tool-stacks" style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '14px 28px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '15px',
            border: '1px solid var(--color-border)',
          }}>
            Andere Stacks ansehen
          </a>
        </div>
      </div>

    </main>
  )
}
