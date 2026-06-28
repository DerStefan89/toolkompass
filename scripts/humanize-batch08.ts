/**
 * scripts/humanize-batch08.ts
 * Zweck: Batch 08 Teil B — 1 Comparison updaten (sevdesk-vs-lexware-office)
 *        + 4 neue Comparisons anlegen (notion-vs-clickup, calendly-vs-tidycal,
 *        chatgpt-vs-claude, canva-vs-figma).
 * Aufruf: npx tsx scripts/humanize-batch08.ts [--dry-run]
 */

import * as dotenv from 'dotenv'
import type { PrismaClient, Prisma } from '@prisma/client'

let prisma: PrismaClient
let PrismaNS: typeof Prisma

// ============================================================
// DATEN
// ============================================================

const UPDATE_COMPARISON = {
  slug: 'sevdesk-vs-lexware-office',
  decisionGuide: {
    toolA: [
      'Du willst möglichst einfach mit digitaler Buchhaltung starten.',
      'Du schreibst regelmäßig Rechnungen, brauchst aber keine sehr tiefen kaufmännischen Prozesse.',
      'Du möchtest Belege, Rechnungen und Bankbewegungen ohne lange Einarbeitung zusammenführen.',
      'Du arbeitest allein oder in einem sehr kleinen Setup.',
    ],
    toolB: [
      'Du möchtest Buchhaltung strukturierter und näher an klassischen kaufmännischen Abläufen abbilden.',
      'Du arbeitest regelmäßig mit einem Steuerberater oder brauchst einen sauberen DATEV-Export.',
      'Du willst nicht nur Rechnungen schreiben, sondern Buchhaltung langfristig belastbarer aufsetzen.',
      'Dein Unternehmen wächst aus einem sehr einfachen Freelancer Setup heraus.',
    ],
    alternatives: [
      'FastBill kann sinnvoll sein, wenn Rechnungen und Belege wichtiger sind als eine vollständige Buchhaltung.',
      'Accountable ist interessant, wenn du als Solo-Selbstständiger Buchhaltung und Steuer stärker zusammen denken willst.',
      'Papierkram passt, wenn Zeiterfassung, Projekte und Rechnungen in einem schlanken System laufen sollen.',
    ],
  },
  targetGroups: {
    toolA: [
      'Freelancer, die von Word, Excel oder Papierbelegen weg wollen.',
      'Solo-Selbstständige mit überschaubarer Buchhaltung.',
      'Nutzer, die eine einfache Oberfläche wichtiger finden als maximale Tiefe.',
      'Gründer, die schnell Rechnungen, Belege und Bankkonto verbinden möchten.',
    ],
    toolB: [
      'Selbstständige mit regelmäßigem Belegaufkommen.',
      'Kleine Unternehmen, die Buchhaltung sauberer strukturieren wollen.',
      'Nutzer mit enger Steuerberater-Zusammenarbeit.',
      'Teams oder wachsende Unternehmen, bei denen einfache Rechnungstools nicht mehr reichen.',
    ],
  },
}

type NewComparison = {
  slug: string
  toolASlugs: string[]
  toolBSlugs: string[]
  title: string
  subtitle: string
  keyDifference: string
  verdict: string
  decisionGuide: { toolA: string[]; toolB: string[]; alternatives: string[] }
  targetGroups?: { toolA: string[]; toolB: string[] }
  faqItems?: Array<{ question: string; answer: string }>
}

