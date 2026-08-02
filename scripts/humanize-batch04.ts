/**
 * scripts/humanize-batch04.ts
 * Zweck: Importiert überarbeitete Texte aus Batch 04 (Seitenstruktur)
 *        in 4 verschiedene Modelle: CategoryTranslation, ToolStackTranslation,
 *        Article + ArticleSection, Comparison + ComparisonRow.
 * Aufruf: npx tsx scripts/humanize-batch04.ts [--execute]
 *   Ohne Flag: Dry-Run (kein Schreibzugriff). Mit --execute: schreibt in DB.
 */

import * as dotenv from 'dotenv'
import type { PrismaClient } from '@prisma/client'
import { startScript } from './_mode'

let prisma: PrismaClient

// ============================================================
// DATEN
// ============================================================

const CATEGORIES: Array<{ slug: string; name: string; description: string }> = [
  { slug: 'buchhaltung-rechnungen', name: 'Buchhaltung & Rechnungen', description: 'Tools für Rechnungen, Belege, E-Rechnung und die Übergabe an den Steuerberater. Sinnvoll, wenn Buchhaltung nicht mehr nebenbei laufen soll.' },
  { slug: 'geschaftskonto-finanzen', name: 'Geschäftskonto & Finanzen', description: 'Geschäftskonten, Karten und Finanztools für Selbstständige und kleine Unternehmen, die private und geschäftliche Ausgaben sauber trennen wollen.' },
  { slug: 'controlling-ausgabenmanagement', name: 'Controlling & Ausgabenmanagement', description: 'Tools für Ausgaben, Budgets, Karten und Finanzübersicht. Besonders nützlich, wenn mehrere Personen Kosten verursachen oder Freigaben nötig werden.' },
  { slug: 'recht-datenschutz-esignatur', name: 'Recht, Datenschutz & E-Signatur', description: 'Tools für Verträge, Signaturen, Datenschutz und rechtliche Abläufe. Kein Ersatz für Beratung, aber hilfreich für wiederkehrende Standardprozesse.' },
  { slug: 'produktivitat-notizen', name: 'Produktivität & Notizen', description: 'Tools für Notizen, Wissen, Aufgaben und interne Struktur. Gut, wenn Ideen, Kundeninformationen und Projekte nicht mehr an vielen Orten verteilt sein sollen.' },
  { slug: 'projektmanagement', name: 'Projektmanagement', description: 'Tools für Aufgaben, Projekte, Verantwortlichkeiten und Deadlines. Besonders sinnvoll, wenn Arbeit nicht mehr allein über Zuruf oder Chat laufen sollte.' },
  { slug: 'kalender-calls', name: 'Kalender & Calls', description: 'Tools für Terminbuchung, Kalenderabgleich und Kundenmeetings. Gut, wenn Terminabsprachen weniger Zeit kosten und professioneller wirken sollen.' },
  { slug: 'meetings-automatisierung', name: 'Meetings & Automatisierung', description: 'Tools für Meeting-Notizen, Transkripte, Zusammenfassungen und wiederkehrende Abläufe. Sinnvoll, wenn Besprechungen zu viel Nacharbeit verursachen.' },
  { slug: 'screen-recording-kundenupdates', name: 'Screen Recording & Kundenupdates', description: 'Tools für Bildschirmaufnahmen, kurze Erklärvideos und asynchrone Updates. Gut, wenn nicht jede Rückfrage direkt in einen Call führen soll.' },
  { slug: 'design-video', name: 'Design & Video', description: 'Tools für Präsentationen, Social-Media-Grafiken, Videos und einfache Gestaltung. Geeignet, wenn Inhalte schnell professioneller aussehen sollen.' },
  { slug: 'bildbearbeitung', name: 'Bildbearbeitung', description: 'Tools zum Bearbeiten, Optimieren und Freistellen von Bildern. Nützlich für Website, Shop, Präsentationen und Social-Media-Inhalte.' },
  { slug: 'ki-coding', name: 'KI & Coding', description: 'KI-Tools für Texte, Analysen, Ideen, Code und technische Workflows. Stark, wenn sie als Unterstützung genutzt werden und nicht als ungeprüfte Abkürzung.' },
  { slug: 'website-hosting', name: 'Website & Hosting', description: 'Tools zum Erstellen, Betreiben und Veröffentlichen von Websites. Relevant, wenn die eigene Website mehr leisten soll als nur online zu sein.' },
  { slug: 'crm-marketing', name: 'CRM & Marketing', description: 'Tools für Kontakte, Leads, E-Mails, Pipelines und Kundenbeziehungen. Sinnvoll, sobald Vertrieb und Nachfassen nicht mehr im Kopf funktionieren.' },
  { slug: 'musik-audio-voice', name: 'Musik, Audio & Voice', description: 'Tools für Audio, Voiceover, Musik und Sprachinhalte. Nützlich für Content, Kurse, Videos und einfache Produktionen ohne eigenes Studio.' },
  { slug: 'nocode-automation', name: 'No-Code & Automation', description: 'Tools, die Abläufe zwischen Apps verbinden und wiederkehrende Aufgaben automatisieren. Stark bei klaren Prozessen, schwach bei chaotischen Sonderfällen.' },
  { slug: 'social-media', name: 'Social Media', description: 'Tools für Planung, Veröffentlichung und Auswertung von Social-Media-Inhalten. Gut, wenn Content regelmäßig erscheinen soll statt nur spontan.' },
]

