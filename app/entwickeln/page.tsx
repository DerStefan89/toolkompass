/**
 * Datei: app/entwickeln/page.tsx
 *
 * Zweck: Landingpage für Tool-Entwicklung als Dienstleistung.
 * 8 Abschnitte: Hero, Preise, Beispiele, Ablauf, Leistungsumfang,
 * Warum ToolSucher, Anfrageformular, FAQ.
 * Server Component — nur das Formular (InquiryForm) ist Client.
 */

import type { Metadata } from 'next'
import InquiryForm from '@/components/InquiryForm'
import { SITE_URL } from '@/lib/config/site'
import { safeJsonLd } from '@/lib/seo/json-ld'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tool entwickeln lassen | ToolSucher',
  description:
    'Lass dir ein kleines Tool oder MVP entwickeln. Pragmatisch, klar begrenzt und ohne unnötig großes Softwareprojekt.',
  alternates: { canonical: '/entwickeln' },
  openGraph: {
    title: 'Tool entwickeln lassen | ToolSucher',
    description:
      'Lass dir ein kleines Tool oder MVP entwickeln. Pragmatisch, klar begrenzt und ohne unnötig großes Softwareprojekt.',
  },
}

const EXAMPLES = [
  { icon: '🧮', title: 'Angebotsrechner', desc: 'Kunden können Preise oder Pakete selbst einschätzen.' },
  { icon: '📈', title: 'ROI-Rechner', desc: 'Zeige, welchen wirtschaftlichen Effekt dein Angebot haben kann.' },
  { icon: '✅', title: 'Checklisten-Tool', desc: 'Interaktive Checkliste mit Status und Fortschritt.' },
  { icon: '🏷', title: 'Preiskonfigurator', desc: 'Pakete zusammenstellen und den Preis direkt sehen.' },
  { icon: '🧲', title: 'Lead-Magnet-Tool', desc: 'Ein interaktives Tool, das passende Anfragen erzeugt.' },
  { icon: '👥', title: 'Mini-CRM', desc: 'Kontakte, Notizen und einfache Pipeline an einem Ort.' },
  { icon: '📋', title: 'Kunden-Onboarding', desc: 'Formulare, Dokumente und Status nachvollziehbar bündeln.' },
  { icon: '📅', title: 'Termin-Tool', desc: 'Buchungsformular mit einfacher Kalenderlogik.' },
  { icon: '📊', title: 'Projekt-Tracker', desc: 'Aufgaben, Deadlines und Zuständigkeiten sichtbar machen.' },
  { icon: '🤖', title: 'Textgenerator', desc: 'Wiederkehrende Texte für einen klaren Anwendungsfall erzeugen.' },
  { icon: '📉', title: 'Kunden-Dashboard', desc: 'Login, Übersicht, Reporting und Export für Kunden.' },
  { icon: '⚡', title: 'Automatisierung', desc: 'Formular, CRM und E-Mail-Prozess sinnvoll verbinden.' },
  { icon: '🚀', title: 'MVP für Geschäftsidee', desc: 'Eine erste Version bauen, um eine Idee am Markt zu prüfen.' },
  { icon: '📝', title: 'Bewerbungsportal', desc: 'Einreichung, Review und Feedback in einem klaren Ablauf.' },
]

const STEPS = [
  { nr: '1', title: 'Idee beschreiben', desc: 'Kurz erklären, welches Problem das Tool lösen soll.' },
  { nr: '2', title: 'Einschätzung erhalten', desc: 'Prüfen, ob die Idee als schlankes MVP realistisch ist.' },
  { nr: '3', title: 'MVP bauen', desc: 'Schlanke Umsetzung mit Fokus auf die Kernfunktion.' },
  { nr: '4', title: 'Testen und verbessern', desc: 'Erste Version nutzen, Feedback sammeln und gezielt verbessern.' },
  { nr: '5', title: 'Live nutzen', desc: 'Intern einsetzen, mit Kunden teilen oder als Grundlage weiterentwickeln.' },
]

const SCOPE = [
  'Konzeptschärfung', 'UX-Struktur', 'MVP-Entwicklung',
  'Datenbank-Anbindung', 'Formularlogik', 'Automatisierungen',
  'Login-Bereich (falls sinnvoll)', 'Responsive Oberfläche',
  'Deployment', 'Kurze Einweisung', 'Optionale Weiterentwicklung',
]

const FAQ = [
  { q: 'Kann ich auch ohne technische Erfahrung anfragen?', a: 'Ja. Du musst nicht wissen, welche Technologie gebraucht wird. Wichtiger ist, dass du das Problem, die Zielgruppe und den gewünschten Ablauf beschreiben kannst.' },
  { q: 'Ist das günstiger als eine Agentur?', a: 'Oft ja, weil der Fokus auf kleinen MVPs und klar begrenzten Funktionen liegt. Für große Individualsoftware mit umfangreicher Planung, Sicherheit, Skalierung und Support ist eine klassische Agentur oder ein größeres Team meist passender.' },
  { q: 'Kann ich damit ein komplettes SaaS bauen lassen?', a: 'Ein erstes MVP kann sinnvoll sein. Eine vollständige SaaS-Plattform mit Abrechnung, Rollenmodell, Skalierung, Support und Sicherheitskonzept ist ein deutlich größeres Projekt und muss separat bewertet werden.' },
  { q: 'Kann das Tool später erweitert werden?', a: 'Ja, wenn die erste Version zeigt, dass der Anwendungsfall trägt. Erweiterungen sollten aber nicht auf Vermutung gebaut werden, sondern auf echtem Feedback aus der Nutzung.' },
  { q: 'Für welche Projekte ist das nicht geeignet?', a: 'Nicht geeignet sind sehr komplexe, sicherheitskritische oder stark regulierte Anwendungen ohne zusätzliche technische und rechtliche Prüfung. In solchen Fällen sollte der Umfang zuerst sauber geklärt werden.' },
]

