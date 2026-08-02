/**
 * scripts/import-vendor-links.ts
 * Zweck: Setzt vendor.website + legt einen Direkt-AffiliateLink an für alle
 *        publizierten Tools. Kein Affiliate-Tracking, nur Website-URL als Link.
 * Aufruf: npx tsx scripts/import-vendor-links.ts             (Dry-Run per Default)
 *         npx tsx scripts/import-vendor-links.ts --execute   (schreibt in DB)
 */

import * as dotenv from 'dotenv'
import type { PrismaClient } from '@prisma/client'
import { startScript } from './_mode'

let prisma: PrismaClient

const TOOL_WEBSITES: Array<{ slug: string; website: string }> = [
  { slug: 'accountable', website: 'https://www.accountable.eu' },
  { slug: 'adobe-express', website: 'https://www.adobe.com/de/express' },
  { slug: 'photoshop', website: 'https://www.adobe.com/de/products/photoshop.html' },
  { slug: 'affinity-photo', website: 'https://affinity.serif.com/de/photo' },
  { slug: 'airtable', website: 'https://www.airtable.com' },
  { slug: 'all-inkl', website: 'https://all-inkl.com' },
  { slug: 'asana', website: 'https://asana.com/de' },
  { slug: 'audacity', website: 'https://www.audacityteam.org' },
  { slug: 'auphonic', website: 'https://auphonic.com' },
  { slug: 'bitrix24', website: 'https://www.bitrix24.de' },
  { slug: 'brevo', website: 'https://www.brevo.com/de' },
  { slug: 'bubble', website: 'https://bubble.io' },
  { slug: 'buchhaltungsbutler', website: 'https://www.buchhaltungsbutler.de' },
  { slug: 'buffer', website: 'https://buffer.com' },
  { slug: 'cal-com', website: 'https://cal.com' },
  { slug: 'calendly', website: 'https://calendly.com' },
  { slug: 'camtasia', website: 'https://www.techsmith.com/de-de/video-editor.html' },
  { slug: 'canva', website: 'https://www.canva.com' },
  { slug: 'capcut', website: 'https://www.capcut.com/de-de' },
  { slug: 'centralstationcrm', website: 'https://www.centralstationcrm.de' },
  { slug: 'chatgpt', website: 'https://chatgpt.com' },
  { slug: 'circula', website: 'https://www.circula.com/de' },
  { slug: 'claude', website: 'https://claude.ai' },
  { slug: 'clickup', website: 'https://clickup.com' },
  { slug: 'cursor', website: 'https://www.cursor.com' },
  { slug: 'deepl', website: 'https://www.deepl.com/de/translator' },
  { slug: 'deepl-write', website: 'https://www.deepl.com/de/write' },
  { slug: 'descript', website: 'https://www.descript.com' },
  { slug: 'doodle', website: 'https://doodle.com/de' },
  { slug: 'elevenlabs', website: 'https://elevenlabs.io' },
  { slug: 'fastbill', website: 'https://www.fastbill.com' },
  { slug: 'fathom', website: 'https://fathom.video' },
  { slug: 'figma', website: 'https://www.figma.com/de-de' },
  { slug: 'filmora', website: 'https://filmora.wondershare.de' },
  { slug: 'finom', website: 'https://finom.co/de-de' },
  { slug: 'freshsales', website: 'https://www.freshworks.com/de/crm/sales' },
  { slug: 'fyrst', website: 'https://www.fyrst.de' },
  { slug: 'gimp', website: 'https://www.gimp.org' },
  { slug: 'github-copilot', website: 'https://github.com/features/copilot' },
  { slug: 'glide', website: 'https://www.glideapps.com' },
  { slug: 'google-calendar', website: 'https://calendar.google.com' },
  { slug: 'google-meet', website: 'https://meet.google.com' },
  { slug: 'hindenburg-pro', website: 'https://hindenburg.com' },
  { slug: 'hootsuite', website: 'https://www.hootsuite.com/de' },
  { slug: 'hubspot-crm', website: 'https://www.hubspot.de/products/crm' },
  { slug: 'invideo', website: 'https://invideo.io' },
  { slug: 'ionos', website: 'https://www.ionos.de' },
  { slug: 'jasper-ai', website: 'https://www.jasper.ai' },
  { slug: 'jimdo', website: 'https://www.jimdo.com/de' },
  { slug: 'kontist', website: 'https://kontist.com/de' },
  { slug: 'later', website: 'https://later.com' },
  { slug: 'lexoffice', website: 'https://www.lexware.de' },
  { slug: 'lexware-office', website: 'https://www.lexware.de/lexware-office' },
  { slug: 'loom', website: 'https://www.loom.com' },
  { slug: 'make', website: 'https://www.make.com/de' },
  { slug: 'metricool', website: 'https://metricool.com/de' },
  { slug: 'microsoft-365-copilot', website: 'https://www.microsoft.com/de-de/microsoft-365/copilot' },
  { slug: 'microsoft-onenote', website: 'https://www.microsoft.com/de-de/microsoft-365/onenote' },
  { slug: 'monday-crm', website: 'https://monday.com/de/crm' },
  { slug: 'moss', website: 'https://www.getmoss.com/de' },
  { slug: 'murf-ai', website: 'https://murf.ai' },
  { slug: 'n26-business', website: 'https://n26.com/de-de/business-konto' },
  { slug: 'n8n', website: 'https://n8n.io' },
  { slug: 'notion', website: 'https://www.notion.so/de-de' },
  { slug: 'paperless-io', website: 'https://www.paperless.io' },
  { slug: 'papierkram', website: 'https://www.papierkram.de' },
  { slug: 'photopea', website: 'https://www.photopea.com' },
  { slug: 'pictory', website: 'https://pictory.ai' },
  { slug: 'pipedrive', website: 'https://www.pipedrive.com/de' },
  { slug: 'pixlr', website: 'https://pixlr.com/de' },
  { slug: 'pleo', website: 'https://www.pleo.io/de' },
  { slug: 'qonto', website: 'https://qonto.com/de' },
  { slug: 'reaper', website: 'https://www.reaper.fm' },
  { slug: 'remove-bg', website: 'https://www.remove.bg/de' },
  { slug: 'screencastify', website: 'https://www.screencastify.com' },
  { slug: 'screenpal', website: 'https://screenpal.com/de' },
  { slug: 'sevdesk', website: 'https://sevdesk.de' },
  { slug: 'simplybook-me', website: 'https://simplybook.me/de' },
  { slug: 'skribble', website: 'https://www.skribble.com/de' },
  { slug: 'snagit', website: 'https://www.techsmith.com/de-de/screen-capture.html' },
  { slug: 'softr', website: 'https://www.softr.io' },
  { slug: 'spendesk', website: 'https://www.spendesk.com/de' },
  { slug: 'strato', website: 'https://www.strato.de' },
  { slug: 'tella', website: 'https://www.tella.tv' },
  { slug: 'tidycal', website: 'https://tidycal.com' },
  { slug: 'timify', website: 'https://www.timify.com/de' },
  { slug: 'todoist', website: 'https://todoist.com/de' },
  { slug: 'trello', website: 'https://trello.com/de' },
  { slug: 'vivid', website: 'https://vivid.money/de-de' },
  { slug: 'vivid-business', website: 'https://vivid.money/de-de/business' },
  { slug: 'webflow', website: 'https://webflow.com/de' },
  { slug: 'whereby', website: 'https://whereby.com' },
  { slug: 'windsurf-codeium', website: 'https://windsurf.com' },
  { slug: 'wiso-meinbuero', website: 'https://www.wiso-meinbuero.de' },
  { slug: 'wordpress-org', website: 'https://de.wordpress.org' },
  { slug: 'yousign', website: 'https://yousign.com/de-de' },
  { slug: 'zapier', website: 'https://zapier.com/de' },
  { slug: 'zoho-crm', website: 'https://www.zoho.com/de/crm' },
]

