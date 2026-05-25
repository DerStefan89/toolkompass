/**
 * Datei: app/kategorien/[slug]/page.tsx
 *
 * Zweck: Kategorie-Detailseite — lädt echte Daten aus Prisma.
 * Zeigt alle publizierten Tools der Kategorie als Tool-Cards.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 *
 * Wichtig:
 * Layout bleibt unverändert zur Mock-Version.
 * Die Empfehlungsbox (Mock: Buchhaltungs-spezifisch) wird durch
 * echte Tool-Cards ersetzt, da kein strukturiertes Empfehlungsmodell
 * in der DB existiert.
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
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { translations: { where: { locale: 'de' } } },
  })
  if (!category) return {}
  const t = category.translations[0]
  if (!t) return {}
  const title = `${t.name} Tools — ToolKompass`
  const description = t.description ?? ''
  return { title, description, openGraph: { title, description } }
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return categories.map((c) => ({ slug: c.slug }))
}

export default async function KategorieDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Next.js 15: params ist ein Promise — muss explizit awaited werden (Breaking Change vs. Next.js 14)
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      tools: {
        where: { tool: { published: true } },
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              tags: { include: { tag: true } },
              affiliateLinks: {
                where: { isActive: true },
                orderBy: { isPrimary: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  })

  if (!category || !category.published) notFound()

  const t = category.translations[0]
  if (!t) notFound()

  const tools = category.tools.map((tc) => tc.tool)
  const sidebarTags = category.tags.map((ct) => ct.tag.name)

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/kategorien" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Kategorien</a>
        {' › '}
        {t.name}
      </p>

      {/* Hero */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        gap: '48px',
      }}>
        <div style={{ flex: 1 }}>
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
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
          }}>
            {t.description}
          </p>
        </div>
        <div style={{
          width: '280px',
          height: '180px',
          backgroundColor: 'var(--color-badge-bg)',
          borderRadius: 'var(--radius-card)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}>
          {category.icon ?? '🗂️'}
        </div>
      </div>

      {/* Hauptbereich */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* Linke Seite */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
            }}>
              Top-Empfehlungen
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {tools.length} Tools
            </span>
          </div>

          {tools.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', padding: '24px 0' }}>
              Noch keine Tools in dieser Kategorie.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {tools.map((tool) => {
                const tl = tool.translations[0]
                const name = tl?.name ?? tool.slug
                const primaryUrl = tool.affiliateLinks[0]?.url ?? '#'
                const preis = formatPreis(tool.startingPriceMonthly, { prefix: 'ab' })

                return (
                  <div key={tool.id} style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '8px',
                        backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                        border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>
                      {tl?.shortDescription}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {tool.hasFreePlan && (
                        <span style={{
                          backgroundColor: 'var(--color-badge-bg)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                        }}>
                          Free Plan
                        </span>
                      )}
                      {tool.tags.slice(0, 2).map(({ tag }) => (
                        <span key={tag.id} style={{
                          backgroundColor: 'var(--color-badge-bg)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                        }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      {preis} / Monat
                    </p>

                    <a href={`/tools/${tool.slug}`} style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-cta)',
                      color: 'white',
                      padding: '8px',
                      borderRadius: 'var(--radius-btn)',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '8px',
                    }}>
                      Details ansehen
                    </a>
                    <a href={primaryUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: 'block',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      fontSize: '12px',
                      textDecoration: 'none',
                    }}>
                      Zum Anbieter →
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rechte Sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>

          {sidebarTags.length > 0 && (
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
                Worauf achten?
              </h3>
              {sidebarTags.map((tag) => (
                <div key={tag} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  fontSize: '13px',
                }}>
                  <span style={{ color: 'var(--color-cta)' }}>✓</span>
                  {tag}
                </div>
              ))}
            </div>
          )}

          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>
              Nicht sicher?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              Finde in 2 Minuten das passende Tool.
            </p>
            <a href="/tool-finder" style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '10px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              Tool-Finder starten
            </a>
          </div>

        </div>

      </div>

    </main>
  )
}
