/**
 * Datei: app/ratgeber/page.tsx
 *
 * Zweck: Übersicht aller publizierten Ratgeber-Artikel — lädt echte Daten aus Prisma.
 * Aufbau: Featured Guide → Beliebte Guides Grid → Tool-Vergleiche Grid
 *
 * Design-Referenz:
 * - Kein eigener Screenshot — Layout bleibt identisch zur statischen Vorgängerversion.
 *
 * Wichtig:
 * - Filter-Pills sind vorerst dekorativ (Interaktivität ist Phase 5).
 * - Featured = neuester Artikel vom Typ guide oder top_list.
 * - Vergleiche werden separat unten angezeigt.
 */

import { prisma } from '@/lib/prisma'

export const revalidate = 3600

// Lesbare Bezeichnungen für jeden Artikel-Typ
const typLabels: Record<string, string> = {
  guide:      'Guide',
  top_list:   'Top-Liste',
  comparison: 'Vergleich',
  tutorial:   'Anleitung',
}

// Statische Filter-Labels für die Pills (Interaktivität folgt in Phase 5)
const filterPills = ['Alle', 'Tool-Guides', 'Top-Listen', 'Vergleiche', 'Anleitungen', 'KI', 'Buchhaltung', 'Projektmanagement', 'Freelancer', 'Teams']

export default async function RatgeberSeite() {
  // Alle publizierten Artikel laden, neueste zuerst
  // Tools werden für die Featured-Box (Logo-Vorschau) mitgeladen
  const articles = await prisma.article.findMany({
    where: { published: true },
    include: {
      tools: {
        include: {
          tool: {
            include: { translations: { where: { locale: 'de' } } },
          },
        },
        take: 5,
      },
    },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Aufteilung: Featured ist der neueste Guide oder Top-Liste
  const featured   = articles.find(a => a.type === 'guide' || a.type === 'top_list') ?? null
  // Beliebte Guides: alle nicht-Vergleiche außer dem Featured
  const guides     = articles.filter(a => a.type !== 'comparison' && a.id !== featured?.id)
  // Vergleiche: nur Artikel vom Typ comparison
  const comparisons = articles.filter(a => a.type === 'comparison')

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Ratgeber
      </p>

      {/* Titel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Ratgeber & Guides
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Praxisnahe Guides, Vergleiche und Anleitungen rund um digitale Tools
        für Gründer, Selbstständige und kleine Teams.
      </p>

      {/* Suchfeld (dekorativ — Interaktivität Phase 5) */}
      <input
        type="text"
        placeholder="Artikel, Tool oder Thema suchen ..."
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '24px',
        }}
      />

      {/* Filter-Pills (dekorativ — Interaktivität Phase 5) */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {filterPills.map((filter, index) => (
          <span key={filter} style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            backgroundColor: index === 0 ? 'var(--color-cta)' : 'var(--color-bg-card)',
            color: index === 0 ? 'white' : 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: index === 0 ? '600' : '400',
            cursor: 'default',
          }}>
            {filter}
          </span>
        ))}
      </div>

      {/* ─── Empty State: Keine Artikel vorhanden ─── */}
      {articles.length === 0 && (
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Noch keine Artikel veröffentlicht.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Guides, Top-Listen und Vergleiche erscheinen hier, sobald sie veröffentlicht werden.
          </p>
        </div>
      )}

      {/* ─── Featured Guide ─── */}
      {featured && (() => {
        const dateStr = (featured.publishedAt ?? featured.createdAt).toLocaleDateString('de-DE', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        const toolLogos = featured.tools.map((at) => ({
          id: at.tool.id,
          name: at.tool.translations[0]?.name ?? at.tool.slug,
          kuerzel: (at.tool.translations[0]?.name ?? at.tool.slug).charAt(0).toUpperCase(),
        }))

        return (
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '32px',
            marginBottom: '48px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '32px',
          }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                display: 'block',
              }}>
                Featured Guide
              </span>

              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '12px',
                color: 'var(--color-text-primary)',
              }}>
                {featured.title}
              </h2>

              <p style={{
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6',
                marginBottom: '20px',
              }}>
                {featured.subtitle}
              </p>

              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                {typLabels[featured.type] ?? featured.type} · {dateStr}
              </p>

              <a href={`/ratgeber/${featured.slug}`} style={{
                backgroundColor: 'var(--color-cta)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: 'var(--radius-btn)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                Guide lesen
              </a>
            </div>

            {/* Tool-Logos: nur anzeigen wenn Artikel Tools enthält */}
            {toolLogos.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {toolLogos.map((t) => (
                  <div key={t.id} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-cta)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '16px',
                      marginBottom: '4px',
                    }}>
                      {t.kuerzel}
                    </div>
                    <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{t.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      {/* ─── Beliebte Guides ─── */}
      {guides.length > 0 && (
        <>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            fontWeight: '600',
            marginBottom: '20px',
            color: 'var(--color-text-primary)',
          }}>
            Beliebte Guides
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '48px',
          }}>
            {guides.map((artikel) => {
              const dateStr = (artikel.publishedAt ?? artikel.createdAt).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <a key={artikel.id} href={`/ratgeber/${artikel.slug}`} style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-badge-bg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    marginBottom: '12px',
                  }}>
                    {typLabels[artikel.type] ?? artikel.type}
                  </span>

                  <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', lineHeight: '1.3' }}>
                    {artikel.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {artikel.subtitle}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{dateStr}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Artikel lesen →</span>
                  </div>
                </a>
              )
            })}
          </div>
        </>
      )}

      {/* ─── Tool-Vergleiche ─── */}
      {comparisons.length > 0 && (
        <>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            fontWeight: '600',
            marginBottom: '20px',
            color: 'var(--color-text-primary)',
          }}>
            Tool-Vergleiche
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
            {comparisons.map((vergleich) => {
              const dateStr = (vergleich.publishedAt ?? vergleich.createdAt).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <a key={vergleich.id} href={`/ratgeber/${vergleich.slug}`} style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-warning-bg)',
                    color: 'var(--color-warning-text)',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    marginBottom: '12px',
                  }}>
                    Vergleich
                  </span>

                  <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', lineHeight: '1.3' }}>
                    {vergleich.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {vergleich.subtitle}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{dateStr}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Artikel lesen →</span>
                  </div>
                </a>
              )
            })}
          </div>
        </>
      )}

    </main>
  )
}
