// AUFGABEN-SEITE: Unternehmen verwalten (app/aufgaben/unternehmen-verwalten/page.tsx)
//
// Zweck: Zeigt passende Tools für die Aufgabe "Unternehmen verwalten".
// Später: Template — Admin wählt Aufgabe + Tools aus der Datenbank.
// Jetzt: Daten stehen im aufgabeData Objekt unten.

const aufgabeData = {
  name: 'Unternehmen verwalten',
  beschreibung: 'Von Buchhaltung bis CRM — diese Tools helfen dir, dein Business strukturiert zu führen, Kunden zu managen und Prozesse zu automatisieren.',
  zielgruppe: 'Solo & Teams',
  aktualisiertAm: 'Mai 2025',

  tools: [
    {
      kuerzel: 'L',
      farbe: '#2563eb',
      name: 'Lexoffice',
      kategorie: 'Buchhaltung & Rechnungen',
      beschreibung: 'Rechnungen schreiben, Belege erfassen und DATEV-Export — einfach, DSGVO-konform und ideal für Selbstständige in Deutschland.',
      badges: ['DSGVO', 'E-Rechnung'],
      preis: 'ab 7,90 € / Monat',
      empfehlung: true,
      link: '/tools/lexoffice',
    },
    {
      kuerzel: 'V',
      farbe: '#7c3aed',
      name: 'Vivid',
      kategorie: 'Geschäftskonto & Finanzen',
      beschreibung: 'Modernes Geschäftskonto mit Karte und Cashback. Trenne Privat- und Geschäftsausgaben sauber — kostenlos im Basis-Tarif.',
      badges: ['Free Plan', 'Konto'],
      preis: 'ab 0 € / Monat',
      empfehlung: false,
      link: '/tools/vivid',
    },
    {
      kuerzel: 'C',
      farbe: '#1a1a1a',
      name: 'Claude',
      kategorie: 'KI-Assistent',
      beschreibung: 'Texte schreiben, Ideen entwickeln und Prozesse automatisieren. Der vielseitigste KI-Assistent für den Business-Alltag.',
      badges: ['KI', 'Beliebt'],
      preis: 'ab 18 € / Monat',
      empfehlung: false,
      link: '/tools/claude',
    },
    {
      kuerzel: 'Z',
      farbe: '#d69e2e',
      name: 'Zapier',
      kategorie: 'Automatisierung',
      beschreibung: 'Verbinde alle deine Tools automatisch miteinander. Spart Stunden pro Woche durch automatisierte Workflows — ohne Code.',
      badges: ['Free Plan', 'No-Code'],
      preis: 'ab 0 € / Monat',
      empfehlung: false,
      link: '/tools/zapier',
    },
    {
      kuerzel: 'H',
      farbe: '#e53e3e',
      name: 'HubSpot CRM',
      kategorie: 'CRM & Marketing',
      beschreibung: 'Kunden verwalten, Deals tracken und Marketing automatisieren. Starkes Free-Angebot für den Einstieg.',
      badges: ['Free Plan', 'CRM'],
      preis: 'ab 0 € / Monat',
      empfehlung: false,
      link: '/tools/hubspot',
    },
  ],
};

// ─── LAYOUT ─────────────────────────────────────────────────────

export default function UnternehmenVerwaltenSeite() {
  const d = aufgabeData;

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/aufgaben" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Aufgaben</a>
        {' › '}
        {d.name}
      </p>

      {/* Badge */}
      <span style={{
        display: 'inline-block',
        backgroundColor: 'var(--color-badge-bg)',
        border: '1px solid var(--color-border)',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        marginBottom: '16px',
      }}>
        🏢 Aufgabe
      </span>

      {/* Titel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '38px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        lineHeight: '1.2',
        marginBottom: '12px',
      }}>
        Tools zum {d.name}
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.6',
        maxWidth: '640px',
        marginBottom: '24px',
      }}>
        {d.beschreibung}
      </p>

      {/* Meta-Pills */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {[
          `👥 Für ${d.zielgruppe}`,
          `🛠 ${d.tools.length} empfohlene Tools`,
          `📅 Aktualisiert: ${d.aktualisiertAm}`,
        ].map((pill) => (
          <span key={pill} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}>
            {pill}
          </span>
        ))}
      </div>

      {/* Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
        }}>
          Top-Empfehlungen
        </h2>
        <a href="/tools" style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}>
          Alle Tools ansehen →
        </a>
      </div>

      {/* Tool-Cards — 3 Spalten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        marginBottom: '40px',
      }}>
        {d.tools.map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: tool.empfehlung ? '2px solid var(--color-cta)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
          }}>

            {/* Logo + Herz */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: tool.farbe,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {tool.kuerzel}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{tool.kategorie}</p>
                </div>
              </div>
              <span style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '16px' }}>♡</span>
            </div>

            {/* Beschreibung */}
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5',
              marginBottom: '10px',
              flex: 1,
            }}>
              {tool.beschreibung}
            </p>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {tool.empfehlung && (
                <span style={{
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontWeight: '600',
                }}>
                  Unsere Empfehlung
                </span>
              )}
              {tool.badges.map((badge) => (
                <span key={badge} style={{
                  backgroundColor: 'var(--color-badge-bg)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Preis + Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {tool.preis}
              </span>
              <a href={tool.link} style={{
                backgroundColor: tool.empfehlung ? 'var(--color-cta)' : 'transparent',
                color: tool.empfehlung ? 'white' : 'var(--color-text-primary)',
                border: tool.empfehlung ? 'none' : '1px solid var(--color-border)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-btn)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
              }}>
                Details →
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '6px',
          }}>
            Nicht sicher welches Tool passt?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            Beantworte 4 Fragen und finde dein passendes Tool für Unternehmensführung.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <a href="/tool-finder" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px 22px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}>
            Tool-Finder starten
          </a>
          <a href="/tools" style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '12px 22px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid var(--color-border)',
            whiteSpace: 'nowrap',
          }}>
            Alle Tools ansehen
          </a>
        </div>
      </div>

    </main>
  );
}