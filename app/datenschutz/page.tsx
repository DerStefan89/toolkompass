import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz — ToolSucher',
}

export default function DatenschutzPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Datenschutz
      </p>

      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '36px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '24px',
      }}>
        Datenschutzerklärung
      </h1>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        fontSize: '15px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.7',
      }}>
        Diese Seite wird noch ausgefüllt.
      </div>

    </main>
  )
}
