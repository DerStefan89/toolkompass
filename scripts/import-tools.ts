/**
 * Datei: scripts/import-tools.ts
 *
 * Zweck: Parser + Importer für Tools aus Content_Website/*.md.
 *
 * Ausführen:
 *   npx tsx scripts/import-tools.ts --dry-run   → Report ohne DB-Writes
 *   npx tsx scripts/import-tools.ts              → schreibt in DB
 *
 * Zwei Content-Formate:
 *   Format A (14 Dateien): YAML-Frontmatter, **Slug:** pro Tool
 *   Format B (buchhaltung-rechnungen.md): kein Frontmatter, kein **Slug:**
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'

// Prisma wird in main() dynamisch geladen, NACHDEM dotenv .env.local mit override:true
// gesetzt hat. Esbuild hoistet alle statischen imports, daher darf prisma NICHT statisch
// importiert werden — sonst würde der Pool mit DATABASE_URL aus .env (localhost) gebildet.
let prisma: PrismaClient

// ============================================================
// CONSTANTS
// ============================================================

/** hasFreePlan-Korrekturen für Format B (kein Free-Plan-Feld im Body). */
const FORMAT_B_FREE_PLAN_MAP: Record<string, boolean> = {
  'sevdesk': true,
  'lexware-office': false,
  'fastbill': false,
  'papierkram': true,
  'buchhaltungsbutler': false,
  'accountable': true,
  'wiso-meinburo': true,
}

// ============================================================
// TYPES
// ============================================================

interface ParsedTool {
  name: string
  slug: string
  hasFreePlan: boolean
  shortDescription: string     // Tagline, max 160 chars
  longDescription: string      // Kurzfazit + Alternativen
  strengths: string[]
  weaknesses: string[]
  features: string[]
  bestFor: string[]
  notIdealFor: string[]
  categorySlug: string
  sourceFile: string
}

interface FileReport {
  file: string
  categorySlug: string
  categoryName: string
  format: 'A' | 'B'
  toolCount: number
  skipped: string[]
  tools: string[]
}

interface ImportReport {
  files: FileReport[]
  summary: {
    totalParsed: number
    existingInDb: string[]
    newTools: string[]
    categorySlugsNeeded: string[]
    categorySlugsInDb: string[]
    categorySlugsNotInDb: string[]
    existingVendorSlugs: string[]
  }
  warnings: {
    taglineTooLong: Array<{ tool: string; sourceFile: string; length: number }>
    missingNameOrTagline: string[]
    categoryNotInDb: string[]
    duplicateSlugsInContent: string[]
    emptyStrengths: string[]
    emptyFeatures: string[]
  }
}

interface UniqueToolEntry {
  tool: ParsedTool
  categorySlugs: string[]
}

interface WriteResult {
  toolsUpserted: number
  toolsNew: number
  toolsUpdated: number
  vendorsCreated: number
  categoryLinksCreated: number
  errors: Array<{ slug: string; error: string }>
}

// ============================================================
// HELPERS — PARSING
// ============================================================

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Section headings that are never Tool sections. */
const SKIP_SECTION_TITLES = new Set([
  'so ist die kategorie aufgebaut',
  'vergleich auf einen blick',
  'häufige fragen',
  'faq',
  'hinweis zur aktualität',
  'hinweis',
])

function shouldSkip(heading: string): boolean {
  return SKIP_SECTION_TITLES.has(heading.toLowerCase().trim())
}

/** Parse `key: value` YAML frontmatter block. */
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    result[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim()
  }
  return result
}

/**
 * Find a line containing **boldKey** and return the text after it.
 * Works for both `**Field:** value` and `**Field?** value` patterns.
 */
function extractInlineField(lines: string[], boldKey: string): string {
  const pattern = `**${boldKey}**`
  for (const line of lines) {
    const idx = line.indexOf(pattern)
    if (idx !== -1) {
      return line.slice(idx + pattern.length).replace(/^[:\s]+/, '').trim()
    }
  }
  return ''
}

/** Split · separated values, trim each. */
function splitDot(raw: string): string[] {
  return raw.split(' · ').map(s => s.trim()).filter(Boolean)
}

/** Split content into sections that start with `## Heading`. */
function splitSections(lines: string[]): string[][] {
  const sections: string[][] = []
  let current: string[] = []
  for (const line of lines) {
    if (line.startsWith('## ') && current.length > 0) {
      sections.push(current)
      current = []
    }
    current.push(line)
  }
  if (current.length > 0) sections.push(current)
  return sections.filter(s => s[0].startsWith('## '))
}

