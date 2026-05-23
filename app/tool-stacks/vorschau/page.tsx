// STACK-VORSCHAU SEITE (app/tool-stacks/vorschau/page.tsx)
//
// Zweck: Zeigt einen vorgeschlagenen Tool-Stack für den Nutzer.
// Später: Nutzer kann eigene Tools hinzufügen, Kosten tracken, Stack speichern.
// Jetzt: Statische Vorschau mit 5 empfohlenen Tools.

const stackData = {
  titel: 'Dein empfohlener Tool-Stack',
  beschreibung: 'Basierend auf deinem Profil — Solo-Selbstständige, Creator und Gründer.',
  monatlicheKosten: '63,80',

  tools: [
    {
      kuerzel: 'C',
      farbe: '#1a1a1a',
      name: 'Claude',
      kategorie: 'KI-Assistent',
      beschreibung: 'Texte schreiben, Ideen entwickeln, Recherche und Automatisierung. Der vielseitigste KI-Assistent für den Business-Alltag.',
      preis: 'ab 18 € / Monat',
      badges: ['KI', 'Beliebt'],
      link: '/tools/claude',
      tipp: 'Ideal für: E-Mails, Social-Media-Texte, Angebote und Brainstorming.',
    },
    {
      kuerzel: 'L',
      farbe: '#2563eb',
      name: 'Lexoffice',
      kategorie: 'Buchhaltung & Rechnungen',
      beschreibung: 'Rechnungen schreiben, Belege erfassen und DATEV-Export — einfach und DSGVO-konform für Selbstständige in Deutschland.',
      preis: 'ab 7,90 € / Monat',
      badges: ['DSGVO', 'E-Rechnung'],
      link: '/tools/lexoffice',
      tipp: 'Ideal für: Rechnungsstellung, Belegerfassung und Steuerberater-Zusammenarbeit.',
    },
    {
      kuerzel: 'V',
      farbe: '#7c3aed',
      name: 'Vivid',
      kategorie: 'Geschäftskonto & Finanzen',
      beschreibung: 'Modernes Geschäftskonto mit Karte, Cashback und einfacher Ausgabenverwaltung. Perfekt für Freelancer und kleine Teams.',
      preis: 'ab 0 € / Monat',
      badges: ['Free Plan', 'Beliebt'],
      link: '/tools/vivid',
      tipp: 'Ideal für: Geschäftsausgaben trennen, Karten für Teams, Cashback.',
    },
    {
      kuerzel: 'C',
      farbe: '#dc2626',
      name: 'CapCut',
      kategorie: 'Video erstellen & editieren',
      beschreibung: 'Videos schneiden, Untertitel hinzufügen und Reels erstellen — direkt am Desktop oder Handy. Einfach und schnell.',
      preis: 'ab 0 € / Monat',
      badges: ['Free Plan', 'Creator'],
      link: '/tools/capcut',
      tipp: 'Ideal für: Reels, YouTube Shorts, Kundenvideos und Präsentationen.',
    },
    {
      kuerzel: 'B',
      farbe: '#0f172a',
      name: 'Buffer',
      kategorie: 'Social Media',
      beschreibung: 'Social-Media-Posts planen, veröffentlichen und analysieren — für Instagram, LinkedIn, TikTok und mehr.',
      preis: 'ab 0 € / Monat',
      badges: ['Free Plan'],
      link: '/tools/buffer',
      tipp: 'Ideal für: Content-Planung, automatisches Posten und Performance-Analyse.',
    },
  ],
};

// ─── LAYOUT ─────────────────────────────────────────────────────

export default function StackVorschauSeite() {
  const d = stackData;

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/tool-stacks" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Tool-Stacks</a>
        {' › '}
        Vorschau
      </p>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '38px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          lineHeight: '1.2',
          marginBottom: '12px',
        }}>
          {d.titel}
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          {d.beschreibung}
        </p>
      </div>

      {/* Kosten-Übersicht */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 24px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Geschätzte monatliche Kosten
          </p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            ab {d.monatlicheKosten} € / Monat
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Günstigste verfügbare Tarife · Preise können abweichen
          </p>
        </div>

        {/* Tool-Logos Übersicht */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {d.tools.map((tool) => (
            <div key={tool.name} style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
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
          ))}
        </div>
      </div>

      {/* Tool-Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        {d.tools.map((tool, index) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

              {/* Nummer + Logo */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                  {index + 1}
                </span>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  backgroundColor: tool.farbe,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '20px',
                }}>
                  {tool.kuerzel}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '18px', marginBottom: '2px' }}>{tool.name}</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{tool.kategorie}</p>
                  </div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)', flexShrink: 0 }}>
                    {tool.preis}
                  </p>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                  {tool.beschreibung}
                </p>

                {/* Tipp */}
                <div style={{
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-card)',
                  padding: '10px 14px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '12px',
                }}>
                  💡 {tool.tipp}
                </div>

                {/* Badges + Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {tool.badges.map((badge) => (
                      <span key={badge} style={{
                        backgroundColor: 'var(--color-badge-bg)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                  <a href={tool.link} style={{
                    backgroundColor: 'var(--color-cta)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-btn)',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}>
                    Details ansehen →
                  </a>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* CTA unten */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '22px',
          fontWeight: '700',
          marginBottom: '12px',
        }}>
          Möchtest du deinen Stack speichern?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
          Bald kannst du Tools speichern, Kosten tracken und deinen persönlichen Stack verwalten.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/einloggen" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            🔔 Benachrichtigen lassen
          </a>
          <a href="/tools" style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            border: '1px solid var(--color-border)',
          }}>
            Weitere Tools entdecken
          </a>
        </div>
      </div>

    </main>
  );
}