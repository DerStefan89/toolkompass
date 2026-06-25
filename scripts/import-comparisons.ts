/**
 * Datei: scripts/import-comparisons.ts
 *
 * Zweck: Liest Vergleichs-DOCX (ein Artikel pro Datei) via mammoth → HTML,
 * parst die Heading-/Tabellen-Struktur und legt Comparison-Einträge an
 * (inkl. rows, features, sections, alternatives, decisionGuide, targetGroups,
 * faqItems). Wiederverwendbar für weitere DOCX im selben Format.
 *
 * SICHER PER DEFAULT: Ohne --execute wird NICHTS geschrieben (Dry-Run).
 *
 * Ausführen:
 *   npx tsx scripts/import-comparisons.ts --dry-run
 *     → zeigt pro Artikel, was passieren würde (kein DB-Zugriff zum Schreiben)
 *   npx tsx scripts/import-comparisons.ts --execute
 *     → schreibt (published bleibt false)
 *   npx tsx scripts/import-comparisons.ts --execute --publish
 *     → schreibt UND setzt published=true
 *
 * Optional: DOCX-Pfade als Argumente. Ohne Argumente werden die beiden
 * Standard-Dateien im Projektroot verwendet.
 *
 * Struktur der DOCX (an beiden Artikeln verifiziert):
 *   H1 = Titel · H2 = Sektions-Marker · H3 = Unterblöcke
 *   Tabelle "Kategorie|A|B" → rows · Tabelle "Funktion|A|B" → features
 *   Tool-Namen aus den Tabellen-Headern (Spalte 2 = A, Spalte 3 = B)
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import mammoth from 'mammoth'
import type { PrismaClient, Prisma } from '@prisma/client'
import { toSlug } from '../lib/utils/form'

let prisma: PrismaClient

// Standard-DOCX im Projektroot (nicht im Git — liegen zur Laufzeit dort).
// Die 19 Vergleichs-DOCX. Die 2 bereits importierten + publizierten Lexware-
// Artikel sind bewusst NICHT enthalten (ein späterer --execute würde sie sonst
// auf published=false zurücksetzen). Bei Bedarf als CLI-Argument übergeben.
const DEFAULT_DOCX = [
  'Accountable vs sevdesk Vergleich.docx',
  'Asana vs monday.com Vergleich.docx',
  'Asana vs Trello Vergleich.docx',
  'Calendly vs Cal.com Vergleich.docx',
  'Canva vs Adobe Express Vergleich.docx',
  'ClickUp vs Asana Vergleich.docx',
  'ClickUp vs monday.com Vergleich.docx',
  'ClickUp vs Trello Vergleich.docx',
  'HubSpot vs Brevo Vergleich.docx',
  'HubSpot vs Pipedrive Vergleich.docx',
  'Kontist vs N26 Business.docx',
  'Make vs n8n- Welches Automatisierungstool passt besser-.docx',
  'Make vs Zapier- Welches Automatisierungstool passt besser-.docx',
  'Pipedrive vs monday CRM.docx',
  'Pipedrive vs Zoho CRM.docx',
  'Pleo vs Moss Vergleich.docx',
  'Qonto vs Finom Vergleich.docx',
  'Qonto vs Kontist Vergleich.docx',
  'Zapier vs n8n- Welches Automatisierungstool passt besser-.docx',
]

// Tool-Alias-Map: Tabellen-Header-Name (lowercase) → tatsächlicher DB-Slug,
// für bekannte Abweichungen. Wird in findTool zusätzlich zum Namens-/Slug-Match
// konsultiert.
const TOOL_SLUG_ALIASES: Record<string, string> = {
  'monday.com': 'monday-crm',
  'monday crm': 'monday-crm',
  'cal.com': 'cal-com',
  'n26 business': 'n26-business',
  'adobe express': 'adobe-express',
  'zoho crm': 'zoho-crm',
  'hubspot': 'hubspot-crm',
  'pipedrive': 'pipedrive',
}

// Bekannte Alternativen-Tools — Fallback, wenn ein Artikel keine strukturierte
// "Alternativen zu …"-Sektion mit H3-Unterblöcken hat.
const FALLBACK_ALTERNATIVES = ['Papierkram', 'FastBill', 'BuchhaltungsButler', 'Accountable']

// ============================================================
// TYPEN
// ============================================================

type BlockTag = 'h1' | 'h2' | 'h3' | 'p' | 'ul'
type Block = { tag: BlockTag; html: string }

type H2Section = {
  heading: string
  direct: Block[]
  subs: Array<{ heading: string; blocks: Block[] }>
}

type ParsedComparison = {
  title: string
  slug: string | null
  subtitle: string | null
  verdict: string
  keyDifference: string | null
  decisionGuide: { toolA: string[]; toolB: string[]; alternatives: string[] } | null
  targetGroups: { toolA: string[]; toolB: string[] } | null
  sections: Array<{ heading: string; content: string }>
  features: Array<{ feature: string; toolAValue: string; toolBValue: string }>
  rows: Array<{ criterion: string; toolAValue: string; toolBValue: string }>
  alternatives: Array<{ name: string; reason: string }>
  faqItems: Array<{ question: string; answer: string }>
  toolAName: string | null
  toolBName: string | null
}

// ============================================================
// HTML-HILFSFUNKTIONEN (übernommen aus update-tool-content.ts)
// ============================================================

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function stripAnchor(html: string): string {
  return html.replace(/<a[^>]*>[\s\S]*?<\/a>/g, '')
}

function headingText(html: string): string {
  return decodeEntities(stripAnchor(html)).trim()
}

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

/** Stichpunkte aus Blöcken: <ul>-Items ODER •-getrennte Absätze. */
function blockBullets(blocks: Block[]): string[] {
  const out: string[] = []
  for (const b of blocks) {
    if (b.tag === 'ul') {
      out.push(...extractListItems(b.html))
    } else if (b.tag === 'p') {
      const text = htmlInlineToText(b.html)
      const parts = text.split(/\s*[•·]\s*|\n+/).map((s) => s.trim()).filter(Boolean)
      out.push(...parts)
    }
  }
  return out
}