const STACKS = [
  { slug: 'selbststaendige', name: 'Tool-Stack für Selbstständige', description: 'Ein kompakter Tool-Stack für Selbstständige, die ihre wichtigsten Abläufe abdecken wollen: Texte, Buchhaltung, Finanzen, Content und Social Media. Nicht jedes Tool ist Pflicht. Der Stack ist eher ein sinnvoller Startpunkt als eine feste Vorgabe.', targetAudience: 'Solo-Selbstständige · Freelancer · Creator' },
  { slug: 'vorschau', name: 'Empfohlener Starter-Stack', description: 'Ein pragmatischer Startpunkt für Gründer und Selbstständige. Der Stack deckt die wichtigsten Bereiche ab, ohne direkt zu viele Tools einzuführen: Buchhaltung, Organisation, Termine, Kundenkommunikation und KI-Unterstützung.', targetAudience: 'Gründer & Selbstständige' },
]

const ARTICLE = {
  slug: 'beste-tools-freelancer-2025',
  title: 'Die besten Tools für Freelancer 2026',
  subtitle: 'Ein ehrlicher Überblick über Tools für Buchhaltung, Organisation, Termine, KI und Kundenkommunikation. Mit Fokus auf den Alltag von Selbstständigen.',
  sections: [
    { sortOrder: 0, heading: 'Einleitung', content: 'Als Freelancer brauchst du keine möglichst große Tool-Sammlung. Du brauchst wenige Werkzeuge, die echte Probleme lösen. Rechnungen müssen raus, Belege müssen auffindbar bleiben, Termine sollen nicht in endlosen E-Mails hängen und Kundenprojekte brauchen eine nachvollziehbare Struktur.\n\nDieser Guide zeigt deshalb keine theoretische Maximallösung, sondern einen pragmatischen Startpunkt. Die Tools sind vor allem dann interessant, wenn du allein oder in einem kleinen Setup arbeitest und nicht für jeden Prozess direkt ein großes System einführen willst.' },
    { sortOrder: 1, heading: '1. Buchhaltung & Rechnungen', content: 'Buchhaltung ist selten der Bereich, auf den Selbstständige besonders viel Lust haben. Trotzdem sollte sie früh sauber aufgesetzt werden. Wenn Rechnungen, Belege und Steuerunterlagen zu lange in Ordnern, E-Mails oder Excel liegen, wird es später unnötig mühsam.\n\n**Empfehlung:** sevdesk ist ein guter Einstieg, wenn du einfache Rechnungen, Belege und Bankabgleich sauber abbilden möchtest. Lexware Office passt besser, wenn du mehr kaufmännische Struktur brauchst oder enger mit einem Steuerberater arbeitest.' },
    { sortOrder: 2, heading: '2. Projektmanagement & Organisation', content: 'Viele Freelancer starten mit Notizen, E-Mails und ein paar To-dos. Das reicht eine Zeit lang. Spätestens bei mehreren Kunden, wiederkehrenden Aufgaben oder parallelen Projekten wird aber sichtbar, ob die eigene Struktur trägt.\n\n**Empfehlung:** Notion eignet sich gut, wenn du Wissen, Notizen und einfache Projektstrukturen an einem Ort sammeln möchtest. ClickUp ist stärker, wenn Aufgaben, Zuständigkeiten, Deadlines und Projektstatus klarer gesteuert werden müssen.' },
    { sortOrder: 3, heading: '3. Terminbuchung', content: 'Terminabsprachen kosten oft mehr Zeit, als sie sollten. Gerade bei Erstgesprächen, Kundenupdates oder wiederkehrenden Calls lohnt sich ein Buchungstool schnell. Es wirkt professioneller und verhindert unnötige E-Mail-Schleifen.\n\n**Empfehlung:** Calendly ist der bekannte Standard mit vielen Integrationen. TidyCal ist interessant, wenn du eine einfache und günstige Lösung suchst und nicht jedes Detail eines großen Terminbuchungssystems brauchst.' },
    { sortOrder: 4, heading: 'Fazit', content: 'Ein guter Freelancer-Stack ist nicht möglichst groß, sondern passend zum eigenen Arbeitsalltag. Starte mit den Bereichen, die wirklich Reibung erzeugen: Buchhaltung, Organisation, Termine und Kundenkommunikation.\n\nErweitere deinen Stack erst dann, wenn ein Tool ein konkretes Problem löst. Sonst entsteht nur die nächste Baustelle: zu viele Systeme, zu viele Benachrichtigungen und zu wenig Klarheit.' },
  ],
}

