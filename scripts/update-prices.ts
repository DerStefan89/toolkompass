/**
 * Datei: scripts/update-prices.ts
 *
 * Zweck: Liest "**Einstieg:**"-Zeilen aus Content_Website/toolsucher_*.md
 *        und setzt startingPriceCents in der DB — nur für Tools die noch
 *        keinen Preis haben (skip wenn startingPriceCents IS NOT NULL).
 *
 * Ausführen:
 *   npx tsx scripts/update-prices.ts --dry-run   → zeigt was geändert würde
 *   npx tsx scripts/update-prices.ts              → schreibt in DB
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'

// PrismaClient dynamisch nach dotenv laden (verhindert localhost-Fallback aus .env)
let prisma: PrismaClient

// ============================================================
// MANUELLE KORREKTUREN
// Greift nach dem automatischen Parsing — überschreibt den geparsten Wert.
// ============================================================

const PRICE_OVERRIDES: Record<string, number | null> = {
  'camtasia': null,    // Jahreskauf, kein Monatspreis
  'snagit': null,      // Jahreskauf, kein Monatspreis
  'reaper': null,      // Einmalkauf, kein Monatspreis
  'ionos': 900,        // Verlängerungspreis 9 €/Monat
  'strato': 900,       // Verlängerungspreis 9 €/Monat
  'photopea': null,    // Free-Plan, Premium optional
}

// ============================================================
// TYPES
// ============================================================

interface ToolPriceEntry {
  slug: string
  rawEinstieg: string
  parsedCents: number | null
}

type DbStatus = 'updated' | 'skipped' | 'null_price' | 'not_found'

interface ProcessResult {
  slug: string
  rawEinstieg: string
  parsedCents: number | null
  status: DbStatus
  error?: string
}

// ============================================================
// PRICE PARSER
// ============================================================

/**
 * Parst eine "**Einstieg:**"-Zeile und gibt den Preis in Cent zurück.
 * Gibt null zurück wenn kein sinnvoller Monatspreis extrahierbar ist
 * (Free, auf Anfrage, nutzungsbasiert, 0 €, etc.).
 */
function parseEinstiegPrice(raw: string): number | null {
  const text = raw.trim()
  const lower = text.toLowerCase()

  // — Explizite Null-Fälle ohne extrahierbaren Preis —
  if (/^auf anfrage/i.test(text)) return null
  if (/^nutzungsbasiert/i.test(lower)) return null
  if (/^workload-basiert/i.test(lower)) return null
  // "kostenlos" ohne folgendes "ab X"
  if (/^kostenlos/i.test(lower) && !/\bab\b/i.test(lower)) return null

  // — Normalisierung: Gedankenstrich in Bereichen entfernen (8–10 → 8 10) —
  const normalized = text.replace(/[–—]/g, ' ')

  // — Primärstrategie: "ab [ca.] [~] ZAHL" —
  // Verlässlichster Indikator für den Einstiegspreis
  const abMatch = normalized.match(/\bab\s+(?:ca\.\s*)?~?\s*(\d+(?:[.,]\d+)?)/)
  if (abMatch) {
    const val = parseFloat(abMatch[1].replace(',', '.'))
    if (val === 0) return null
    return Math.round(val * 100)
  }

  // — Fallback: Zahlen neben Währungssymbolen suchen —
  const beforeCurrency = [...normalized.matchAll(/~?\s*(\d+(?:[.,]\d+)?)\s*[€$]/g)]
    .map(m => parseFloat(m[1].replace(',', '.')))
  const afterCurrency = [...normalized.matchAll(/[€$]\s*(\d+(?:[.,]\d+)?)/g)]
    .map(m => parseFloat(m[1].replace(',', '.')))

  const candidates = [...beforeCurrency, ...afterCurrency].filter(n => n > 0)
  if (candidates.length === 0) return null

  // Kleinsten Wert nehmen = konservativster Einstiegspreis
  return Math.round(Math.min(...candidates) * 100)
}

// ============================================================
// MD-FILE PARSER
// ============================================================

/**
 * Extrahiert alle (slug, rawEinstieg)-Paare aus einer MD-Datei.
 * Sucht nach **Slug:** gefolgt von **Einstieg:** im selben Tool-Block.
 */
function extractToolEntries(content: string): ToolPriceEntry[] {
  const entries: ToolPriceEntry[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const slugMatch = lines[i].match(/^\*\*Slug:\*\*\s+(.+)$/)
    if (!slugMatch) continue

    const slug = slugMatch[1].trim()

    // Voraussuche: **Einstieg:** in den nächsten 10 Zeilen
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      // Neuer Tool-Abschnitt → abbrechen
      if (/^##\s/.test(lines[j])) break

      const einstiegMatch = lines[j].match(/^\*\*Einstieg:\*\*\s+(.+)$/)
      if (einstiegMatch) {
        const rawEinstieg = einstiegMatch[1].trim()
        entries.push({
          slug,
          rawEinstieg,
          parsedCents: parseEinstiegPrice(rawEinstieg),
        })
        break
      }
    }
  }

  return entries
}

// ============================================================
// OUTPUT HELPERS
// ============================================================

function statusLabel(status: DbStatus): string {
  switch (status) {
    case 'updated':   return 'NEU'
    case 'skipped':   return 'ÜBERSPRUNGEN'
    case 'null_price': return 'NULL'
    case 'not_found': return 'NICHT GEFUNDEN'
  }
}

