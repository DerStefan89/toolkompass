/**
 * Datei: app/aufgaben/page.tsx
 *
 * Zweck: Zeigt passende Tools für eine Aufgabe (hier: "Unternehmen verwalten").
 * Später: Template — Admin wählt Aufgabe + Tools aus der Datenbank.
 * Jetzt: Daten stehen im aufgabeData Objekt.
 */

import Link from 'next/link'
import styles from './page.module.css'

const aufgabeData = {
  name: 'Unternehmen verwalten',
  beschreibung: 'Von Buchhaltung bis CRM — diese Tools helfen dir, dein Business strukturiert zu führen, Kunden zu managen und Prozesse zu automatisieren.',
  zielgruppe: 'Solo & Teams',
  aktualisiertAm: 'Mai 2026',

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
      farbe: 'var(--color-error)',
      name: 'HubSpot CRM',
      kategorie: 'CRM & Marketing',
      beschreibung: 'Kunden verwalten, Deals tracken und Marketing automatisieren. Starkes Free-Angebot für den Einstieg.',
      badges: ['Free Plan', 'CRM'],
      preis: 'ab 0 € / Monat',
      empfehlung: false,
      link: '/tools/hubspot',
    },
  ],
}

export default function UnternehmenVerwaltenSeite() {
  const d = aufgabeData

  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/aufgaben" className={styles.breadcrumbLink}>Aufgaben</Link>
        {' › '}
        {d.name}
      </p>

      {/* Badge */}
      <span className={styles.pageBadge}>
        🏢 Aufgabe
      </span>

      {/* Titel */}
      <h1 className={styles.pageTitle}>
        Tools zum {d.name}
      </h1>

      <p className={styles.pageDesc}>
        {d.beschreibung}
      </p>

      {/* Meta-Pills */}
      <div className={styles.metaPills}>
        {[
          `👥 Für ${d.zielgruppe}`,
          `🛠 ${d.tools.length} empfohlene Tools`,
          `📅 Aktualisiert: ${d.aktualisiertAm}`,
        ].map((pill) => (
          <span key={pill} className={styles.metaPill}>
            {pill}
          </span>
        ))}
      </div>

      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          Top-Empfehlungen
        </h2>
        <Link href="/tools" className={styles.allToolsLink}>
          Alle Tools ansehen →
        </Link>
      </div>

      {/* Tool-Cards */}
      <div className={styles.toolGrid}>
        {d.tools.map((tool) => (
          <div key={tool.name} className={tool.empfehlung ? styles.toolCardFeatured : styles.toolCard}>

            {/* Logo + Herz */}
            <div className={styles.toolCardTop}>
              <div className={styles.toolCardLeft}>
                {/* backgroundColor bleibt inline (tool.farbe — Laufzeitwert) */}
                <div
                  className={styles.toolLogoWrap}
                  style={{ backgroundColor: tool.farbe }}
                >
                  {tool.kuerzel}
                </div>
                <div>
                  <p className={styles.toolName}>{tool.name}</p>
                  <p className={styles.toolKategorie}>{tool.kategorie}</p>
                </div>
              </div>
              <span className={styles.toolHeart}>♡</span>
            </div>

            {/* Beschreibung */}
            <p className={styles.toolDesc}>
              {tool.beschreibung}
            </p>

            {/* Badges */}
            <div className={styles.badgeRow}>
              {tool.empfehlung && (
                <span className={styles.empfehlungBadge}>
                  Unsere Empfehlung
                </span>
              )}
              {tool.badges.map((badge) => (
                <span key={badge} className={styles.regularBadge}>
                  {badge}
                </span>
              ))}
            </div>

            {/* Preis + Button */}
            <div className={styles.toolFooter}>
              <span className={styles.toolPreis}>
                {tool.preis}
              </span>
              <a href={tool.link} className={tool.empfehlung ? styles.detailBtnFeatured : styles.detailBtn}>
                Details →
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className={styles.ctaBox}>
        <div className={styles.ctaText}>
          <h3 className={styles.ctaTitle}>
            Nicht sicher welches Tool passt?
          </h3>
          <p className={styles.ctaDesc}>
            Beantworte 4 Fragen und finde dein passendes Tool für Unternehmensführung.
          </p>
        </div>
        <div className={styles.ctaBtns}>
          <Link href="/tool-finder" className={styles.ctaBtnPrimary}>
            Tool-Finder starten
          </Link>
          <Link href="/tools" className={styles.ctaBtnSecondary}>
            Alle Tools ansehen
          </Link>
        </div>
      </div>

    </main>
  )
}
