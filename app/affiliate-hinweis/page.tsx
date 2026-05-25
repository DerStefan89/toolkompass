import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate-Hinweis — ToolSucher',
}

export default function AffiliateHinweisPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Affiliate-Hinweis
      </p>

      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '36px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '32px',
      }}>
        Affiliate-Hinweis
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
          <a href="mailto:toolsucher@gmail.com" style={{ color: 'var(--color-text-secondary)' }}>
            toolsucher@gmail.com
          </a>
        </p>

      </div>

    </main>
  )
}
