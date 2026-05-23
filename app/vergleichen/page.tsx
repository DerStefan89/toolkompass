// VERGLEICHEN-SEITE (app/vergleichen/page.tsx)
// Zeigt beliebte Tool-Vergleiche und ein Suchfeld.
// URL: /vergleichen

export default function VergleichenSeite() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Seitentitel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Tools vergleichen
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Vergleiche beliebte Tools nach Preis, Funktionen, Einsatzbereich und Alternativen.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Tool A vs Tool B suchen ..."
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '40px',
        }}
      />

      {/* Beliebte Vergleiche */}
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '22px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        marginBottom: '20px',
      }}>
        Beliebte Vergleiche
      </h2>

      {/* Vergleichs-Karten — 2 Spalten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {[
          { icon: '📊', name: 'sevdesk vs Lexware Office', beschreibung: 'Buchhaltung für Selbstständige und kleine Teams.' },
          { icon: '📝', name: 'Notion vs ClickUp', beschreibung: 'Organisation, Projekte und Wissensarbeit.' },
          { icon: '📅', name: 'Calendly vs TidyCal', beschreibung: 'Terminbuchung und Kalender-Workflows.' },
          { icon: '🤖', name: 'ChatGPT vs Perplexity', beschreibung: 'KI-Recherche, Texte und Antworten.' },
          { icon: '🎨', name: 'Canva vs Adobe Express', beschreibung: 'Design, Social Content und Vorlagen.' },
          { icon: '📈', name: 'HubSpot vs Pipedrive', beschreibung: 'CRM, Marketing und Vertrieb.' },
        ].map((vergleich) => (
          <a
            key={vergleich.name}
            href={`/vergleichen/${vergleich.name.toLowerCase().replace(/ vs /g, '-vs-').replace(/ /g, '-')}`}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-badge-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              flexShrink: 0,
            }}>
              {vergleich.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
                {vergleich.name}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {vergleich.beschreibung}
              </p>
            </div>

            {/* Pfeil */}
            <span style={{ color: 'var(--color-text-secondary)' }}>Ansehen →</span>
          </a>
        ))}
      </div>

      {/* Beispiel-Vergleich Tabelle */}
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '22px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        marginBottom: '20px',
      }}>
        Vergleichsdetail: Beispiel
      </h2>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>
          sevdesk vs Lexware Office
        </h3>

        {/* Tabelle */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 0', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Kriterium</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: '600' }}>sevdesk</th>
              <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: '600' }}>Lexware Office</th>
            </tr>
          </thead>
          <tbody>
            {[
              { kriterium: 'Für wen?', a: 'Solo & Freelancer', b: 'Selbstständige & KMU' },
              { kriterium: 'Preis ab', a: '9,90 €', b: '8,90 €' },
              { kriterium: 'Stärke', a: 'Einfacher Einstieg', b: 'Kaufmännische Tiefe' },
              { kriterium: 'Einsatzbereich', a: 'Buchhaltung, Rechnungen', b: 'Buchhaltung, Lohn, Steuern' },
              { kriterium: 'Integrationen', a: 'Bank, PayPal, DATEV', b: 'DATEV, Banking, PayPal' },
            ].map((zeile) => (
              <tr key={zeile.kriterium} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 0', color: 'var(--color-text-secondary)' }}>{zeile.kriterium}</td>
                <td style={{ padding: '12px 16px' }}>{zeile.a}</td>
                <td style={{ padding: '12px 0' }}>{zeile.b}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <a href="/tools/sevdesk" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            sevdesk ansehen ↗
          </a>
          <a href="/tools/lexware-office" style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid var(--color-border)',
          }}>
            Lexware ansehen ↗
          </a>
        </div>
      </div>

    </main>
  );
}