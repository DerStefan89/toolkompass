// BLOGARTIKEL-SEITE (app/ratgeber/[slug]/page.tsx)
//
// Zweck: Template für alle Blogartikel, Guides und Tool-Vergleiche.
// Später: Inhalte kommen aus der Datenbank (Admin befüllt, published).
// Jetzt: Alle Inhalte stehen im "artikelData" Objekt unten.
//
// Artikel-Typen die dieses Template unterstützt:
// - Guide (z.B. "Beste Tools für Freelancer")
// - Top-Liste (z.B. "10 beste KI-Tools")
// - Vergleich (z.B. "sevdesk vs Lexware Office")
// - Anleitung (z.B. "So richtest du DATEV ein")

// ─── DATEN ──────────────────────────────────────────────────────

const artikelData = {
  // Meta
  typ: 'Guide',                    // Guide / Top-Liste / Vergleich / Anleitung
  titel: 'Die besten Tools für Freelancer 2025',
  untertitel: 'Ein kompletter Guide für Buchhaltung, Projektmanagement, Termine, KI und Kundenorganisation — mit Vergleichstabelle und Tool-Empfehlungen.',
  autor: 'ToolKompass Redaktion',
  datum: '15. Mai 2025',
  aktualisiertAm: 'Mai 2025',
  lesezeit: '12 Min.',
  kategorie: 'Freelancer',
  kategorieLink: '/kategorien/freelancer',
  hinweis: 'Dieser Artikel enthält Tool-Empfehlungen. Einige Links sind Affiliate-Links.',

  // Intro-Text
  intro: 'Als Freelancer jonglierst du täglich zwischen Kundenprojekten, Rechnungen, Terminen und Administration. Die richtigen Tools können dir dabei helfen, Zeit zu sparen, professioneller aufzutreten und den Überblick zu behalten. In diesem Guide zeigen wir dir, welche Tools sich in der Praxis bewährt haben.',

  // Empfohlene Tools (Box oben)
  empfohleneTools: [
    { kuerzel: 'S', farbe: '#e53e3e', name: 'sevdesk', zweck: 'Buchhaltung' },
    { kuerzel: 'N', farbe: '#000000', name: 'Notion', zweck: 'Organisation' },
    { kuerzel: 'C', farbe: '#38b2ac', name: 'Calendly', zweck: 'Termine' },
    { kuerzel: 'L', farbe: '#805ad5', name: 'Loom', zweck: 'Kundenupdates' },
    { kuerzel: 'G', farbe: '#38a169', name: 'ChatGPT', zweck: 'KI-Assistent' },
  ],

  // Inhaltsabschnitte
  abschnitte: [
    {
      titel: '1. Buchhaltung & Rechnungen',
      inhalt: 'Als Freelancer musst du Rechnungen schreiben, Belege verwalten und die Steuer vorbereiten. Gute Buchhaltungssoftware spart dir dabei Stunden pro Monat.',
      tools: [
        { kuerzel: 'S', farbe: '#e53e3e', name: 'sevdesk', beschreibung: 'Ideal für den Einstieg. Einfach, schnell, DSGVO-konform.', preis: 'ab 9,90 € / Monat', badges: ['Beliebt', 'E-Rechnung'], empfehlung: true },
        { kuerzel: 'L', farbe: '#38a169', name: 'Lexware Office', beschreibung: 'Umfassender, ideal wenn du mit einem Steuerberater arbeitest.', preis: 'ab 8,90 € / Monat', badges: ['DATEV'], empfehlung: false },
      ],
    },
    {
      titel: '2. Projektmanagement & Organisation',
      inhalt: 'Den Überblick über mehrere Kundenprojekte gleichzeitig zu behalten ist eine der größten Herausforderungen für Freelancer. Diese Tools helfen dir dabei.',
      tools: [
        { kuerzel: 'N', farbe: '#000000', name: 'Notion', beschreibung: 'All-in-One: Notizen, Projekte, Wikis und Datenbanken in einem Tool.', preis: 'Kostenlos / ab 8 € / Monat', badges: ['Free Plan', 'Beliebt'], empfehlung: true },
        { kuerzel: 'C', farbe: '#6b46c1', name: 'ClickUp', beschreibung: 'Mehr Struktur für komplexe Projekte mit vielen Aufgaben.', preis: 'ab 5 € / Monat', badges: ['Free Plan'], empfehlung: false },
      ],
    },
    {
      titel: '3. Terminbuchung',
      inhalt: 'Statt endloser E-Mail-Ketten für Terminabsprachen: Lass Kunden einfach direkt in deinen Kalender buchen.',
      tools: [
        { kuerzel: 'C', farbe: '#38b2ac', name: 'Calendly', beschreibung: 'Der Klassiker. Einfach einzurichten, professionell in der Nutzung.', preis: 'Kostenlos / ab 8 € / Monat', badges: ['Free Plan'], empfehlung: true },
        { kuerzel: 'T', farbe: '#d69e2e', name: 'TidyCal', beschreibung: 'Günstigere Alternative mit einmaligem Kaufpreis.', preis: 'ab 19 $ einmalig', badges: [], empfehlung: false },
      ],
    },
  ],

  // Fazit
  fazit: 'Du brauchst als Freelancer keine 20 Tools. Starte mit den Basics: Buchhaltung, Organisation und Terminbuchung. Baue deinen Stack Schritt für Schritt auf — und ersetze Tools nur dann, wenn du ein konkretes Problem damit löst.',

  // Verwandte Artikel
  verwandteArtikel: [
    { titel: 'Buchhaltung für Selbstständige', typ: 'Guide', lesezeit: '10 Min.', link: '/ratgeber/buchhaltung-selbststaendige' },
    { titel: 'KI-Tools für Gründer', typ: 'Guide', lesezeit: '9 Min.', link: '/ratgeber/ki-tools-gruender' },
    { titel: 'sevdesk vs Lexware Office', typ: 'Vergleich', lesezeit: '8 Min.', link: '/ratgeber/sevdesk-vs-lexware' },
  ],
};