const serviceLd = safeJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Tool-Entwicklung',
  provider: { '@type': 'Organization', name: 'ToolSucher', url: SITE_URL },
  description: 'Individuelle MVPs und kleine Business-Tools — pragmatisch, bezahlbar.',
  url: `${SITE_URL}/entwickeln`,
  areaServed: 'DE',
})

function CtaLink() {
  return (
    <a href="#anfrage" className={styles.ctaInline}>Tool-Idee anfragen</a>
  )
}

export default function EntwickelnSeite() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serviceLd }} />
      <main className={styles.main}>

        {/* 1. HERO */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Lass dir dein eigenes kleines Tool entwickeln</h1>
          <p className={styles.heroSub}>
            Du hast eine Idee für ein internes Tool, einen Rechner, ein Kundenportal oder eine
            Automatisierung? Wir helfen dir, daraus schnell ein funktionierendes MVP zu machen —
            pragmatisch, bezahlbar und ohne monatelanges Softwareprojekt.
          </p>
          <div className={styles.heroBtns}>
            <a href="#anfrage" className={styles.btnPrimary}>Tool-Idee anfragen</a>
            <a href="#beispiele" className={styles.btnSecondary}>Beispiele ansehen</a>
          </div>
        </section>

        {/* 2. PREISE */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preise</h2>
          <div className={styles.priceGrid}>
            <div className={styles.priceCard}>
              <p className={styles.priceCardTitle}>Kleine Tools</p>
              <p className={styles.priceCardDesc}>Rechner, Formulare, Landingpage-Tools</p>
              <p className={styles.priceCardAmount}>ab 800 €</p>
              <p className={styles.priceCardTime}>1–2 Tage Umsetzung</p>
            </div>
            <div className={`${styles.priceCard} ${styles.priceCardHighlight}`}>
              <span className={styles.priceBadge}>Empfohlen</span>
              <p className={styles.priceCardTitle}>MVP-Tools</p>
              <p className={styles.priceCardDesc}>Erste Versionen mit Datenbank und Logik</p>
              <p className={styles.priceCardAmount}>ab 2.000 €</p>
              <p className={styles.priceCardTime}>3–5 Tage Umsetzung</p>
            </div>
            <div className={styles.priceCard}>
              <p className={styles.priceCardTitle}>Individuelle Tools</p>
              <p className={styles.priceCardDesc}>Komplexere Workflows und Kundenbereiche</p>
              <p className={styles.priceCardAmount}>ab 4.000 €</p>
              <p className={styles.priceCardTime}>nach Aufwand</p>
            </div>
          </div>
          <p className={styles.priceNote}>
            Die Kosten hängen vom Umfang ab. Nach deiner Anfrage erhältst du eine realistische Einschätzung.
          </p>
        </section>

        {/* 3. BEISPIELE */}
        <section className={styles.section} id="beispiele">
          <h2 className={styles.sectionTitle}>Beispiele: Was wir bauen können</h2>
          <div className={styles.exampleGrid}>
            {EXAMPLES.map((ex) => (
              <div key={ex.title} className={styles.exampleCard}>
                <span className={styles.exampleIcon}>{ex.icon}</span>
                <p className={styles.exampleTitle}>{ex.title}</p>
                <p className={styles.exampleDesc}>{ex.desc}</p>
              </div>
            ))}
          </div>
          <div className={styles.ctaRow}><CtaLink /></div>
        </section>

        {/* 4. ABLAUF */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>So läuft es ab</h2>
          <div className={styles.stepsGrid}>
            {STEPS.map((s) => (
              <div key={s.nr} className={styles.step}>
                <div className={styles.stepNr}>{s.nr}</div>
                <div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. LEISTUNGSUMFANG */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Was im Umfang enthalten ist</h2>
          <div className={styles.scopeList}>
            {SCOPE.map((s) => (
              <div key={s} className={styles.scopeItem}><span className={styles.fitCheck}>✓</span>{s}</div>
            ))}
          </div>
        </section>

        {/* 6. WARUM TOOLSUCHER */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Warum ToolSucher?</h2>
          <p className={styles.sectionText}>
            Manchmal ist das beste Tool nicht das bekannteste — sondern ein kleines Tool,
            das genau deinen Prozess abbildet.
          </p>
          <div className={styles.scopeList}>
            {[
              'Effiziente Entwicklungsmethoden — schneller als klassische Agenturen',
              'Fokus auf kleine, nützliche MVPs statt Feature-Bloat',
              'Pragmatisch statt perfektionistisch — erst nutzen, dann iterieren',
              'Transparente Preise, kein Stundenzählen im Hintergrund',
              'Du bekommst ein funktionierendes Tool, keinen Prototypen',
            ].map((a) => (
              <div key={a} className={styles.scopeItem}><span className={styles.fitCheck}>✓</span>{a}</div>
            ))}
          </div>
          <div className={styles.ctaRow}><CtaLink /></div>
        </section>

        {/* 7. ANFRAGEFORMULAR */}
        <section className={styles.section} id="anfrage">
          <h2 className={styles.sectionTitle}>Deine Tool-Idee beschreiben</h2>
          <div className={styles.formCard}>
            <InquiryForm />
          </div>
        </section>

        {/* 8. FAQ */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Häufige Fragen</h2>
          <div className={styles.faqList}>
            {FAQ.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <p className={styles.faqQ}>{f.q}</p>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
          <div className={styles.ctaRow}><CtaLink /></div>
        </section>

      </main>
    </>
  )
}
