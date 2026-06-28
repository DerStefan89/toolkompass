#!/usr/bin/env tsx
/**
 * scripts/humanize-tools.ts
 * Zweck: Importiert überarbeitete Tool-Texte aus MD-Dateien
 *        in ToolTranslation (locale=de).
 * Aufruf: npx tsx scripts/humanize-tools.ts <datei.md> [--dry-run]
 * Wird aufgerufen von: CLI
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

const ARRAY_FIELDS = ['features','strengths','weaknesses','bestFor','notIdealFor'] as const
const TEXT_FIELDS  = ['name','shortDescription','longDescription'] as const

type ToolBlock = {
  slug: string
  name?: string
  shortDescription?: string
  longDescription?: string
  features?: string[]
  strengths?: string[]
  weaknesses?: string[]
  bestFor?: string[]
  notIdealFor?: string[]
}

function parseNumberedList(lines: string[]): string[] {
  return lines
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(l => l.length > 0)
}

function parseMd(content: string): ToolBlock[] {
  const blocks: ToolBlock[] = []
  const sections = content.split(/\n(?=## \d+\.)/)
  for (const section of sections) {
    const lines = section.split('\n')
    const slugLine = lines.find(l => /^slug:\s/.test(l))
    if (!slugLine) continue
    const slug = slugLine.replace(/^slug:\s*/, '').trim()
    const block: ToolBlock = { slug }
    let currentField: string | null = null
    let fieldLines: string[] = []
    const flushField = () => {
      if (!currentField || fieldLines.length === 0) return
      const text = fieldLines.join('\n').trim()
      if (ARRAY_FIELDS.includes(currentField as typeof ARRAY_FIELDS[number])) {
        ;(block as Record<string, unknown>)[currentField] = parseNumberedList(fieldLines)
      } else {
        ;(block as Record<string, unknown>)[currentField] = text
      }
      fieldLines = []
      currentField = null
    }
    const allFields = [...TEXT_FIELDS, ...ARRAY_FIELDS]
    for (const line of lines) {
      const fieldMatch = allFields.find(
        f => line.trim() === `${f}:` || line.trim().startsWith(`${f}: `)
      )
      if (fieldMatch) {
        flushField()
        currentField = fieldMatch
        const inline = line.replace(new RegExp(`^${fieldMatch}:\\s*`), '').trim()
        if (inline) fieldLines.push(inline)
      } else if (currentField) {
        fieldLines.push(line)
      }
    }
    flushField()
    blocks.push(block)
  }
  return blocks
}

function truncate(str: string, n = 60): string {
  if (!str) return '(leer)'
  return str.length > n ? str.slice(0, n) + '…' : str
}

async function main() {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma

  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const filePath = args.find(a => !a.startsWith('--'))
  if (!filePath) {
    console.error('Usage: npx tsx scripts/humanize-tools.ts <datei.md> [--dry-run]')
    process.exit(1)
  }
  const abs = path.resolve(filePath)
  if (!fs.existsSync(abs)) {
    console.error(`Datei nicht gefunden: ${abs}`)
    process.exit(1)
  }
  const content = fs.readFileSync(abs, 'utf-8')
  const blocks = parseMd(content)
  console.log(`\n═══ Humanize Tools ${dryRun ? '[DRY-RUN]' : '[ECHTLAUF]'} ═══`)
  console.log(`Datei: ${filePath}`)
  console.log(`Tools im MD: ${blocks.length}\n`)
  let found = 0, notFound = 0
  const updateFns: Array<() => Promise<unknown>> = []
  for (const block of blocks) {
    const translation = await prisma.toolTranslation.findFirst({
      where: { tool: { slug: block.slug }, locale: 'de' },
      select: {
        id: true, name: true, shortDescription: true, longDescription: true,
        features: true, strengths: true, weaknesses: true,
        bestFor: true, notIdealFor: true
      }
    })
    if (!translation) {
      console.log(`⚠  SLUG NICHT IN DB GEFUNDEN: ${block.slug}`)
      notFound++
      continue
    }
    found++
    console.log(`✓  ${block.slug}`)
    const allFields = [...TEXT_FIELDS, ...ARRAY_FIELDS]
    for (const field of allFields) {
      const newVal = (block as Record<string, unknown>)[field]
      if (newVal === undefined) {
        console.log(`   ⚠ FELD FEHLT IM BATCH, wird übersprungen: ${field}`)
        continue
      }
      const oldVal = (translation as Record<string, unknown>)[field]
      const oldStr = Array.isArray(oldVal) ? (oldVal as string[]).join(' | ') : String(oldVal ?? '')
      const newStr = Array.isArray(newVal) ? (newVal as string[]).join(' | ') : String(newVal)
      if (oldStr !== newStr) {
        console.log(`   ${field}:`)
        console.log(`     ALT: ${truncate(oldStr)}`)
        console.log(`     NEU: ${truncate(newStr)}`)
      }
    }
    console.log('')
    if (!dryRun) {
      const id = translation.id
      updateFns.push(() => prisma.toolTranslation.update({
        where: { id },
        data: {
          ...(block.name              !== undefined && { name:             block.name }),
          ...(block.shortDescription  !== undefined && { shortDescription: block.shortDescription }),
          ...(block.longDescription   !== undefined && { longDescription:  block.longDescription }),
          ...(block.features          !== undefined && { features:         block.features }),
          ...(block.strengths         !== undefined && { strengths:        block.strengths }),
          ...(block.weaknesses        !== undefined && { weaknesses:       block.weaknesses }),
          ...(block.bestFor           !== undefined && { bestFor:          block.bestFor }),
          ...(block.notIdealFor       !== undefined && { notIdealFor:      block.notIdealFor }),
        }
      }))
    }
  }
  console.log(`═══ Zusammenfassung ═══`)
  console.log(`Tools gefunden:    ${found}`)
  console.log(`Slugs nicht in DB: ${notFound}`)
  if (!dryRun && updateFns.length > 0) {
    console.log(`\nSchreibe ${updateFns.length} Updates...`)
    for (const fn of updateFns) await fn()
    console.log('✓ Fertig.')
  } else if (dryRun) {
    console.log('\n[DRY-RUN] Keine Änderungen geschrieben.')
  }
  await prisma.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