// ============================================================
// TABELLEN
// ============================================================

/** Text einer Tabellenzelle (entfernt <p>-Wrapper, verbindet Zeilen). */
function cellText(html: string): string {
  const parts: string[] = []
  const pRe = /<p>([\s\S]*?)<\/p>/g
  let pm: RegExpExecArray | null
  let found = false
  while ((pm = pRe.exec(html))) {
    found = true
    const t = htmlInlineToText(pm[1])
    if (t) parts.push(t)
  }
  if (!found) {
    const t = htmlInlineToText(html)
    if (t) parts.push(t)
  }
  return parts.join(' ').trim()
}

function extractTables(html: string): string[][][] {
  const tables: string[][][] = []
  const tableRe = /<table[\s\S]*?<\/table>/g
  let tm: RegExpExecArray | null
  while ((tm = tableRe.exec(html))) {
    const tableHtml = tm[0]
    const rows: string[][] = []
    const trRe = /<tr>([\s\S]*?)<\/tr>/g
    let rm: RegExpExecArray | null
    while ((rm = trRe.exec(tableHtml))) {
      const cells: string[] = []
      const tdRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g
      let cm: RegExpExecArray | null
      while ((cm = tdRe.exec(rm[1]))) {
        cells.push(cellText(cm[1]))
      }
      if (cells.length > 0) rows.push(cells)
    }
    if (rows.length > 0) tables.push(rows)
  }
  return tables
}

