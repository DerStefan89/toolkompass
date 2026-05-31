/**
 * Datei: app/vergleichen/page.tsx
 *
 * Zweck: Übersicht aller publizierten Vergleiche — lädt echte Daten aus Prisma.
 * Zeigt Vergleichskarten und eine Vorschau-Tabelle des ersten Vergleichs.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 */

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Tool-Vergleiche — ToolSucher',
  description: 'Vergleiche die besten Business-Tools direkt nebeneinander und finde die passende Lösung für dein Team.',
  alternates: { canonical: '/vergleichen' },
  openGraph: {
    title: 'Tool-Vergleiche — ToolSucher',
    description: 'Vergleiche die besten Business-Tools direkt nebeneinander und finde die passende Lösung für dein Team.',
  },
}

export default async function VergleichenSeite() {
  // Promise.all: beide Queries laufen parallel — spart eine sequenzielle Wartezeit
  const [comparisons, featured] = await Promise.all([
    prisma.comparison.findMany({
      where: { published: true },
      include: {
        toolA: {
          include: {
            translations: { where: { locale: 'de' } },
            categories: {
              include: { category: { include: { translations: { where: { locale: 'de' } } } } },
              take: 1,
            },
          },
        },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.comparison.findFirst({
      where: { published: true },
      include: {
        toolA: { include: { translations: { where: { locale: 'de' } } } },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
        rows: { orderBy: { sortOrder: 'asc' }, take: 5 },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  return (
    <main className={styles.main}>

      {/* Seitentitel */}
      <h1 className={styles.pageTitle}>Tools vergleichen</h1>

      <p className={styles.pageDesc}>
        Vergleiche beliebte Tools nach Preis, Funktionen, Einsatzbereich und Alternativen.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Tool A vs Tool B suchen ..."
        className={styles.searchInput}
      />

      {/* Beliebte Vergleiche */}
      <h2 className={styles.sectionTitle}>Beliebte Vergleiche</h2>

      {comparisons.length === 0 ? (
        <p className={styles.empty}>Noch keine Vergleiche vorhanden.</p>
      ) : (
        <div className={styles.compGrid}>
          {comparisons.map((comp) => {
            const tA = comp.toolA.translations[0]
            const tB = comp.toolB.translations[0]
            if (!tA || !tB) return null

            const kategorieName = comp.toolA.categories[0]?.category.translations[0]?.name
            const beschreibung = kategorieName
              ? `${kategorieName} für Selbstständige und kleine Teams.`
              : `${tA.name} und ${tB.name} im direkten Vergleich.`

            return (
              <a
                key={comp.id}
                href={`/vergleichen/${comp.slug}`}
                className={styles.compCard}
              >
                {/* Icon — erste Buchstaben beider Tools */}
                <div className={styles.compIcon}>
                  {tA.name.charAt(0)}{tB.name.charAt(0)}
                </div>

                {/* Text */}
                <div className={styles.compText}>
                  <p className={styles.compTitle}>{tA.name} vs {tB.name}</p>
                  <p className={styles.compDesc}>{beschreibung}</p>
                </div>

                {/* Pfeil */}
                <span className={styles.compArrow}>Ansehen →</span>
              </a>
            )
          })}
        </div>
      )}

      {/* Vergleichsdetail: Vorschau */}
      {featured && (() => {
        const tA = featured.toolA.translations[0]
        const tB = featured.toolB.translations[0]
        if (!tA || !tB) return null

        return (
          <>
            <h2 className={styles.sectionTitle}>Vergleichsdetail: Vorschau</h2>

            <div className={styles.previewCard}>
              <p className={styles.previewTitle}>{tA.name} vs {tB.name}</p>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHeadRow}>
                      <th className={styles.thLabel}>Kriterium</th>
                      <th className={styles.thTool}>{tA.name}</th>
                      <th className={styles.thToolLast}>{tB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featured.rows.map((zeile) => (
                      <tr key={zeile.id} className={styles.tableRow}>
                        <td className={styles.tdLabel}>{zeile.criterion}</td>
                        <td className={styles.tdA}>{zeile.toolAValue}</td>
                        <td className={styles.tdB}>{zeile.toolBValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CTA-Buttons: untereinander Mobile, nebeneinander Desktop */}
              <div className={styles.previewCtaRow}>
                <a href={`/tools/${featured.toolA.slug}`} className={styles.btnPrimary}>
                  {tA.name} ansehen ↗
                </a>
                <a href={`/tools/${featured.toolB.slug}`} className={styles.btnSecondary}>
                  {tB.name} ansehen ↗
                </a>
              </div>
            </div>
          </>
        )
      })()}

    </main>
  )
}