// ─── LAYOUT ─────────────────────────────────────────────────────

export default function BlogArtikelSeite() {
  const d = artikelData;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/ratgeber" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Ratgeber</a>
        {' › '}
        {d.titel}
      </p>

      {/* Hauptbereich — zwei Spalten */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

        {/* LINKE SEITE — Artikel */}
        <div style={{ flex: 1 }}>

          {/* Typ-Badge + Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: 'var(--color-badge-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: '600',
            }}>
              {d.typ}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {d.lesezeit} · {d.datum} · Aktualisiert: {d.aktualisiertAm}
            </span>
          </div>

          {/* Titel */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '40px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            {d.titel}
          </h1>

          {/* Untertitel */}
          <p style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            {d.untertitel}
          </p>

          {/* Affiliate-Hinweis */}
          <div style={{
            backgroundColor: 'var(--color-badge-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 16px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
          }}>
            ℹ️ {d.hinweis}
          </div>

          {/* Empfohlene Tools Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            marginBottom: '40px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
              Im Artikel empfohlene Tools:
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {d.empfohleneTools.map((tool) => (
                <div key={tool.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: tool.farbe,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}>
                    {tool.kuerzel}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>{tool.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>{tool.zweck}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intro */}
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-primary)',
            lineHeight: '1.8',
            marginBottom: '48px',
          }}>
            {d.intro}
          </p>

          {/* Abschnitte */}
          {d.abschnitte.map((abschnitt) => (
            <div key={abschnitt.titel} style={{ marginBottom: '48px' }}>

              {/* Abschnitts-Titel */}
              <h2 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '26px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
              }}>
                {abschnitt.titel}
              </h2>

              {/* Abschnitts-Text */}
              <p style={{
                fontSize: '15px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.8',
                marginBottom: '24px',
              }}>
                {abschnitt.inhalt}
              </p>

              {/* Tool-Cards im Abschnitt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {abschnitt.tools.map((tool) => (
                  <div key={tool.name} style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: tool.empfehlung ? '2px solid var(--color-cta)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'flex-start',
                  }}>

                    {/* Logo */}
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
                      flexShrink: 0,
                    }}>
                      {tool.kuerzel}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '700', fontSize: '15px', margin: 0 }}>{tool.name}</p>
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
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>
                        {tool.beschreibung}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                    </div>

                    {/* Preis + Button */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>{tool.preis}</p>
                      <a href={`/tools/${tool.name.toLowerCase().replace(/ /g, '-')}`} style={{
                        backgroundColor: 'var(--color-cta)',
                        color: 'white',
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
            </div>
          ))}

          {/* Fazit */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            marginBottom: '48px',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Fazit
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
              {d.fazit}
            </p>
          </div>

          {/* Verwandte Artikel */}
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '16px',
          }}>
            Verwandte Artikel
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {d.verwandteArtikel.map((artikel) => (
              <a key={artikel.titel} href={artikel.link} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    backgroundColor: 'var(--color-badge-bg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '20px',
                  }}>
                    {artikel.typ}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{artikel.titel}</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {artikel.lesezeit} →
                </span>
              </a>
            ))}
          </div>

        </div>

        {/* RECHTE SIDEBAR */}
        <div style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '24px' }}>

          {/* Autor */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Geschrieben von</p>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{d.autor}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Kuratiert und geprüft durch das ToolKompass Team.
            </p>
          </div>

          {/* Tool-Finder CTA */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>
              Nicht sicher welches Tool passt?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
              Beantworte 4 Fragen und finde dein passendes Tool.
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

          {/* Kategorie-Link */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>Kategorie</p>
            <a href={d.kategorieLink} style={{
              fontSize: '13px',
              color: 'var(--color-cta)',
              textDecoration: 'none',
            }}>
              {d.kategorie} →
            </a>
          </div>

        </div>

      </div>

    </main>
  );
}