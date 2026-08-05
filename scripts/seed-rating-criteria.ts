/**
 * Datei: scripts/seed-rating-criteria.ts
 *
 * Zweck: Importiert 58 Bewertungskriterien (RatingCriterion) und weist sie
 * per ToolRatingCriterion den Tools der jeweiligen Kategorie zu.
 *
 * Ausführen:
 *   npx tsx scripts/seed-rating-criteria.ts             → zeigt was passieren würde (Dry-Run per Default)
 *   npx tsx scripts/seed-rating-criteria.ts --execute   → schreibt in DB
 *
 * Idempotent: upsert by slug für Kriterien, skipDuplicates für Zuweisungen.
 */

import * as dotenv from 'dotenv'
import type { PrismaClient } from '@prisma/client'
import { startScript } from './_mode'

let prisma: PrismaClient

// ============================================================
// KRITERIEN
// ============================================================

const CRITERIA = [
  { name: 'Benutzerfreundlichkeit', slug: 'benutzerfreundlichkeit', sortOrder: 1 },
  { name: 'Preis-Leistung', slug: 'preis-leistung', sortOrder: 2 },
  { name: 'DATEV-Anbindung', slug: 'datev-anbindung', sortOrder: 3 },
  { name: 'Belegerfassung & OCR', slug: 'belegerfassung-ocr', sortOrder: 4 },
  { name: 'E-Rechnungs-Support', slug: 'e-rechnungs-support', sortOrder: 5 },
  { name: 'Support & Dokumentation', slug: 'support-dokumentation', sortOrder: 6 },
  { name: 'Kontoführungsgebühren', slug: 'kontofuehrungsgebuehren', sortOrder: 7 },
  { name: 'Kartenleistungen', slug: 'kartenleistungen', sortOrder: 8 },
  { name: 'DSGVO & Sicherheit', slug: 'dsgvo-sicherheit', sortOrder: 9 },
  { name: 'App-Qualität', slug: 'app-qualitaet', sortOrder: 10 },
  { name: 'Firmenkarten-Funktionen', slug: 'firmenkarten-funktionen', sortOrder: 11 },
  { name: 'Ausgaben-Reporting', slug: 'ausgaben-reporting', sortOrder: 12 },
  { name: 'Team-Verwaltung', slug: 'team-verwaltung', sortOrder: 13 },
  { name: 'Rechtssicherheit (EU/DE)', slug: 'rechtssicherheit-eu-de', sortOrder: 14 },
  { name: 'Signaturprozess', slug: 'signaturprozess', sortOrder: 15 },
  { name: 'Dokumentenverwaltung', slug: 'dokumentenverwaltung', sortOrder: 16 },
  { name: 'Funktionsumfang', slug: 'funktionsumfang', sortOrder: 17 },
  { name: 'Integrationen', slug: 'integrationen', sortOrder: 18 },
  { name: 'Offline-Verfügbarkeit', slug: 'offline-verfuegbarkeit', sortOrder: 19 },
  { name: 'Teamfähigkeit', slug: 'teamfaehigkeit', sortOrder: 20 },
  { name: 'Aufgaben & Workflows', slug: 'aufgaben-workflows', sortOrder: 21 },
  { name: 'Teamkollaboration', slug: 'teamkollaboration', sortOrder: 22 },
  { name: 'Reporting & Übersicht', slug: 'reporting-uebersicht', sortOrder: 23 },
  { name: 'Kontaktverwaltung', slug: 'kontaktverwaltung', sortOrder: 24 },
  { name: 'Pipeline & Vertrieb', slug: 'pipeline-vertrieb', sortOrder: 25 },
  { name: 'Marketing-Automation', slug: 'marketing-automation', sortOrder: 26 },
  { name: 'Buchungsseite & Links', slug: 'buchungsseite-links', sortOrder: 27 },
  { name: 'Kalender-Integration', slug: 'kalender-integration', sortOrder: 28 },
  { name: 'Erinnerungen & Benachrichtigungen', slug: 'erinnerungen-benachrichtigungen', sortOrder: 29 },
  { name: 'Videoqualität', slug: 'videoqualitaet', sortOrder: 30 },
  { name: 'Aufzeichnung & Transkription', slug: 'aufzeichnung-transkription', sortOrder: 31 },
  { name: 'Teilnehmer-Verwaltung', slug: 'teilnehmer-verwaltung', sortOrder: 32 },
  { name: 'Anzahl Integrationen', slug: 'anzahl-integrationen', sortOrder: 33 },
  { name: 'Workflow-Komplexität', slug: 'workflow-komplexitaet', sortOrder: 34 },
  { name: 'Zuverlässigkeit', slug: 'zuverlaessigkeit', sortOrder: 35 },
  { name: 'Dokumentation & Community', slug: 'dokumentation-community', sortOrder: 36 },
  { name: 'Code-Qualität & Genauigkeit', slug: 'code-qualitaet-genauigkeit', sortOrder: 37 },
  { name: 'Unterstützte Sprachen/IDEs', slug: 'unterstuetzte-sprachen-ides', sortOrder: 38 },
  { name: 'Kontextverständnis', slug: 'kontextverstaendnis', sortOrder: 39 },
  { name: 'Datenschutz & Sicherheit', slug: 'datenschutz-sicherheit', sortOrder: 40 },
  { name: 'Vorlagen-Qualität', slug: 'vorlagen-qualitaet', sortOrder: 41 },
  { name: 'Export-Optionen', slug: 'export-optionen', sortOrder: 42 },
  { name: 'KI-Funktionen', slug: 'ki-funktionen', sortOrder: 43 },
  { name: 'Bearbeitungsfunktionen', slug: 'bearbeitungsfunktionen', sortOrder: 44 },
  { name: 'KI-Werkzeuge', slug: 'ki-werkzeuge', sortOrder: 45 },
  { name: 'Export-Formate', slug: 'export-formate', sortOrder: 46 },
  { name: 'Performance', slug: 'performance', sortOrder: 47 },
  { name: 'Audio-Qualität', slug: 'audio-qualitaet', sortOrder: 48 },
  { name: 'Aufnahmequalität', slug: 'aufnahmequalitaet', sortOrder: 49 },
  { name: 'Sharing & Links', slug: 'sharing-links', sortOrder: 50 },
  { name: 'Performance & Ladezeit', slug: 'performance-ladezeit', sortOrder: 51 },
  { name: 'SEO-Funktionen', slug: 'seo-funktionen', sortOrder: 52 },
  { name: 'Support & Uptime', slug: 'support-uptime', sortOrder: 53 },
  { name: 'Skalierbarkeit', slug: 'skalierbarkeit', sortOrder: 54 },
  { name: 'Kanalabdeckung', slug: 'kanalabdeckung', sortOrder: 55 },
  { name: 'Content-Planung', slug: 'content-planung', sortOrder: 56 },
  { name: 'Analytics & Reporting', slug: 'analytics-reporting', sortOrder: 57 },
  { name: 'Team-Zusammenarbeit', slug: 'team-zusammenarbeit', sortOrder: 58 },
]