function truncate(str: string, n = 50): string {
  return str.length > n ? str.slice(0, n) + '…' : str
}

async function main() {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma

  const execute = startScript()

  let updated = 0
  let linksCreated = 0
  let notFound = 0

  for (const entry of TOOL_WEBSITES) {
    const tool = await prisma.tool.findUnique({
      where: { slug: entry.slug },
      select: {
        id: true,
        slug: true,
        vendorId: true,
        vendor: { select: { id: true, website: true } },
        affiliateLinks: { where: { isActive: true }, select: { id: true, trackingSlug: true } },
      },
    })

    if (!tool) {
      console.log(`⚠  SLUG NICHT GEFUNDEN: ${entry.slug}`)
      notFound++
      continue
    }

    // 1. Vendor website
    const oldWebsite = tool.vendor?.website ?? ''
    const websiteChanged = oldWebsite !== entry.website
    if (websiteChanged) {
      console.log(`✓  ${entry.slug}: website ${oldWebsite ? truncate(oldWebsite) : '(leer)'} → ${truncate(entry.website)}`)
      if (execute) {
        await prisma.vendor.update({
          where: { id: tool.vendor.id },
          data: { website: entry.website },
        })
      }
      updated++
    } else {
      console.log(`-  ${entry.slug}: website bereits korrekt`)
    }

    // 2. AffiliateLink
    if (tool.affiliateLinks.length > 0) {
      console.log(`   Link: bereits vorhanden (${tool.affiliateLinks[0].trackingSlug})`)
    } else {
      const trackingSlug = `${tool.slug}-direct`
      console.log(`   Link: würde angelegt (${trackingSlug})`)
      if (execute) {
        try {
          await prisma.affiliateLink.create({
            data: {
              toolId: tool.id,
              label: 'Zum Anbieter',
              url: entry.website,
              trackingSlug,
              isActive: true,
              isPrimary: true,
            },
          })
          linksCreated++
        } catch (err) {
          console.log(`   ⚠ Link-Fehler: ${err instanceof Error ? err.message : String(err)}`)
        }
      } else {
        linksCreated++
      }
    }
  }

  console.log(`\n═══ Zusammenfassung ═══`)
  console.log(`Websites aktualisiert: ${updated}`)
  console.log(`Links angelegt:        ${linksCreated}`)
  console.log(`Slugs nicht gefunden:  ${notFound}`)
  if (!execute) console.log('\n[DRY-RUN] Keine Änderungen geschrieben.')
  else console.log('\n✓ Fertig.')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
