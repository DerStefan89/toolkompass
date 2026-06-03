/**
 * Datei: app/kategorien/page.tsx
 *
 * Zweck: Übersicht aller publizierten Kategorien — lädt echte Daten aus Prisma.
 * Zeigt Tool-Anzahl und die ersten 3 Tool-Namen pro Kategorie.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import IconRenderer from '@/components/ui/IconRenderer'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Alle Kategorien — ToolSucher',
  description: 'Entdecke digitale Business-Tools nach Kategorie: Buchhaltung, CRM, Projektmanagement und mehr.',
  alternates: { canonical: '/kategorien' },
  openGraph: {
    title: 'Alle Kategorien — ToolSucher',
    description: 'Entdecke digitale Business-Tools nach Kategorie: Buchhaltung, CRM, Projektmanagement und mehr.',
  },
}

export default async function KategorienSeite() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' } },
      _count: { select: { tools: true } },
      tools: {
        where: { tool: { published: true } },
        include: {
          tool: { include: { translations: { where: { locale: 'de' } } } },
        },
        take: 3,
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Kategorien
      </p>

      {/* Seitentitel */}
      <h1 className={styles.pageTitle}>Alle Tool-Kategorien</h1>

      <p className={styles.pageDesc}>
        Entdecke Tools nach Bereich und finde passende Software für deine Aufgaben —
        kuratiert für Solo-Selbstständige und kleine Teams in Deutschland.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Kategorie oder Aufgabe suchen ..."
        className={styles.searchInput}
      />

      {/* Kategorien-Raster */}
      {categories.length === 0 ? (
        <p className={styles.empty}>Noch keine Kategorien vorhanden.</p>
      ) : (
        <div className={styles.catGrid}>
          {categories.map((cat) => {
            const t = cat.translations[0]
            if (!t) return null

            const toolNames = cat.tools
              .map((tc) => tc.tool.translations[0]?.name ?? tc.tool.slug)
              .join(' · ')

            return (
              <a
                key={cat.id}
                href={`/kategorien/${cat.slug}`}
                className={`category-card ${styles.catCard}`}
              >
                {/* Icon */}
                <div className={`category-card-icon ${styles.catIcon}`}>
                  <IconRenderer icon={cat.icon} size={28} />
                </div>

                {/* Name */}
                <p className={styles.catName}>{t.name}</p>

                {/* Beschreibung */}
                <p className={styles.catDesc}>{t.description}</p>

                {/* Beispiel-Tools */}
                {toolNames && (
                  <p className={styles.catTools}>{toolNames}</p>
                )}

                {/* Anzahl Tools + Pfeil */}
                <div className={styles.catFooter}>
                  <span className={styles.catCount}>{cat._count.tools} Tools</span>
                  <span className={styles.catArrow}>→</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

    </main>
  )
}
