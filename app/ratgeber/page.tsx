// RATGEBER-SEITE (app/ratgeber/page.tsx)
// Zeigt Guides, Top-Listen und Vergleichsartikel.
// URL: /ratgeber

export default function RatgeberSeite() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Ratgeber
      </p>

      {/* Titel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Ratgeber & Guides
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Praxisnahe Guides, Vergleiche und Anleitungen rund um digitale Tools
        für Gründer, Selbstständige und kleine Teams.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Artikel, Tool oder Thema suchen ..."
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '24px',
        }}
      />

      {/* Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {['Alle', 'Tool-Guides', 'Top-Listen', 'Vergleiche', 'Anleitungen', 'KI', 'Buchhaltung', 'Projektmanagement', 'Freelancer', 'Teams'].map((filter, index) => (
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

      {/* Featured Guide */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        marginBottom: '48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '32px',
      }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
            display: 'block',
          }}>
            Featured Guide
          </span>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '12px',
            color: 'var(--color-text-primary)',
          }}>
            Die besten Tools für Freelancer 2025
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            Ein kompletter Guide für Buchhaltung, Projektmanagement, Termine, KI
            und Kundenorganisation — mit Vergleichstabelle und Tool-Empfehlungen.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Guide · 12 Min. Lesezeit · enthält Tool-Empfehlungen
          </p>
          <a href="/ratgeber/beste-tools-freelancer" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            Guide lesen
          </a>
        </div>

        {/* Tool-Logos */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {[
            { k: 'S', farbe: 'var(--color-error)', name: 'sevdesk' },
            { k: 'N', farbe: '#000000', name: 'Notion' },
            { k: 'C', farbe: '#38b2ac', name: 'Calendly' },
            { k: 'L', farbe: '#805ad5', name: 'Loom' },
            { k: 'C', farbe: 'var(--color-success)', name: 'ChatGPT' },
          ].map((tool) => (
            <div key={tool.name} style={{ textAlign: 'center' }}>
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
                fontSize: '16px',
                marginBottom: '4px',
              }}>
                {tool.k}
              </div>
              <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{tool.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Beliebte Guides */}
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '20px',
        color: 'var(--color-text-primary)',
      }}>
        Beliebte Guides
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '48px',
      }}>
        {[
          { badge: 'Top-Liste', titel: 'Beste Tools für Freelancer', beschreibung: 'Die wichtigsten Tools für Buchhaltung, Projekte, Termine, KI und Kundenorganisation.', meta: '12 Min. · Aktualisiert 2025' },
          { badge: 'Guide', titel: 'Buchhaltung für Selbstständige', beschreibung: 'Was du bei Rechnungen, E-Rechnung, DATEV und Belegen beachten solltest.', meta: '10 Min. · mit Tool-Vergleich' },
          { badge: 'Guide', titel: 'KI-Tools für Gründer', beschreibung: 'Welche KI-Tools bei Recherche, Texten, Coding und Automatisierung helfen.', meta: '9 Min. · enthält Empfehlungen' },
        ].map((artikel) => (
          <a key={artikel.titel} href="#" style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
            display: 'block',
          }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-badge-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '12px',
            }}>
              {artikel.badge}
            </span>
            <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', lineHeight: '1.3' }}>
              {artikel.titel}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              {artikel.beschreibung}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{artikel.meta}</span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Artikel lesen →</span>
            </div>
          </a>
        ))}
      </div>

      {/* Tool-Vergleiche */}
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '20px',
        color: 'var(--color-text-primary)',
      }}>
        Tool-Vergleiche
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}>
        {[
          { titel: 'sevdesk vs Lexware Office', beschreibung: 'Welches Buchhaltungstool passt besser zu Selbstständigen und kleinen Teams?', meta: '8 Min. · Vergleichstabelle' },
          { titel: 'Notion vs ClickUp', beschreibung: 'Organisation, Projektmanagement und Wissensarbeit im direkten Vergleich.', meta: '7 Min. · Alternativen' },
          { titel: 'ChatGPT vs Perplexity', beschreibung: 'KI-Assistent oder Antwortmaschine? Einsatzbereiche für Gründer und Freelancer.', meta: '6 Min. · KI' },
        ].map((vergleich) => (
          <a key={vergleich.titel} href="#" style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            textDecoration: 'none',
            color: 'var(--color-text-primary)',
            display: 'block',
          }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-warning-bg)',
              color: 'var(--color-warning-text)',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              marginBottom: '12px',
            }}>
              Vergleich
            </span>
            <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', lineHeight: '1.3' }}>
              {vergleich.titel}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              {vergleich.beschreibung}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{vergleich.meta}</span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>Artikel lesen →</span>
            </div>
          </a>
        ))}
      </div>

    </main>
  );
}