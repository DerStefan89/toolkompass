// STARTSEITE (app/page.tsx)
export default function Home() {
  return (
    <main>
{/* ─── HERO ───────────────────────────────────────────────
    Der erste große Bereich der Startseite.
    Aufgeteilt in ZWEI SPALTEN nebeneinander:
    - Links: Titel, Untertitel, Suchfeld, Buttons
    - Rechts: Tool-Stack Vorschau-Box
─────────────────────────────────────────────────────── */}
<section style={{
  padding: '60px 24px',       // Abstand oben/unten und seitlich
  maxWidth: '1200px',         // Nie breiter als 1200px
  margin: '0 auto',           // Zentriert auf der Seite
  display: 'flex',            // Zwei Spalten nebeneinander
  gap: '48px',                // Abstand zwischen links und rechts
  alignItems: 'flex-start',   // Beide Spalten oben ausrichten
}}>

  {/* ── LINKE SPALTE ──────────────────────────────────────
      flex: 1 bedeutet: nimm den ganzen übrigen Platz.
      Die rechte Box hat eine feste Breite, der Rest gehört links.
  ───────────────────────────────────────────────────── */}
  <div style={{ flex: 1 }}>

    {/* Haupttitel in Serif-Schrift */}
    <h1 style={{
      fontFamily: 'var(--font-playfair)', // Serif-Schrift
      fontSize: '52px',
      fontWeight: '700',
      color: 'var(--color-text-primary)',
      lineHeight: '1.2',       // Zeilenabstand
      marginBottom: '20px',
    }}>
      Finde und vergleiche die besten Tools für dein Business.
    </h1>

    {/* Grauer Untertitel */}
    <p style={{
      fontSize: '16px',
      color: 'var(--color-text-secondary)', // Grau
      marginBottom: '32px',
      lineHeight: '1.6',
    }}>
      ToolKompass hilft Gründern, Selbstständigen und kleinen Teams in
      Deutschland, passende Software zu finden und zu vergleichen.
    </p>

    {/* Suchfeld */}
    <input
      type="text"
      placeholder="Nach Tool, Kategorie oder Anwendungsfall suchen ..."
      style={{
        width: '100%',
        padding: '14px 18px',
        borderRadius: 'var(--radius-btn)',
        border: '1px solid var(--color-border)',
        fontSize: '15px',
        backgroundColor: 'white',
        marginBottom: '24px',
      }}
    />

    {/* Zwei Buttons nebeneinander */}
    <div style={{ display: 'flex', gap: '12px' }}>

      {/* Primär-Button — grün, ausgefüllt */}
      <a href="/tool-finder" style={{
        backgroundColor: 'var(--color-cta)',  // Dunkelgrün
        color: 'white',
        padding: '12px 24px',
        borderRadius: 'var(--radius-btn)',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
      }}>
        Tool-Finder starten →
      </a>

      {/* Sekundär-Button — transparent mit Rahmen */}
      <a href="/kategorien" style={{
        backgroundColor: 'transparent',
        color: 'var(--color-text-primary)',
        padding: '12px 24px',
        borderRadius: 'var(--radius-btn)',
        textDecoration: 'none',
        fontSize: '14px',
        border: '1px solid var(--color-border)',
      }}>
        Kategorien ansehen
      </a>

    </div>
  </div>

  {/* ── RECHTE SPALTE — Tool-Stack Vorschau Box ───────────
      Feste Breite von 320px.
      flexShrink: 0 bedeutet: diese Box wird nie kleiner.
  ───────────────────────────────────────────────────── */}
  <div style={{
    width: '320px',
    flexShrink: 0,
    backgroundColor: 'var(--color-bg-card)',  // Weißer Hintergrund
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '24px',
  }}>

    {/* Titelzeile mit "Bald verfügbar" Badge */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ fontWeight: '700', fontSize: '16px' }}>
        Vorschau: Dein Tool-Stack
      </span>
      {/* Gelber Badge */}
      <span style={{
        backgroundColor: '#fef9c3',
        color: '#854d0e',
        fontSize: '11px',
        padding: '2px 8px',
        borderRadius: '20px',
        fontWeight: '600',
      }}>
        Bald verfügbar
      </span>
    </div>

    {/* Erklärungstext */}
    <p style={{
      fontSize: '13px',
      color: 'var(--color-text-secondary)',
      marginBottom: '20px',
      lineHeight: '1.5',
    }}>
      Bald kannst du Tools speichern, Kosten im Blick behalten
      und deine wichtigsten Tools direkt öffnen.
    </p>

    {/* Feature-Liste — wird automatisch aus dem Array gebaut.
        Willst du etwas hinzufügen? Einfach hier ins Array schreiben. */}
    {[
      'Tools speichern',
      'Kosten im Blick behalten',
      'Kündigungen erinnern',
      'Alternativen entdecken',
      'Tools direkt öffnen',
    ].map((feature) => (
      <div key={feature} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        fontSize: '14px',
      }}>
        <span style={{ color: 'var(--color-cta)' }}>✓</span>
        {feature}
      </div>
    ))}

    {/* Vorschau-Box mit Beispiel-Tools */}
    <div style={{
      backgroundColor: 'var(--color-bg)',  // Creme-Hintergrund
      borderRadius: 'var(--radius-card)',
      padding: '16px',
      marginTop: '16px',
      marginBottom: '20px',
    }}>
      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
        Dein Stack (Vorschau)
      </p>

      {/* Beispiel-Tools — später durch echte Nutzerdaten ersetzt */}
      {['Notion', 'sevdesk', 'Calendly'].map((tool) => (
        <div key={tool} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 0',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '14px',
        }}>
          <span>{tool}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>– –</span>
        </div>
      ))}

      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
        Monatliche Kosten (Beispiel): – – € / Monat
      </p>
    </div>

    {/* CTA Button */}
    <a href="/tool-stacks" style={{
      display: 'block',
      textAlign: 'center',
      backgroundColor: 'var(--color-cta)',
      color: 'white',
      padding: '12px',
      borderRadius: 'var(--radius-btn)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '12px',
    }}>
      Stack-Vorschau ansehen
    </a>

    {/* Sekundäre Aktion */}
    <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
      🔔 Benachrichtigen lassen
    </p>

  </div>

