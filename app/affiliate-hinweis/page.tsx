import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Affiliate-Hinweis — ToolSucher',
}

export default function AffiliateHinweisPage() {
  return (
    <main className={styles.main}>

      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Affiliate-Hinweis
      </p>

      <h1 className={styles.pageTitle}>
        Affiliate-Hinweis
      </h1>

      <div className={styles.proseCard}>

        <p style={{ marginBottom: '20px' }}>
          Auf ToolSucher können Links zu Anbietern als Affiliate-Links eingebunden sein. Wenn du über einen solchen Link ein Tool kaufst, buchst oder testest, können wir vom Anbieter eine Provision erhalten. Für dich entstehen dadurch <strong style={{ color: 'var(--color-text-primary)' }}>keine zusätzlichen Kosten</strong>.
        </p>

        <p style={{ marginBottom: '20px' }}>
          Affiliate-Links beeinflussen nicht automatisch unsere Einschätzung. Ein Tool soll auf ToolSucher nur dann empfohlen oder sichtbar eingeordnet werden, wenn es für Selbstständige, Gründer oder kleine Teams grundsätzlich sinnvoll sein kann.
        </p>

        <p style={{ marginBottom: '20px' }}>
          Trotzdem bleibt wichtig: Preise, Funktionen und Bedingungen können sich ändern. Prüfe vor einer Buchung immer die Angaben auf der Website des jeweiligen Anbieters. Affiliate-Links sind auf ToolSucher zum Beispiel durch Hinweise wie {'"'}Partnerlink{'"'} oder {'"'}Zum Anbieter{'"'} erkennbar.
        </p>

        <p>
          Bei Fragen oder Hinweisen:{' '}
          <a href="mailto:toolsucher@gmail.com" className={styles.proseLink}>
            toolsucher@gmail.com
          </a>
        </p>

      </div>

    </main>
  )
}
