/**
 * Datei: app/tool-stacks/page.tsx
 *
 * Zweck: Übersicht aller publizierten Tool-Stacks — lädt echte Daten aus Prisma.
 * Zeigt Tool-Anzahl und Zielgruppe pro Stack.
 *
 * Design-Referenz:
 * - design-refs/5_Tool_Stacks.png
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tool-Stacks — ToolSucher',
  description: 'Entdecke bewährte Tool-Kombinationen für Freelancer, Agenturen und kleine Teams.',
  alternates: { canonical: '/tool-stacks' },
  openGraph: {
    title: 'Tool-Stacks — ToolSucher',
    description: 'Entdecke bewährte Tool-Kombinationen für Freelancer, Agenturen und kleine Teams.',
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

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className={styles.heroSection}>

        {/* Linke Seite */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>Tool-Stacks für dein Business</h1>
          <p className={styles.heroDesc}>
            Bewährte Tool-Stacks und Tool-Kombinationen für Freelancer,
            Gründer, Creator und kleine Teams entdecken und speichern.
          </p>

          {stacks.length === 0 && (
            <span className={styles.emptyBadge}>Im Aufbau 🛠</span>
          )}
        </div>

        {/* Rechte Seite — Info Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoBoxIcon}>🚀</div>
          <h2 className={styles.infoBoxTitle}>Kuratierte Stacks</h2>
          <p className={styles.infoBoxDesc}>
            Jeder Stack ist ein durchdachtes Tool-Set für einen bestimmten
            Anwendungsfall — keine zufälligen Listen.
          </p>
          <Link href="/kategorien" className={styles.infoBoxBtn}>
            Alle Kategorien ansehen
          </Link>
        </div>

      </section>

      {/* ─── STACKS ───────────────────────────────────────────── */}
      <section className={styles.stacksSection}>

        <h2 className={styles.sectionTitle}>
          {stacks.length > 0 ? 'Aktuelle Stacks' : 'Geplante Stacks'}
        </h2>

        {stacks.length === 0 ? (
          <p className={styles.empty}>Noch keine Stacks veröffentlicht.</p>
        ) : (
          <div className={styles.stackGrid}>
            {stacks.map((stack) => {
              const t = stack.translations[0]
              const name = t?.name ?? stack.slug
              const tagLine = stack.tags.length > 0
                ? stack.tags.map((st) => st.tag.name).join(' · ')
                : t?.targetAudience ?? ''

              return (
                <a
                  key={stack.id}
                  href={`/tool-stacks/${stack.slug}`}
                  className={styles.stackCard}
                >
                  {/* Icon */}
                  <div className={styles.stackIcon}>⊕</div>

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
          <div className={styles.ctaIcon}>🧭</div>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaTitle}>Nicht sicher, welche Tools du brauchst?</h3>
            <p className={styles.ctaDesc}>
              Starte über die Tool-Suche und Vergleiche.
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