const COMPARISON = {
  slug: 'sevdesk-vs-lexware-office',
  verdict: 'sevdesk passt besser, wenn du als Solo-Selbstständiger oder Freelancer einfache Rechnungen, Belege und Bankbewegungen möglichst unkompliziert verwalten willst. Lexware Office kann die bessere Wahl sein, wenn deine Buchhaltung regelmäßiger anfällt, du enger mit dem Steuerberater arbeitest oder mehr kaufmännische Struktur brauchst.',
  title: 'sevdesk vs Lexware Office: Welche Buchhaltung passt besser?',
  subtitle: 'sevdesk ist meist einfacher für den Einstieg. Lexware Office passt besser, wenn Buchhaltung regelmäßiger, strukturierter und näher am Steuerberater laufen soll.',
  keyDifference: 'Der wichtigste Unterschied liegt weniger im Preis als im Anspruch. sevdesk wirkt zugänglicher und eignet sich gut für einfache laufende Buchhaltung. Lexware Office ist stärker, wenn Buchhaltung, Auswertungen und Steuerberater-Zusammenarbeit eine größere Rolle spielen.',
  rows: [
    { criterion: 'Preis ab', toolAValue: '9,90 € pro Monat', toolBValue: '8,90 € pro Monat', sortOrder: 1 },
    { criterion: 'Kostenloser Plan', toolAValue: 'Nein', toolBValue: 'Nein', sortOrder: 2 },
    { criterion: 'E-Rechnung', toolAValue: 'Ja', toolBValue: 'Ja', sortOrder: 3 },
    { criterion: 'DATEV', toolAValue: 'Ja', toolBValue: 'Ja', sortOrder: 4 },
    { criterion: 'Belegerfassung', toolAValue: 'Ja', toolBValue: 'Ja', sortOrder: 5 },
    { criterion: 'Bedienung', toolAValue: 'einfacher Einstieg', toolBValue: 'umfangreicher', sortOrder: 6 },
    { criterion: 'Für Solo-Selbstständige', toolAValue: 'sehr passend', toolBValue: 'passend', sortOrder: 7 },
    { criterion: 'Für kleine Teams', toolAValue: 'bedingt passend', toolBValue: 'besser geeignet', sortOrder: 8 },
  ],
}

// ============================================================
// HILFSFUNKTIONEN
// ============================================================

