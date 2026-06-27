import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Impressum — ToolSucher',
}

export default function ImpressumPage() {
  return (
    <main className={styles.main}>

      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Impressum
      </p>

      <h1 className={styles.pageTitle}>
        Impressum
      </h1>

      <div className={styles.proseCard}>

        <p style={{ color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '4px' }}>Stefan Kuhl</p>
        <p style={{ marginBottom: '4px' }}>Kolonnenstraße 8</p>
        <p style={{ marginBottom: '32px' }}>10827 Berlin</p>

        <h2 className={styles.proseH2}>
          Kontakt
        </h2>
        <p style={{ marginBottom: '4px' }}>
          Telefon:{' '}
          <a href="tel:+4917625101255" className={styles.proseLink}>
            +49 176 25101255
          </a>
        </p>
        <p style={{ marginBottom: '32px' }}>
          E-Mail:{' '}
          <a href="mailto:toolsucher@gmail.com" className={styles.proseLink}>
            toolsucher@gmail.com
          </a>
        </p>

        <h2 className={styles.proseH2}>
          Redaktionell verantwortlich
        </h2>
        <p>Stefan Kuhl</p>

      </div>

    </main>
  )
}
