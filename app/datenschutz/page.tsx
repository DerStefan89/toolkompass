import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz — ToolSucher',
}

// ─── Hilfskomponenten ────────────────────────────────────────────────────────

function Section({ nr, title, children }: { nr: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        {nr}. {title}
      </h2>
      <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Seite ───────────────────────────────────────────────────────────────────

export default function DatenschutzPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</Link>
        {' › '}
        Datenschutz
      </p>

      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '36px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '8px',
      }}>
        Datenschutzerklärung
      </h1>

      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Stand: Mai 2026
      </p>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
      }}>

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
            Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Dazu gehören zum Beispiel Name, E-Mail-Adresse, IP-Adresse, Nutzungsdaten, Geräteinformationen oder Angaben, die Nutzer später im Rahmen eines Nutzerkontos machen.
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
            Unsere Website kann Cookies, Local Storage, Session Storage oder ähnliche Technologien einsetzen. Technisch notwendige Technologien werden ohne Einwilligung eingesetzt. Optionale Analyse- und Marketing-Technologien werden nur nach Einwilligung eingesetzt.
          </p>
        </Section>

        <Section nr="6" title="Technisch notwendige Technologien">
          <p style={{ marginBottom: '8px' }}>
            Technisch notwendige Technologien sind erforderlich, damit diese Website ordnungsgemäß funktioniert, insbesondere: Speicherung von Consent-Einstellungen, Sicherheitsfunktionen, Session-Funktionen, Schutz vor Missbrauch, technische Bereitstellung der Website, Lastverteilung, Fehleranalyse.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>§ 25 Abs. 2 TDDDG</strong> und <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>.
          </p>
        </Section>

        <Section nr="7" title="Consent-Management">
          <p>
            Für optionale Cookies, insbesondere Google Analytics, verwenden wir ein Consent-Management-System. Nutzer können zwischen den Kategorien technisch notwendig, Analytics und Marketing wählen. Eine erteilte Einwilligung kann jederzeit über die Cookie-Einstellungen widerrufen werden.
          </p>
        </Section>

        <Section nr="8" title="Google Analytics">
          <p>
            Wir verwenden <strong style={{ color: 'var(--color-text-primary)' }}>Google Analytics</strong> von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (Muttergesellschaft: Google LLC, USA). Google Analytics wird nur nach Einwilligung in die Kategorie Analytics geladen. Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>§ 25 Abs. 1 TDDDG</strong> und <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. a DSGVO</strong>. Google Signals, Google Ads-Verknüpfung und Remarketing sind nicht aktiviert.
          </p>
        </Section>

        <Section nr="9" title="Affiliate-Links und Partnerangebote">
          <p style={{ marginBottom: '12px' }}>
            www.toolsucher.de ist als Affiliate-Plattform konzipiert. Beim Klick auf Affiliate-Links können Informationen an Anbieter oder Affiliate-Netzwerke übermittelt werden, insbesondere: Herkunft von toolsucher.de, verwendeter Link, Partnerkennung, Zeitpunkt des Klicks, Referrer-Information, technische Browser- und Geräteinformationen.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>. Für die Datenverarbeitung auf den Websites der Partner sind die Partner selbst verantwortlich.
          </p>
        </Section>

        <Section nr="10" title="Kontaktaufnahme per E-Mail">
          <p style={{ marginBottom: '12px' }}>
            Bei Kontaktaufnahme per E-Mail verarbeiten wir: Name (sofern angegeben), E-Mail-Adresse, Inhalt der Nachricht, Zeitpunkt der Anfrage.
          </p>
          <p>
            Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. b DSGVO</strong> bei vertraglichen Anfragen, sonst <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. f DSGVO</strong>.
          </p>
        </Section>

        <Section nr="11" title="Newsletter und E-Mail-Marketing">
          <p>
            Derzeit bieten wir keinen Newsletter an. Falls künftig ein Newsletter eingeführt wird, erfolgt dies nur nach ausdrücklicher Einwilligung (Double-Opt-In). Rechtsgrundlage: <strong style={{ color: 'var(--color-text-primary)' }}>Art. 6 Abs. 1 lit. a DSGVO</strong>.
          </p>
        </Section>

        <Section nr="12" title="Künftige Nutzerkonten und Login-Bereich">
          <p>
            Auf www.toolsucher.de sind künftig Login- und Nutzerkonto-Funktionen geplant. Passwörter werden nicht im Klartext gespeichert. Dieser Abschnitt wird vor dem Livegang des Login-Bereichs angepasst.
          </p>
        </Section>

        <Section nr="13" title="Zielgruppe">
          <p>
            Unsere Website richtet sich an Selbstständige, Freelancer, Unternehmer, Agenturen sowie kleine und mittlere Unternehmen. Das Angebot richtet sich nicht gezielt an Kinder oder Jugendliche.
          </p>
        </Section>

        <Section nr="14" title="Empfänger personenbezogener Daten">
          <p>
            Personenbezogene Daten können übermittelt werden an: Hosting-Anbieter, Datenbank- und Backend-Anbieter, Analyseanbieter (nach Einwilligung), Affiliate-Partner oder Affiliate-Netzwerke, technische Dienstleister, Behörden (soweit gesetzlich verpflichtet).
          </p>
        </Section>

        <Section nr="15" title="Drittlandübermittlungen">
          <p>
            Einige Dienstleister haben ihren Sitz außerhalb der EU, insbesondere in den USA: Vercel, Google, Supabase. Bei Übermittlungen in Drittländer achten wir auf geeignete Garantien, insbesondere EU-Standardvertragsklauseln oder Zertifizierungen unter dem EU-U.S. Data Privacy Framework.
          </p>
        </Section>

        <Section nr="16" title="Speicherdauer">
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Technische Logdaten werden nur so lange gespeichert, wie für Sicherheit und Stabilität erforderlich.
          </p>
        </Section>

        <Section nr="17" title="Rechte der betroffenen Personen">
          <p style={{ marginBottom: '8px' }}>
            Betroffene Personen haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit, Widerspruch und Widerruf einer Einwilligung. Zur Ausübung dieser Rechte:{' '}
            <a href="mailto:toolsucher@gmail.com" style={{ color: 'var(--color-text-secondary)' }}>toolsucher@gmail.com</a>
          </p>
        </Section>

        <Section nr="18" title="Widerruf von Einwilligungen">
          <p>
            Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, insbesondere über die Cookie-Einstellungen der Website.
          </p>
        </Section>

        <Section nr="19" title="Widerspruch gegen Verarbeitung auf Grundlage berechtigter Interessen">
          <p>
            Bei Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO können betroffene Personen Widerspruch einlegen. Bei Direktwerbung besteht jederzeit ein Widerspruchsrecht ohne Angabe von Gründen.
          </p>
        </Section>

        <Section nr="20" title="Beschwerderecht bei einer Aufsichtsbehörde">
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

        <Section nr="21" title="Änderungen dieser Datenschutzerklärung">
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich die Website, eingesetzte Dienste, rechtliche Anforderungen oder technische Abläufe ändern. Die jeweils aktuelle Fassung ist auf dieser Website abrufbar.
          </p>
        </Section>

      </div>

    </main>
  )
}
