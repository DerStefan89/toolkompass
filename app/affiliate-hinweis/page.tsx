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
          Diese Website enthält Affiliate-Links. Das bedeutet: Wenn du auf einen solchen Link klickst
          und ein Produkt oder eine Dienstleistung kaufst oder buchst, erhalten wir eine Provision vom
          jeweiligen Anbieter. Für dich entstehen dabei <strong style={{ color: 'var(--color-text-primary)' }}>keine zusätzlichen Kosten</strong>.
        </p>

        <p style={{ marginBottom: '20px' }}>
          Affiliate-Links sind auf dieser Website mit dem Hinweis{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>&bdquo;Partnerlink&ldquo;</strong> oder{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>&bdquo;Zum Anbieter&ldquo;</strong> gekennzeichnet.
        </p>

        <p style={{ marginBottom: '20px' }}>
          Wir empfehlen nur Tools und Dienste, die wir selbst für sinnvoll halten. Die redaktionelle
          Unabhängigkeit unserer Inhalte bleibt davon unberührt.
        </p>

        <p>
          Bei Fragen:{' '}
          <a href="mailto:toolsucher@gmail.com" className={styles.proseLink}>
            toolsucher@gmail.com
          </a>
        </p>

      </div>

    </main>
  )
}
