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
 * Erlaubte Inline-Styles: backgroundColor auf Icon-Divs (tool.farbe — Laufzeitwert).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import { comparisonJsonLd, breadcrumbJsonLd } from '@/lib/seo/json-ld'
import styles from './page.module.css'

const SITE_URL = 'https://toolsucher.de'

export const dynamic = 'force-dynamic'
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
  return {
    title,
    description,
    alternates: { canonical: `/vergleichen/${slug}` },
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
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
      preis: formatPreis(comparison.toolA.startingPriceCents, { prefix: 'ab', suffix: '/ Monat', hasFreePlan: comparison.toolA.hasFreePlan }),
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
      preis: formatPreis(comparison.toolB.startingPriceCents, { prefix: 'ab', suffix: '/ Monat', hasFreePlan: comparison.toolB.hasFreePlan }),
      beschreibung: tB.shortDescription,
      vorteile: tB.strengths,
      nachteile: tB.weaknesses,
      passendeWenn: tB.bestFor,
      url: comparison.toolB.affiliateLinks[0]?.url ?? '#',
    },
  ]

  const [toolA, toolB] = tools

  const jsonLd = comparisonJsonLd({
    slug: comparison.slug,
    verdict: comparison.verdict,
    updatedAt: comparison.updatedAt,
    toolAName: tA.name,
    toolBName: tB.name,
  }, SITE_URL)

  const crumbLd = breadcrumbJsonLd([
    { name: 'Startseite', url: SITE_URL },
    { name: 'Vergleichen', url: `${SITE_URL}/vergleichen` },
    { name: `${tA.name} vs ${tB.name}`, url: `${SITE_URL}/vergleichen/${comparison.slug}` },
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
        <Link href="/vergleichen" className={styles.breadcrumbLink}>Vergleichen</Link>
        {' › '}
        {toolA.name} vs {toolB.name}
      </p>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <div className={styles.heroRow}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>{toolA.name} vs {toolB.name}</h1>
          <p className={styles.heroDesc}>
            {kategorieName}-Tools im Vergleich: Welche Lösung passt besser zu Selbstständigen, Freelancern und kleinen Teams?
          </p>
        </div>

        {/* vs-Box: Mobile ausgeblendet */}
        <div className={styles.heroVsBox}>
          {/* backgroundColor: tool.farbe — erlaubter Inline-Style */}
          <div className={styles.toolIconLg} style={{ backgroundColor: toolA.farbe }}>
            {toolA.kuerzel}
          </div>
          <span className={styles.vsLabel}>vs</span>
          <div className={styles.toolIconLg} style={{ backgroundColor: toolB.farbe }}>
            {toolB.kuerzel}
          </div>
          <div>
            <p className={styles.vsKategorie}>{kategorieName}</p>
          </div>
        </div>
      </div>

      {/* ─── UNSER URTEIL ─────────────────────────────────────── */}
      <div className={styles.verdictCard}>
        <h2 className={styles.verdictTitle}>Unser Urteil kurz gesagt</h2>
        <p className={styles.verdictText}>{comparison.verdict}</p>

        {/* CTA-Buttons: untereinander Mobile, nebeneinander Desktop */}
        <div className={styles.ctaRow}>
          <a href={toolA.url} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            {toolA.name} ansehen
          </a>
          <a href={toolB.url} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
            {toolB.name} ansehen
          </a>
          <span className={styles.affiliateNote}>Affiliate-Link · Für dich keine Mehrkosten</span>
        </div>
      </div>

      {/* ─── WELCHES TOOL PASST BESSER? ───────────────────────── */}
      <h2 className={styles.sectionTitle}>Welches Tool passt besser zu dir?</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.fitCard}>
            <div className={styles.fitCardHeader}>
              {/* backgroundColor: tool.farbe — erlaubter Inline-Style */}
              <div className={styles.toolIconMd} style={{ backgroundColor: tool.farbe }}>
                {tool.kuerzel}
              </div>
              <p className={styles.fitCardTitle}>{tool.name} passt besser, wenn du ...</p>
            </div>
            {tool.passendeWenn.map((punkt) => (
              <div key={punkt} className={styles.fitItem}>
                <span className={styles.fitCheck}>✓</span>{punkt}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ─── DIREKTVERGLEICH TABELLE ──────────────────────────── */}
      <h2 className={styles.sectionTitle}>Direktvergleich</h2>
      <div className={styles.tableSection}>
        {/* overflow-x: auto — horizontale Scrollbar auf Mobile */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.thLabel}>Kriterium</th>
                <th className={styles.thTool}>{toolA.name}</th>
                <th className={styles.thToolLast}>{toolB.name}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((zeile) => (
                <tr key={zeile.id} className={styles.tableRow}>
                  <td className={styles.tdLabel}>{zeile.criterion}</td>
                  <td className={styles.tdA}>{zeile.toolAValue}</td>
                  <td className={styles.tdB}>{zeile.toolBValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.
        </p>
      </div>

      {/* ─── PREISE ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Preise im Vergleich</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.priceCard}>
            <div className={styles.priceCardLeft}>
              {/* backgroundColor: tool.farbe — erlaubter Inline-Style */}
              <div className={styles.toolIconSm} style={{ backgroundColor: tool.farbe }}>
                {tool.kuerzel}
              </div>
              <div>
                <p className={styles.priceCardName}>{tool.name}</p>
                <p className={styles.priceCardAmount}>{tool.preis}</p>
                <p className={styles.priceCardDesc}>{tool.beschreibung}</p>
              </div>
            </div>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className={styles.vendorBtn}>
              Zum Anbieter
            </a>
          </div>
        ))}
      </div>
      <p className={styles.priceNote}>
        Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.
      </p>

      {/* ─── VORTEILE & NACHTEILE ─────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Vorteile und Nachteile</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.prosConsCard}>
            <div className={styles.prosConsHeader}>
              {/* backgroundColor: tool.farbe — erlaubter Inline-Style */}
              <div className={styles.toolIconMd} style={{ backgroundColor: tool.farbe }}>
                {tool.kuerzel}
              </div>
              <p className={styles.prosConsTitle}>{tool.name}</p>
            </div>
            <div className={styles.prosConsGrid}>
              <div>
                <p className={styles.prosConsLabel}>Vorteile</p>
                {tool.vorteile.map((v) => (
                  <div key={v} className={styles.prosConsItem}>
                    <span className={styles.proCheck}>✓</span>{v}
                  </div>
                ))}
              </div>
              <div>
                <p className={styles.prosConsLabel}>Nachteile</p>
                {tool.nachteile.map((n) => (
                  <div key={n} className={styles.prosConsItem}>
                    <span className={styles.conCross}>✗</span>{n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
    </>
  )
}
