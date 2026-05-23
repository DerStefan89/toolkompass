// TOOL-DETAILSEITE (app/tools/[slug]/page.tsx)
//
// Zweck: Template für alle Tool-Detailseiten.
// Später: Inhalte kommen aus der Datenbank (Admin befüllt, published).
// Jetzt: Alle Inhalte stehen im "toolData" Objekt unten.
//
// Prinzip:
// - toolData = alle Inhalte (Admin befüllt das später)
// - Layout darunter = zeigt nur an, was in toolData steht

// ─── DATEN ──────────────────────────────────────────────────────

const toolData = {
  // Basis
  name: 'Notion',
  kategorie: 'Produktivität · Wissensmanagement',
  beschreibung: 'Flexible All-in-One Workspace. Notizen, Wikis, Datenbanken und Projekte an einem Ort. Ideal für Teams und Einzelpersonen.',
  verifiziert: true,
  bewertung: 4.8,
  bewertungenAnzahl: 2100,
  badges: ['Sehr beliebt', 'Kostenloser Plan verfügbar'],

  // Preis
  preis: '8,00 €',
  preisZeitraum: '/ Monat',
  preisHinweis: 'pro Nutzer, jährlich abgerechnet',
  kostenlosPlan: true,
  preisFeatures: ['Unbegrenzte Blöcke', 'Unbegrenzte Dateien', '30 Tage Versionsverlauf', 'Bevorzugter Support'],
  garantie: '14 Tage Geld-zurück-Garantie',
  preisNote: 'Kostenloser Plan für individuelle Nutzung. Kein Kreditkarte erforderlich.',

  // Tabs
  tabs: ['Überblick', 'Funktionen', 'Preise', 'Vergleich', 'Bewertungen (2.100)', 'Alternativen', 'FAQ'],

  // Kurzfazit
  kurzfazit: 'Notion kombiniert Notizen, Wikis, Datenbanken und Projektmanagement in einem flexiblen Workspace. Ideal für Teams und Einzelpersonen, die Struktur und Klarheit in ihre Arbeit bringen möchten.',

  staerken: [
    'Sehr flexible Anpassung',
    'All-in-One Workspace',
    'Starke Datenbank-Funktionen',
    'Große Vorlagen-Bibliothek',
  ],

  schwaechen: [
    'Einarbeitung kann Zeit brauchen',
    'Offline-Funktionen limitiert',
    'Bei großen Datenbanken kann es langsam werden',
  ],

  // Für wen geeignet?
  geeignetFuer: [
    { gruppe: 'Teams & Unternehmen', beschreibung: 'Wissensmanagement, Projektsteuerung und Dokumentation zentral organisieren.' },
    { gruppe: 'Selbstständige & Freelancer', beschreibung: 'Kundenprojekte, Inhalte und Prozesse übersichtlich verwalten.' },
    { gruppe: 'Studierende & Lernende', beschreibung: 'Notizen, Aufgaben und Lernmaterial strukturiert zusammenführen.' },
  ],

  nichtGeeignetFuer: [
    'Nutzer, die einfache Tools bevorzugen',
    'Nutzer, die keine Oberfläche mit vielen Optionen mögen',
    'Nutzer, die stark auf klassische CRM- oder ERP-Systeme angewiesen sind',
    'Nutzer, die eine reine To-Do-App wollen',
  ],

  // Funktionen
  funktionen: [
    { icon: '📄', name: 'Notizen & Dokumente', beschreibung: 'Erstelle und organisiere Inhalte mit leistungsstarkem Editor.' },
    { icon: '🗃', name: 'Datenbanken', beschreibung: 'Erstelle eigene Datenbanken, Tabellen und Ansichten.' },
    { icon: '✓', name: 'Aufgaben & Projekte', beschreibung: 'Plane Aufgaben, vergebe und verfolge den Fortschritt.' },
    { icon: '📚', name: 'Wikis & Wissen', beschreibung: 'Baue Team-Wikis und halte Wissen strukturiert fest.' },
  ],

  // Preispläne
  preisplaene: [
    { name: 'Free', preis: '0 €', fuer: 'Für Einzelpersonen', beliebt: false },
    { name: 'Plus', preis: '8 €', fuer: '/ Nutzer / Monat · Für kleine Teams', beliebt: true },
    { name: 'Business', preis: '15 €', fuer: '/ Nutzer / Monat · Für wachsende Teams', beliebt: false },
  ],
};

// ─── LAYOUT ─────────────────────────────────────────────────────

