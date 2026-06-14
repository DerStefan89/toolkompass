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

import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/json-ld'
import styles from './page.module.css'

const SITE_URL = 'https://toolsucher.de'

export const revalidate = 300

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
  return {
    title,
    description,
    alternates: { canonical: `/ratgeber/${slug}` },
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
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

  const jsonLd = articleJsonLd({
    title: article.title,
    subtitle: article.subtitle,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    slug: article.slug,
  }, SITE_URL)

  const crumbLd = breadcrumbJsonLd([
    { name: 'Startseite', url: SITE_URL },
    { name: 'Ratgeber', url: `${SITE_URL}/ratgeber` },
    { name: article.title, url: `${SITE_URL}/ratgeber/${article.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: crumbLd }} />
      <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/ratgeber" className={styles.breadcrumbLink}>Ratgeber</Link>
        {' › '}
        {article.title}
      </p>

      {/* Hauptbereich */}
      <div className={styles.contentArea}>

        {/* Linke Seite — Artikel */}
        <div className={styles.article}>

          {/* Typ-Badge + Meta */}
          <div className={styles.metaRow}>
            <span className={styles.typeBadge}>
              {typLabels[article.type] ?? article.type}
            </span>
            <span className={styles.metaDate}>{dateStr}</span>
          </div>

          {/* Titel */}
          <h1 className={styles.articleTitle}>{article.title}</h1>

          {/* Untertitel */}
          <p className={styles.articleSubtitle}>{article.subtitle}</p>

          {/* Affiliate-Hinweis */}
          <div className={styles.affiliateNotice}>
            ℹ️ Dieser Artikel enthält Tool-Empfehlungen. Einige Links sind Affiliate-Links.
          </div>

          {/* Empfohlene Tools Box */}
          {empfohleneTools.length > 0 && (
            <div className={styles.toolsBox}>
              <p className={styles.toolsLabel}>Im Artikel empfohlene Tools:</p>
              <div className={styles.toolsList}>
                {empfohleneTools.map(({ tool, name, kuerzel }) => (
                  <a key={tool.id} href={`/tools/${tool.slug}`} className={styles.toolLink}>
                    <div className={styles.toolIcon}>{kuerzel}</div>
                    <p className={styles.toolName}>{name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {article.sections.map((section) => (
            <div key={section.id} className={styles.section}>
              {section.heading && (
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
              )}
              <p className={section.heading ? styles.sectionContent : styles.sectionIntro}>
                {section.content}
              </p>
            </div>
          ))}

        </div>

        {/* Rechte Sidebar */}
        <div className={styles.sidebar}>

          {/* Autor */}
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarAuthorLabel}>Geschrieben von</p>
            <p className={styles.sidebarAuthorName}>ToolSucher Redaktion</p>
            <p className={styles.sidebarAuthorDesc}>
              Kuratiert und geprüft durch das ToolSucher Team.
            </p>
          </div>

          {/* Tool-Finder CTA */}
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarFinderTitle}>Nicht sicher welches Tool passt?</p>
            <p className={styles.sidebarFinderDesc}>
              Beantworte 4 Fragen und finde dein passendes Tool.
            </p>
            <a href="/tool-finder" className={styles.sidebarFinderBtn}>
              Tool-Finder starten
            </a>
          </div>

        </div>

      </div>

    </main>
    </>
  )
}
