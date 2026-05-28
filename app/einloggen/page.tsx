/**
 * Datei: app/einloggen/page.tsx
 *
 * Zweck: Platzhalter-Seite für den Nutzer-Login.
 * Wird in einer späteren Phase durch echte Supabase Auth ersetzt.
 */

import Link from 'next/link'
import styles from './page.module.css'

export default function EinloggenSeite() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.cardIcon}>🧭</div>
        <h1 className={styles.cardTitle}>
          Einloggen
        </h1>
        <p className={styles.cardDesc}>
          Login für Nutzer kommt bald.
        </p>
        <Link href="/" className={styles.backLink}>
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  )
}
