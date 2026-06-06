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
 * Erlaubte Inline-Styles: backgroundColor + border auf .toolLogoWrap
 * (conditional auf tool.logoUrl — Laufzeitwert).
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import IconRenderer from '@/components/ui/IconRenderer'
import { breadcrumbJsonLd } from '@/lib/seo/json-ld'
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
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { translations: { where: { locale: 'de' } } },
  })
  if (!category) return {}
  const t = category.translations[0]
  if (!t) return {}
  const title = `${t.name} Tools — ToolSucher`
  const description = t.description ?? ''
  return {
    title,
    description,
    alternates: { canonical: `/kategorien/${slug}` },
    openGraph: { title, description },
  }
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

  const crumbLd = breadcrumbJsonLd([
    { name: 'Startseite', url: SITE_URL },
    { name: 'Kategorien', url: `${SITE_URL}/kategorien` },
    { name: t.name, url: `${SITE_URL}/kategorien/${slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: crumbLd }} />
      <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/kategorien" className={styles.breadcrumbLink}>Kategorien</Link>
        {' › '}
        {t.name}
      </p>

      {/* Hero */}
      <div className={styles.heroRow}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>{t.name}</h1>
          <p className={styles.heroDesc}>{t.description}</p>
        </div>
        <div className={styles.heroIconBox}>
          <IconRenderer icon={category.icon} size={64} />
        </div>
      </div>

      {/* Hauptbereich */}
      <div className={styles.contentArea}>

        {/* Linke Seite */}
        <div className={styles.mainCol}>
          <div className={styles.toolsHeader}>
            <h2 className={styles.toolsTitle}>Top-Empfehlungen</h2>
            <span className={styles.toolCount}>{tools.length} Tools</span>
          </div>

          {tools.length === 0 ? (
            <p className={styles.toolsEmpty}>Noch keine Tools in dieser Kategorie.</p>
          ) : (
            <div className={styles.toolGrid}>
              {tools.map((tool) => {
                const tl = tool.translations[0]
                const name = tl?.name ?? tool.slug
                const primaryUrl = tool.affiliateLinks[0]?.url ?? '#'
                const preis = formatPreis(tool.startingPriceCents, { prefix: 'ab', suffix: '/ Monat', hasFreePlan: tool.hasFreePlan })

                return (
                  <div key={tool.id} className={styles.toolCard}>
                    <div className={styles.toolCardTop}>
                      {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
                      <div
                        className={styles.toolLogoWrap}
                        style={{
                          backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                          border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        {tool.logoUrl ? (
                          <Image src={tool.logoUrl} alt={name} width={44} height={44} className={styles.toolLogoImg} />
                        ) : (
                          <span className={styles.toolLogoInitial}>
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={styles.toolName}>{name}</p>
                    <p className={styles.toolDesc}>{tl?.shortDescription}</p>

                    <div className={styles.toolBadges}>
                      {tool.hasFreePlan && (
                        <span className={styles.toolBadge}>Free Plan</span>
                      )}
                      {tool.tags.slice(0, 2).map(({ tag }) => (
                        <span key={tag.id} className={styles.toolBadge}>{tag.name}</span>
                      ))}
                    </div>

                    <p className={styles.toolPrice}>{preis}</p>

                    <a href={`/tools/${tool.slug}`} className={styles.toolDetailBtn}>
                      Details ansehen
                    </a>
                    <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className={styles.toolVendorLink}>
                      Zum Anbieter →
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Rechte Sidebar */}
        <div className={styles.sidebar}>

          {sidebarTags.length > 0 && (
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Worauf achten?</h3>
              {sidebarTags.map((tag) => (
                <div key={tag} className={styles.sidebarTagItem}>
                  <span className={styles.sidebarTagCheck}>✓</span>
                  {tag}
                </div>
              ))}
            </div>
          )}

          <div className={styles.sidebarCard}>
            <h3 className={styles.sidebarTitle}>Nicht sicher?</h3>
            <p className={styles.sidebarFinderDesc}>
              Finde in 2 Minuten das passende Tool.
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
