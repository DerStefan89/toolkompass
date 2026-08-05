/**
 * Datei: app/vergleichen/page.tsx
 *
 * Zweck: Übersicht aller publizierten Vergleiche — lädt echte Daten aus Prisma.
 * Zeigt Vergleichskarten mit Tool-Logos.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 */

import Image from 'next/image'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tool-Vergleiche für Selbstständige | ToolSucher',
  description: 'Vergleiche Business-Tools nach Einsatzbereich, Preis, Funktionen und Grenzen. Damit du nicht das bekannteste Tool wählst, sondern das passendere.',
  alternates: { canonical: '/vergleichen' },
  openGraph: {
    title: 'Tool-Vergleiche für Selbstständige und kleine Teams',
    description: 'Gegenüberstellungen beliebter Business-Tools. Mit klaren Unterschieden, Entscheidungshilfen und ehrlichen Einschätzungen.',
  },
}

export default async function VergleichenSeite() {
  const comparisons = await prisma.comparison.findMany({
    where: { published: true },
    include: {
      toolA: {
        include: {
          translations: { where: { locale: 'de' } },
          categories: {
            include: { category: { include: { translations: { where: { locale: 'de' } } } } },
            take: 1,
            skip: 0,
          },
        },
      },
      toolB: { include: { translations: { where: { locale: 'de' } } } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main className={styles.main}>

      {/* Seitentitel */}
      <h1 className={styles.pageTitle}>Tool-Vergleiche</h1>

      <p className={styles.pageDesc}>
        Direkte Gegenüberstellungen beliebter Business-Tools. Mit klaren Unterschieden, Entscheidungshilfen und einer ehrlichen Einschätzung.
      </p>

      <h2 className={styles.sectionTitle}>Alle Vergleiche</h2>

      {comparisons.length === 0 ? (
        <p className={styles.empty}>Aktuell sind noch keine Vergleiche veröffentlicht.</p>
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
                {/* Logos — Fallback auf Initialen wenn kein Logo vorhanden */}
                <div className={styles.compLogos}>
                  {comp.toolA.logoUrl ? (
                    <Image src={comp.toolA.logoUrl} alt={tA.name} width={32} height={32} className={styles.compLogoImg} />
                  ) : (
                    <span className={styles.compLogoInitial}>{tA.name.charAt(0)}</span>
                  )}
                  <span className={styles.compVs}>vs</span>
                  {comp.toolB.logoUrl ? (
                    <Image src={comp.toolB.logoUrl} alt={tB.name} width={32} height={32} className={styles.compLogoImg} />
                  ) : (
                    <span className={styles.compLogoInitial}>{tB.name.charAt(0)}</span>
                  )}
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

    </main>
  )
}