function classifyTables(tables: string[][][]): {
  rows: ParsedComparison['rows']
  features: ParsedComparison['features']
  toolAName: string | null
  toolBName: string | null
} {
  let rows: ParsedComparison['rows'] = []
  let features: ParsedComparison['features'] = []
  let toolAName: string | null = null
  let toolBName: string | null = null

  for (const table of tables) {
    const header = table[0] ?? []
    const h0 = (header[0] ?? '').toLowerCase()
    const dataRows = table.slice(1).filter((r) => (r[0] ?? '').trim())

    if (/kategorie|kriterium|merkmal/.test(h0)) {
      rows = dataRows.map((r) => ({ criterion: r[0] ?? '', toolAValue: r[1] ?? '', toolBValue: r[2] ?? '' }))
      toolAName = toolAName ?? (header[1] || null)
      toolBName = toolBName ?? (header[2] || null)
    } else if (/funktion|feature/.test(h0)) {
      features = dataRows.map((r) => ({ feature: r[0] ?? '', toolAValue: r[1] ?? '', toolBValue: r[2] ?? '' }))
      toolAName = toolAName ?? (header[1] || null)
      toolBName = toolBName ?? (header[2] || null)
    }
  }

  return { rows, features, toolAName, toolBName }
}

// ============================================================
// BLOCK-WALK (Heading-Struktur ohne Tabellen)
// ============================================================

function parseBlocks(htmlWithoutTables: string): Block[] {
  const blockRe = /<(h1|h2|h3|p|ul)>([\s\S]*?)<\/\1>/g
  const blocks: Block[] = []
  let m: RegExpExecArray | null
  while ((m = blockRe.exec(htmlWithoutTables))) {
    blocks.push({ tag: m[1] as BlockTag, html: m[2] })
  }
  return blocks
}

function buildH2Sections(blocks: Block[]): { title: string; h2s: H2Section[] } {
  let title = ''
  const h2s: H2Section[] = []
  let curH2: H2Section | null = null
  let curSub: { heading: string; blocks: Block[] } | null = null

  for (const b of blocks) {
    if (b.tag === 'h1') {
      if (!title) title = headingText(b.html)
      continue
    }
    if (b.tag === 'h2') {
      curH2 = { heading: headingText(b.html), direct: [], subs: [] }
      h2s.push(curH2)
      curSub = null
      continue
    }
    if (b.tag === 'h3') {
      if (!curH2) continue
      curSub = { heading: headingText(b.html), blocks: [] }
      curH2.subs.push(curSub)
      continue
    }
    // p / ul
    if (!curH2) continue
    if (curSub) curSub.blocks.push(b)
    else curH2.direct.push(b)
  }

  return { title, h2s }
}

// ============================================================
// PARSER: DOCX → ParsedComparison
// ============================================================

