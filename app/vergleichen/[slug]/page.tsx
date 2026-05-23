// VERGLEICHS-DETAILSEITE (app/vergleichen/[slug]/page.tsx)
//
// Zweck: Template für alle Tool-Vergleiche.
// Später: Inhalte kommen aus der Datenbank.
// Jetzt: Alle Inhalte stehen im "vergleichData" Objekt unten.

// ─── DATEN ──────────────────────────────────────────────────────

const vergleichData = {
  // Meta
  toolA: {
    kuerzel: 'S',
    farbe: '#e53e3e',
    name: 'sevdesk',
    preis: 'ab 9,90 € / Monat',
    beschreibung: 'Einsteiger-Tarife für Rechnungen, Belege und Buchhaltung. Tarifdetails beim Anbieter prüfen.',
    vorteile: ['einfacher Einstieg', 'gut für Solo-Selbstständige', 'Belegerfassung', 'E-Rechnung/DATEV prüfen'],
    nachteile: ['bei komplexeren Anforderungen ggf. begrenzt', 'Tarifdetails prüfen', 'nicht für jede Spezialanforderung ideal'],
    passendeWenn: ['einfache Rechnungen und Belege verwalten willst', 'solo arbeitest', 'schnell starten möchtest', 'eine intuitive Oberfläche suchst', 'möglichst wenig Buchhaltungs-Komplexität willst'],
  },
  toolB: {
    kuerzel: 'LO',
    farbe: '#e8a24a',
    name: 'Lexware Office',
    preis: 'ab 8,90 € / Monat',
    beschreibung: 'Kaufmännischer Einstieg mit mehreren Tarifen, Funktionen und Laufzeiten beim Anbieter prüfen.',
    vorteile: ['umfangreicher', 'stark für kaufmännische Prozesse', 'gut für kleine Unternehmen', 'Steuerberatung'],
    nachteile: ['kann für Einsteiger umfangreicher wirken', 'Tarifstruktur prüfen', 'eventuell mehr Einarbeitung nötig'],
    passendeWenn: ['mehr kaufmännische Funktionen brauchst', 'mit einem kleinen Team arbeitest', 'strukturiertere Buchhaltung möchtest', 'mehr Auswertungen und Prozesse brauchst', 'enger mit Steuerberater:innen arbeitest'],
  },

  // Kontext
  kategorie: 'Buchhaltung & Rechnungen',
  kategorieLink: '/kategorien/buchhaltung-rechnungen',
  untertitel: 'Buchhaltungssoftware im Vergleich: Welche Lösung passt besser zu Selbstständigen, Freelancern und kleinen Teams?',

  // Unser Urteil
  urteil: 'sevdesk passt besser, wenn du als Solo-Selbstständiger einfache Rechnungen, Belegerfassung und eine intuitive Bedienung suchst. Lexware Office kann besser passen, wenn du mehr kaufmännische Funktionen, strukturierte Buchhaltung und Zusammenarbeit mit Steuerberater:innen brauchst.',

  // Direktvergleich Tabelle
  vergleichsTabelle: [
    { kriterium: 'Preis ab', a: '9,90 € / Monat', b: '8,90 € / Monat' },
    { kriterium: 'Free Plan', a: '—', b: '—' },
    { kriterium: 'E-Rechnung', a: '✓', b: '✓' },
    { kriterium: 'DATEV', a: '✓', b: '✓' },
    { kriterium: 'Belegerfassung', a: '✓', b: '✓' },
    { kriterium: 'UStVA', a: '✓', b: '✓' },
    { kriterium: 'Bankanbindung', a: '✓', b: '✓' },
    { kriterium: 'Steuerberaterzugang', a: '✓', b: '✓' },
    { kriterium: 'Bedienung', a: 'einfach', b: 'umfangreicher' },
    { kriterium: 'Für Solo', a: '✓', b: '✓' },
    { kriterium: 'Für Teams', a: 'bedingt', b: '✓' },
    { kriterium: 'Bewertungen', a: 'im Aufbau', b: 'im Aufbau' },
  ],

  // Preishinweis
  preisHinweis: 'Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.',
  affiliateHinweis: 'Affiliate-Link · Für dich keine Mehrkosten',
};

// ─── LAYOUT ─────────────────────────────────────────────────────

