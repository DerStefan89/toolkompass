/**
 * Datei: scripts/update-tool-content.ts
 *
 * Zweck: Liest die 98 Tool-Beschreibungen aus
 *        Toolsucher_Tooltexte_final_V3_redaktionell_bereinigt.docx
 *        (via mammoth → HTML, geparst nach Heading-2/3-Struktur) und überträgt
 *        die Inhalte pro Tool in ToolTranslation (locale='de').
 *
 * Übernommene Felder:
 *   shortDescription ← Kurzbeschreibung (erster Absatz)
 *   longDescription  ← Kurzfazit (alle Absätze, mit \n\n verbunden)
 *   strengths[]      ← Stärken
 *   weaknesses[]     ← Schwächen
 *   bestFor[]        ← Für wen geeignet?
 *   notIdealFor[]    ← Für wen nicht geeignet?
 *   features[]       ← Funktionen
 *   faqItems         ← Häufige Fragen ([{question, answer}, ...])
 *
 * NICHT übernommen: name, Preise, planFeatures, Preisbox (informativ),
 * Alternativen (kein Schema-Feld).
 *
 * Ein Feld wird nur überschrieben, wenn die DOCX dafür Inhalt liefert —
 * fehlt eine Sektion komplett, bleibt der bestehende DB-Wert unangetastet.
 *
 * Ausführen:
 *   npx tsx scripts/update-tool-content.ts             → zeigt was geändert würde (Dry-Run per Default)
 *   npx tsx scripts/update-tool-content.ts --execute   → schreibt in DB
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import mammoth from 'mammoth'
import type { PrismaClient, Prisma } from '@prisma/client'
import { toSlug } from '../lib/utils/form'
import { startScript } from './_mode'

let prisma: PrismaClient

const DOCX_PATH = path.join(
  process.cwd(),
  '_arbeitsmaterial',
  'Toolsucher_Tooltexte_final_V3_redaktionell_bereinigt.docx'
)

// ============================================================
// MANUELLE SLUG-OVERRIDES
// Greift wenn toSlug(name) NICHT dem tatsächlichen DB-Slug entspricht,
// oder zur expliziten Dokumentation von Sonderfällen aus dem Briefing.
// `null` = kein passender Slug in der DB gefunden → wird als
// "NICHT GEFUNDEN" gemeldet.
// ============================================================

const SLUG_OVERRIDES: Record<string, string | null> = {
  // Abweichung vom Briefing: Das Briefing nennt
  // "Lexware Office" → "lexoffice" (NICHT "lexware-office").
  // Die "Umsetzungshinweise" in der DOCX sowie Aufgabe 3 sagen jedoch das
  // Gegenteil: Lexware Office ist die KANONISCHE Hauptseite, lexoffice die
  // alte/abgelöste Seite ("lexoffice bekommt keine eigene Toolseite ...").
  // In der DB existieren beide Slugs als eigene Tools. Entscheidung: Der
  // DOCX-Abschnitt "Lexware Office" wird auf den DB-Slug "lexware-office"
  // gemappt (= Standard-toSlug-Ergebnis, hier nur zur Dokumentation
  // explizit aufgeführt). DB-Slug "lexoffice" bleibt unangetastet — dafür
  // existiert kein eigener DOCX-Abschnitt (siehe Aufgabe 3: "lexoffice:
  // KEIN Update").
  'Lexware Office': 'lexware-office',

  'WISO MeinBüro': 'wiso-meinbuero',

  // Briefing nennt zwei Optionen ("codeium-windsurf" oder Prüfung auf
  // "windsurf-codeium"/"devin-desktop"). DB-Check: "devin-desktop" existiert
  // nicht, "windsurf-codeium" existiert (Name "Windsurf"). → gemappt.
  'Devin Desktop (ehemals Windsurf)': 'windsurf-codeium',

  // toSlug ergäbe "all-inkl-com" — DB-Slug ist "all-inkl"
  'ALL-INKL.COM': 'all-inkl',

  'Cal.com': 'cal-com',
  'SimplyBook.me': 'simplybook-me',
  'remove.bg': 'remove-bg',
  'paperless.io': 'paperless-io',
  'WordPress.org': 'wordpress-org',

  // Kein passender Slug in der DB gefunden (geprüft: weder "tldv" noch
  // "tl-dv" noch ähnliche Varianten existieren unter den 98 DB-Slugs).
  'tl;dv': null,

  'monday CRM': 'monday-crm',
  'N26 Business': 'n26-business',
  'Vivid Business': 'vivid-business',

  // toSlug ergäbe "adobe-photoshop" — DB-Slug ist "photoshop"
  'Adobe Photoshop': 'photoshop',

  // toSlug ergäbe "microsoft-copilot" — DB-Slug ist "microsoft-365-copilot"
  'Microsoft Copilot': 'microsoft-365-copilot',

  'Microsoft OneNote': 'microsoft-onenote',
  'Google Calendar': 'google-calendar',
  'Google Meet': 'google-meet',

  // toSlug ergäbe "hindenburg" — DB-Slug ist "hindenburg-pro"
  'Hindenburg': 'hindenburg-pro',

  'Adobe Express': 'adobe-express',
  'Murf AI': 'murf-ai',
  'Jasper AI': 'jasper-ai',
  'ElevenLabs': 'elevenlabs',
  'GitHub Copilot': 'github-copilot',
  'DeepL Write': 'deepl-write',
}

// ============================================================
// TYPES
// ============================================================

type BlockTag = 'h1' | 'h2' | 'h3' | 'p' | 'ul'
interface Block {
  tag: BlockTag
  html: string
}

type FaqItem = {
  question: string
  answer: string
}

interface ParsedTool {
  name: string
  sections: Map<string, Block[]>
}

interface NewValues {
  shortDescription?: string
  longDescription?: string
  strengths?: string[]
  weaknesses?: string[]
  bestFor?: string[]
  notIdealFor?: string[]
  features?: string[]
  faqItems?: FaqItem[]
}

type DbStatus = 'matched' | 'skipped_duplicate' | 'not_found'

interface ProcessResult {
  docxName: string
  slug: string | null
  status: DbStatus
  changedFields: string[]
  note?: string
}

// ============================================================
// HTML-HILFSFUNKTIONEN
// ============================================================

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

// Entfernt den <a id="..."></a>-Anker am Anfang von Überschriften
function stripAnchor(html: string): string {
  return html.replace(/<a[^>]*>[\s\S]*?<\/a>/g, '')
}

function headingText(html: string): string {
  return decodeEntities(stripAnchor(html)).trim()
}

// Wandelt Inline-HTML (innerhalb von <p>/<li>) in Markdown-/Klartext um —
// **fett**, *kursiv*, <u>unterstrichen</u> bleiben erhalten (siehe
// InlineMarkdown in app/tools/[slug]/page.tsx), Links → reiner Text.
function htmlInlineToText(html: string): string {
  let s = html
  s = s.replace(/<strong>([\s\S]*?)<\/strong>/g, '**$1**')
  s = s.replace(/<em>([\s\S]*?)<\/em>/g, '*$1*')
  s = s.replace(/<a[^>]*>([\s\S]*?)<\/a>/g, '$1')
  s = s.replace(/<[^>]+>/g, '')
  s = decodeEntities(s)
  return s.trim()
}

function extractListItems(html: string): string[] {
  const items: string[] = []
  const re = /<li>([\s\S]*?)<\/li>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const text = htmlInlineToText(m[1])
    if (text) items.push(text)
  }
  return items
}

function getParagraphs(blocks: Block[]): string[] {
  return blocks
    .filter((b) => b.tag === 'p')
    .map((b) => htmlInlineToText(b.html))
    .filter(Boolean)
}

function getListValues(blocks: Block[]): string[] {
  const items: string[] = []
  for (const b of blocks) {
    if (b.tag === 'ul') items.push(...extractListItems(b.html))
  }
  return items
}

// "Häufige Fragen": abwechselnd <p><strong>Frage</strong></p> / <p>Antwort</p>
function parseFaq(blocks: Block[]): FaqItem[] {
  const items: FaqItem[] = []
  let currentQuestion: string | null = null

  for (const b of blocks) {
    if (b.tag !== 'p') continue
    const trimmed = b.html.trim()
    const questionMatch = trimmed.match(/^<strong>([\s\S]*)<\/strong>$/)
    if (questionMatch) {
      currentQuestion = htmlInlineToText(questionMatch[1])
    } else if (currentQuestion) {
      items.push({ question: currentQuestion, answer: htmlInlineToText(b.html) })
      currentQuestion = null
    }
  }

  return items
}

// ============================================================
// DOCX-PARSER
// ============================================================

async function parseDocx(): Promise<ParsedTool[]> {
  const result = await mammoth.convertToHtml(
    { path: DOCX_PATH },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    }
  )

  const html = result.value

  // Vor dem ersten <h2> liegen die "Umsetzungshinweise für Claude Code"
  // (eigenes H1) sowie die erste Kategorie-Überschrift (H1) — beide werden
  // nicht als Website-Content behandelt und hier verworfen.
  const startIdx = html.indexOf('<h2>')
  const content = startIdx >= 0 ? html.slice(startIdx) : html

  const blockRe = /<(h1|h2|h3|p|ul)>([\s\S]*?)<\/\1>/g
  const tools: ParsedTool[] = []
  let currentTool: ParsedTool | null = null
  let currentSection: string | null = null

  let m: RegExpExecArray | null
  while ((m = blockRe.exec(content))) {
    const tag = m[1] as BlockTag
    const inner = m[2]

    if (tag === 'h1') {
      // Kategorie-Überschrift — kein Tool-Inhalt
      continue
    }

    if (tag === 'h2') {
      if (currentTool) tools.push(currentTool)
      currentTool = { name: headingText(inner), sections: new Map() }
      currentSection = null
      continue
    }

    if (tag === 'h3') {
      currentSection = headingText(inner)
      if (currentTool && !currentTool.sections.has(currentSection)) {
        currentTool.sections.set(currentSection, [])
      }
      continue
    }

    // p / ul
    if (currentTool && currentSection) {
      currentTool.sections.get(currentSection)!.push({ tag, html: inner })
    }
  }

  if (currentTool) tools.push(currentTool)

  return tools
}

// ============================================================
// MAPPING & FELD-EXTRAKTION
// ============================================================

function nameToSlug(name: string): string | null {
  if (Object.prototype.hasOwnProperty.call(SLUG_OVERRIDES, name)) {
    return SLUG_OVERRIDES[name]
  }
  return toSlug(name)
}

function computeNewValues(tool: ParsedTool): NewValues {
  const kurzbeschreibung = getParagraphs(tool.sections.get('Kurzbeschreibung') ?? [])
  const kurzfazit = getParagraphs(tool.sections.get('Kurzfazit') ?? [])
  const staerken = getListValues(tool.sections.get('Stärken') ?? [])
  const schwaechen = getListValues(tool.sections.get('Schwächen') ?? [])
  const bestFor = getListValues(tool.sections.get('Für wen geeignet?') ?? [])
  const notIdealFor = getListValues(tool.sections.get('Für wen nicht geeignet?') ?? [])
  const funktionen = getListValues(tool.sections.get('Funktionen') ?? [])
  const faq = parseFaq(tool.sections.get('Häufige Fragen') ?? [])

  const values: NewValues = {}
  // "erster Absatz" — nur der erste Paragraph der Kurzbeschreibung
  if (kurzbeschreibung[0]) values.shortDescription = kurzbeschreibung[0]
  if (kurzfazit.length > 0) values.longDescription = kurzfazit.join('\n\n')
  if (staerken.length > 0) values.strengths = staerken
  if (schwaechen.length > 0) values.weaknesses = schwaechen
  if (bestFor.length > 0) values.bestFor = bestFor
  if (notIdealFor.length > 0) values.notIdealFor = notIdealFor
  if (funktionen.length > 0) values.features = funktionen
  if (faq.length > 0) values.faqItems = faq

  return values
}

interface CurrentTranslation {
  shortDescription: string
  longDescription: string | null
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
  notIdealFor: string[]
  features: string[]
  faqItems: Prisma.JsonValue | null
}

function diffFields(current: CurrentTranslation, next: NewValues): string[] {
  const changed: string[] = []

  if (next.shortDescription !== undefined && next.shortDescription !== current.shortDescription) {
    changed.push('shortDescription')
  }
  if (next.longDescription !== undefined && next.longDescription !== (current.longDescription ?? '')) {
    changed.push('longDescription')
  }

  const arrayFields = ['strengths', 'weaknesses', 'bestFor', 'notIdealFor', 'features'] as const
  for (const field of arrayFields) {
    const nextVal = next[field]
    if (nextVal !== undefined && JSON.stringify(nextVal) !== JSON.stringify(current[field])) {
      changed.push(field)
    }
  }

  if (next.faqItems !== undefined && JSON.stringify(next.faqItems) !== JSON.stringify(current.faqItems ?? null)) {
    changed.push('faqItems')
  }

  return changed
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma
  const { Prisma: PrismaNS } = await import('@prisma/client')

  const execute = startScript()

  const tools = await parseDocx()
  console.log(`  📄 ${tools.length} Tool-Abschnitte aus DOCX geparst\n`)

  const results: ProcessResult[] = []
  const seenSlugs = new Set<string>()

  for (const tool of tools) {
    const slug = nameToSlug(tool.name)

    if (slug === null) {
      results.push({ docxName: tool.name, slug: null, status: 'not_found', changedFields: [] })
      continue
    }

    if (seenSlugs.has(slug)) {
      results.push({
        docxName: tool.name,
        slug,
        status: 'skipped_duplicate',
        changedFields: [],
        note: 'Doppelter DOCX-Abschnitt — bereits beim ersten Vorkommen übernommen',
      })
      continue
    }

    const dbTool = await prisma.tool.findUnique({
      where: { slug },
      select: {
        id: true,
        translations: {
          where: { locale: 'de' },
          select: {
            shortDescription: true,
            longDescription: true,
            strengths: true,
            weaknesses: true,
            bestFor: true,
            notIdealFor: true,
            features: true,
            faqItems: true,
          },
        },
      },
    })

    if (!dbTool || !dbTool.translations[0]) {
      results.push({ docxName: tool.name, slug, status: 'not_found', changedFields: [] })
      continue
    }

    seenSlugs.add(slug)

    const current = dbTool.translations[0]
    const next = computeNewValues(tool)
    const changedFields = diffFields(current, next)

    if (execute && changedFields.length > 0) {
      await prisma.toolTranslation.update({
        where: { toolId_locale: { toolId: dbTool.id, locale: 'de' } },
        data: {
          ...(next.shortDescription !== undefined ? { shortDescription: next.shortDescription } : {}),
          ...(next.longDescription !== undefined ? { longDescription: next.longDescription } : {}),
          ...(next.strengths !== undefined ? { strengths: next.strengths } : {}),
          ...(next.weaknesses !== undefined ? { weaknesses: next.weaknesses } : {}),
          ...(next.bestFor !== undefined ? { bestFor: next.bestFor } : {}),
          ...(next.notIdealFor !== undefined ? { notIdealFor: next.notIdealFor } : {}),
          ...(next.features !== undefined ? { features: next.features } : {}),
          ...(next.faqItems !== undefined
            ? { faqItems: next.faqItems.length > 0 ? next.faqItems : PrismaNS.DbNull }
            : {}),
        },
      })
    }

    results.push({ docxName: tool.name, slug, status: 'matched', changedFields })
  }

  // ─── Detaillierter Report ────────────────────────────────────────────────

  console.log('  ─── Detaillierter Report ───────────────────────────────────\n')
  console.log(`  ${'DOCX-Name'.padEnd(36)} ${'Slug'.padEnd(22)} ${'Gefunden?'.padEnd(11)} Felder die geändert ${!execute ? 'würden' : 'wurden'}`)
  console.log(`  ${'─'.repeat(36)} ${'─'.repeat(22)} ${'─'.repeat(11)} ${'─'.repeat(40)}`)

  for (const r of results) {
    const nameCol = r.docxName.slice(0, 34).padEnd(36)
    const slugCol = (r.slug ?? '—').padEnd(22)
    let foundCol: string
    let fieldsCol: string

    switch (r.status) {
      case 'matched':
        foundCol = 'JA'.padEnd(11)
        fieldsCol = r.changedFields.length > 0 ? r.changedFields.join(', ') : '(keine Änderung)'
        break
      case 'skipped_duplicate':
        foundCol = '—'.padEnd(11)
        fieldsCol = `ÜBERSPRUNGEN — ${r.note}`
        break
      case 'not_found':
        foundCol = 'NEIN'.padEnd(11)
        fieldsCol = r.slug === null ? 'kein DB-Slug ermittelbar' : 'Tool/Übersetzung nicht in DB'
        break
    }

    console.log(`  ${nameCol} ${slugCol} ${foundCol} ${fieldsCol}`)
  }

  // ─── Zusammenfassung ──────────────────────────────────────────────────────

  const matched = results.filter((r) => r.status === 'matched').length
  const notFound = results.filter((r) => r.status === 'not_found').length
  const skipped = results.filter((r) => r.status === 'skipped_duplicate').length

  console.log('\n  ─── Zusammenfassung ────────────────────────────────────────\n')
  console.log(`  ✓ Gematcht:                ${matched}`)
  console.log(`  ✗ Nicht gefunden:          ${notFound}`)
  console.log(`  ↷ Übersprungen (Duplikat): ${skipped}`)
  console.log(`\n  Gesamt DOCX-Abschnitte: ${results.length}`)

  console.log('\n  ℹ  Hinweis: DB-Slug "lexoffice" wird von keinem DOCX-Abschnitt')
  console.log('     angesprochen und bleibt unverändert (siehe Aufgabe 3 —')
  console.log('     "lexoffice: KEIN Update, wird über Lexware Office abgedeckt").')

  if (!execute) {
    console.log('\n  ℹ  DRY-RUN — keine DB-Änderungen.')
    console.log('  Mit --execute werden die Inhalte in die DB geschrieben.')
  }

  console.log('\n═══════════════════════════════════════════════════════════\n')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[update-tool-content] Fehler:', err)
  process.exit(1)
})
