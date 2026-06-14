/**
 * Datei: app/tool-stacks/page.tsx
 *
 * Zweck: Ãœbersicht aller publizierten Tool-Stacks â€” lÃ¤dt echte Daten aus Prisma.
 * Zeigt Tool-Anzahl und Zielgruppe pro Stack.
 *
 * Design-Referenz:
 * - design-refs/5_Tool_Stacks.png
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Tool-Stacks â€” ToolSucher',
  description: 'Entdecke bewÃ¤hrte Tool-Kombinationen fÃ¼r Freelancer, Agenturen und kleine Teams.',
  alternates: { canonical: '/tool-stacks' },
  openGraph: {
    title: 'Tool-Stacks â€” ToolSucher',
    description: 'Entdecke bewÃ¤hrte Tool-Kombinationen fÃ¼r Freelancer, Agenturen und kleine Teams.',
  },
}

export default async function ToolStacksSeite() {
  const stacks = await prisma.toolStack.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' } },
      tags: { include: { tag: true } },
      _count: { select: { tools: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main>

      {/* â”€â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className={styles.heroSection}>

        {/* Linke Seite */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Tool-Stacks fÃ¼r dein Business</h1>
          <p className={styles.heroDesc}>
            BewÃ¤hrte Tool-Stacks und Tool-Kombinationen fÃ¼r Freelancer,
            GrÃ¼nder, Creator und kleine Teams entdecken und speichern.
          </p>

          {stacks.length === 0 && (
            <span className={styles.emptyBadge}>Im Aufbau ðŸ› </span>
          )}
        </div>

        {/* Rechte Seite â€” Info Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoBoxIcon}>ðŸš€</div>
          <h2 className={styles.infoBoxTitle}>Kuratierte Stacks</h2>
          <p className={styles.infoBoxDesc}>
            Jeder Stack ist ein durchdachtes Tool-Set fÃ¼r einen bestimmten
            Anwendungsfall â€” keine zufÃ¤lligen Listen.
          </p>
          <Link href="/kategorien" className={styles.infoBoxBtn}>
            Alle Kategorien ansehen
          </Link>
        </div>

      </section>

      {/* â”€â”€â”€ STACKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className={styles.stacksSection}>

        <h2 className={styles.sectionTitle}>
          {stacks.length > 0 ? 'Aktuelle Stacks' : 'Geplante Stacks'}
        </h2>

        {stacks.length === 0 ? (
          <p className={styles.empty}>Noch keine Stacks verÃ¶ffentlicht.</p>
        ) : (
          <div className={styles.stackGrid}>
            {stacks.map((stack) => {
              const t = stack.translations[0]
              const name = t?.name ?? stack.slug
              const tagLine = stack.tags.length > 0
                ? stack.tags.map((st) => st.tag.name).join(' Â· ')
                : t?.targetAudience ?? ''

              return (
                <a
                  key={stack.id}
                  href={`/tool-stacks/${stack.slug}`}
                  className={styles.stackCard}
                >
                  {/* Icon */}
                  <div className={styles.stackIcon}>âŠ•</div>

                  {/* Name */}
                  <p className={styles.stackName}>{name}</p>

                  {/* Tags / Zielgruppe */}
                  {tagLine && (
                    <p className={styles.stackTags}>{tagLine}</p>
                  )}

                  {/* Tool-Anzahl Badge */}
                  <span className={styles.stackBadge}>
                    {stack._count.tools} Tools
                  </span>
                </a>
              )
            })}
          </div>
        )}

        {/* CTA Box unten */}
        <div className={styles.ctaBox}>
          <div className={styles.ctaIcon}>ðŸ§­</div>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Nicht sicher, welche Tools du brauchst?</h3>
            <p className={styles.ctaDesc}>
              Starte Ã¼ber die Tool-Suche und Vergleiche.
              Der Tool-Finder hilft dir bei der Auswahl.
            </p>
          </div>
          <Link href="/kategorien" className={styles.ctaBtn}>
            Tools entdecken
          </Link>
        </div>

      </section>

    </main>
  )
}