function centsLabel(cents: number | null): string {
  if (cents === null) return '—'
  const euros = (cents / 100).toFixed(2).replace('.', ',')
  return `${euros} € (${cents} ct)`
}

// ============================================================
// MAIN
// ============================================================

async function main(): Promise<void> {
  dotenv.config({ path: '.env.local', override: true })
  const mod = await import('@/lib/prisma')
  prisma = mod.prisma

  const isDryRun = process.argv.includes('--dry-run')

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log(`  Preise-Update — ${isDryRun ? 'DRY-RUN (keine DB-Writes)' : 'SCHREIBE IN DB'}`)
  console.log('═══════════════════════════════════════════════════════════\n')

  // ─── MD-Dateien einlesen ────────────────────────────────────────────────────

  const contentDir = path.join(process.cwd(), 'Content_Website')

  if (!fs.existsSync(contentDir)) {
    console.error(`  ✗ Content_Website/ nicht gefunden: ${contentDir}`)
    process.exit(1)
  }

  const mdFiles = fs.readdirSync(contentDir)
    .filter(f => f.startsWith('toolsucher_') && f.endsWith('.md'))
    .map(f => path.join(contentDir, f))

  console.log(`  📁 ${mdFiles.length} MD-Dateien gefunden\n`)

  // ─── Alle Einträge parsen ────────────────────────────────────────────────────

  const allEntries: ToolPriceEntry[] = []
  for (const filePath of mdFiles) {
    const content = fs.readFileSync(filePath, 'utf-8')
    const fileEntries = extractToolEntries(content)
    allEntries.push(...fileEntries)
  }

  // Duplikate by slug entfernen (letztes Vorkommen gewinnt)
  const uniqueMap = new Map<string, ToolPriceEntry>()
  for (const e of allEntries) uniqueMap.set(e.slug, e)

  // Manuelle Korrekturen anwenden
  for (const [slug, overrideCents] of Object.entries(PRICE_OVERRIDES)) {
    const entry = uniqueMap.get(slug)
    if (entry) {
      entry.parsedCents = overrideCents
    }
  }

  const entries = [...uniqueMap.values()].sort((a, b) => a.slug.localeCompare(b.slug))

  console.log(`  🔍 ${entries.length} einzigartige Tool-Einträge geparst\n`)

  // ─── Pro Tool verarbeiten ────────────────────────────────────────────────────

  const results: ProcessResult[] = []

  for (const entry of entries) {
    try {
      if (entry.parsedCents === null) {
        results.push({ ...entry, status: 'null_price' })
        continue
      }

      const tool = await prisma.tool.findUnique({
        where: { slug: entry.slug },
        select: { slug: true, startingPriceCents: true },
      })

      if (!tool) {
        results.push({ ...entry, status: 'not_found' })
        continue
      }

      if (tool.startingPriceCents !== null) {
        results.push({ ...entry, status: 'skipped' })
        continue
      }

      if (!isDryRun) {
        await prisma.tool.update({
          where: { slug: entry.slug },
          data: { startingPriceCents: entry.parsedCents },
        })
      }

      results.push({ ...entry, status: 'updated' })
    } catch (err) {
      console.error(`[update-prices] Fehler bei "${entry.slug}":`, err)
      results.push({ ...entry, status: 'not_found', error: String(err) })
    }
  }

  // ─── Detaillierter Report ────────────────────────────────────────────────────

  console.log('  ─── Detaillierter Report ───────────────────────────────────\n')
  console.log(`  ${'Slug'.padEnd(30)} ${'Einstieg (MD)'.padEnd(52)} ${'Cent-Wert'.padEnd(20)} Status`)
  console.log(`  ${'─'.repeat(30)} ${'─'.repeat(52)} ${'─'.repeat(20)} ${'─'.repeat(15)}`)

  for (const r of results) {
    const slugCol = r.slug.padEnd(30)
    const rawCol = r.rawEinstieg.slice(0, 50).padEnd(52)
    const centsCol = centsLabel(r.parsedCents).padEnd(20)
    const statusCol = statusLabel(r.status)
    console.log(`  ${slugCol} ${rawCol} ${centsCol} ${statusCol}`)
    if (r.error) console.log(`    ⚠ Fehler: ${r.error}`)
  }

  // ─── Zusammenfassung ─────────────────────────────────────────────────────────

  const updated   = results.filter(r => r.status === 'updated').length
  const skipped   = results.filter(r => r.status === 'skipped').length
  const nullPrice = results.filter(r => r.status === 'null_price').length
  const notFound  = results.filter(r => r.status === 'not_found').length

  console.log('\n  ─── Zusammenfassung ────────────────────────────────────────\n')
  console.log(`  ✓ Preise ${isDryRun ? 'würden gesetzt werden' : 'neu gesetzt'}:   ${updated}`)
  console.log(`  ↷ Übersprungen (hatten schon Preis):    ${skipped}`)
  console.log(`  — Auf null (Free/Anfrage/kein Preis):   ${nullPrice}`)
  console.log(`  ✗ Nicht in DB gefunden:                 ${notFound}`)
  console.log(`\n  Gesamt geparst: ${results.length}`)

  if (isDryRun) {
    console.log('\n  ℹ  DRY-RUN — keine DB-Änderungen.')
    console.log('  Ohne --dry-run werden Preise in die DB geschrieben.')
  }

  console.log('\n═══════════════════════════════════════════════════════════\n')

  await prisma.$disconnect()
}

main().catch(err => {
  console.error('[update-prices] Fehler:', err)
  process.exit(1)
})
