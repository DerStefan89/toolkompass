/**
 * Datei: app/tool-finder/page.tsx
 *
 * Zweck: Tool-Finder — interaktiver 3-Schritt-Fragebogen.
 * Lädt die Kategorien serverseitig und übergibt sie an die Client-Component
 * <ToolFinder>, die den Wizard (Kategorie → Budget → Ergebnisse) steuert.
 *
 * Design-Referenz:
 * - Keine eigene Screenshot-Referenz — folgt dem bestehenden Design-System.
 *
 * Wichtig:
 * - force-dynamic: Ergebnisse hängen von Live-Daten ab (kein Caching der Seite).
 * - Daten kommen aus lib/data/tool-finder.ts (Data-Access-Layer).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPublishedCategories } from '@/lib/data/tool-finder'
import ToolFinder from '@/components/tool-finder/ToolFinder'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tool-Finder: passende Software schneller finden',
  description:
    'Beantworte wenige Fragen und finde Tools, die zu Kategorie, Budget und Situation passen. Eine erste Orientierung, keine gekaufte Bestenliste.',
  alternates: { canonical: '/tool-finder' },
  openGraph: {
    title: 'Tool-Finder für Selbstständige und kleine Teams',
    description: 'Wähle Kategorie und Budget aus und erhalte passende Tool-Vorschläge. Nützlich als Einstieg, wenn du nicht jedes Tool einzeln prüfen willst.',
  },
}

export default async function ToolFinderSeite() {
  const categories = await getAllPublishedCategories()

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Tool-Finder
      </p>

      <h1 className={styles.pageTitle}>Tool-Finder</h1>
      <p className={styles.pageDesc}>
        Finde in wenigen Schritten eine erste Tool-Auswahl nach Aufgabe und Budget. Die Ergebnisse sollen dir beim Eingrenzen helfen. Prüfen solltest du Preise, Funktionen und Vertragsbedingungen trotzdem vor der Entscheidung.
      </p>

      <ToolFinder categories={categories} />
    </main>
  )
}