async function parseComparisonDocx(docxPath: string): Promise<ParsedComparison> {
  const result = await mammoth.convertToHtml(
    { path: docxPath },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
      ],
    }
  )
  const html = result.value

  // Tabellen zuerst extrahieren, dann aus dem HTML entfernen (für den Block-Walk)
  const tables = extractTables(html)
  const { rows, features, toolAName, toolBName } = classifyTables(tables)
  const htmlNoTables = html.replace(/<table[\s\S]*?<\/table>/g, '')

  const { title, h2s } = buildH2Sections(parseBlocks(htmlNoTables))

  const parsed: ParsedComparison = {
    title,
    slug: null,
    subtitle: null,
    verdict: '',
    keyDifference: null,
    decisionGuide: null,
    targetGroups: null,
    sections: [],
    features,
    rows,
    alternatives: [],
    faqItems: [],
    toolAName,
    toolBName,
  }

  const containsName = (heading: string, name: string | null) =>
    !!name && heading.toLowerCase().includes(name.toLowerCase())

  for (const h2 of h2s) {
    const h = h2.heading
    const hl = h.toLowerCase()

    // Ab "SEO Vorgaben" nur noch Slug/Meta ziehen, sonst alles ignorieren
    if (/seo\s*vorgaben|seo\b/.test(hl)) {
      for (const text of getParagraphs(h2.direct)) {
        const slugMatch = text.match(/url\s*slug\s*:?\s*(\S.*)/i)
        if (slugMatch) parsed.slug = toSlug(slugMatch[1])
        const metaMatch = text.match(/meta\s*description\s*:?\s*(\S.*)/i)
        if (metaMatch) parsed.subtitle = metaMatch[1].trim()
      }
      break
    }

    if (/kurzfazit/.test(hl)) {
      parsed.verdict = getParagraphs(h2.direct).join('\n\n')
      continue
    }

    if (/schnelle entscheidung/.test(hl)) {
      const dg = { toolA: [] as string[], toolB: [] as string[], alternatives: [] as string[] }
      for (const sub of h2.subs) {
        const bullets = blockBullets(sub.blocks)
        if (/alternativ/i.test(sub.heading)) dg.alternatives.push(...bullets)
        else if (containsName(sub.heading, toolBName)) dg.toolB.push(...bullets)
        else if (containsName(sub.heading, toolAName)) dg.toolA.push(...bullets)
      }
      if (dg.toolA.length || dg.toolB.length || dg.alternatives.length) parsed.decisionGuide = dg
      continue
    }

    if (/wichtigste unterschied/.test(hl)) {
      const text = getParagraphs(h2.direct).join('\n\n')
      if (text) parsed.keyDifference = text
      continue
    }

    if (/^für wen ist/.test(hl) || /für wen ist/.test(hl)) {
      const bullets = [...blockBullets(h2.direct), ...h2.subs.flatMap((s) => blockBullets(s.blocks))]
      if (containsName(h, toolBName)) {
        parsed.targetGroups = parsed.targetGroups ?? { toolA: [], toolB: [] }
        parsed.targetGroups.toolB.push(...bullets)
      } else if (containsName(h, toolAName)) {
        parsed.targetGroups = parsed.targetGroups ?? { toolA: [], toolB: [] }
        parsed.targetGroups.toolA.push(...bullets)
      }
      continue
    }

    if (/^alternativen|alternativen zu/.test(hl)) {
      for (const sub of h2.subs) {
        const reason = getParagraphs(sub.blocks).join(' ')
        if (sub.heading) parsed.alternatives.push({ name: sub.heading, reason })
      }
      continue
    }

    if (/häufige fragen|faq/.test(hl)) {
      for (const sub of h2.subs) {
        const answer = getParagraphs(sub.blocks).join('\n\n')
        if (sub.heading && answer) parsed.faqItems.push({ question: sub.heading, answer })
      }
      continue
    }

    // Sonst: generische Textsektion (nur wenn Inhalt vorhanden)
    const content = getParagraphs(h2.direct).join('\n\n')
    if (content) parsed.sections.push({ heading: h, content })
  }

  // Fallback Slug: aus Titel vor dem ":" generieren
  if (!parsed.slug && parsed.title) {
    parsed.slug = toSlug(parsed.title.split(':')[0])
  }

  // Fallback Alternativen: keine strukturierte Sektion → bekannte Alt-Tools aus dem Text
  if (parsed.alternatives.length === 0) {
    const plain = htmlInlineToText(htmlNoTables).toLowerCase()
    const mainNames = [parsed.toolAName, parsed.toolBName]
      .filter(Boolean)
      .map((n) => (n as string).toLowerCase())
    for (const name of FALLBACK_ALTERNATIVES) {
      const lower = name.toLowerCase()
      const isMain = mainNames.some((m) => m.includes(lower) || lower.includes(m))
      if (!isMain && plain.includes(lower)) {
        parsed.alternatives.push({ name, reason: '' })
      }
    }
  }

  return parsed
}

// ============================================================
// TOOL-MAPPING
// ============================================================

type ToolMatch = { id: string; slug: string; name: string }

const toolSelect = {
  id: true,
  slug: true,
  translations: { where: { locale: 'de' as const }, select: { name: true }, take: 1 },
}

async function findTool(name: string): Promise<ToolMatch | null> {
  const clean = name.trim()
  if (!clean) return null

  // 1) Exakter Translation-Name (case-insensitive)
  const byName = await prisma.tool.findFirst({
    where: { translations: { some: { locale: 'de', name: { equals: clean, mode: 'insensitive' } } } },
    select: toolSelect,
  })
  if (byName) return { id: byName.id, slug: byName.slug, name: byName.translations[0]?.name ?? byName.slug }

  // 2) Slug-Kandidaten: erst Alias-Map, dann normalisierter Slug
  const candidates: string[] = []
  const alias = TOOL_SLUG_ALIASES[clean.toLowerCase()]
  if (alias) candidates.push(alias)
  const normalized = toSlug(clean)
  if (!candidates.includes(normalized)) candidates.push(normalized)

  for (const slug of candidates) {
    const bySlug = await prisma.tool.findUnique({ where: { slug }, select: toolSelect })
    if (bySlug) return { id: bySlug.id, slug: bySlug.slug, name: bySlug.translations[0]?.name ?? bySlug.slug }
  }

  return null
}

