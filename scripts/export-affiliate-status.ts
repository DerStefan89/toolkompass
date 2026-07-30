/**
 * scripts/export-affiliate-status.ts
 * Zweck: Exportiert den Affiliate-Status aller publizierten Tools als CSV.
 * Aufruf: npx tsx scripts/export-affiliate-status.ts
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import type { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

async function main() {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma

  const tools = await prisma.tool.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' }, select: { name: true } },
      vendor: { select: { website: true } },
      affiliateLinks: { where: { isActive: true }, select: { trackingSlug: true, isPrimary: true } },
    },
  })

  // Sortieren nach deutschem Namen (alphabetisch)
  tools.sort((a, b) => {
    const nameA = a.translations[0]?.name ?? a.slug
    const nameB = b.translations[0]?.name ?? b.slug
    return nameA.localeCompare(nameB, 'de')
  })

  const header = 'Name,Slug,Website,Affiliate-Programm,Links eingetragen,Tracking-Slug'
  const rows = tools.map((tool) => {
    const name = (tool.translations[0]?.name ?? tool.slug).replace(/,/g, ' ')
    const website = tool.vendor?.website ?? ''
    const affiliateStatus = tool.isAffiliate ? 'Ja' : 'Nein — kein Programm bekannt'
    const activeCount = tool.affiliateLinks.length
    const primarySlug = tool.affiliateLinks.find((l) => l.isPrimary)?.trackingSlug ?? ''
    return `${name},${tool.slug},${website},${affiliateStatus},${activeCount},${primarySlug}`
  })

  const csv = [header, ...rows].join('\n') + '\n'

  // Output-Pfad: Arbeitsmaterial-Ordner im Projektroot
  const outputDir = path.join(process.cwd(), '_arbeitsmaterial')
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'toolsucher_affiliate_status.csv')

  fs.writeFileSync(outputPath, csv, 'utf-8')
  console.log(`✓ ${tools.length} Tools exportiert → ${outputPath}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