const NEW_COMPARISONS: NewComparison[] = [
  {
    slug: 'notion-vs-clickup',
    toolASlugs: ['notion'],
    toolBSlugs: ['clickup'],
    title: 'Notion vs ClickUp: Wissensarbeit oder Projektsteuerung?',
    subtitle: 'Notion ist flexibler für Wissen und Dokumentation. ClickUp ist stärker, wenn Projekte, Aufgaben und Verantwortlichkeiten klar gesteuert werden müssen.',
    keyDifference: 'Notion ist ein flexibler Workspace für Wissen, Notizen und einfache Prozesse. ClickUp ist stärker auf operative Projektsteuerung ausgerichtet.',
    verdict: 'Notion passt besser, wenn du Wissen, Dokumentation und einfache Projektstrukturen an einem Ort bündeln willst. ClickUp ist sinnvoller, wenn Aufgaben, Deadlines, Verantwortlichkeiten und Projektstatus klarer gesteuert werden müssen.',
    decisionGuide: {
      toolA: [
        'Du willst Wissen, Notizen, Ideen und einfache Projekte zusammen verwalten.',
        'Du baust gerne eigene Strukturen und Datenbanken auf.',
        'Du arbeitest allein oder in einem kleinen Team mit wenig operativem Overhead.',
      ],
      toolB: [
        'Du brauchst klare Aufgaben, Deadlines, Status und Verantwortlichkeiten.',
        'Du willst Projekte mit mehreren Personen operativ steuern.',
        'Dein Team braucht mehr als eine Notiz- und Dokumentationsplattform.',
      ],
      alternatives: [
        'Trello kann reichen, wenn Kanban-Boards für einfache Aufgaben ausreichend sind.',
        'Asana passt, wenn Projekte und Teamverantwortlichkeiten noch klarer strukturiert werden sollen.',
      ],
    },
    targetGroups: {
      toolA: [
        'Selbstständige und Berater, die Wissen und Projekte flexibel verwalten wollen.',
        'Teams, die Dokumentation und einfache Prozesse verbinden möchten.',
        'Nutzer, die gerne eigene Strukturen aufbauen.',
      ],
      toolB: [
        'Teams mit mehreren parallelen Projekten und Verantwortlichen.',
        'Agenturen und Dienstleister mit klaren Aufgaben und Deadlines.',
        'Nutzer, die mehr brauchen als eine einfache Aufgabenliste.',
      ],
    },
    faqItems: [
      { question: 'Ist Notion ein Projektmanagement Tool?', answer: 'Notion kann für Projektmanagement genutzt werden, ist aber nicht in erster Linie darauf festgelegt. Es ist eher ein flexibler Workspace für Wissen, Notizen, Datenbanken und einfache Prozesse.' },
      { question: 'Wann ist ClickUp besser als Notion?', answer: 'ClickUp ist besser, wenn Aufgaben, Deadlines, Verantwortlichkeiten, Projektstatus und operative Steuerung wichtiger sind als freie Dokumentation.' },
      { question: 'Kann man Notion und ClickUp zusammen nutzen?', answer: 'Ja, das kann sinnvoll sein. Notion kann Wissen und Dokumentation abbilden, während ClickUp Aufgaben und Projekte steuert. Für kleine Teams kann das aber auch unnötig komplex werden.' },
    ],
  },
  {
    slug: 'calendly-vs-tidycal',
    toolASlugs: ['calendly'],
    toolBSlugs: ['tidycal'],
    title: 'Calendly vs TidyCal: Welches Terminbuchungstool passt besser?',
    subtitle: 'Calendly ist etablierter und bietet mehr Tiefe. TidyCal ist schlanker und kann reichen, wenn du einfache Terminbuchung ohne viel System drumherum brauchst.',
    keyDifference: 'Calendly ist die professionellere Lösung für wiederkehrende Terminprozesse. TidyCal ist eher der pragmatische Einstieg, wenn einfache Buchungslinks genügen.',
    verdict: 'Calendly passt besser, wenn Terminbuchung regelmäßig Teil deines Vertriebs, Supports oder Kundengeschäfts ist. TidyCal reicht eher, wenn du gelegentlich Buchungslinks verschickst und keine umfangreichen Workflows brauchst.',
    decisionGuide: {
      toolA: [
        'Du brauchst mehrere Terminarten, Kalenderregeln und professionelle Buchungsabläufe.',
        'Terminbuchung ist regelmäßig Teil deines Kundenprozesses.',
        'Du möchtest später Integrationen und Teamfunktionen nutzen.',
      ],
      toolB: [
        'Du willst einfache Buchungslinks ohne viel Einrichtung.',
        'Du arbeitest allein und hast überschaubare Terminarten.',
        'Du suchst eine schlanke Lösung statt eines umfangreichen Terminsystems.',
      ],
      alternatives: [
        'Google Kalender reicht, wenn du Termine weiterhin manuell abstimmen willst.',
        'HubSpot Meetings kann sinnvoll sein, wenn dein CRM ohnehin HubSpot ist.',
      ],
    },
  },
  {
    slug: 'chatgpt-vs-claude',
    toolASlugs: ['chatgpt'],
    toolBSlugs: ['claude'],
    title: 'ChatGPT vs Claude: Welches KI-Tool passt besser?',
    subtitle: 'ChatGPT ist sehr vielseitig und stark im Alltag. Claude wirkt besonders nützlich, wenn lange Texte, Dokumente und strukturierte Analyse im Vordergrund stehen.',
    keyDifference: 'ChatGPT ist oft der breitere Allrounder für viele Aufgaben. Claude ist häufig stark, wenn lange Inhalte, vorsichtige Argumentation und textnahe Arbeit wichtig sind.',
    verdict: 'ChatGPT passt besser, wenn du ein vielseitiges KI-Tool für Recherche, Schreiben, Ideen, Code und Alltagsaufgaben suchst. Claude kann besser passen, wenn du häufig mit langen Texten, Dokumenten, Analysen oder sauberer Argumentation arbeitest.',
    decisionGuide: {
      toolA: [
        'Du willst ein vielseitiges KI-Tool für viele unterschiedliche Aufgaben.',
        'Du nutzt KI für Texte, Ideen, Code, Analysen und Alltagsfragen.',
        'Du möchtest möglichst viele Funktionen in einem System ausprobieren.',
      ],
      toolB: [
        'Du arbeitest viel mit längeren Texten oder Dokumenten.',
        'Du brauchst eher ruhige, strukturierte und vorsichtige Antworten.',
        'Du willst Entwürfe, Analysen oder Argumentationen ausführlich prüfen lassen.',
      ],
      alternatives: [
        'Perplexity kann sinnvoll sein, wenn aktuelle Web-Recherche im Vordergrund steht.',
        'GitHub Copilot passt besser, wenn es hauptsächlich um Coding im Editor geht.',
      ],
    },
    faqItems: [
      { question: 'Ist ChatGPT oder Claude besser?', answer: 'Das hängt vom Einsatz ab. ChatGPT ist sehr breit einsetzbar. Claude ist besonders interessant, wenn lange Texte, Dokumente und strukturierte Analyse wichtig sind.' },
      { question: 'Welches Tool ist besser für Texte?', answer: 'Beide können gut mit Texten arbeiten. Claude wirkt oft stärker bei langen, ruhigen und analytischen Texten. ChatGPT ist vielseitiger, wenn Texte mit Recherche, Ideen, Formatierung oder anderen Aufgaben kombiniert werden.' },
      { question: 'Sollte man beide Tools nutzen?', answer: 'Für viele Nutzer reicht ein Tool. Wer beruflich viel mit Text, Analyse oder Produktivität arbeitet, kann beide testen und je nach Aufgabe nutzen.' },
    ],
  },
  {
    slug: 'canva-vs-figma',
    toolASlugs: ['canva'],
    toolBSlugs: ['figma'],
    title: 'Canva vs Figma: Design-Tool oder Gestaltungsplattform?',
    subtitle: 'Canva ist besser für schnelle Inhalte und Vorlagen. Figma passt besser, wenn Designsysteme, Interfaces und Zusammenarbeit im Produktdesign wichtig sind.',
    keyDifference: 'Canva richtet sich stärker an Menschen, die schnell gute visuelle Inhalte erstellen wollen. Figma richtet sich stärker an Design, Produktentwicklung und Zusammenarbeit an Interfaces.',
    verdict: 'Canva passt besser, wenn du Social-Media-Grafiken, Präsentationen, einfache Werbemittel oder schnelle Designs brauchst. Figma ist sinnvoller, wenn du Websites, Apps, Designsysteme oder UI-Konzepte professioneller gestalten und mit anderen abstimmen willst.',
    decisionGuide: {
      toolA: [
        'Du brauchst schnell Präsentationen, Grafiken, Social-Media-Inhalte oder einfache Designs.',
        'Du willst mit Vorlagen arbeiten und nicht jedes Layout selbst aufbauen.',
        'Design ist wichtig, aber nicht dein Hauptberuf.',
      ],
      toolB: [
        'Du arbeitest an Websites, Apps, Interfaces oder Designsystemen.',
        'Du brauchst präzisere Gestaltung, Komponenten und Zusammenarbeit mit Entwicklung.',
        'Design ist ein wichtiger Teil deines Produkts oder deiner Kundenarbeit.',
      ],
      alternatives: [
        'Adobe Express kann eine Alternative für schnelle Marketing-Inhalte sein.',
        'Affinity Designer kann passen, wenn du lokal und ohne Abo gestalten willst.',
      ],
    },
  },
]

