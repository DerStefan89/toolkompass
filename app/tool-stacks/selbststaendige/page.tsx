// STACK-SEITE: Selbstständige (app/tool-stacks/selbststaendige/page.tsx)
//
// Zweck: Kuratierter Tool-Stack für Selbstständige.
// Später: Inhalte kommen aus der Datenbank — Admin erstellt Stacks im Backend.
// Jetzt: Daten stehen im stackData Objekt unten.

const stackData = {
  titel: 'Tool-Stack für Selbstständige',
  untertitel: 'Diese 5 Tools decken deinen kompletten Business-Alltag ab — von Buchhaltung bis Social Media.',
  zielgruppe: 'Solo-Selbstständige · Freelancer · Creator',
  monatlicheKosten: 'ab 25,90 €',
  tools: [
    {
      nummer: 1,
      kuerzel: 'C',
      farbe: '#1a1a1a',
      name: 'Claude',
      kategorie: 'KI-Assistent',
      wofuer: 'Texte, Ideen & Automatisierung',
      beschreibung: 'Schreib E-Mails, erstelle Angebote, recherchiere Themen und automatisiere wiederkehrende Aufgaben — dein KI-Assistent für den Alltag.',
      preis: 'ab 18 € / Monat',
      freePlan: false,
      badges: ['KI', 'Beliebt'],
      link: '/tools/claude',
    },
    {
      nummer: 2,
      kuerzel: 'L',
      farbe: '#2563eb',
      name: 'Lexoffice',
      kategorie: 'Buchhaltung & Rechnungen',
      wofuer: 'Rechnungen & Buchhaltung',
      beschreibung: 'Schreib Rechnungen, erfasse Belege und bereite deine Steuer vor — einfach, DSGVO-konform und mit DATEV-Export.',
      preis: 'ab 7,90 € / Monat',
      freePlan: false,
      badges: ['DSGVO', 'E-Rechnung'],
      link: '/tools/lexoffice',
    },
    {
      nummer: 3,
      kuerzel: 'V',
      farbe: '#7c3aed',
      name: 'Vivid',
      kategorie: 'Geschäftskonto',
      wofuer: 'Konto & Finanzen',
      beschreibung: 'Modernes Geschäftskonto mit Karte und Cashback. Trenne Privat- und Geschäftsausgaben sauber — kostenlos im Basis-Tarif.',
      preis: 'ab 0 € / Monat',
      freePlan: true,
      badges: ['Free Plan', 'Konto'],
      link: '/tools/vivid',
    },
    {
      nummer: 4,
      kuerzel: 'CC',
      farbe: '#dc2626',
      name: 'CapCut',
      kategorie: 'Video & Content',
      wofuer: 'Videos erstellen & editieren',
      beschreibung: 'Schneide Videos, füge Untertitel hinzu und erstelle Reels für Instagram und TikTok — schnell und einfach, auch ohne Vorkenntnisse.',
      preis: 'ab 0 € / Monat',
      freePlan: true,
      badges: ['Free Plan', 'Creator'],
      link: '/tools/capcut',
    },
    {
      nummer: 5,
      kuerzel: 'Bu',
      farbe: '#0f172a',
      name: 'Buffer',
      kategorie: 'Social Media',
      wofuer: 'Social Media planen & posten',
      beschreibung: 'Plane und veröffentliche Posts für Instagram, LinkedIn und TikTok automatisch. Analysiere was funktioniert und spare Zeit.',
      preis: 'ab 0 € / Monat',
      freePlan: true,
      badges: ['Free Plan', 'Social'],
      link: '/tools/buffer',
    },
  ],
};

export default function StackSelbststaendigeSeite() {
  const d = stackData;

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/tool-stacks" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Tool-Stacks</a>
        {' › '}
        Selbstständige
      </p>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-badge-bg)',
          border: '1px solid var(--color-border)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '16px',
        }}>
          {d.zielgruppe}
        </span>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '42px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          lineHeight: '1.2',
          marginBottom: '16px',
        }}>
          {d.titel}
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 24px',
        }}>
          {d.untertitel}
        </p>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Gesamtkosten: <strong style={{ color: 'var(--color-text-primary)' }}>{d.monatlicheKosten} / Monat</strong>
        </p>
      </div>

      {/* 5 Tools nebeneinander */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {d.tools.map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>

            {/* Nummer */}
            <p style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--color-text-secondary)',
              marginBottom: '12px',
              letterSpacing: '1px',
            }}>
              {tool.nummer} / 5
            </p>

            {/* Logo */}
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
              fontSize: '16px',
              marginBottom: '14px',
            }}>
              {tool.kuerzel}
            </div>

            {/* Name + Kategorie */}
            <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '2px' }}>{tool.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{tool.kategorie}</p>

            {/* Wofür */}
            <p style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--color-cta)',
              marginBottom: '12px',
            }}>
              {tool.wofuer}
            </p>

            {/* Beschreibung */}
            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
              marginBottom: '16px',
              flex: 1,
            }}>
              {tool.beschreibung}
            </p>

            {/* Preis */}
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
            }}>
              {tool.preis}
            </p>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
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

            {/* Button */}
            <a href={tool.link} style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '8px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Details ansehen
            </a>

          </div>
        ))}
      </div>

      {/* Alles in einem Account managen — CTA Box */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🧭</div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '26px',
          fontWeight: '700',
          marginBottom: '12px',
        }}>
          Alles in einem Account managen
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.7',
          maxWidth: '500px',
          margin: '0 auto 32px',
        }}>
          Bald kannst du deinen Stack speichern, Kosten tracken, Kündigungsfristen im Blick behalten
          und alle deine Tools direkt von ToolKompass aus öffnen.
        </p>

        {/* Feature-Liste */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}>
          {[
            '✓ Stack speichern',
            '✓ Kosten tracken',
            '✓ Kündigungen erinnern',
            '✓ Alternativen entdecken',
            '✓ Tools direkt öffnen',
          ].map((feature) => (
            <span key={feature} style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              fontWeight: '500',
            }}>
              {feature}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="/einloggen" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: '600',
          }}>
            🔔 Benachrichtigen lassen
          </a>
          <a href="/tool-stacks" style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            padding: '14px 28px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '15px',
            border: '1px solid var(--color-border)',
          }}>
            Andere Stacks ansehen
          </a>
        </div>
      </div>

    </main>
  );
}