/**
 * Datei: app/tool-finder/page.tsx
 *
 * Zweck: Coming-Soon-Seite — zeigt was kommt, sammelt Interesse.
 * Der echte Tool-Finder folgt in einer späteren Phase.
 */

import Link from 'next/link'
import styles from './page.module.css'

export default function ToolFinderSeite() {
  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Tool-Finder
      </p>

      {/* Zweispaltig: Links Inhalt, Rechts Vorschau */}
      <div className={styles.contentArea}>

        {/* LINKE SEITE */}
        <div className={styles.leftCol}>

          {/* Badge */}
          <span className={styles.statusBadge}>🚧 In Entwicklung</span>

          {/* Titel */}
          <h1 className={styles.pageTitle}>Tool-Finder</h1>

          <p className={styles.pageDesc}>
            Beantworte ein paar Fragen und finde passende Tools
            für deine Rolle, deinen Bedarf und dein Budget.
          </p>

          {/* Feature-Badges */}
          <div className={styles.featurePills}>
            {[
              '⏱ Dauert ca. 2 Minuten',
              '✓ Kostenlos & unverbindlich',
              '👤 Keine Registrierung nötig',
              '🔖 Empfehlungen später speichern',
            ].map((f) => (
              <span key={f} className={styles.featurePill}>{f}</span>
            ))}
          </div>

          {/* So funktioniert es */}
          <h2 className={styles.sectionTitle}>So funktioniert der Tool-Finder</h2>

          <div className={styles.stepsList}>
            {[
              { nr: '1', titel: 'Solo oder Team?', beschreibung: 'Arbeitest du allein oder mit einem Team?' },
              { nr: '2', titel: 'Rolle auswählen', beschreibung: 'Freelancer, Gründer, Creator, Berater...' },
              { nr: '3', titel: 'Aufgaben bestimmen', beschreibung: 'Was willst du erledigen? Rechnungen, Social Media, Projekte...' },
              { nr: '4', titel: 'Prioritäten setzen', beschreibung: 'Was ist dir wichtig? Preis, Einfachheit, DSGVO...' },
              { nr: '5', titel: 'Budget eingrenzen', beschreibung: 'Kostenlos, bis 20 €, bis 50 € oder mehr?' },
              { nr: '6', titel: 'Bestehende Tools angeben', beschreibung: 'Welche Tools nutzt du bereits?' },
            ].map((schritt) => (
              <div key={schritt.nr} className={styles.stepCard}>
                <div className={styles.stepNr}>{schritt.nr}</div>
                <div>
                  <p className={styles.stepTitle}>{schritt.titel}</p>
                  <p className={styles.stepDesc}>{schritt.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Danach */}
          <div className={styles.resultHint}>
            <span className={styles.resultHintIcon}>🧭</span>
            <p className={styles.resultHintText}>
              Danach erhältst du <strong>passende Tool-Empfehlungen</strong> — mit Begründung, Preis und direktem Link zum Anbieter.
            </p>
          </div>

          {/* CTA */}
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Noch nicht verfügbar</h3>
            <p className={styles.ctaDesc}>
              Der Tool-Finder ist gerade in Entwicklung.
              Lass dich benachrichtigen sobald er live geht.
            </p>
            <div className={styles.ctaBtns}>
              <a href="#" className={styles.ctaBtnPrimary}>
                🔔 Benachrichtigen lassen
              </a>
              <Link href="/kategorien" className={styles.ctaBtnSecondary}>
                Tools selbst entdecken →
              </Link>
            </div>
          </div>

        </div>

        {/* RECHTE SEITE — Vorschau (Mobile ausgeblendet) */}
        <div className={styles.previewCol}>

          <div className={styles.previewBox}>

            {/* Vorschau Header */}
            <div className={styles.previewHeader}>
              <span className={styles.previewHeaderIcon}>👁</span>
              <p className={styles.previewHeaderTitle}>Vorschau: Dein Weg zur Empfehlung</p>
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
              <div
                key={schritt.nr}
                className={schritt.aktiv ? styles.previewStepRowActive : styles.previewStepRow}
              >
                <div className={schritt.aktiv ? styles.previewStepNrActive : styles.previewStepNr}>
                  {schritt.nr}
                </div>
                <p className={schritt.aktiv ? styles.previewStepLabelActive : styles.previewStepLabel}>
                  {schritt.label}
                </p>
              </div>
            ))}

            {/* Ergebnis-Vorschau */}
            <div className={styles.previewResult}>
              <span className={styles.previewResultIcon}>🧭</span>
              <p className={styles.previewResultText}>
                Danach erhältst du passende Tool-Empfehlungen.
              </p>
            </div>

            {/* Datenschutz-Hinweis */}
            <div className={styles.previewPrivacy}>
              <span className={styles.previewPrivacyIcon}>🔒</span>
              <p className={styles.previewPrivacyText}>
                Deine Antworten werden nicht gespeichert und nicht an Dritte weitergegeben, solange du keinen Account erstellst.
              </p>
            </div>

          </div>
        </div>

      </div>

    </main>
  )
}
