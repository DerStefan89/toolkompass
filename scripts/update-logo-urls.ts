/**
 * Datei: scripts/update-logo-urls.ts
 *
 * Zweck: Setzt logoUrl auf allen Tools deren Logo in public/logos/tools/ liegt.
 *        Liest Dateien aus dem Logo-Ordner, matched by slug, updated DB.
 *
 * SICHER PER DEFAULT: Ohne --execute wird NICHTS geschrieben (Dry-Run).
 *
 * Ausführen:
 *   npx tsx scripts/update-logo-urls.ts             → zeigt was geändert würde (kein DB-Zugriff zum Schreiben)
 *   npx tsx scripts/update-logo-urls.ts --execute   → schreibt in DB
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'
import { startScript } from './_mode'

// PrismaClient dynamisch nach dotenv laden (verhindert localhost-Fallback aus .env)
let prisma: PrismaClient

const LOGO_DIR = path.join(process.cwd(), 'public', 'logos', 'tools')
const LOGO_BASE_URL = '/logos/tools'

async function main(): Promise<void> {
  dotenv.config({ path: '.env.local', override: true })
  const mod = await import('@/lib/prisma')
  prisma = mod.prisma

  const execute = startScript()

  // ─── Logo-Dateien lesen ────────────────────────────────────────────────────

  if (!fs.existsSync(LOGO_DIR)) {
    console.error(`  ✗ Ordner nicht gefunden: ${LOGO_DIR}`)
    process.exit(1)
  }

  const logoFiles = fs.readdirSync(LOGO_DIR).filter(f => f.endsWith('.png'))
  const logoSlugs = new Set(logoFiles.map(f => f.replace(/\.png$/, '')))

  console.log(`  📁 ${logoFiles.length} Logo-Dateien in public/logos/tools/\n`)

  // ─── Alle Tools aus DB laden ───────────────────────────────────────────────

  const allTools = await prisma.tool.findMany({
    select: { id: true, slug: true, logoUrl: true },
    orderBy: { slug: 'asc' },
  })

  console.log(`  🔍 ${allTools.length} Tools in DB\n`)

  // ─── Matching ──────────────────────────────────────────────────────────────

  const matched: Array<{ slug: string; newUrl: string; hadLogo: boolean }> = []
  const notMatched: string[] = []

  for (const tool of allTools) {
    if (logoSlugs.has(tool.slug)) {
      matched.push({
        slug: tool.slug,
        newUrl: `${LOGO_BASE_URL}/${tool.slug}.png`,
        hadLogo: !!tool.logoUrl,
      })
    } else {
      notMatched.push(tool.slug)
    }
  }

  // Logo-Dateien ohne DB-Eintrag (umgekehrtes Matching)
  const logoWithoutTool = logoFiles
    .map(f => f.replace(/\.png$/, ''))
    .filter(slug => !allTools.some(t => t.slug === slug))

  // ─── Report ausgeben ───────────────────────────────────────────────────────

  console.log('  ═══ MATCH-ERGEBNIS ════════════════════════════════\n')
  console.log(`  ✓ Gematchte Tools:     ${matched.length} von ${allTools.length}`)
  console.log(`  ✗ Nicht gematchte:     ${notMatched.length}`)
  console.log(`  ℹ Logos ohne DB-Tool:  ${logoWithoutTool.length}\n`)

  const newLogos = matched.filter(m => !m.hadLogo)
  const updates = matched.filter(m => m.hadLogo)
  console.log(`  Davon neu (kein Logo bisher): ${newLogos.length}`)
  console.log(`  Davon Update (Logo vorhanden): ${updates.length}\n`)

  if (notMatched.length > 0) {
    console.log('  ─── Tools OHNE Logo (kein Match in /logos/tools/) ──\n')
    for (const slug of notMatched) {
      console.log(`    - ${slug}`)
    }
    console.log()
  }

  if (logoWithoutTool.length > 0) {
    console.log('  ─── Logos OHNE DB-Eintrag (kein Tool mit diesem Slug) ──\n')
    for (const slug of logoWithoutTool) {
      console.log(`    - ${slug}.png`)
    }
    console.log()
  }

  // ─── Dry-Run endet hier ────────────────────────────────────────────────────

  if (!execute) {
    console.log('  ─── Würde setzen: ──────────────────────────────────\n')
    for (const { slug, newUrl } of matched) {
      console.log(`    ${slug} → ${newUrl}`)
    }
    console.log('\n  DRY-RUN — keine DB-Änderungen. Mit --execute schreiben.')
    console.log('═══════════════════════════════════════════════════\n')
    return
  }

  // ─── DB-Writes ─────────────────────────────────────────────────────────────

  console.log('  ─── Schreibe logoUrl in DB... ──────────────────────\n')

  let updated = 0
  const errors: Array<{ slug: string; error: string }> = []

  for (const { slug, newUrl } of matched) {
    try {
      await prisma.tool.update({
        where: { slug },
        data: { logoUrl: newUrl },
      })
      updated++
    } catch (err: unknown) {
      errors.push({
        slug,
        error: err instanceof Error ? err.message.slice(0, 100) : String(err),
      })
    }
  }

  console.log(`  ✓ ${updated} Tools aktualisiert`)
  if (errors.length > 0) {
    console.log(`  ✗ ${errors.length} Fehler:`)
    for (const e of errors) console.log(`    - ${e.slug}: ${e.error}`)
  }

  console.log('\n═══════════════════════════════════════════════════\n')
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Fehler:', err)
    process.exit(1)
  })
