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
import CategoryFilter from '@/components/category/CategoryFilter'
import styles from './page.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Tools nach Kategorie | ToolSucher',
  description: 'Alle Tool-Kategorien im Überblick: Buchhaltung, KI, Design, CRM, Projektmanagement und mehr. Für Selbstständige und kleine Teams.',
  alternates: { canonical: '/kategorien' },
  openGraph: {
    title: 'Tool-Kategorien für Selbstständige | ToolSucher',
    description: 'Von Buchhaltung bis Automatisierung: Entdecke Tools nach Aufgabe und Einsatzbereich.',
  },
}

export default async function KategorienSeite() {
  // Build-sicher: bei DB-Ausfall zur Build-Zeit leere Defaults statt Crash.
  async function ladeKategorien() {
    return prisma.category.findMany({
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
  }

  let categories: Awaited<ReturnType<typeof ladeKategorien>> = []
  try {
    categories = await ladeKategorien()
  } catch (error) {
    console.error('[Kategorien] DB-Query fehlgeschlagen:', error)
  }

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

      {/* Suchfeld + Kategorien-Raster — Client-seitig gefiltert */}
      {categories.length === 0 ? (
        <p className={styles.empty}>Noch keine Kategorien vorhanden.</p>
      ) : (
        <CategoryFilter categories={categories} />
      )}

    </main>
  )
}