function truncate(str: string, n = 60): string {
  if (!str) return '(leer)'
  return str.length > n ? str.slice(0, n) + '…' : str
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma

  const execute = startScript()

  // ── Block 1: Kategorien ──
  console.log('[KATEGORIEN]')
  let catFound = 0, catMissing = 0
  for (const cat of CATEGORIES) {
    const trans = await prisma.categoryTranslation.findFirst({
      where: { category: { slug: cat.slug }, locale: 'de' },
      select: { id: true, name: true, description: true },
    })
    if (!trans) {
      console.log(`  ⚠  NICHT GEFUNDEN: ${cat.slug}`)
      catMissing++
      continue
    }
    catFound++
    const nameChanged = trans.name !== cat.name
    const descChanged = (trans.description ?? '') !== cat.description
    if (nameChanged || descChanged) {
      console.log(`  ✓ ${cat.slug}`)
      if (nameChanged) console.log(`    name: ${truncate(trans.name)} → ${truncate(cat.name)}`)
      if (descChanged) console.log(`    desc: ${truncate(trans.description ?? '')} → ${truncate(cat.description)}`)
    } else {
      console.log(`  - ${cat.slug} (unverändert)`)
    }
    if (execute) {
      await prisma.categoryTranslation.update({
        where: { id: trans.id },
        data: { name: cat.name, description: cat.description },
      })
    }
  }
  console.log(`  → ${catFound} gefunden, ${catMissing} nicht gefunden\n`)

  // ── Block 2: Stacks ──
  console.log('[STACKS]')
  let stackFound = 0, stackMissing = 0
  for (const stack of STACKS) {
    const trans = await prisma.toolStackTranslation.findFirst({
      where: { toolStack: { slug: stack.slug }, locale: 'de' },
      select: { id: true, name: true, description: true, targetAudience: true },
    })
    if (!trans) {
      console.log(`  ⚠  NICHT GEFUNDEN: ${stack.slug}`)
      stackMissing++
      continue
    }
    stackFound++
    console.log(`  ✓ ${stack.slug}`)
    if (trans.name !== stack.name) console.log(`    name: ${truncate(trans.name)} → ${truncate(stack.name)}`)
    if ((trans.description ?? '') !== stack.description) console.log(`    desc: ${truncate(trans.description ?? '')} → ${truncate(stack.description)}`)
    if (trans.targetAudience !== stack.targetAudience) console.log(`    audience: ${truncate(trans.targetAudience)} → ${truncate(stack.targetAudience)}`)
    if (execute) {
      await prisma.toolStackTranslation.update({
        where: { id: trans.id },
        data: { name: stack.name, description: stack.description, targetAudience: stack.targetAudience },
      })
    }
  }
  console.log(`  → ${stackFound} gefunden, ${stackMissing} nicht gefunden\n`)

  // ── Block 3: Artikel ──
  console.log('[ARTIKEL]')
  const article = await prisma.article.findUnique({
    where: { slug: ARTICLE.slug },
    include: { sections: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!article) {
    console.log(`  ⚠  ARTIKEL NICHT GEFUNDEN: ${ARTICLE.slug}`)
  } else {
    console.log(`  ✓ ${ARTICLE.slug}`)
    if (article.title !== ARTICLE.title) console.log(`    title: ${truncate(article.title)} → ${truncate(ARTICLE.title)}`)
    if (article.subtitle !== ARTICLE.subtitle) console.log(`    subtitle: ${truncate(article.subtitle)} → ${truncate(ARTICLE.subtitle)}`)
    for (const sec of ARTICLE.sections) {
      const existing = article.sections.find(s => s.sortOrder === sec.sortOrder)
      if (existing) {
        if (existing.heading !== sec.heading || existing.content !== sec.content) {
          console.log(`    section[${sec.sortOrder}]: ${truncate(existing.heading ?? '')} → ${truncate(sec.heading)}`)
        }
      } else {
        console.log(`    section[${sec.sortOrder}]: NEU (${truncate(sec.heading)})`)
      }
    }
    if (execute) {
      await prisma.article.update({
        where: { id: article.id },
        data: { title: ARTICLE.title, subtitle: ARTICLE.subtitle },
      })
      for (const sec of ARTICLE.sections) {
        const existing = article.sections.find(s => s.sortOrder === sec.sortOrder)
        if (existing) {
          await prisma.articleSection.update({
            where: { id: existing.id },
            data: { heading: sec.heading, content: sec.content },
          })
        }
      }
    }
  }
  console.log('')

  // ── Block 4: Vergleich ──
  console.log('[VERGLEICH]')
  const comp = await prisma.comparison.findUnique({
    where: { slug: COMPARISON.slug },
    include: { rows: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!comp) {
    console.log(`  ⚠  VERGLEICH NICHT GEFUNDEN: ${COMPARISON.slug}`)
  } else {
    console.log(`  ✓ ${COMPARISON.slug}`)
    if (comp.verdict !== COMPARISON.verdict) console.log(`    verdict: ${truncate(comp.verdict)} → ${truncate(COMPARISON.verdict)}`)
    if (comp.title !== COMPARISON.title) console.log(`    title: ${truncate(comp.title ?? '')} → ${truncate(COMPARISON.title)}`)
    if (comp.subtitle !== COMPARISON.subtitle) console.log(`    subtitle: ${truncate(comp.subtitle ?? '')} → ${truncate(COMPARISON.subtitle)}`)
    if (comp.keyDifference !== COMPARISON.keyDifference) console.log(`    keyDifference: ${truncate(comp.keyDifference ?? '')} → ${truncate(COMPARISON.keyDifference)}`)
    console.log(`    rows: ${comp.rows.length} bestehend → ${COMPARISON.rows.length} neu`)
    if (execute) {
      await prisma.comparison.update({
        where: { id: comp.id },
        data: {
          verdict: COMPARISON.verdict,
          title: COMPARISON.title,
          subtitle: COMPARISON.subtitle,
          keyDifference: COMPARISON.keyDifference,
        },
      })
      await prisma.comparisonRow.deleteMany({ where: { comparisonId: comp.id } })
      await prisma.comparisonRow.createMany({
        data: COMPARISON.rows.map(r => ({ ...r, comparisonId: comp.id })),
      })
    }
  }

  console.log(`\n═══ Zusammenfassung ═══`)
  console.log(`Kategorien: ${catFound}/${CATEGORIES.length}`)
  console.log(`Stacks:     ${stackFound}/${STACKS.length}`)
  console.log(`Artikel:    ${article ? '1' : '0'}/1`)
  console.log(`Vergleich:  ${comp ? '1' : '0'}/1`)
  if (!execute) console.log('\n[DRY-RUN] Keine Änderungen geschrieben.')
  else console.log('\n✓ Fertig.')

  await prisma.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
