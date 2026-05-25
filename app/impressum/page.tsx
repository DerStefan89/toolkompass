import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum — ToolSucher',
}

export default function ImpressumPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Impressum
      </p>

      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '36px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '32px',
      }}>
        Impressum
      </h1>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        fontSize: '15px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.8',
      }}>

        <p style={{ color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: '4px' }}>Stefan Kuhl</p>
        <p style={{ marginBottom: '4px' }}>Kolonnenstraße 8</p>
        <p style={{ marginBottom: '32px' }}>10827 Berlin</p>

        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}>
          Kontakt
        </h2>
        <p style={{ marginBottom: '4px' }}>
          Telefon:{' '}
          <a href="tel:+4917625101255" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            +49 176 25101255
          </a>
        </p>
        <p style={{ marginBottom: '32px' }}>
          E-Mail:{' '}
          <a href="mailto:toolsucher@gmail.de" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            toolsucher@gmail.de
          </a>
        </p>

        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}>
          Redaktionell verantwortlich
        </h2>
        <p>Stefan Kuhl</p>

      </div>

    </main>
  )
}
