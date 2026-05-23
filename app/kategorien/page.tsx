// KATEGORIEN-SEITE (app/kategorien/page.tsx)
// Zeigt alle Tool-Kategorien in einem Raster.
// URL: /kategorien

export default function KategorienSeite() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb — Navigationspfad oben */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <a href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</a>
        {' › '}
        Kategorien
      </p>

      {/* Seitentitel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Alle Tool-Kategorien
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Entdecke Tools nach Bereich und finde passende Software für deine Aufgaben —
        kuratiert für Solo-Selbstständige und kleine Teams in Deutschland.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Kategorie oder Aufgabe suchen ..."
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '32px',
        }}
      />

      {/* Kategorien-Raster */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {[
          { icon: '⊞', name: 'Buchhaltung & Rechnungen', beschreibung: 'Rechnungen schreiben, Belege verwalten und E-Rechnung vorbereiten.', tools: 'sevdesk · Lexware Office · FastBill', anzahl: 12 },
          { icon: '🏛', name: 'Geschäftskonto & Finanzen', beschreibung: 'Geschäftskonten, Karten und Finanzlösungen für dein Business.', tools: 'Qonto · FINOM · N26 Business', anzahl: 13 },
          { icon: '📊', name: 'Controlling & Ausgabenmanagement', beschreibung: 'Ausgaben im Blick behalten und Finanzen smarter steuern.', tools: 'Pleo · spendesk · Moss', anzahl: 14 },
          { icon: '⚖️', name: 'Recht, Datenschutz & E-Signatur', beschreibung: 'Verträge erstellen, unterschreiben und rechtlich sicher arbeiten.', tools: 'DocuSign · Yousign · eRecht24', anzahl: 15 },
          { icon: '✓', name: 'Produktivität & Notizen', beschreibung: 'Notizen, Aufgaben und Ideen effizient organisieren.', tools: 'Notion · Evernote · Todoist', anzahl: 16 },
          { icon: '📋', name: 'Projektmanagement', beschreibung: 'Projekte planen, Aufgaben verwalten und Teams koordinieren.', tools: 'Trello · ClickUp · Asana', anzahl: 17 },
          { icon: '📅', name: 'Kalender & Calls', beschreibung: 'Termine planen, Buchungen verwalten und Calls organisieren.', tools: 'Calendly · Cal.com · SavvyCal', anzahl: 18 },
          { icon: '🎙', name: 'Meetings & Automatisierung', beschreibung: 'Meetings aufzeichnen, transkribieren und Workflows automatisieren.', tools: 'Fireflies · Otter · Zapier', anzahl: 19 },
          { icon: '🎬', name: 'Screen Recording & Kundenupdates', beschreibung: 'Bildschirmaufnahmen erstellen und Kunden up-to-date halten.', tools: 'Loom · Tella · Scribe', anzahl: 12 },
          { icon: '✏️', name: 'Design & Video', beschreibung: 'Design, Videoschnitt und Content für Social Media.', tools: 'Canva · Figma · Filmora', anzahl: 13 },
          { icon: '🖼', name: 'Bildbearbeitung', beschreibung: 'Bilder bearbeiten, optimieren und freistellen.', tools: 'Adobe Photoshop · Pixlr · Remove.bg', anzahl: 14 },
          { icon: '✦', name: 'KI & Coding', beschreibung: 'KI-Assistenten, Coding-Tools und Entwickler-Workflows.', tools: 'ChatGPT · Cursor · GitHub Copilot', anzahl: 15 },
          { icon: '🌐', name: 'Website & Hosting', beschreibung: 'Websites erstellen, hosten und skalieren.', tools: 'Webflow · Framer · Hetzner', anzahl: 16 },
          { icon: '👥', name: 'CRM & Marketing', beschreibung: 'Kunden gewinnen, verwalten und Marketing automatisieren.', tools: 'HubSpot · Pipedrive · Brevo', anzahl: 17 },
          { icon: '🎵', name: 'Musik, Audio & Voice', beschreibung: 'Musik, Voiceover und Audioproduktionen erstellen.', tools: 'ElevenLabs · Suno · Udio', anzahl: 18 },
          { icon: '🔧', name: 'No-Code & Automation', beschreibung: 'Prozesse automatisieren und Tools miteinander verbinden.', tools: 'Make · Zapier · Airtable', anzahl: 19 },
        ].map((kategorie) => (
          <a
            key={kategorie.name}
            href={`/kategorien/${kategorie.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
            style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
              display: 'block',
            }}
          >
            {/* Icon */}
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>
              {kategorie.icon}
            </div>

            {/* Name */}
            <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', lineHeight: '1.3' }}>
              {kategorie.name}
            </p>

            {/* Beschreibung */}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
              {kategorie.beschreibung}
            </p>

            {/* Beispiel-Tools */}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              {kategorie.tools}
            </p>

            {/* Anzahl Tools + Pfeil */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {kategorie.anzahl} Tools
              </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
            </div>
          </a>
        ))}
      </div>

    </main>
  );
}