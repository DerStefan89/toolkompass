/**
 * Datei: app/page.tsx
 *
 * Zweck: Startseite von ToolSucher.
 * Aufbau: Hero (2 Spalten) → Aufgaben-Pills → Tool-Cards → Kategorien-Scroll
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 *
 * Wichtig:
 * Tool-Cards zeigen die 6 neuesten publizierten Tools aus der DB.
 * Kategorien-Scroll zeigt alle publizierten Kategorien sortiert nach sortOrder.
 * Erlaubte Inline-Styles: backgroundColor + border auf .toolLogoWrap,
 * da sie von tool.logoUrl (Laufzeitwert) abhängen.
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import IconRenderer from '@/components/ui/IconRenderer'
import SearchInput from '@/components/SearchInput'
import StackWidget from '@/components/home/StackWidget'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'ToolSucher: passende Business-Tools finden',
  description: 'Vergleiche Software und KI-Tools für Selbstständige, Gründer und kleine Teams. Mit Kategorien, Tool-Finder und ehrlichen Empfehlungen.',
  openGraph: {
    title: 'ToolSucher: Software finden, ohne stundenlang zu vergleichen',
    description: 'Buchhaltung, KI, Organisation, Design, CRM und Automatisierung. ToolSucher ordnet Tools so ein, dass du schneller eine vernünftige Entscheidung treffen kannst.',
  },
}

export default async function Home() {
  // Build-sicher: bei DB-Ausfall zur Build-Zeit leere Defaults statt Crash.
  // ISR füllt die Seite beim ersten echten Request (DB erreichbar) normal.
  async function ladeStartseitenDaten() {
    return Promise.all([
      prisma.tool.findMany({
        where: { published: true },
        take: 6,
        skip: 0,
        orderBy: { publishedAt: 'desc' },
        include: { translations: { where: { locale: 'de' } } },
      }),
      prisma.category.findMany({
        where: { published: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          translations: { where: { locale: 'de' } },
          _count: { select: { tools: true } },
        },
      }),
    ])
  }

  let tools: Awaited<ReturnType<typeof ladeStartseitenDaten>>[0] = []
  let categories: Awaited<ReturnType<typeof ladeStartseitenDaten>>[1] = []
  try {
    ;[tools, categories] = await ladeStartseitenDaten()
  } catch (error) {
    console.error('[Startseite] DB-Query fehlgeschlagen:', error)
  }

  // Aufgaben-Pills → echte Kategorie-Seite. Slugs werden über den Kategorie-NAMEN
  // aus der DB aufgelöst (nicht hartkodiert). Pills ohne Treffer werden
  // ausgeblendet — besser als ein toter Link.
  const pills = [
    { icon: '🧾', label: 'Buchhaltung ordnen', kategorie: 'Buchhaltung & Rechnungen' },
    { icon: '📅', label: 'Termine einfacher buchen', kategorie: 'Kalender & Calls' },
    { icon: '🎙', label: 'KI sinnvoll nutzen', kategorie: 'KI & Coding' },
    { icon: '🎬', label: 'Inhalte erstellen', kategorie: 'Design & Video' },
    { icon: '✍️', label: 'Social Media planen', kategorie: 'Social Media' },
    { icon: '💼', label: 'Vertrieb strukturieren', kategorie: 'CRM & Marketing' },
    { icon: '💳', label: 'Finanzen trennen', kategorie: 'Geschäftskonto & Finanzen' },
  ]

  // Map: Kategoriename (de) → Slug, aus den bereits geladenen Kategorien
  const slugByName = new Map(
    categories.map((c) => [c.translations[0]?.name ?? '', c.slug]),
  )

  const pillsMitSlug = pills
    .map((p) => ({ ...p, slug: slugByName.get(p.kategorie) }))
    .filter((p): p is typeof p & { slug: string } => Boolean(p.slug))

  return (
    <main>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className={styles.heroSection}>

        {/* Linke Spalte */}
        <div className={styles.heroLeft}>

          <h1 className={styles.heroHeadline}>
            Finde Business-Tools, die wirklich zu deinem Alltag passen.
          </h1>

          <p className={styles.heroCopy}>
            ToolSucher hilft Selbstständigen, Gründern und kleinen Teams,
            digitale Tools besser einzuordnen, zu vergleichen und bewusster auszuwählen.
          </p>

          <SearchInput
            placeholder="Nach Tool, Kategorie oder Anwendungsfall suchen ..."
            className={styles.searchInput}
          />

          {/* Buttons */}
          <div className={styles.heroButtons}>
            <Link href="/tool-finder" className={styles.btnPrimary}>
              Tool-Finder starten →
            </Link>
            <Link href="/kategorien" className={styles.btnSecondary}>
              Tools entdecken
            </Link>
            <Link href="/entwickeln" className={styles.btnSecondary}>
              Tool entwickeln lassen
            </Link>
          </div>

          {/* Aufgaben-Pills */}
          <p className={styles.pillsLabel}>Was möchtest du verbessern?</p>

          <div className={styles.pillsRow}>
            {pillsMitSlug.map((pill) => (
              <Link key={pill.label} href={`/kategorien/${pill.slug}`} className={styles.pill}>
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </Link>
            ))}
          </div>

        </div>

        {/* Rechte Spalte — echter Tool-Stack (lädt clientseitig, cache-sicher) */}
        <div className={styles.heroRight}>
          <StackWidget />
        </div>

      </section>

      {/* ─── TOOL-CARDS ───────────────────────────────────── */}
      <section className={styles.toolSection}>
        <div className={styles.toolGrid}>
          {tools.map((tool, index) => {
            const t = tool.translations[0]
            const name = t?.name ?? tool.slug
            const preis = formatPreis(tool.startingPriceCents, { prefix: 'ab', hasFreePlan: tool.hasFreePlan })

            return (
              <div key={tool.id} className={styles.toolCard}>
                <div className={styles.toolCardHeader}>
                  <div className={styles.toolCardLeft}>
                    {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
                    <div
                      className={styles.toolLogoWrap}
                      style={{
                        backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                        border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      {tool.logoUrl ? (
                        // priority nur fürs erste (oberste) Logo — verbessert LCP,
                        // ohne alle Bilder eager zu laden (Rest bleibt lazy).
                        <Image src={tool.logoUrl} alt={name} width={36} height={36} className={styles.toolLogoImg} priority={index === 0} />
                      ) : (
                        <span className={styles.toolLogoInitial}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={styles.toolName}>{name}</p>
                      <p className={styles.toolShort}>
                        {t?.shortDescription?.slice(0, 30) ?? ''}
                      </p>
                    </div>
                  </div>
                  <span className={styles.toolHeart}>♡</span>
                </div>

                <p className={styles.toolDesc}>
                  {t?.shortDescription ?? ''}
                </p>

                {tool.hasFreePlan && (
                  <span className={styles.freeBadge}>Free Plan</span>
                )}

                <div className={styles.toolFooter}>
                  <span className={styles.toolPrice}>{preis}</span>
                  <a href={`/tools/${tool.slug}`} className={styles.detailsLink}>
                    Details
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── KATEGORIEN ───────────────────────────────────── */}
      <section className={styles.catSection}>
        <div className={styles.catHeader}>
          <h2 className={styles.catTitle}>Tools nach Aufgabe finden</h2>
          <Link href="/kategorien" className={styles.catAllLink}>
            Alle Kategorien ansehen →
          </Link>
        </div>
        <div className={styles.catScroll}>
          {categories.map((cat) => {
            const t = cat.translations[0]
            const label = t?.name ?? cat.slug

            return (
              <a
                key={cat.id}
                href={`/kategorien/${cat.slug}`}
                // category-card aus globals.css liefert den Hover-Effekt (Grün)
                className={`category-card ${styles.catCard}`}
              >
                <div className={`category-card-icon ${styles.catIcon}`}>
                  <IconRenderer icon={cat.icon} size={28} />
                </div>
                {label}
              </a>
            )
          })}
        </div>
      </section>

    </main>
  )
}
