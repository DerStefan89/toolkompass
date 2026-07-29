/**
 * Datei: scripts/check-tool-exists.ts
 *
 * Zweck: Prüft VOR dem Anlegen eines neuen Tools, ob es bereits existiert
 * (DB: Vendor/Tool per Slug + Namens-Teilstring; Content_Website: Volltextsuche).
 * Pflicht-Schritt 0 im tool-anlegen-Skill, um Duplikate wie doppeltes Miro zu verhindern.
 *
 * Aufruf: npx tsx scripts/check-tool-exists.ts "<Toolname>" [websiteDomain]
 * Beispiel: npx tsx scripts/check-tool-exists.ts "Miro" miro.com
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'
import { toSlug } from '@/lib/utils/form'

let prisma: PrismaClient

async function main(): Promise<void> {
  const name = process.argv[2]
  const domain = process.argv[3]

  if (!name) {
    console.error('Nutzung: npx tsx scripts/check-tool-exists.ts "<Toolname>" [websiteDomain]')
    process.exit(1)
  }

  dotenv.config({ path: '.env.local', override: true })
  const mod = await import('@/lib/prisma')
  prisma = mod.prisma

  const slug = toSlug(name)
  const nameLower = name.toLowerCase()

  console.log(`\n🔍 Prüfe "${name}" (Slug: ${slug})${domain ? ` | Domain: ${domain}` : ''}\n`)

  // ─── DB: exakter Slug-Treffer ────────────────────────────────────────────
  const exactTool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      vendor: { select: { name: true, website: true } },
    },
  })

  // ─── DB: unscharfe Treffer über Vendor-Name/Website ──────────────────────
  const fuzzyVendors = await prisma.vendor.findMany({
    where: {
      OR: [
        { name: { contains: name, mode: 'insensitive' } },
        ...(domain ? [{ website: { contains: domain, mode: 'insensitive' as const } }] : []),
      ],
    },
    include: {
      tools: {
        include: { translations: { where: { locale: 'de' } } },
      },
    },
  })

  // ─── Content_Website: Volltextsuche ──────────────────────────────────────
  const contentDir = path.join(process.cwd(), 'Content_Website')
  const contentHits: string[] = []
  if (fs.existsSync(contentDir)) {
    for (const file of fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))) {
      const text = fs.readFileSync(path.join(contentDir, file), 'utf-8')
      if (text.toLowerCase().includes(nameLower)) contentHits.push(file)
    }
  }

  // ─── Ergebnis ─────────────────────────────────────────────────────────────
  if (exactTool) {
    const displayName = exactTool.translations[0]?.name ?? exactTool.slug
    console.log('🟥 GEFUNDEN — Tool existiert bereits in der DB (exakter Slug-Treffer)')
    console.log(`   Name:        ${displayName}`)
    console.log(`   Slug:        ${exactTool.slug}`)
    console.log(`   Published:   ${exactTool.published ? 'ja' : 'nein (Entwurf)'}`)
    console.log(`   Vendor:      ${exactTool.vendor.name} (${exactTool.vendor.website ?? 'keine Website hinterlegt'})`)
    console.log(`   Admin:       /admin/tools/${exactTool.id}`)
    console.log('\n   → Kein Neuanlegen nötig. Falls Inhalte fehlen/veraltet sind: mit dem Nutzer')
    console.log('     abklären, ob das bestehende Tool aktualisiert/überschrieben werden soll.')
  } else if (fuzzyVendors.length > 0) {
    console.log('🟨 MÖGLICHER TREFFER — ähnlicher Vendor-Name oder Domain in der DB gefunden:')
    for (const v of fuzzyVendors) {
      console.log(`   - Vendor "${v.name}" (Slug: ${v.slug}, Website: ${v.website ?? '—'})`)
      for (const t of v.tools) {
        const displayName = t.translations[0]?.name ?? t.slug
        console.log(`     → Tool "${displayName}" (Slug: ${t.slug}, published: ${t.published})`)
      }
    }
    console.log('\n   → Vor dem Anlegen mit dem Nutzer klären, ob das dasselbe Tool ist.')
  } else {
    console.log('🟩 NICHT GEFUNDEN — kein Treffer in der DB. Anlegen kann fortgesetzt werden.')
  }

  if (contentHits.length > 0) {
    console.log(`\n📄 Erwähnung in Content_Website/: ${contentHits.join(', ')}`)
  }

  console.log()
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  if (prisma) await prisma.$disconnect()
  process.exit(1)
})