export default function VergleichDetailSeite() {
  const d = vergleichData;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        <a href="/vergleichen" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Vergleichen</a>
        {' › '}
        {d.toolA.name} vs {d.toolB.name}
      </p>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '48px', marginBottom: '40px' }}>

        {/* Titel */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '42px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '12px',
          }}>
            {d.toolA.name} vs {d.toolB.name}
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            {d.untertitel}
          </p>
        </div>

        {/* Tool-Logos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px 24px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '8px',
            backgroundColor: d.toolA.farbe, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '18px',
          }}>
            {d.toolA.kuerzel}
          </div>
          <span style={{ fontWeight: '700', color: 'var(--color-text-secondary)' }}>vs</span>
          <div style={{
            width: '48px', height: '48px', borderRadius: '8px',
            backgroundColor: d.toolB.farbe, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '18px',
          }}>
            {d.toolB.kuerzel}
          </div>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', textAlign: 'center' }}>
              {d.kategorie}
            </p>
          </div>
        </div>

      </div>

      {/* ─── UNSER URTEIL ─────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '40px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>
          Unser Urteil kurz gesagt
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
          {d.urteil}
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="#" style={{
            backgroundColor: 'var(--color-cta)', color: 'white',
            padding: '10px 20px', borderRadius: 'var(--radius-btn)',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600',
          }}>
            {d.toolA.name} ansehen
          </a>
          <a href="#" style={{
            backgroundColor: 'transparent', color: 'var(--color-text-primary)',
            padding: '10px 20px', borderRadius: 'var(--radius-btn)',
            textDecoration: 'none', fontSize: '14px',
            border: '1px solid var(--color-border)',
          }}>
            {d.toolB.name} ansehen
          </a>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {d.affiliateHinweis}
          </span>
        </div>
      </div>

      {/* ─── WELCHES TOOL PASST BESSER? ───────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Welches Tool passt besser zu dir?
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>

        {/* Tool A */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '6px',
              backgroundColor: d.toolA.farbe, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '14px',
            }}>
              {d.toolA.kuerzel}
            </div>
            <p style={{ fontWeight: '700', fontSize: '15px' }}>{d.toolA.name} passt besser, wenn du ...</p>
          </div>
          {d.toolA.passendeWenn.map((punkt) => (
            <div key={punkt} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-cta)' }}>✓</span>{punkt}
            </div>
          ))}
        </div>

        {/* Tool B */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '6px',
              backgroundColor: d.toolB.farbe, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '14px',
            }}>
              {d.toolB.kuerzel}
            </div>
            <p style={{ fontWeight: '700', fontSize: '15px' }}>{d.toolB.name} passt besser, wenn du ...</p>
          </div>
          {d.toolB.passendeWenn.map((punkt) => (
            <div key={punkt} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-cta)' }}>✓</span>{punkt}
            </div>
          ))}
        </div>

      </div>

      {/* ─── DIREKTVERGLEICH TABELLE ──────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Direktvergleich
      </h2>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '48px',
        overflowX: 'auto',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ textAlign: 'left', padding: '10px 0', color: 'var(--color-text-secondary)', fontWeight: '600', width: '30%' }}>Kriterium</th>
              <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: '700', width: '35%' }}>{d.toolA.name}</th>
              <th style={{ textAlign: 'left', padding: '10px 0', fontWeight: '700', width: '35%' }}>{d.toolB.name}</th>
            </tr>
          </thead>
          <tbody>
            {d.vergleichsTabelle.map((zeile) => (
              <tr key={zeile.kriterium} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 0', color: 'var(--color-text-secondary)' }}>{zeile.kriterium}</td>
                <td style={{ padding: '12px 16px' }}>{zeile.a}</td>
                <td style={{ padding: '12px 0' }}>{zeile.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '16px' }}>
          {d.preisHinweis}
        </p>
      </div>

      {/* ─── PREISE ───────────────────────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Preise im Vergleich
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
        {[d.toolA, d.toolB].map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                backgroundColor: tool.farbe, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '16px', flexShrink: 0,
              }}>
                {tool.kuerzel}
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{tool.name}</p>
                <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{tool.preis}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{tool.beschreibung}</p>
              </div>
            </div>
            <a href="#" style={{
              backgroundColor: 'var(--color-cta)', color: 'white',
              padding: '10px 16px', borderRadius: 'var(--radius-btn)',
              textDecoration: 'none', fontSize: '13px', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Zum Anbieter
            </a>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '48px' }}>
        {d.preisHinweis}
      </p>

      {/* ─── VORTEILE & NACHTEILE ─────────────────────────────── */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '26px', fontWeight: '700', marginBottom: '20px' }}>
        Vorteile und Nachteile
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[d.toolA, d.toolB].map((tool) => (
          <div key={tool.name} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '6px',
                backgroundColor: tool.farbe, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '14px',
              }}>
                {tool.kuerzel}
              </div>
              <p style={{ fontWeight: '700', fontSize: '15px' }}>{tool.name}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Vorteile</p>
                {tool.vorteile.map((v) => (
                  <div key={v} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-cta)' }}>✓</span>{v}
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '8px' }}>Nachteile</p>
                {tool.nachteile.map((n) => (
                  <div key={n} style={{ display: 'flex', gap: '6px', marginBottom: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#e53e3e' }}>✗</span>{n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}