// ============================================================
// FORMAT A PARSER
// ============================================================

function parseFormatA(
  section: string[],
  categorySlug: string,
  sourceFile: string,
): ParsedTool | null {
  const name = section[0].replace(/^##\s+/, '').trim()

  const slug = extractInlineField(section, 'Slug:')
  if (!slug) return null  // no **Slug:** → not a tool section

  const freePlanRaw = extractInlineField(section, 'Free-Plan:')
  const hasFreePlan = freePlanRaw.toLowerCase().startsWith('ja')

  const shortDescription = extractInlineField(section, 'Tagline:')

  // Kurzfazit: **Kurzfazit.** text (may be long single line)
  let kurzfazit = ''
  for (const line of section) {
    const marker = '**Kurzfazit.**'
    const idx = line.indexOf(marker)
    if (idx !== -1) {
      kurzfazit = line.slice(idx + marker.length).trim()
      break
    }
  }

  const strengths = splitDot(extractInlineField(section, 'Stärken:'))
  const weaknesses = splitDot(extractInlineField(section, 'Schwächen:'))
  const features = splitDot(extractInlineField(section, 'Funktionen:'))

  const bestForRaw = extractInlineField(section, 'Für wen geeignet?')
  const bestFor = bestForRaw ? [bestForRaw] : []

  const notIdealForRaw = extractInlineField(section, 'Für wen eher nicht?')
  const notIdealFor = notIdealForRaw ? [notIdealForRaw] : []

  const alternativesRaw = extractInlineField(section, 'Alternativen:')
  const longDescription = alternativesRaw
    ? `${kurzfazit}\n\nAlternativen: ${alternativesRaw}`
    : kurzfazit

  return {
    name, slug, hasFreePlan, shortDescription, longDescription,
    strengths, weaknesses, features, bestFor, notIdealFor,
    categorySlug, sourceFile,
  }
}

// ============================================================
// FORMAT B PARSER
// ============================================================

function parseFormatB(
  section: string[],
  categorySlug: string,
  sourceFile: string,
): ParsedTool | null {
  const name = section[0].replace(/^##\s+/, '').trim()
  const slug = toSlug(name)

  // Tagline: first *kursive Linie* after the ## heading
  let shortDescription = ''
  for (const line of section.slice(1, 6)) {
    const italicMatch = line.match(/^\*([^*]+)\*\.?$/)
    if (italicMatch) {
      shortDescription = italicMatch[1].replace(/\.$/, '').trim()
      break
    }
  }

  // Kurzfazit
  let kurzfazit = ''
  for (const line of section) {
    const marker = '**Kurzfazit.**'
    const idx = line.indexOf(marker)
    if (idx !== -1) {
      kurzfazit = line.slice(idx + marker.length).trim()
      break
    }
  }

  // hasFreePlan: not available in Format B body — corrected later via FORMAT_B_FREE_PLAN_MAP
  const hasFreePlan = false

  // Stärken / Schwächen: standalone **Header** followed by bullet list
  const strengths: string[] = []
  const weaknesses: string[] = []
  const features: string[] = []
  type BulletMode = 'none' | 'staerken' | 'schwaechen'
  let mode: BulletMode = 'none'

  for (const line of section) {
    if (line.trim() === '**Stärken**') { mode = 'staerken'; continue }
    if (line.trim() === '**Schwächen**') { mode = 'schwaechen'; continue }

    // Bullet item
    if (line.startsWith('- ')) {
      if (mode === 'staerken') { strengths.push(line.slice(2).trim()); continue }
      if (mode === 'schwaechen') { weaknesses.push(line.slice(2).trim()); continue }
    }

    // Any new bold-heading ends the current mode
    if (line.startsWith('**') && mode !== 'none') {
      mode = 'none'
    }

    // Features: **Funktionen.** text · text (inline, period in bold)
    const funkMarker = '**Funktionen.**'
    const funkIdx = line.indexOf(funkMarker)
    if (funkIdx !== -1) {
      const raw = line.slice(funkIdx + funkMarker.length).replace(/^[:\s]+/, '').trim()
      features.push(...splitDot(raw))
    }
  }

  const bestForRaw = extractInlineField(section, 'Für wen geeignet?')
  const bestFor = bestForRaw ? [bestForRaw] : []

  const notIdealForRaw = extractInlineField(section, 'Für wen eher nicht?')
  const notIdealFor = notIdealForRaw ? [notIdealForRaw] : []

  const alternativesRaw = extractInlineField(section, 'Alternativen:')
  const longDescription = alternativesRaw
    ? `${kurzfazit}\n\nAlternativen: ${alternativesRaw}`
    : kurzfazit

  return {
    name, slug, hasFreePlan, shortDescription, longDescription,
    strengths, weaknesses, features, bestFor, notIdealFor,
    categorySlug, sourceFile,
  }
}

// ============================================================
// FILE PARSER
// ============================================================

function parseFile(filePath: string): { report: FileReport; tools: ParsedTool[] } {
  const filename = path.basename(filePath)
  const rawContent = fs.readFileSync(filePath, 'utf-8')

  const isFormatA = rawContent.includes('**Slug:**')
  const format: 'A' | 'B' = isFormatA ? 'A' : 'B'

  // Category slug + name
  let categorySlug = ''
  let categoryName = ''
  if (isFormatA) {
    const fm = parseFrontmatter(rawContent)
    categorySlug = fm['slug'] ?? ''
    categoryName = fm['kategorie'] ?? ''
  } else {
    const match = filename.match(/toolsucher_(.+)\.md$/)
    categorySlug = match ? match[1] : ''
    const h1Match = rawContent.match(/^#\s+(.+)$/m)
    categoryName = h1Match ? h1Match[1].trim() : categorySlug
  }

  const lines = rawContent.replace(/\r\n/g, '\n').split('\n')
  const sections = splitSections(lines)

  const skipped: string[] = []
  const tools: ParsedTool[] = []

  for (const section of sections) {
    const heading = section[0].replace(/^##\s+/, '').trim()

    if (shouldSkip(heading)) {
      skipped.push(heading)
      continue
    }

    const tool = isFormatA
      ? parseFormatA(section, categorySlug, filename)
      : parseFormatB(section, categorySlug, filename)

    if (tool) {
      tools.push(tool)
    } else {
      skipped.push(heading)
    }
  }

  return {
    report: {
      file: filename,
      categorySlug,
      categoryName,
      format,
      toolCount: tools.length,
      skipped,
      tools: tools.map(t => t.name),
    },
    tools,
  }
}

// ============================================================
// WRITE HELPERS
// ============================================================

/** Apply FORMAT_B corrections and any other post-parse fixes. */
function applyCorrections(tools: ParsedTool[]): ParsedTool[] {
  return tools.map(t => {
    const corrected = FORMAT_B_FREE_PLAN_MAP[t.slug]
    if (corrected !== undefined) {
      return { ...t, hasFreePlan: corrected }
    }
    return t
  })
}

/**
 * Merge duplicate slugs: one tool record, all category slugs collected.
 * First occurrence wins for tool field data.
 */
function deduplicateTools(tools: ParsedTool[]): UniqueToolEntry[] {
  const map = new Map<string, UniqueToolEntry>()
  for (const tool of tools) {
    const existing = map.get(tool.slug)
    if (existing) {
      if (!existing.categorySlugs.includes(tool.categorySlug)) {
        existing.categorySlugs.push(tool.categorySlug)
      }
    } else {
      map.set(tool.slug, { tool, categorySlugs: [tool.categorySlug] })
    }
  }
  return [...map.values()]
}

// ============================================================
// DB WRITE
// ============================================================

async function writeToDB(
  allTools: ParsedTool[],
  categoryNameMap: Map<string, string>,
  existingToolSlugs: Set<string>,
): Promise<WriteResult> {
  const corrected = applyCorrections(allTools)
  const uniqueEntries = deduplicateTools(corrected)

  const result: WriteResult = {
    toolsUpserted: 0,
    toolsNew: 0,
    toolsUpdated: 0,
    vendorsCreated: 0,
    categoryLinksCreated: 0,
    errors: [],
  }

  // Pre-load existing vendor slugs to track new creations
  const existingVendors = await prisma.vendor.findMany({ select: { slug: true } })
  const existingVendorSlugs = new Set(existingVendors.map(v => v.slug))

  // Category ID cache to avoid redundant DB queries within the same run
  const categoryIdCache = new Map<string, string>()

  for (const { tool, categorySlugs } of uniqueEntries) {
    try {
      // a) Vendor upsert (slug = tool slug, name = tool name)
      const vendor = await prisma.vendor.upsert({
        where: { slug: tool.slug },
        create: { slug: tool.slug, name: tool.name },
        update: {},
        select: { id: true },
      })
      if (!existingVendorSlugs.has(tool.slug)) {
        result.vendorsCreated++
      }
      const vendorId = vendor.id

      // b) Category find-or-create for each categorySlug
      const categoryIds: string[] = []
      for (const catSlug of categorySlugs) {
        let categoryId = categoryIdCache.get(catSlug)
        if (!categoryId) {
          const catName = categoryNameMap.get(catSlug) ?? catSlug
          const category = await prisma.category.upsert({
            where: { slug: catSlug },
            create: {
              slug: catSlug,
              published: false,
              sortOrder: 0,
              translations: {
                create: { locale: 'de', name: catName, description: '' },
              },
            },
            update: {},
            select: { id: true },
          })
          categoryId = category.id
          categoryIdCache.set(catSlug, categoryId)
        }
        categoryIds.push(categoryId)
      }

      // c) Tool upsert by slug
      const toolRecord = await prisma.tool.upsert({
        where: { slug: tool.slug },
        create: {
          slug: tool.slug,
          hasFreePlan: tool.hasFreePlan,
          vendorId,
          published: false,
        },
        update: {
          hasFreePlan: tool.hasFreePlan,
          vendorId,
        },
        select: { id: true },
      })
      const toolId = toolRecord.id
      result.toolsUpserted++
      if (existingToolSlugs.has(tool.slug)) {
        result.toolsUpdated++
      } else {
        result.toolsNew++
      }

      // d) ToolTranslation upsert by { toolId, locale: 'de' }
      const translationData = {
        locale: 'de' as const,
        name: tool.name,
        shortDescription: tool.shortDescription.slice(0, 160),
        longDescription: tool.longDescription || null,
        features: tool.features,
        strengths: tool.strengths,
        weaknesses: tool.weaknesses,
        bestFor: tool.bestFor,
        notIdealFor: tool.notIdealFor,
      }
      await prisma.toolTranslation.upsert({
        where: { toolId_locale: { toolId, locale: 'de' } },
        create: { toolId, ...translationData },
        update: translationData,
      })

      // e) ToolCategory links — check existence first to count only new links
      for (const categoryId of categoryIds) {
        const existingLink = await prisma.toolCategory.findFirst({
          where: { toolId, categoryId },
          select: { toolId: true },
        })
        if (!existingLink) {
          await prisma.toolCategory.create({ data: { toolId, categoryId } })
          result.categoryLinksCreated++
        }
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push({ slug: tool.slug, error: msg })
    }
  }

  return result
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  // .env.local mit override:true MUSS als erstes laufen, bevor prisma geladen wird.
  // .env enthält DATABASE_URL=prisma+postgres://localhost:... (Fallback) — das würde
  // sonst den Pool mit der falschen URL initialisieren.
  dotenv.config({ path: '.env.local', override: true })
  const mod = await import('@/lib/prisma')
  prisma = mod.prisma

  const isDryRun = process.argv.includes('--dry-run')
  const mode = isDryRun ? 'DRY-RUN REPORT' : 'IMPORT'

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  ToolSucher Import — ${mode}`)
  console.log('═══════════════════════════════════════════════════\n')

  // ─── Lese Content-Dateien ───────────────────────────────────────────────────

  const contentDir = path.join(process.cwd(), 'Content_Website')
  const mdFiles = fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => path.join(contentDir, f))
    .sort()

  console.log(`📁 ${mdFiles.length} Markdown-Dateien gefunden in Content_Website/\n`)

  // ─── Parse alle Dateien ─────────────────────────────────────────────────────

  const allTools: ParsedTool[] = []
  const fileReports: FileReport[] = []
  const categoryNameMap = new Map<string, string>()

  for (const filePath of mdFiles) {
    const { report, tools } = parseFile(filePath)
    fileReports.push(report)
    allTools.push(...tools)
    if (report.categoryName) {
      categoryNameMap.set(report.categorySlug, report.categoryName)
    }

    const fmt = report.format
    const skippedStr = report.skipped.length > 0
      ? ` | übersprungen: [${report.skipped.join(', ')}]`
      : ''
    console.log(`  ${report.file}`)
    console.log(`    Format ${fmt} | Kategorie: ${report.categorySlug} | ${report.toolCount} Tools${skippedStr}`)
    if (report.tools.length > 0) {
      console.log(`    Tools: ${report.tools.join(', ')}`)
    }
    console.log()
  }

  // ─── DB-Reads (immer, auch beim Write) ─────────────────────────────────────

  console.log('🔍 Lese DB (read-only)...')
  let dbToolSlugs = new Set<string>()
  let dbCategorySlugs = new Set<string>()
  let dbVendorSlugs: string[] = []
  let dbAvailable = true

  try {
    const [dbTools, dbCategories, dbVendors] = await Promise.all([
      prisma.tool.findMany({ select: { slug: true } }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.vendor.findMany({ select: { slug: true } }),
    ])
    dbToolSlugs = new Set(dbTools.map(t => t.slug))
    dbCategorySlugs = new Set(dbCategories.map(c => c.slug))
    dbVendorSlugs = dbVendors.map(v => v.slug)
    console.log(`  ✓ DB erreichbar — ${dbTools.length} Tools, ${dbCategories.length} Kategorien, ${dbVendors.length} Vendors\n`)
  } catch {
    dbAvailable = false
    console.log('  ⚠ DB nicht erreichbar — Slug-Abgleich übersprungen (nur Parsing-Report)\n')
    if (!isDryRun) {
      console.error('  ✗ DB-Verbindung erforderlich für Import. Abbruch.')
      process.exit(1)
    }
  }

  // ─── Validierung ────────────────────────────────────────────────────────────

  const taglineTooLong: ImportReport['warnings']['taglineTooLong'] = []
  const missingNameOrTagline: string[] = []
  const emptyStrengths: string[] = []
  const emptyFeatures: string[] = []

  const seenSlugs = new Map<string, string>()
  const duplicateSlugs: string[] = []

  const categorySlugsNeeded = new Set<string>()

  for (const tool of allTools) {
    const label = `${tool.name} (${tool.sourceFile})`

    if (!tool.name || !tool.shortDescription) missingNameOrTagline.push(label)
    if (tool.shortDescription.length > 160) {
      taglineTooLong.push({ tool: tool.name, sourceFile: tool.sourceFile, length: tool.shortDescription.length })
    }
    if (tool.strengths.length === 0) emptyStrengths.push(label)
    if (tool.features.length === 0) emptyFeatures.push(label)

    if (seenSlugs.has(tool.slug)) {
      const existing = seenSlugs.get(tool.slug) ?? ''
      if (!duplicateSlugs.some(d => d.startsWith(tool.slug))) {
        duplicateSlugs.push(`${tool.slug} (${existing} + ${tool.sourceFile})`)
      }
    } else {
      seenSlugs.set(tool.slug, tool.sourceFile)
    }

    categorySlugsNeeded.add(tool.categorySlug)
  }

  const categorySlugsInDb = [...categorySlugsNeeded].filter(s => dbCategorySlugs.has(s))
  const categorySlugsNotInDb = [...categorySlugsNeeded].filter(s => !dbCategorySlugs.has(s))

  const existingInDb = allTools.filter(t => dbToolSlugs.has(t.slug)).map(t => t.slug)
  const newToolsList = allTools.filter(t => !dbToolSlugs.has(t.slug)).map(t => t.slug)

  // ─── Report ausgeben ────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  ZUSAMMENFASSUNG')
  console.log('═══════════════════════════════════════════════════\n')

  console.log(`  Tools geparst gesamt:  ${allTools.length}`)
  if (dbAvailable) {
    console.log(`  Bereits in DB:         ${existingInDb.length}  → ${existingInDb.join(', ') || '—'}`)
    console.log(`  Neu (nicht in DB):     ${newToolsList.length}`)
  } else {
    console.log(`  Slug-Abgleich:         ⚠ DB nicht erreichbar`)
  }
  console.log()
  console.log(`  Kategorien benötigt:   ${[...categorySlugsNeeded].join(', ')}`)
  if (dbAvailable) {
    console.log(`  Kategorien in DB:      ${categorySlugsInDb.join(', ') || '—'}`)
    console.log(`  Kategorien NICHT in DB (werden angelegt): ${categorySlugsNotInDb.join(', ') || '—'}`)
    console.log()
    console.log(`  Vendors in DB:         ${dbVendorSlugs.join(', ') || '—'}`)
  }
  console.log(`  ℹ  Vendor-Mapping:     Pro Tool ein Vendor (slug=tool-slug, name=tool-name)`)

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  WARNUNGEN')
  console.log('═══════════════════════════════════════════════════\n')

  if (taglineTooLong.length === 0) {
    console.log('  ✓ Taglines: alle ≤ 160 Zeichen')
  } else {
    console.log(`  ⚠ Taglines > 160 Zeichen (${taglineTooLong.length}):`)
    for (const t of taglineTooLong) {
      console.log(`    - ${t.tool} (${t.sourceFile}): ${t.length} Zeichen`)
    }
  }

  if (missingNameOrTagline.length === 0) {
    console.log('  ✓ Alle Tools haben Name + Tagline')
  } else {
    console.log(`  ⚠ Fehlender Name oder Tagline (${missingNameOrTagline.length}):`)
    for (const t of missingNameOrTagline) console.log(`    - ${t}`)
  }

  if (categorySlugsNotInDb.length === 0) {
    console.log('  ✓ Alle Kategorie-Slugs in DB vorhanden')
  } else {
    console.log(`  ℹ Kategorie-Slugs nicht in DB — werden beim Import angelegt (${categorySlugsNotInDb.length}):`)
    for (const s of categorySlugsNotInDb) console.log(`    - ${s}`)
  }

  if (duplicateSlugs.length === 0) {
    console.log('  ✓ Keine doppelten Slugs im Content')
  } else {
    console.log(`  ℹ Doppelte Slugs — werden als Multi-Kategorie-Links behandelt (${duplicateSlugs.length}):`)
    for (const d of duplicateSlugs) console.log(`    - ${d}`)
  }

  if (emptyStrengths.length === 0) {
    console.log('  ✓ Alle Tools haben Stärken')
  } else {
    console.log(`  ⚠ Leere Stärken (${emptyStrengths.length}):`)
    for (const t of emptyStrengths) console.log(`    - ${t}`)
  }

  if (emptyFeatures.length === 0) {
    console.log('  ✓ Alle Tools haben Funktionen')
  } else {
    console.log(`  ⚠ Leere Funktionen (${emptyFeatures.length}):`)
    for (const t of emptyFeatures) console.log(`    - ${t}`)
  }

  // ─── JSON-Report schreiben ──────────────────────────────────────────────────

  const report: ImportReport = {
    files: fileReports,
    summary: {
      totalParsed: allTools.length,
      existingInDb,
      newTools: newToolsList,
      categorySlugsNeeded: [...categorySlugsNeeded],
      categorySlugsInDb,
      categorySlugsNotInDb,
      existingVendorSlugs: dbVendorSlugs,
    },
    warnings: {
      taglineTooLong,
      missingNameOrTagline,
      categoryNotInDb: categorySlugsNotInDb,
      duplicateSlugsInContent: duplicateSlugs,
      emptyStrengths,
      emptyFeatures,
    },
  }

  const reportPath = path.join(contentDir, '_import-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`\n📄 Report geschrieben nach: Content_Website/_import-report.json`)

  // ─── Dry-Run endet hier ─────────────────────────────────────────────────────

  if (isDryRun) {
    console.log('\n═══════════════════════════════════════════════════')
    console.log('  DRY-RUN abgeschlossen — keine DB-Writes.')
    console.log('  Ohne --dry-run schreibt das Skript in die DB.')
    console.log('═══════════════════════════════════════════════════\n')
    return
  }

  // ─── DB-Writes ───────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  SCHREIBE IN DB...')
  console.log('═══════════════════════════════════════════════════\n')

  const writeResult = await writeToDB(allTools, categoryNameMap, dbToolSlugs)

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  IMPORT ABGESCHLOSSEN')
  console.log('═══════════════════════════════════════════════════\n')

  console.log(`  Tools upserted:       ${writeResult.toolsUpserted} (${writeResult.toolsNew} neu, ${writeResult.toolsUpdated} aktualisiert)`)
  console.log(`  Vendors neu angelegt: ${writeResult.vendorsCreated}`)
  console.log(`  Kategorie-Links neu:  ${writeResult.categoryLinksCreated}`)

  if (writeResult.errors.length === 0) {
    console.log('\n  ✓ Keine Fehler')
  } else {
    console.log(`\n  ✗ Fehler (${writeResult.errors.length}):`)
    for (const e of writeResult.errors) {
      console.log(`    - ${e.slug}: ${e.error}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════\n')
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Fehler:', err)
    process.exit(1)
  })
