/**
 * Datei: app/ratgeber/[slug]/page.tsx
 *
 * Zweck: Ratgeber-Detailseite — lädt echte Daten aus Prisma.
 * Rendert Artikel-Sections und empfohlene Tools aus der DB.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Artikel-Layout ähnlich)
 *
 * Wichtig:
 * "Verwandte Artikel" fehlt im Datenmodell und wird daher weggelassen.
 * Per-Section-Tools aus dem Mock werden durch eine globale Tool-Box ersetzt.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, subtitle: true },
  })
  if (!article) return {}
  const title = `${article.title} — ToolSucher`
  const description = article.subtitle
  return { title, description, openGraph: { title, description } }
}

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return articles.map((a) => ({ slug: a.slug }))
}

const typLabels: Record<string, string> = {
  guide: 'Guide',
  top_list: 'Top-Liste',
  comparison: 'Vergleich',
  tutorial: 'Anleitung',
}

export default async function BlogArtikelSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { sortOrder: 'asc' } },
      tools: {
        include: {
          tool: {
            include: { translations: { where: { locale: 'de' } } },
          },
        },
      },
    },
  })

  if (!article || !article.published) notFound()

  const dateStr = (article.publishedAt ?? article.createdAt).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const empfohleneTools = article.tools.map((at) => ({
    tool: at.tool,
    name: at.tool.translations[0]?.name ?? at.tool.slug,
    kuerzel: (at.tool.translations[0]?.name ?? at.tool.slug).charAt(0).toUpperCase(),
  }))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/ratgeber" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Ratgeber</a>
        {' › '}
        {article.title}
      </p>

      {/* Hauptbereich */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

        {/* Linke Seite — Artikel */}
        <div style={{ flex: 1 }}>

          {/* Typ-Badge + Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: 'var(--color-badge-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: '600',
            }}>
              {typLabels[article.type] ?? article.type}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {dateStr}
            </span>
          </div>

          {/* Titel */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '40px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            {article.title}
          </h1>

          {/* Untertitel */}
          <p style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            {article.subtitle}
          </p>

          {/* Affiliate-Hinweis */}
          <div style={{
            backgroundColor: 'var(--color-badge-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 16px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
          }}>
            ℹ️ Dieser Artikel enthält Tool-Empfehlungen. Einige Links sind Affiliate-Links.
          </div>

          {/* Empfohlene Tools Box */}
          {empfohleneTools.length > 0 && (
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              marginBottom: '40px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                Im Artikel empfohlene Tools:
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {empfohleneTools.map(({ tool, name, kuerzel }) => (
                  <a key={tool.id} href={`/tools/${tool.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--color-cta)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px',
                    }}>
                      {kuerzel}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>{name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {article.sections.map((section) => (
            <div key={section.id} style={{ marginBottom: '40px' }}>
              {section.heading && (
                <h2 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '26px',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  marginBottom: '16px',
                }}>
                  {section.heading}
                </h2>
              )}
              <p style={{
                fontSize: section.heading ? '15px' : '16px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.8',
              }}>
                {section.content}
              </p>
            </div>
          ))}

        </div>

        {/* Rechte Sidebar */}
        <div style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '24px' }}>

          {/* Autor */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Geschrieben von</p>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>ToolSucher Redaktion</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Kuratiert und geprüft durch das ToolSucher Team.
            </p>
          </div>

          {/* Tool-Finder CTA */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
              Nicht sicher welches Tool passt?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              Beantworte 4 Fragen und finde dein passendes Tool.
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
