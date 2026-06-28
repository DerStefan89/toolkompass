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

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Ratgeber | ToolSucher',
  description: 'Anleitungen und Entscheidungshilfen rund um Business-Tools für Selbstständige, Gründer und kleine Teams.',
  alternates: { canonical: '/ratgeber' },
  openGraph: {
    title: 'Ratgeber | ToolSucher',
    description: 'Anleitungen und Entscheidungshilfen rund um Business-Tools für Selbstständige, Gründer und kleine Teams.',
  },
}

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
  // Tools werden für die Featured-Box (Logo-Vorschau) mitgeladen.
  // Build-sicher: bei DB-Ausfall zur Build-Zeit leere Defaults statt Crash.
  async function ladeArtikel() {
    return prisma.article.findMany({
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
  }

  let articles: Awaited<ReturnType<typeof ladeArtikel>> = []
  try {
    articles = await ladeArtikel()
  } catch (error) {
    console.error('[Ratgeber] DB-Query fehlgeschlagen:', error)
  }

  // Aufteilung: Featured ist der neueste Guide oder Top-Liste
  const featured   = articles.find(a => a.type === 'guide' || a.type === 'top_list') ?? null
  // Beliebte Guides: alle nicht-Vergleiche außer dem Featured
  const guides     = articles.filter(a => a.type !== 'comparison' && a.id !== featured?.id)
  // Vergleiche: nur Artikel vom Typ comparison
  const comparisons = articles.filter(a => a.type === 'comparison')

  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Ratgeber
      </p>

      {/* Titel */}
      <h1 className={styles.pageTitle}>Ratgeber & Guides</h1>

      <p className={styles.pageDesc}>
        Praxisnahe Guides, Vergleiche und Anleitungen rund um digitale Tools
        für Gründer, Selbstständige und kleine Teams.
      </p>

      {/* Suchfeld (dekorativ — Interaktivität Phase 5) */}
      <input
        type="text"
        placeholder="Artikel, Tool oder Thema suchen ..."
        className={styles.searchInput}
      />

      {/* Filter-Pills (dekorativ — Interaktivität Phase 5) */}
      <div className={styles.pillsRow}>
        {filterPills.map((filter, index) => (
          <span key={filter} className={index === 0 ? styles.pillActive : styles.pill}>
            {filter}
          </span>
        ))}
      </div>

      {/* ─── Empty State: Keine Artikel vorhanden ─── */}
      {articles.length === 0 && (
        <div className={styles.emptyCard}>
          <p className={styles.emptyTitle}>Noch keine Artikel veröffentlicht.</p>
          <p className={styles.emptyDesc}>
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
          <div className={styles.featuredCard}>
            <div className={styles.featuredLeft}>
              <span className={styles.featuredLabel}>Featured Guide</span>

              <h2 className={styles.featuredTitle}>{featured.title}</h2>

              <p className={styles.featuredSubtitle}>{featured.subtitle}</p>

              <p className={styles.featuredMeta}>
                {typLabels[featured.type] ?? featured.type} · {dateStr}
              </p>

              <a href={`/ratgeber/${featured.slug}`} className={styles.featuredBtn}>
                Guide lesen
              </a>
            </div>

            {/* Tool-Logos: nur anzeigen wenn Artikel Tools enthält */}
            {toolLogos.length > 0 && (
              <div className={styles.featuredLogos}>
                {toolLogos.map((t) => (
                  <div key={t.id} className={styles.featuredLogoItem}>
                    <div className={styles.featuredLogoCircle}>{t.kuerzel}</div>
                    <p className={styles.featuredLogoName}>{t.name}</p>
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
          <h2 className={styles.sectionTitle}>Beliebte Guides</h2>

          <div className={styles.articleGrid}>
            {guides.map((artikel) => {
              const dateStr = (artikel.publishedAt ?? artikel.createdAt).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <a key={artikel.id} href={`/ratgeber/${artikel.slug}`} className={styles.articleCard}>
                  <span className={styles.typeBadge}>
                    {typLabels[artikel.type] ?? artikel.type}
                  </span>

                  <h3 className={styles.cardTitle}>{artikel.title}</h3>

                  <p className={styles.cardSubtitle}>{artikel.subtitle}</p>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardDate}>{dateStr}</span>
                    <span className={styles.cardReadLink}>Artikel lesen →</span>
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
          <h2 className={styles.sectionTitle}>Tool-Vergleiche</h2>

          <div className={styles.articleGrid}>
            {comparisons.map((vergleich) => {
              const dateStr = (vergleich.publishedAt ?? vergleich.createdAt).toLocaleDateString('de-DE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <a key={vergleich.id} href={`/ratgeber/${vergleich.slug}`} className={styles.articleCard}>
                  <span className={styles.compBadge}>Vergleich</span>

                  <h3 className={styles.cardTitle}>{vergleich.title}</h3>

                  <p className={styles.cardSubtitle}>{vergleich.subtitle}</p>

                  <div className={styles.cardFooter}>
                    <span className={styles.cardDate}>{dateStr}</span>
                    <span className={styles.cardReadLink}>Artikel lesen →</span>
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
