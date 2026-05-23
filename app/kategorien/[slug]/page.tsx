// KATEGORIE-DETAILSEITE (app/kategorien/[slug]/page.tsx)
// Zeigt alle Tools einer Kategorie mit Empfehlungen und Filtern.
// URL: /kategorien/buchhaltung-rechnungen, /kategorien/design-video etc.
// [slug] = der variable Teil der URL — wechselt je nach Kategorie

export default function KategorieDetailSeite() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/kategorien" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Kategorien</a>
        {' › '}
        Buchhaltung & Rechnungen
      </p>

      {/* Hero — Titel links, Bild rechts */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        gap: '48px',
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '42px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            Beste Buchhaltungssoftware für Selbstständige
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
          }}>
            Vergleiche Buchhaltungstools für Selbstständige, Freelancer und kleine Teams
            in Deutschland – mit Fokus auf E-Rechnung, DATEV, Belegerfassung, Preise
            und einfache Bedienung.
          </p>
        </div>

        {/* Platzhalter für Bild */}
        <div style={{
          width: '280px',
          height: '180px',
          backgroundColor: 'var(--color-badge-bg)',
          borderRadius: 'var(--radius-card)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
        }}>
          🗂️
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {['Solo', 'Team', 'Preis', 'Free Plan', 'DSGVO', 'E-Rechnung', 'DATEV', 'Bewertung', 'Anwendungsfall'].map((filter, index) => (
          <a key={filter} href="#" style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            backgroundColor: index === 0 ? 'var(--color-cta)' : 'var(--color-bg-card)',
            color: index === 0 ? 'white' : 'var(--color-text-primary)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: index === 0 ? '600' : '400',
          }}>
            {filter}
          </a>
        ))}
      </div>

      {/* Hauptbereich — zwei Spalten */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* LINKE SEITE — Hauptinhalt */}
        <div style={{ flex: 1 }}>

          {/* Empfehlungsbox */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            marginBottom: '32px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--color-text-primary)',
            }}>
              Unsere Empfehlung kurz gesagt
            </h2>

            {/* 5 Empfehlungs-Karten */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[
                { zweck: 'Für Solo-Freelancer', tool: 'sevdesk', beschreibung: 'Einfach starten, schnell Rechnungen schreiben.' },
                { zweck: 'Für Selbstständige & kleine KMU', tool: 'Lexware Office', beschreibung: 'Klassisch, zuverlässig und sehr umfassend.' },
                { zweck: 'Für einfache Rechnungen', tool: 'FastBill', beschreibung: 'Übersichtlich und schnell eingerichtet.' },
                { zweck: 'Für günstigen Einstieg', tool: 'Accountable oder Papierkram', beschreibung: 'Günstig starten und Kosten sparen.' },
                { zweck: 'Für Steuerberater-Zusammenarbeit', tool: 'Lexware Office oder sevdesk', beschreibung: 'Beste Zusammenarbeit mit dem Steuerbüro.' },
              ].map((emp) => (
                <div key={emp.zweck} style={{
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-card)',
                  padding: '14px',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{emp.zweck}</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-cta)', marginBottom: '6px' }}>{emp.tool}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{emp.beschreibung}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top-Empfehlungen Titel */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}>
                Top-Empfehlungen
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Aktualisiert: Mai 2025
              </span>
            </div>
            <a href="#" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Alle Tools ansehen →
            </a>
          </div>

          {/* Tool-Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { k: 'S', farbe: '#e53e3e', name: 'sevdesk', beschreibung: 'Einfacher Einstieg für Solo-Selbstständige.', badges: ['Beliebt', 'E-Rechnung'], preis: 'ab 9,90 €' },
              { k: 'L', farbe: '#38a169', name: 'Lexware Office', beschreibung: 'Klassisch, zuverlässig und sehr umfassend.', badges: ['Beliebt', 'DATEV'], preis: 'ab 8,90 €' },
              { k: 'F', farbe: '#e53e3e', name: 'FastBill', beschreibung: 'Schnell eingerichtet für kleine Unternehmen.', badges: ['E-Rechnung', 'DATEV'], preis: 'ab 10,00 €' },
              { k: 'W', farbe: '#3182ce', name: 'WISO MeinBüro', beschreibung: 'Komplettlösung für Selbstständige & KMU.', badges: ['DATEV'], preis: 'ab 14,90 €' },
              { k: 'a', farbe: '#805ad5', name: 'Accountable', beschreibung: 'Moderne Buchhaltung für Selbstständige.', badges: ['E-Rechnung'], preis: 'ab 8,00 €' },
              { k: 'p', farbe: '#d69e2e', name: 'Papierkram', beschreibung: 'Minimalistisch. Günstig. Für einfache Zwecke.', badges: [], preis: 'ab 4,90 €' },
            ].map((tool) => (
              <div key={tool.name} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
              }}>
                {/* Logo + Herz */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    backgroundColor: tool.farbe,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '18px',
                  }}>
                    {tool.k}
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>♡</span>
                </div>

                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{tool.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px', lineHeight: '1.5' }}>
                  {tool.beschreibung}
                </p>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {tool.badges.map((badge) => (
                    <span key={badge} style={{
                      backgroundColor: 'var(--color-badge-bg)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>

                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  {tool.preis} / Monat
                </p>

                <p style={{ fontSize: '11px', color: 'var(--color-cta)', marginBottom: '12px' }}>
                  Bewertungen im Aufbau
                </p>

                {/* Buttons */}
                <a href={`/tools/${tool.name.toLowerCase().replace(/ /g, '-')}`} style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                  padding: '8px',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}>
                  Details ansehen
                </a>
                <a href="#" style={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '12px',
                  textDecoration: 'none',
                }}>
                  Zum Anbieter →
                </a>
              </div>
            ))}
          </div>

        </div>

        {/* RECHTE SIDEBAR */}
        <div style={{ width: '220px', flexShrink: 0 }}>

          {/* Worauf achten? */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '16px' }}>
              Worauf achten?
            </h3>
            {['E-Rechnung', 'DATEV Export', 'Belegerfassung', 'UStVA', 'GoBD', 'Bankanbindung', 'Steuerberaterzugang'].map((punkt) => (
              <div key={punkt} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '13px',
              }}>
                <span style={{ color: 'var(--color-cta)' }}>✓</span>
                {punkt}
              </div>
            ))}
            <a href="#" style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              display: 'block',
              marginTop: '8px',
            }}>
              Mehr erfahren →
            </a>
          </div>

          {/* Nicht sicher? Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <h3 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px' }}>
              Nicht sicher?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              Finde in 2 Minuten das passende Buchhaltungstool.
            </p>
            <a href="/tool-finder" style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '10px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              Tool-Finder starten
            </a>
          </div>

        </div>

      </div>

    </main>
  );
}