// ============================================================
// KATEGORIE → KRITERIEN MAPPING
// ============================================================

const CATEGORY_CRITERIA: Record<string, string[]> = {
  'buchhaltung-rechnungen': ['benutzerfreundlichkeit', 'preis-leistung', 'datev-anbindung', 'belegerfassung-ocr', 'e-rechnungs-support', 'support-dokumentation'],
  'geschaeftskonto-finanzen': ['benutzerfreundlichkeit', 'preis-leistung', 'kontofuehrungsgebuehren', 'kartenleistungen', 'dsgvo-sicherheit', 'app-qualitaet'],
  // Slug in DB prüfen: evtl. 'geschaftskonto-finanzen' (ohne Umlaut-Dopplung)
  'geschaftskonto-finanzen': ['benutzerfreundlichkeit', 'preis-leistung', 'kontofuehrungsgebuehren', 'kartenleistungen', 'dsgvo-sicherheit', 'app-qualitaet'],
  'controlling-ausgabenmanagement': ['benutzerfreundlichkeit', 'preis-leistung', 'datev-anbindung', 'firmenkarten-funktionen', 'ausgaben-reporting', 'team-verwaltung'],
  'recht-datenschutz-esignatur': ['benutzerfreundlichkeit', 'preis-leistung', 'rechtssicherheit-eu-de', 'signaturprozess', 'dokumentenverwaltung', 'support-dokumentation'],
  'produktivitaet-notizen': ['benutzerfreundlichkeit', 'preis-leistung', 'funktionsumfang', 'integrationen', 'offline-verfuegbarkeit', 'teamfaehigkeit'],
  'projektmanagement': ['benutzerfreundlichkeit', 'preis-leistung', 'aufgaben-workflows', 'teamkollaboration', 'integrationen', 'reporting-uebersicht'],
  'crm-marketing': ['benutzerfreundlichkeit', 'preis-leistung', 'kontaktverwaltung', 'pipeline-vertrieb', 'marketing-automation', 'integrationen'],
  'kalender-calls': ['benutzerfreundlichkeit', 'preis-leistung', 'buchungsseite-links', 'kalender-integration', 'erinnerungen-benachrichtigungen', 'teamfaehigkeit'],
  'meetings-automatisierung': ['benutzerfreundlichkeit', 'preis-leistung', 'videoqualitaet', 'aufzeichnung-transkription', 'integrationen', 'teilnehmer-verwaltung'],
  'nocode-automation': ['benutzerfreundlichkeit', 'preis-leistung', 'anzahl-integrationen', 'workflow-komplexitaet', 'zuverlaessigkeit', 'dokumentation-community'],
  'ki-coding': ['benutzerfreundlichkeit', 'preis-leistung', 'code-qualitaet-genauigkeit', 'unterstuetzte-sprachen-ides', 'kontextverstaendnis', 'datenschutz-sicherheit'],
  'design-video': ['benutzerfreundlichkeit', 'preis-leistung', 'vorlagen-qualitaet', 'export-optionen', 'ki-funktionen', 'teamfaehigkeit'],
  'bildbearbeitung': ['benutzerfreundlichkeit', 'preis-leistung', 'bearbeitungsfunktionen', 'ki-werkzeuge', 'export-formate', 'performance'],
  'musik-audio-voice': ['benutzerfreundlichkeit', 'preis-leistung', 'audio-qualitaet', 'bearbeitungsfunktionen', 'export-formate', 'ki-funktionen'],
  'screen-recording-kundenupdates': ['benutzerfreundlichkeit', 'preis-leistung', 'aufnahmequalitaet', 'bearbeitungsfunktionen', 'sharing-links', 'integrationen'],
  'website-hosting': ['benutzerfreundlichkeit', 'preis-leistung', 'performance-ladezeit', 'seo-funktionen', 'support-uptime', 'skalierbarkeit'],
  'social-media': ['benutzerfreundlichkeit', 'preis-leistung', 'kanalabdeckung', 'content-planung', 'analytics-reporting', 'team-zusammenarbeit'],
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma

  const execute = startScript()

  // ── Schritt 1: Kriterien upserten ──
  console.log(`Kriterien: ${CRITERIA.length} Einträge`)

  if (execute) {
    for (const c of CRITERIA) {
      await prisma.ratingCriterion.upsert({
        where: { slug: c.slug },
        create: { name: c.name, slug: c.slug, sortOrder: c.sortOrder },
        update: { name: c.name, sortOrder: c.sortOrder },
      })
    }
    console.log(`  ✅ ${CRITERIA.length} Kriterien upserted`)
  }

  // Kriterien-Map laden (für IDs) — dieselbe Abfrage in beiden Modi.
  // Im Dry-Run zeigt sie den Stand VOR dem Upsert; fehlen Kriterien noch,
  // ist das der wahre Zustand (würden erst per --execute angelegt), keine Lücke.
  const allCriteria = await prisma.ratingCriterion.findMany({ select: { id: true, slug: true } })
  const criterionBySlug = new Map(allCriteria.map((c) => [c.slug, c.id]))
  if (!execute) {
    const fehlend = CRITERIA.filter((c) => !criterionBySlug.has(c.slug)).length
    if (fehlend > 0) {
      console.log(`  ℹ️  ${fehlend} Kriterien existieren noch nicht in der DB (würden per --execute angelegt)`)
    }
  }

  // ── Schritt 2: Tool-Zuweisungen ──
  let totalAssignments = 0
  let categoriesMatched = 0
  let categoriesSkipped = 0

  for (const [catSlug, critSlugs] of Object.entries(CATEGORY_CRITERIA)) {
    // Alle Tools dieser Kategorie holen — dieselbe Abfrage in beiden Modi.
    const toolCategories = await prisma.toolCategory.findMany({
      where: { category: { slug: catSlug } },
      select: { toolId: true },
    })

    if (toolCategories.length === 0) {
      // Kategorie existiert nicht oder hat keine Tools
      console.log(`  ⚠️  Kategorie "${catSlug}": keine Tools gefunden — übersprungen`)
      categoriesSkipped++
      continue
    }

    const toolIds = toolCategories.map((tc) => tc.toolId)
    const assignments: Array<{ toolId: string; criterionId: string }> = []

    for (const critSlug of critSlugs) {
      const criterionId = criterionBySlug.get(critSlug)
      if (!criterionId) {
        console.log(`  ⚠️  Kriterium "${critSlug}" nicht gefunden — übersprungen`)
        continue
      }
      for (const toolId of toolIds) {
        assignments.push({ toolId, criterionId })
      }
    }

    if (execute && assignments.length > 0) {
      await prisma.toolRatingCriterion.createMany({
        data: assignments,
        skipDuplicates: true,
      })
    }

    console.log(`  ${catSlug}: ${toolIds.length} Tools × ${critSlugs.length} Kriterien = ${assignments.length} Zuweisungen${!execute ? ' (würden angelegt)' : ''}`)
    totalAssignments += assignments.length
    categoriesMatched++
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Zusammenfassung:`)
  console.log(`    ${CRITERIA.length} Kriterien`)
  console.log(`    ${categoriesMatched} Kategorien gematcht, ${categoriesSkipped} übersprungen`)
  console.log(`    ${totalAssignments} Tool-Zuweisungen${!execute ? ' (würden angelegt)' : ''}`)
  if (!execute) {
    console.log('  (Dry-Run — nichts geschrieben.)')
  }
  console.log('═══════════════════════════════════════════════════')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
