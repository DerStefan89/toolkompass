import Link from 'next/link'

// TOOL-FINDER SEITE (app/tool-finder/page.tsx)
// Zweck: Coming Soon Seite — zeigt was kommt, sammelt Interesse.
// Der echte Tool-Finder folgt in einer späteren Phase.

export default function ToolFinderSeite() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</Link>
        {' › '}
        Tool-Finder
      </p>

      {/* Zweispaltig: Links Inhalt, Rechts Vorschau */}
      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

        {/* LINKE SEITE */}
        <div style={{ flex: 1 }}>

          {/* Badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning-text)',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 14px',
            borderRadius: '20px',
            marginBottom: '20px',
          }}>
            🚧 In Entwicklung
          </span>

          {/* Titel */}
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '52px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            Tool-Finder
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '32px',
          }}>
            Beantworte ein paar Fragen und finde passende Tools
            für deine Rolle, deinen Bedarf und dein Budget.
          </p>

          {/* Feature-Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              '⏱ Dauert ca. 2 Minuten',
              '✓ Kostenlos & unverbindlich',
              '👤 Keine Registrierung nötig',
              '🔖 Empfehlungen später speichern',
            ].map((f) => (
              <span key={f} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
              }}>
                {f}
              </span>
            ))}
          </div>

          {/* So funktioniert es */}
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'var(--color-text-primary)',
          }}>
            So funktioniert der Tool-Finder
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
            {[
              { nr: '1', titel: 'Solo oder Team?', beschreibung: 'Arbeitest du allein oder mit einem Team?' },
              { nr: '2', titel: 'Rolle auswählen', beschreibung: 'Freelancer, Gründer, Creator, Berater...' },
              { nr: '3', titel: 'Aufgaben bestimmen', beschreibung: 'Was willst du erledigen? Rechnungen, Social Media, Projekte...' },
              { nr: '4', titel: 'Prioritäten setzen', beschreibung: 'Was ist dir wichtig? Preis, Einfachheit, DSGVO...' },
              { nr: '5', titel: 'Budget eingrenzen', beschreibung: 'Kostenlos, bis 20 €, bis 50 € oder mehr?' },
              { nr: '6', titel: 'Bestehende Tools angeben', beschreibung: 'Welche Tools nutzt du bereits?' },
            ].map((schritt) => (
              <div key={schritt.nr} style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-cta)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  flexShrink: 0,
                }}>
                  {schritt.nr}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>{schritt.titel}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{schritt.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Danach */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}>
            <span style={{ fontSize: '32px' }}>🧭</span>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Danach erhältst du <strong style={{ color: 'var(--color-text-primary)' }}>passende Tool-Empfehlungen</strong> — mit Begründung, Preis und direktem Link zum Anbieter.
            </p>
          </div>

          {/* CTA */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '2px solid var(--color-cta)',
            borderRadius: 'var(--radius-card)',
            padding: '32px',
            textAlign: 'center',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '22px',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Noch nicht verfügbar
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Der Tool-Finder ist gerade in Entwicklung.
              Lass dich benachrichtigen sobald er live geht.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#" style={{
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
              <Link href="/kategorien" style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                padding: '14px 28px',
                borderRadius: 'var(--radius-btn)',
                textDecoration: 'none',
                fontSize: '15px',
                border: '1px solid var(--color-border)',
              }}>
                Tools selbst entdecken →
              </Link>
            </div>
          </div>

        </div>

        {/* RECHTE SEITE — Vorschau wie es aussehen wird */}
        <div style={{ width: '340px', flexShrink: 0 }}>

          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            position: 'sticky',
            top: '24px',
          }}>

            {/* Vorschau Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ fontSize: '16px' }}>👁</span>
              <p style={{ fontWeight: '700', fontSize: '14px' }}>Vorschau: Dein Weg zur Empfehlung</p>
            </div>

            {/* Schritte Vorschau */}
            {[
              { nr: 1, label: 'Solo oder Team?', aktiv: true },
              { nr: 2, label: 'Rolle auswählen', aktiv: false },
              { nr: 3, label: 'Aufgaben bestimmen', aktiv: false },
              { nr: 4, label: 'Prioritäten setzen', aktiv: false },
              { nr: 5, label: 'Budget eingrenzen', aktiv: false },
              { nr: 6, label: 'Bestehende Tools angeben', aktiv: false },
            ].map((schritt) => (
              <div key={schritt.nr} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-card)',
                backgroundColor: schritt.aktiv ? 'var(--color-bg)' : 'transparent',
                marginBottom: '4px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: schritt.aktiv ? 'var(--color-cta)' : 'var(--color-badge-bg)',
                  color: schritt.aktiv ? 'white' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '12px',
                  flexShrink: 0,
                }}>
                  {schritt.nr}
                </div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: schritt.aktiv ? '600' : '400',
                  color: schritt.aktiv ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}>
                  {schritt.label}
                </p>
              </div>
            ))}

            {/* Ergebnis-Vorschau */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-card)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🧭</span>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Danach erhältst du passende Tool-Empfehlungen.
              </p>
            </div>

            {/* Datenschutz-Hinweis */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>🔒</span>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                Deine Antworten werden nicht gespeichert und nicht an Dritte weitergegeben, solange du keinen Account erstellst.
              </p>
            </div>

          </div>
        </div>

      </div>

    </main>
  );
}