</section>


{/* ─── KATEGORIEN ────────────────────────────────────────────
    Horizontale Leiste mit allen Tool-Kategorien.
    Jede Kategorie hat ein Icon und einen Namen.
─────────────────────────────────────────────────────── */}
<section style={{
  padding: '40px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
}}>

  {/* Titelzeile mit Link rechts */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  }}>
    <h2 style={{
      fontFamily: 'var(--font-playfair)',
      fontSize: '20px',
      fontWeight: '600',
      color: 'var(--color-text-primary)',
    }}>
      Entdecke Tools nach Kategorie
    </h2>
    <a href="/kategorien" style={{
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      textDecoration: 'none',
    }}>
      Alle Kategorien ansehen →
    </a>
  </div>

  {/* Kategorie-Karten — scrollbar auf Mobile */}
  <div style={{
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
  }}>
{[
  { icon: '⊞', label: 'Buchhaltung & Rechnungen', slug: 'buchhaltung-rechnungen' },
  { icon: '🏛', label: 'Geschäftskonto & Finanzen', slug: 'geschaeftskonto-finanzen' },
  { icon: '⊙', label: 'Recht & E-Signatur', slug: 'recht-e-signatur' },
  { icon: '✓', label: 'Produktivität & Notizen', slug: 'produktivitaet-notizen' },
  { icon: '◎', label: 'Projektmanagement', slug: 'projektmanagement' },
  { icon: '📅', label: 'Kalender & Calls', slug: 'kalender-calls' },
  { icon: '✏', label: 'Design & Video', slug: 'design-video' },
  { icon: '✦', label: 'KI & Coding', slug: 'ki-coding' },
  { icon: '🌐', label: 'Website & Hosting', slug: 'website-hosting' },
  { icon: '👥', label: 'CRM & Marketing', slug: 'crm-marketing' },
].map((kategorie) => (
  <a
    key={kategorie.label}
    href={`/kategorien/${kategorie.slug}`}
    style={{
      flexShrink: 0,
      width: '110px',
      padding: '16px 12px',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      textAlign: 'center',
      textDecoration: 'none',
      color: 'var(--color-text-primary)',
      fontSize: '12px',
      lineHeight: '1.4',
    }}
  >
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
      {kategorie.icon}
    </div>
    {kategorie.label}
  </a>
))}
  </div>

</section>

{/* ─── WAS MÖCHTEST DU ERLEDIGEN? ────────────────────────────
    Aufgaben-Leiste — hilft Nutzern die nicht nach
    einer Kategorie suchen, sondern nach einer Aufgabe.
─────────────────────────────────────────────────────── */}
<section style={{
  padding: '40px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
}}>

  {/* Titelzeile */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  }}>
    <h2 style={{
      fontFamily: 'var(--font-playfair)',
      fontSize: '20px',
      fontWeight: '600',
      color: 'var(--color-text-primary)',
    }}>
      Was möchtest du erledigen?
    </h2>
    <a href="/aufgaben" style={{
      fontSize: '14px',
      color: 'var(--color-text-secondary)',
      textDecoration: 'none',
    }}>
      Alle Aufgaben ansehen →
    </a>
  </div>

  {/* Aufgaben-Pills — scrollbar auf Mobile */}
  <div style={{
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
  }}>
    {[
      { icon: '🧾', label: 'Rechnungen schreiben', slug: 'rechnungen-schreiben' },
      { icon: '📅', label: 'Termine buchen', slug: 'termine-buchen' },
      { icon: '🎙', label: 'Meetings zusammenfassen', slug: 'meetings-zusammenfassen' },
      { icon: '🎬', label: 'Videos in Reels umwandeln', slug: 'videos-in-reels-umwandeln' },
      { icon: '✍️', label: 'Verträge digital unterschreiben', slug: 'vertraege-digital-unterschreiben' },
      { icon: '💼', label: 'LinkedIn Outreach starten', slug: 'linkedin-outreach-starten' },
      { icon: '📊', label: 'Präsentation erstellen', slug: 'praesentation-erstellen' },
      { icon: '📈', label: 'Excel analysieren', slug: 'excel-analysieren' },
    ].map((aufgabe) => (
      <a
        key={aufgabe.label}
        href={`/aufgaben/${aufgabe.slug}`}
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          textDecoration: 'none',
          color: 'var(--color-text-primary)',
          fontSize: '13px',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{aufgabe.icon}</span>
        <span>{aufgabe.label}</span>
      </a>
    ))}
  </div>

</section>

    </main>
  );
}