// ============================================================
// SCHREIBEN
// ============================================================

function scalarData(parsed: ParsedComparison, PrismaNS: typeof Prisma) {
  return {
    title: parsed.title || null,
    subtitle: parsed.subtitle ?? null,
    verdict: parsed.verdict,
    keyDifference: parsed.keyDifference ?? null,
    decisionGuide: parsed.decisionGuide
      ? (parsed.decisionGuide as Prisma.InputJsonValue)
      : PrismaNS.DbNull,
    targetGroups: parsed.targetGroups
      ? (parsed.targetGroups as Prisma.InputJsonValue)
      : PrismaNS.DbNull,
    faqItems: parsed.faqItems.length > 0
      ? (parsed.faqItems as Prisma.InputJsonValue)
      : PrismaNS.DbNull,
  }
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma
  const { Prisma: PrismaNS } = await import('@prisma/client')

  const argv = process.argv.slice(2)
  const execute = argv.includes('--execute')
  const publish = argv.includes('--publish')
  const fileArgs = argv.filter((a) => !a.startsWith('--'))
  const docxFiles = (fileArgs.length > 0 ? fileArgs : DEFAULT_DOCX).map((f) =>
    path.isAbsolute(f) ? f : path.join(process.cwd(), f)
  )

  console.log('═══════════════════════════════════════════════════')
  console.log(execute ? '  MODUS: SCHREIBEN (--execute)' : '  MODUS: DRY-RUN (kein Schreibzugriff)')
  if (execute) console.log(`  published: ${publish ? 'true (--publish)' : 'false'}`)
  console.log('═══════════════════════════════════════════════════\n')

  let importable = 0
  let skipped = 0
  let warnings = 0

  for (const docxPath of docxFiles) {
    const fileName = path.basename(docxPath)
    console.log(`\n── ${fileName} ─────────────────────────────────────`)

    if (!fs.existsSync(docxPath)) {
      console.log(`  ⚠️  Datei nicht gefunden: ${docxPath} — übersprungen`)
      skipped++; warnings++
      continue
    }

    const parsed = await parseComparisonDocx(docxPath)

    console.log(`  Titel:    ${parsed.title || '(fehlt)'}`)
    console.log(`  Slug:     ${parsed.slug ?? '(konnte nicht bestimmt werden)'}`)
    console.log(`  Subtitle: ${parsed.subtitle ?? '(keine)'}`)

    // Haupt-Tools mappen
    const toolA = parsed.toolAName ? await findTool(parsed.toolAName) : null
    const toolB = parsed.toolBName ? await findTool(parsed.toolBName) : null
    console.log(`  Tool A:   "${parsed.toolAName ?? '(?)'}" → ${toolA ? `gefunden [${toolA.slug}]` : 'NICHT GEFUNDEN'}`)
    console.log(`  Tool B:   "${parsed.toolBName ?? '(?)'}" → ${toolB ? `gefunden [${toolB.slug}]` : 'NICHT GEFUNDEN'}`)

    console.log(`  verdict:        ${parsed.verdict ? `vorhanden (${parsed.verdict.length} Zeichen)` : 'FEHLT (Pflichtfeld!)'}`)
    console.log(`  keyDifference:  ${parsed.keyDifference ? 'vorhanden' : '–'}`)
    console.log(`  rows:           ${parsed.rows.length}`)
    console.log(`  features:       ${parsed.features.length}`)
    console.log(`  sections:       ${parsed.sections.length}${parsed.sections.length ? ' (' + parsed.sections.map(s => s.heading).join(', ') + ')' : ''}`)
    console.log(`  decisionGuide:  ${parsed.decisionGuide ? `A=${parsed.decisionGuide.toolA.length} B=${parsed.decisionGuide.toolB.length} Alt=${parsed.decisionGuide.alternatives.length}` : '–'}`)
    console.log(`  targetGroups:   ${parsed.targetGroups ? `A=${parsed.targetGroups.toolA.length} B=${parsed.targetGroups.toolB.length}` : '–'}`)
    console.log(`  faqItems:       ${parsed.faqItems.length}`)

    // Alternativen mappen
    const altMatches: Array<{ toolId: string; reason: string }> = []
    console.log(`  Alternativen:   ${parsed.alternatives.length} im Artikel`)
    for (const alt of parsed.alternatives) {
      const match = await findTool(alt.name)
      if (match) {
        altMatches.push({ toolId: match.id, reason: alt.reason })
        console.log(`     • "${alt.name}" → gefunden [${match.slug}]`)
      } else {
        console.log(`     • "${alt.name}" → NICHT GEFUNDEN — übersprungen`)
        warnings++
      }
    }

    // Pflichtprüfungen
    if (!toolA || !toolB) {
      console.log('  ⛔ Haupt-Tool(s) fehlen — Artikel wird ÜBERSPRUNGEN.')
      skipped++; warnings++
      continue
    }
    if (!parsed.verdict) {
      console.log('  ⛔ verdict (Pflichtfeld) fehlt — Artikel wird ÜBERSPRUNGEN.')
      skipped++; warnings++
      continue
    }
    if (!parsed.slug) {
      console.log('  ⛔ Slug konnte nicht bestimmt werden — Artikel wird ÜBERSPRUNGEN.')
      skipped++; warnings++
      continue
    }

    const existing = await prisma.comparison.findUnique({ where: { slug: parsed.slug }, select: { id: true } })
    const action = existing ? 'UPDATE' : 'CREATE'
    console.log(`  → Würde: ${action} (Slug ${existing ? 'existiert' : 'neu'})`)

    importable++

    if (!execute) continue

    // ── Schreiben ──
    const scalars = scalarData(parsed, PrismaNS)
    const rowsCreate = parsed.rows.map((r, i) => ({ ...r, sortOrder: i }))
    const featuresCreate = parsed.features.map((f, i) => ({ ...f, sortOrder: i }))
    const sectionsCreate = parsed.sections.map((s, i) => ({ ...s, sortOrder: i }))
    const altCreate = altMatches.map((a, i) => ({
      reason: a.reason,
      sortOrder: i,
      tool: { connect: { id: a.toolId } },
    }))

    try {
      if (existing) {
        await prisma.comparison.update({
          where: { id: existing.id },
          data: {
            ...scalars,
            published: publish,
            toolAId: toolA.id,
            toolBId: toolB.id,
            rows: { deleteMany: {}, create: rowsCreate },
            features: { deleteMany: {}, create: featuresCreate },
            sections: { deleteMany: {}, create: sectionsCreate },
            alternatives: { deleteMany: {}, create: altCreate },
          },
        })
        console.log(`  ✅ aktualisiert: ${parsed.slug}`)
      } else {
        await prisma.comparison.create({
          data: {
            slug: parsed.slug,
            published: publish,
            toolAId: toolA.id,
            toolBId: toolB.id,
            ...scalars,
            rows: { create: rowsCreate },
            features: { create: featuresCreate },
            sections: { create: sectionsCreate },
            alternatives: { create: altCreate },
          },
        })
        console.log(`  ✅ angelegt: ${parsed.slug}`)
      }
    } catch (err) {
      console.error(`  ⛔ Schreibfehler bei ${parsed.slug}:`, err)
      warnings++
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Zusammenfassung: ${importable} importierbar · ${skipped} übersprungen · ${warnings} Warnungen`)
  if (!execute) {
    console.log('  (Dry-Run — nichts geschrieben. Mit --execute schreiben.)')
  }
  console.log('═══════════════════════════════════════════════════')

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