export default function ToolDetailSeite() {
  const d = toolData;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/kategorien" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Produktivität & Wissen</a>
        {' › '}
        {d.name}
      </p>

      {/* ─── HERO: 3 Spalten ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '32px', marginBottom: '32px' }}>

        {/* Spalte 1: Tool-Info */}
        <div>
          {/* Logo + Name */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              backgroundColor: '#000',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '28px',
              flexShrink: 0,
            }}>
              N
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
                {d.name}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                {d.kategorie}
              </p>
              {d.verifiziert && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--color-badge-bg)',
                  border: '1px solid var(--color-border)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}>
                  ✓ Verifiziertes Tool
                </span>
              )}
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            {d.beschreibung}
          </p>

          {/* Bewertung */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: '#f6ad55', fontSize: '18px' }}>★★★★</span>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>{d.bewertung}</span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>({d.bewertungenAnzahl.toLocaleString()} Bewertungen)</span>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {d.badges.map((badge) => (
              <span key={badge} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                👤 {badge}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="#" style={{
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              Zum Anbieter ↗
            </a>
            <a href="#" style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid var(--color-border)',
            }}>
              Tool entfernen
            </a>
            <a href="#" style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid var(--color-border)',
            }}>
              Änderungshistorie
            </a>
          </div>
        </div>

        {/* Spalte 2: Screenshot-Platzhalter */}
        <div style={{
          backgroundColor: 'var(--color-badge-bg)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          minHeight: '200px',
        }}>
          Tool-Screenshot
        </div>

        {/* Spalte 3: Preisbox */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Plan & Preisdetails</span>
            {d.kostenlosPlan && (
              <span style={{
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '11px',
              }}>
                Kostenlos
              </span>
            )}
          </div>

          <p style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>{d.preis}</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{d.preisHinweis}</p>

          {d.preisFeatures.map((feature) => (
            <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--color-cta)' }}>✓</span>
              {feature}
            </div>
          ))}

          <a href="#" style={{
            display: 'block',
            textAlign: 'center',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginTop: '16px',
            marginBottom: '8px',
          }}>
            Zum Anbieter ↗
          </a>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            {d.garantie}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '8px' }}>
            {d.preisNote}
          </p>
        </div>

      </div>

      {/* ─── TABS ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '2px solid var(--color-border)',
        marginBottom: '40px',
      }}>
        {d.tabs.map((tab, index) => (
          <a key={tab} href="#" style={{
            padding: '12px 20px',
            textDecoration: 'none',
            fontSize: '14px',
            color: index === 0 ? 'var(--color-cta)' : 'var(--color-text-secondary)',
            borderBottom: index === 0 ? '2px solid var(--color-cta)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: index === 0 ? '600' : '400',
          }}>
            {tab}
          </a>
        ))}
      </div>

      {/* ─── ÜBERBLICK ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '48px' }}>

        {/* Kurzfazit + Stärken/Schwächen */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
            Kurzfazit
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            {d.kurzfazit}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Stärken</p>
              {d.staerken.map((s) => (
                <div key={s} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-cta)' }}>✓</span>{s}
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#e53e3e' }}>Schwächen</p>
              {d.schwaechen.map((s) => (
                <div key={s} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: '#e53e3e' }}>✗</span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Für wen geeignet? */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
            Für wen geeignet?
          </h2>
          {d.geeignetFuer.map((g) => (
            <div key={g.gruppe} style={{ marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{g.gruppe}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{g.beschreibung}</p>
            </div>
          ))}
        </div>

        {/* Für wen nicht geeignet? */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
            Für wen eher nicht geeignet?
          </h2>
          {d.nichtGeeignetFuer.map((n) => (
            <div key={n} style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span>✗</span>{n}
            </div>
          ))}
        </div>

      </div>

      {/* ─── FUNKTIONEN + PREISE ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>

        {/* Funktionen */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700' }}>Funktionen</h2>
            <a href="#" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Alle Funktionen ansehen →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {d.funktionen.map((f) => (
              <div key={f.name} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
                <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{f.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{f.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preise */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700' }}>Preise</h2>
            <a href="#" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Alle Preispläne ansehen →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {d.preisplaene.map((plan) => (
              <div key={plan.name} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: plan.beliebt ? '2px solid var(--color-cta)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
                textAlign: 'center',
                position: 'relative',
              }}>
                {plan.beliebt && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--color-cta)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontWeight: '600',
                  }}>
                    Beliebt
                  </span>
                )}
                <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{plan.name}</p>
                <p style={{ fontWeight: '700', fontSize: '24px', marginBottom: '4px' }}>{plan.preis}</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>{plan.fuer}</p>
                <a href="#" style={{
                  display: 'block',
                  backgroundColor: plan.beliebt ? 'var(--color-cta)' : 'transparent',
                  color: plan.beliebt ? 'white' : 'var(--color-text-primary)',
                  border: plan.beliebt ? 'none' : '1px solid var(--color-border)',
                  padding: '8px',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                }}>
                  Zum Plan
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

    </main>
  );
}