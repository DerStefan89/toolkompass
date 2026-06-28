import Link from 'next/link'
import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Datenschutz — ToolSucher',
}

// ─── Hilfskomponenten ────────────────────────────────────────────────────────

function Section({ nr, title, children }: { nr: string; title: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionWrap}>
      <h2 className={styles.sectionH2}>
        {nr}. {title}
      </h2>
      <div className={styles.sectionBody}>
        {children}
      </div>
    </div>
  )
}

// ─── Seite ───────────────────────────────────────────────────────────────────

export default function DatenschutzPage() {
  return (
    <main className={styles.main}>

      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Datenschutz
      </p>

      <h1 className={styles.pageTitle}>
        Datenschutzerklärung
      </h1>

      <p className={styles.pageDate}>
        Stand: Juni 2026
      </p>

      <div className={styles.proseCard}>

        <Section nr="1" title="Verantwortlicher">
          <p style={{ marginBottom: '8px' }}>Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>Stefan Kuhl</strong></p>
          <p>Kolonnenstraße 8</p>
          <p>10827 Berlin</p>
          <p>Deutschland</p>
          <p style={{ marginTop: '8px' }}>
            E-Mail:{' '}
            <a href="mailto:toolsucher@gmail.com" style={{ color: 'var(--color-text-secondary)' }}>toolsucher@gmail.com</a>
          </p>
          <p>
            Website:{' '}
            <a href="https://www.toolsucher.de" style={{ color: 'var(--color-text-secondary)' }}>www.toolsucher.de</a>
          </p>
          <p style={{ marginTop: '8px' }}>Ein Datenschutzbeauftragter ist derzeit nicht benannt.</p>
        </Section>

        <Section nr="2" title="Allgemeine Hinweise zur Datenverarbeitung">
          <p style={{ marginBottom: '12px' }}>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung dieser Website, zur technischen Sicherheit, zur Analyse der Nutzung, zur Kommunikation mit Nutzern oder zur Bereitstellung künftiger Plattformfunktionen erforderlich ist.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Personenbezogene Daten sind Informationen, die sich auf eine identifizierte oder identifizierbare Person beziehen. Dazu gehören zum Beispiel Name, E-Mail-Adresse, IP-Adresse, Nutzungsdaten, Geräteinformationen oder Angaben, die im Rahmen eines Nutzerkontos gemacht werden.
          </p>
          <p style={{ marginBottom: '8px' }}>Die Verarbeitung erfolgt insbesondere auf Grundlage folgender Rechtsgrundlagen:</p>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. a DSGVO</strong>, wenn eine Einwilligung erteilt wurde;</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. b DSGVO</strong>, wenn die Verarbeitung zur Durchführung vorvertraglicher Maßnahmen oder eines Vertrags erforderlich ist;</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. c DSGVO</strong>, wenn eine gesetzliche Pflicht besteht;</li>
            <li><strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>, wenn wir ein berechtigtes Interesse an der Verarbeitung haben.</li>
          </ul>
        </Section>

        <Section nr="3" title="Hosting über Vercel">
          <p style={{ marginBottom: '12px' }}>
            Diese Website wird über <strong style={{ color: 'var(--color-text-primary)' }}>Vercel</strong> bereitgestellt.
          </p>
          <p style={{ marginBottom: '4px' }}>Anbieter ist:</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>Vercel Inc.</strong></p>
          <p>340 S Lemon Ave #4133</p>
          <p style={{ marginBottom: '12px' }}>Walnut, CA 91789, USA</p>
          <p style={{ marginBottom: '12px' }}>
            Beim Aufruf der Website verarbeitet Vercel technische Daten, die erforderlich sind, um die Website auszuliefern, stabil zu betreiben und vor Missbrauch oder Angriffen zu schützen. Dazu können insbesondere gehören: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene URL, Referrer-URL, Browsertyp und Browserversion, Betriebssystem, Geräteinformationen, HTTP-Statuscodes, technische Logdaten.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Die Rechtsgrundlage ist <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>. Unser berechtigtes Interesse liegt im sicheren, schnellen und zuverlässigen Betrieb der Website.
          </p>
          <p>
            Mit Vercel wird ein Vertrag zur Auftragsverarbeitung geschlossen. Da Vercel ein Anbieter mit Sitz in den USA ist, kann eine Verarbeitung personenbezogener Daten außerhalb der EU nicht vollständig ausgeschlossen werden. Für solche Übermittlungen kommen geeignete Garantien nach der DSGVO in Betracht, etwa EU-Standardvertragsklauseln.
          </p>
        </Section>

        <Section nr="4" title="Backend und Datenbank über Supabase">
          <p style={{ marginBottom: '12px' }}>
            Für Datenbank- und Backend-Funktionen nutzen wir <strong style={{ color: 'var(--color-text-primary)' }}>Supabase</strong>.
          </p>
          <p style={{ marginBottom: '4px' }}>Anbieter ist:</p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>Supabase Inc.</strong></p>
          <p>970 Toa Payoh North #07-04</p>
          <p style={{ marginBottom: '12px' }}>Singapore 318992, Singapore</p>
          <p>
            Das Supabase-Projekt wird in der Region <strong style={{ color: 'var(--color-text-primary)' }}>Frankfurt / Deutschland bzw. EU-Region</strong> betrieben. Soweit Supabase personenbezogene Daten in unserem Auftrag verarbeitet, wird ein Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO geschlossen.
          </p>
        </Section>

        <Section nr="5" title="Cookies und vergleichbare Technologien">
          <p>
            Unsere Website kann Cookies, Local Storage, Session Storage oder ähnliche Technologien einsetzen. Technisch notwendige Technologien werden ohne Einwilligung eingesetzt. Optionale Dienste wie Analytics werden nur nach Einwilligung über den Consent-Banner geladen.
          </p>
        </Section>

        <Section nr="6" title="Technisch notwendige Technologien">
          <p style={{ marginBottom: '8px' }}>
            Technisch notwendige Technologien sind erforderlich, damit diese Website ordnungsgemäß funktioniert, insbesondere: Speicherung von Consent-Entscheidungen (localStorage), Sicherheitsfunktionen, Session-Funktionen, Schutz vor Missbrauch, technische Bereitstellung der Website, Lastverteilung, Fehleranalyse.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>§ 25 Abs. 2 TDDDG</strong> und <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>.
          </p>
        </Section>

        <Section nr="7" title="Consent-Management">
          <p>
            Beim ersten Besuch erscheint ein Consent-Banner. Nutzer können zwischen zwei Optionen wählen: {'"'}Alle akzeptieren{'"'} (Analytics + Marketing) oder {'"'}Nur Notwendige{'"'}. Die Entscheidung wird lokal im Browser gespeichert (localStorage, Key: ts_consent) und gilt für alle weiteren Besuche. Eine erteilte Einwilligung kann jederzeit durch Löschen des Browser-Speichers widerrufen werden.
          </p>
        </Section>

        <Section nr="8" title="Google Analytics">
          <p style={{ marginBottom: '12px' }}>
            Wir verwenden Google Analytics von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (Muttergesellschaft: Google LLC, USA). Google Analytics wird ausschließlich nach Einwilligung über den Consent-Banner geladen (Kategorie: Analytics).
          </p>
          <p style={{ marginBottom: '12px' }}>
            Dabei können verarbeitet werden: aufgerufene URLs, Verweildauer, Geräteinformationen, Browsertyp, ungefährer Standort (Land/Region), Referrer. IP-Adressen werden anonymisiert (anonymize_ip: true). Google Signals, Remarketing und Google Ads-Verknüpfung sind nicht aktiviert.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>§ 25 Abs. 1 TDDDG</strong> und <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. a DSGVO</strong>. Eine erteilte Einwilligung kann jederzeit durch Löschen des Browser-Speichers widerrufen werden.
          </p>
        </Section>

        <Section nr="9" title="Fehlermonitoring über Sentry">
          <p style={{ marginBottom: '12px' }}>
            Zur Erkennung und Behebung technischer Fehler setzen wir Sentry ein.
          </p>
          <p style={{ marginBottom: '4px' }}>Anbieter: Functional Software, Inc. (Sentry)</p>
          <p style={{ marginBottom: '12px' }}>45 Fremont Street, 8th Floor, San Francisco, CA 94105, USA</p>
          <p style={{ marginBottom: '12px' }}>
            Bei technischen Fehlern können verarbeitet werden: Fehlermeldungen, betroffene URL, Browsertyp, Betriebssystem, Zeitpunkt sowie anonymisierte technische Kontextdaten. Sentry wird nur in der Produktionsumgebung eingesetzt (nicht lokal). Es werden keine Nutzerprofile erstellt.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>. Berechtigtes Interesse: stabiler und fehlerfreier Betrieb der Website. Sentry hat seinen Sitz in den USA; es kommen EU-Standardvertragsklauseln gemäß Art. 46 DSGVO zur Anwendung.
          </p>
        </Section>

        <Section nr="10" title="Feedback-Widget und Anfrageformular über Formspree">
          <p style={{ marginBottom: '12px' }}>
            Für das Feedback-Widget und das Anfrageformular (/entwickeln) nutzen wir Formspree.
          </p>
          <p style={{ marginBottom: '12px' }}>Anbieter: Formspree, Inc., USA</p>
          <p style={{ marginBottom: '12px' }}>
            Bei Nutzung dieser Formulare werden verarbeitet: Name (sofern angegeben), E-Mail-Adresse, Nachrichteninhalt, Zeitpunkt sowie technische Verbindungsdaten. Formspree leitet Einreichungen per E-Mail weiter und speichert sie temporär.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. b DSGVO</strong> bei Anfragen mit Vertragsbezug, sonst <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>. Formspree hat seinen Sitz in den USA; es kommen EU-Standardvertragsklauseln gemäß Art. 46 DSGVO zur Anwendung.
          </p>
        </Section>

        <Section nr="11" title="Affiliate-Links und Partnerangebote">
          <p style={{ marginBottom: '12px' }}>
            www.toolsucher.de ist als Affiliate-Plattform konzipiert. Beim Klick auf Affiliate-Links können Informationen an Anbieter oder Affiliate-Netzwerke übermittelt werden, insbesondere: Herkunft von toolsucher.de, verwendeter Link, Partnerkennung, Zeitpunkt des Klicks, Referrer-Information, technische Browser- und Geräteinformationen.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>. Für die Datenverarbeitung auf den Websites der Partner sind die Partner selbst verantwortlich.
          </p>
        </Section>

        <Section nr="12" title="Kontaktaufnahme per E-Mail">
          <p style={{ marginBottom: '12px' }}>
            Bei Kontaktaufnahme per E-Mail verarbeiten wir: Name (sofern angegeben), E-Mail-Adresse, Inhalt der Nachricht, Zeitpunkt der Anfrage.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. b DSGVO</strong> bei vertraglichen Anfragen, sonst <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>.
          </p>
        </Section>

        <Section nr="13" title="Newsletter und E-Mail-Marketing">
          <p>
            Derzeit bieten wir keinen Newsletter an. Falls künftig ein Newsletter eingeführt wird, erfolgt dies nur nach ausdrücklicher Einwilligung (Double-Opt-In). Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. a DSGVO</strong>.
          </p>
        </Section>

        <Section nr="14" title="Nutzerkonten, Login und persönlicher Bereich">
          <p style={{ marginBottom: '12px' }}>
            Registrierte Nutzer können sich über einen per E-Mail zugesandten Magic Link einloggen. Passwörter werden nicht gespeichert. Die Authentifizierung erfolgt über Supabase Auth (siehe §4).
          </p>
          <p style={{ marginBottom: '8px' }}>Im eingeloggten Bereich stehen folgende Funktionen zur Verfügung:</p>
          <ul style={{ paddingLeft: '20px', margin: '0 0 12px' }}>
            <li style={{ marginBottom: '4px' }}>Nutzerprofil (E-Mail-Adresse, Spracheinstellung)</li>
            <li style={{ marginBottom: '4px' }}>Tool-Stack-Manager: Tools als genutzt markieren, eigene Preisangaben hinterlegen</li>
            <li style={{ marginBottom: '4px' }}>Tool-Bewertungen: Bewertungen abgeben (werden moderiert)</li>
            <li>Anfrageformular: Entwicklungsanfragen stellen</li>
          </ul>
          <p style={{ marginBottom: '12px' }}>
            Dabei verarbeiten wir: E-Mail-Adresse, Spracheinstellung, gespeicherte Tool-Auswahl, optionale Preisangaben, Bewertungsinhalte, Anfrageinhalte sowie Zeitstempel.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. b DSGVO</strong> für Nutzerkontofunktionen; <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong> für technische Sicherheitszwecke.
          </p>
        </Section>

        <Section nr="15" title="Zielgruppe">
          <p>
            Unsere Website richtet sich an Selbstständige, Freelancer, Unternehmer, Agenturen sowie kleine und mittlere Unternehmen. Das Angebot richtet sich nicht gezielt an Kinder oder Jugendliche.
          </p>
        </Section>

        <Section nr="16" title="Empfänger personenbezogener Daten">
          <p>
            Personenbezogene Daten können übermittelt werden an: Hosting-Anbieter, Datenbank- und Backend-Anbieter, Analyseanbieter (Google Analytics, nach Einwilligung), Fehlermonitoring-Anbieter (Sentry), Formulardienstleister (Formspree), Affiliate-Partner oder Affiliate-Netzwerke, technische Dienstleister, Behörden (soweit gesetzlich verpflichtet).
          </p>
        </Section>

        <Section nr="17" title="Drittlandübermittlungen">
          <p>
            Einige Dienstleister haben ihren Sitz außerhalb der EU, insbesondere in den USA: Vercel, Google (Analytics), Supabase, Sentry, Formspree. Bei Übermittlungen in Drittländer achten wir auf geeignete Garantien, insbesondere EU-Standardvertragsklauseln oder Zertifizierungen unter dem EU-U.S. Data Privacy Framework.
          </p>
        </Section>

        <Section nr="18" title="Speicherdauer">
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Technische Logdaten werden nur so lange gespeichert, wie für Sicherheit und Stabilität erforderlich.
          </p>
        </Section>

        <Section nr="19" title="Rechte der betroffenen Personen">
          <p style={{ marginBottom: '8px' }}>
            Betroffene Personen haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Widerruf einer Einwilligung. Zur Ausübung dieser Rechte:{' '}
            <a href="mailto:toolsucher@gmail.com" style={{ color: 'var(--color-text-secondary)' }}>toolsucher@gmail.com</a>
          </p>
        </Section>

        <Section nr="20" title="Widerruf von Einwilligungen">
          <p>
            Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, insbesondere durch Löschen des Browser-Speichers (localStorage-Key: ts_consent).
          </p>
        </Section>

        <Section nr="21" title="Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen">
          <p>
            Bei Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können betroffene Personen Widerspruch einlegen. Bei Direktwerbung besteht jederzeit ein Widerspruchsrecht ohne Angabe von Gründen.
          </p>
        </Section>

        <Section nr="22" title="Beschwerderecht bei einer Aufsichtsbehörde">
          <p style={{ marginBottom: '8px' }}>
            Betroffene Personen haben das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren:
          </p>
          <p><strong style={{ color: 'var(--color-text-primary)' }}>Berliner Beauftragte für Datenschutz und Informationsfreiheit</strong></p>
          <p>Alt-Moabit 59–61</p>
          <p>10555 Berlin</p>
          <p>
            E-Mail:{' '}
            <a href="mailto:mailbox@datenschutz-berlin.de" style={{ color: 'var(--color-text-secondary)' }}>mailbox@datenschutz-berlin.de</a>
          </p>
        </Section>

        <Section nr="23" title="Änderungen dieser Datenschutzerklärung">
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich die Website, eingesetzte Dienste, rechtliche Anforderungen oder technische Abläufe ändern. Die jeweils aktuelle Fassung ist auf dieser Website abrufbar.
          </p>
        </Section>

      </div>

    </main>
  )
}