// ============================================================
// HILFSFUNKTIONEN
// ============================================================

function truncate(str: string, n = 60): string {
  if (!str) return '(leer)'
  return str.length > n ? str.slice(0, n) + '…' : str
}

async function findToolBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
  return prisma.tool.findUnique({ where: { slug }, select: { id: true, slug: true } })
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  dotenv.config({ path: '.env.local', override: true })
  const prismaMod = await import('@/lib/prisma')
  prisma = prismaMod.prisma
  const prismaClient = await import('@prisma/client')
  PrismaNS = prismaClient.Prisma

  const dryRun = process.argv.includes('--dry-run')
  console.log(`\n═══ Humanize Batch 08 ${dryRun ? '[DRY-RUN]' : '[ECHTLAUF]'} ═══\n`)

  // ── Block 1: UPDATE sevdesk-vs-lexware-office ──
  console.log('[UPDATE] sevdesk-vs-lexware-office')
  const existing = await prisma.comparison.findUnique({
    where: { slug: UPDATE_COMPARISON.slug },
    select: { id: true, decisionGuide: true, targetGroups: true },
  })
  if (!existing) {
    console.log('  ⚠  NICHT GEFUNDEN — übersprungen\n')
  } else {
    console.log('  ✓ gefunden')
    console.log(`    decisionGuide: ${existing.decisionGuide ? 'vorhanden → wird überschrieben' : 'leer → NEU'}`)
    console.log(`    targetGroups:  ${existing.targetGroups ? 'vorhanden → wird überschrieben' : 'leer → NEU'}`)
    if (!dryRun) {
      await prisma.comparison.update({
        where: { id: existing.id },
        data: {
          decisionGuide: UPDATE_COMPARISON.decisionGuide as unknown as Prisma.InputJsonValue,
          targetGroups: UPDATE_COMPARISON.targetGroups as unknown as Prisma.InputJsonValue,
        },
      })
      console.log('  ✅ aktualisiert')
    }
    console.log('')
  }

  // ── Block 2: 4 neue Comparisons ──
  for (const comp of NEW_COMPARISONS) {
    console.log(`[NEU] ${comp.slug}`)

    const toolA = await findToolBySlug(comp.toolASlugs[0])
    const toolB = await findToolBySlug(comp.toolBSlugs[0])

    console.log(`  Tool A: ${comp.toolASlugs[0]} → ${toolA ? `gefunden [${toolA.slug}]` : '⚠ NICHT GEFUNDEN'}`)
    console.log(`  Tool B: ${comp.toolBSlugs[0]} → ${toolB ? `gefunden [${toolB.slug}]` : '⚠ NICHT GEFUNDEN'}`)

    if (!toolA || !toolB) {
      console.log('  ⛔ Tool fehlt — übersprungen\n')
      continue
    }

    const existingComp = await prisma.comparison.findUnique({
      where: { slug: comp.slug },
      select: { id: true },
    })
    console.log(`  Aktion: ${existingComp ? 'UPDATE (existiert)' : 'CREATE (neu)'}`)
    console.log(`  title: ${truncate(comp.title)}`)
    console.log(`  verdict: ${truncate(comp.verdict)}`)
    console.log(`  faqItems: ${comp.faqItems?.length ?? 0}`)

    if (!dryRun) {
      const data = {
        slug: comp.slug,
        published: false,
        toolAId: toolA.id,
        toolBId: toolB.id,
        title: comp.title,
        subtitle: comp.subtitle,
        keyDifference: comp.keyDifference,
        verdict: comp.verdict,
        decisionGuide: comp.decisionGuide as unknown as Prisma.InputJsonValue,
        targetGroups: comp.targetGroups
          ? (comp.targetGroups as unknown as Prisma.InputJsonValue)
          : PrismaNS.DbNull,
        faqItems: comp.faqItems && comp.faqItems.length > 0
          ? (comp.faqItems as unknown as Prisma.InputJsonValue)
          : PrismaNS.DbNull,
      }
      if (existingComp) {
        await prisma.comparison.update({ where: { id: existingComp.id }, data })
        console.log('  ✅ aktualisiert')
      } else {
        await prisma.comparison.create({ data })
        console.log('  ✅ angelegt (published: false)')
      }
    }
    console.log('')
  }

  console.log('═══ Zusammenfassung ═══')
  console.log(`1 Update + ${NEW_COMPARISONS.length} neue Comparisons geprüft`)
  if (dryRun) console.log('\n[DRY-RUN] Keine Änderungen geschrieben.')
  else console.log('\n✓ Fertig.')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
