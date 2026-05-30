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
import styles from './page.module.css'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ToolSucher — Digitale Business-Tools entdecken & vergleichen',
  description: 'Finde die besten digitalen Tools für dein Business.',
  openGraph: {
    title: 'ToolSucher — Digitale Business-Tools entdecken & vergleichen',
    description: 'Finde die besten digitalen Tools für dein Business.',
  },
}

export default async function Home() {
  // Promise.all: beide Queries laufen parallel
  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      where: { published: true },
      take: 6,
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

  return (
    <main>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className={styles.heroSection}>

        {/* Linke Spalte */}
        <div className={styles.heroLeft}>

          <h1 className={styles.heroHeadline}>
            Finde und vergleiche die besten Tools für dein Business.
          </h1>

          <p className={styles.heroCopy}>
            ToolSucher hilft Gründern, Selbstständigen und kleinen Teams in
            Deutschland, passende Software zu finden und zu vergleichen.
          </p>

          <input
            type="text"
            placeholder="Nach Tool, Kategorie oder Anwendungsfall suchen ..."
            className={styles.searchInput}
          />

          {/* Buttons */}
          <div className={styles.heroButtons}>
            <Link href="/tool-finder" className={styles.btnPrimary}>
              Tool-Finder starten →
            </Link>
            <Link href="/kategorien" className={styles.btnSecondary}>
              Kategorien ansehen
            </Link>
          </div>

          {/* Aufgaben-Pills */}
          <p className={styles.pillsLabel}>Was möchtest du erledigen?</p>

          <div className={styles.pillsRow}>
            {[
              { icon: '🧾', label: 'Unternehmen verwalten' },
              { icon: '📅', label: 'Termine buchen' },
              { icon: '🎙', label: 'KI Tools einbinden' },
              { icon: '🎬', label: 'Videos erstellen' },
              { icon: '✍️', label: 'Social Media Kampagnen' },
              { icon: '💼', label: 'Sales Funnel aufbauen' },
              { icon: '📊', label: 'Präsentation erstellen' },
            ].map((aufgabe) => (
              <Link key={aufgabe.label} href="/aufgaben" className={styles.pill}>
                <span>{aufgabe.icon}</span>
                <span>{aufgabe.label}</span>
              </Link>
            ))}
          </div>

        </div>

        {/* Rechte Spalte — Tool-Stack Box */}
        <div className={styles.heroRight}>

          <div className={styles.stackHeader}>
            <span className={styles.stackTitle}>Vorschau: Dein Tool-Stack</span>
            <span className={styles.badge}>Bald verfügbar</span>
          </div>

          <p className={styles.stackCopy}>
            Verwalte dein Tool-Stack an einem Ort
          </p>

          {['Tools speichern', 'Kosten im Blick behalten', 'Alternativen entdecken'].map((feature) => (
            <div key={feature} className={styles.featureRow}>
              <span className={styles.featureCheck}>✓</span>
              {feature}
            </div>
          ))}

          <div className={styles.stackPreview}>
            <p className={styles.stackPreviewLabel}>Dein Stack (Vorschau)</p>
            {['Notion', 'sevdesk', 'Calendly'].map((tool) => (
              <div key={tool} className={styles.stackToolRow}>
                <span>{tool}</span>
                <span className={styles.stackToolDash}>– –</span>
              </div>
            ))}
            <p className={styles.stackPreviewNote}>
              Monatliche Kosten (Beispiel): – – € / Monat
            </p>
          </div>

          <Link href="/tool-stacks" className={styles.stackCta}>
            Stack-Vorschau ansehen
          </Link>

          <p className={styles.stackNotify}>🔔 Benachrichtigen lassen</p>

        </div>

      </section>

      {/* ─── TOOL-CARDS ───────────────────────────────────── */}
      <section className={styles.toolSection}>
        <div className={styles.toolGrid}>
          {tools.map((tool) => {
            const t = tool.translations[0]
            const name = t?.name ?? tool.slug
            const preis = formatPreis(tool.startingPriceMonthly, { prefix: 'ab' })

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
                        <Image src={tool.logoUrl} alt={name} width={36} height={36} className={styles.toolLogoImg} />
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
          <h2 className={styles.catTitle}>Entdecke Tools nach Kategorie</h2>
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
