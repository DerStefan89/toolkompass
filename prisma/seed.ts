/**
 * prisma/seed.ts
 *
 * Befüllt die Datenbank mit allen Mock-Daten aus dem app/-Ordner.
 * Idempotent: Mehrfaches Ausführen erstellt keine Duplikate (upsert).
 *
 * Ausführen: npx prisma db seed
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Locale, ArticleType } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starte Seed...')

  // ─── VENDORS ─────────────────────────────────────────────────
  const vendorDefs = [
    { slug: 'unbekannt',      name: 'Unbekannt',             website: null },
    { slug: 'notion-labs',    name: 'Notion Labs, Inc.',     website: 'https://www.notion.so' },
    { slug: 'sevdesk',        name: 'sevdesk GmbH',          website: 'https://sevdesk.de' },
    { slug: 'haufe-lexware',  name: 'Haufe Group',           website: 'https://www.lexware.de' },
    { slug: 'fastbill',       name: 'FastBill GmbH',         website: 'https://www.fastbill.com' },
    { slug: 'buhl-data',      name: 'Buhl Data GmbH',        website: 'https://www.meinbuero.de' },
    { slug: 'accountable',    name: 'Accountable SA',        website: 'https://www.accountable.eu' },
    { slug: 'papierkram',     name: 'Papierkram GmbH',       website: 'https://www.papierkram.de' },
    { slug: 'atlassian',      name: 'Atlassian (Loom)',      website: 'https://www.loom.com' },
    { slug: 'figma-inc',      name: 'Figma, Inc.',           website: 'https://www.figma.com' },
    { slug: 'clickup',        name: 'ClickUp Technologies',  website: 'https://clickup.com' },
    { slug: 'canva',          name: 'Canva Pty Ltd',         website: 'https://www.canva.com' },
    { slug: 'anthropic',      name: 'Anthropic',             website: 'https://www.anthropic.com' },
    { slug: 'vivid-money',    name: 'Vivid Money GmbH',      website: 'https://vivid.money' },
    { slug: 'bytedance',      name: 'ByteDance (CapCut)',    website: 'https://www.capcut.com' },
    { slug: 'buffer-inc',     name: 'Buffer Inc.',           website: 'https://buffer.com' },
    { slug: 'calendly-llc',   name: 'Calendly LLC',          website: 'https://calendly.com' },
    { slug: 'appsumotidycal', name: 'AppSumo (TidyCal)',     website: 'https://tidycal.com' },
    { slug: 'openai',         name: 'OpenAI',                website: 'https://openai.com' },
    { slug: 'hubspot-inc',    name: 'HubSpot, Inc.',         website: 'https://www.hubspot.com' },
    { slug: 'zapier-inc',     name: 'Zapier Inc.',           website: 'https://zapier.com' },
  ]

  // Map von Vendor-Slug → DB-ID
  const vendorMap: Record<string, string> = {}
  for (const def of vendorDefs) {
    const v = await prisma.vendor.upsert({
      where: { slug: def.slug },
      update: { name: def.name, website: def.website },
      create: { name: def.name, slug: def.slug, website: def.website },
    })
    vendorMap[def.slug] = v.id
  }

  // Welches Tool gehört zu welchem Vendor-Slug
  const toolVendorMap: Record<string, string> = {
    'notion':        'notion-labs',
    'sevdesk':       'sevdesk',
    'lexware-office':'haufe-lexware',
    'lexoffice':     'haufe-lexware',
    'fastbill':      'fastbill',
    'wiso-meinburo': 'buhl-data',
    'accountable':   'accountable',
    'papierkram':    'papierkram',
    'loom':          'atlassian',
    'figma':         'figma-inc',
    'clickup':       'clickup',
    'canva':         'canva',
    'claude':        'anthropic',
    'vivid':         'vivid-money',
    'capcut':        'bytedance',
    'buffer':        'buffer-inc',
    'calendly':      'calendly-llc',
    'tidycal':       'appsumotidycal',
    'chatgpt':       'openai',
    'hubspot-crm':   'hubspot-inc',
    'zapier':        'zapier-inc',
  }

  console.log(`  ✓ ${vendorDefs.length} Vendors`)

  // ─── TOOLS ───────────────────────────────────────────────────
  type ToolSeed = {
    slug: string
    startingPriceMonthly?: number
    hasFreePlan: boolean
    targetAudiences: string[]
    translation: {
      name: string
      shortDescription: string
      longDescription?: string
      features: string[]
      strengths: string[]
      weaknesses: string[]
      bestFor: string[]
      notIdealFor: string[]
    }
  }

  const toolsData: ToolSeed[] = [
    {
      slug: 'notion',
      startingPriceMonthly: 4.0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'agency', 'consultant'],
      translation: {
        name: 'Notion',
        shortDescription: 'Flexible All-in-One Workspace für Notizen, Wikis, Datenbanken und Projekte.',
        longDescription:
          'Notion kombiniert Notizen, Wikis, Datenbanken und Projektmanagement in einem flexiblen Workspace. Ideal für Teams und Einzelpersonen, die Struktur und Klarheit in ihre Arbeit bringen möchten.',
        features: ['Notizen & Dokumente', 'Datenbanken', 'Aufgaben & Projekte', 'Wikis & Wissen'],
        strengths: ['Sehr flexible Anpassung', 'All-in-One Workspace', 'Starke Datenbank-Funktionen', 'Große Vorlagen-Bibliothek'],
        weaknesses: ['Einarbeitung kann Zeit brauchen', 'Offline-Funktionen limitiert', 'Bei großen Datenbanken kann es langsam werden'],
        bestFor: ['Teams & Unternehmen', 'Selbstständige & Freelancer', 'Studierende & Lernende'],
        notIdealFor: ['Nutzer, die einfache Tools bevorzugen', 'Nutzer, die stark auf klassische CRM- oder ERP-Systeme angewiesen sind'],
      },
    },
    {
      slug: 'sevdesk',
      startingPriceMonthly: 9.9,
      hasFreePlan: false,
      targetAudiences: ['solo', 'freelancer'],
      translation: {
        name: 'sevdesk',
        shortDescription: 'Einfache Buchhaltungssoftware für Selbstständige und Freelancer.',
        longDescription:
          'sevdesk ist ideal für den Einstieg in die digitale Buchhaltung. Rechnungen schreiben, Belege verwalten und E-Rechnung — einfach, schnell und DSGVO-konform.',
        features: ['Rechnungen schreiben', 'Belegerfassung', 'E-Rechnung', 'DATEV Export', 'Bankanbindung'],
        strengths: ['Einfacher Einstieg', 'Gut für Solo-Selbstständige', 'Intuitive Oberfläche'],
        weaknesses: ['Bei komplexeren Anforderungen begrenzt', 'Kein kostenloser Plan'],
        bestFor: ['Solo-Freelancer', 'Selbstständige die einfach starten wollen'],
        notIdealFor: ['Große Teams', 'Komplexe kaufmännische Anforderungen'],
      },
    },
    {
      slug: 'lexware-office',
      startingPriceMonthly: 8.9,
      hasFreePlan: false,
      targetAudiences: ['solo', 'team', 'consultant'],
      translation: {
        name: 'Lexware Office',
        shortDescription: 'Klassische, zuverlässige Buchhaltungssoftware für Selbstständige und KMU.',
        longDescription:
          'Lexware Office ist umfangreicher als viele Alternativen und ideal wenn du mit einem Steuerberater zusammenarbeitest. Starke kaufmännische Funktionen und DATEV-Export.',
        features: ['Buchhaltung', 'Rechnungen', 'DATEV Export', 'UStVA', 'Steuerberaterzugang'],
        strengths: ['Umfangreiche Funktionen', 'Stark für kaufmännische Prozesse', 'Gut für KMU'],
        weaknesses: ['Kann für Einsteiger umfangreicher wirken', 'Mehr Einarbeitung nötig'],
        bestFor: ['Selbstständige & kleine KMU', 'Steuerberater-Zusammenarbeit'],
        notIdealFor: ['Nutzer die einen sehr einfachen Einstieg suchen'],
      },
    },
    {
      slug: 'lexoffice',
      startingPriceMonthly: 7.9,
      hasFreePlan: false,
      targetAudiences: ['solo', 'freelancer'],
      translation: {
        name: 'Lexoffice',
        shortDescription: 'Rechnungen schreiben, Belege erfassen und DATEV-Export für Selbstständige.',
        longDescription:
          'Lexoffice ist einfach, DSGVO-konform und ideal für Selbstständige in Deutschland. Perfekt für Rechnungen, Belegerfassung und Steuervorbereitungen.',
        features: ['Rechnungen', 'Belegerfassung', 'DATEV Export', 'E-Rechnung', 'Bankanbindung'],
        strengths: ['Einfach zu bedienen', 'DSGVO-konform', 'Guter DATEV-Export'],
        weaknesses: ['Kein kostenloser Plan'],
        bestFor: ['Selbstständige', 'Freelancer'],
        notIdealFor: ['Große Teams mit komplexen Anforderungen'],
      },
    },
    {
      slug: 'fastbill',
      startingPriceMonthly: 10.0,
      hasFreePlan: false,
      targetAudiences: ['solo', 'freelancer'],
      translation: {
        name: 'FastBill',
        shortDescription: 'Schnell eingerichtete Buchhaltungssoftware für kleine Unternehmen.',
        features: ['E-Rechnung', 'DATEV', 'Rechnungen', 'Belegerfassung'],
        strengths: ['Schnell eingerichtet', 'Übersichtlich'],
        weaknesses: [],
        bestFor: ['Kleine Unternehmen', 'Freelancer'],
        notIdealFor: [],
      },
    },
    {
      slug: 'wiso-meinburo',
      startingPriceMonthly: 14.9,
      hasFreePlan: false,
      targetAudiences: ['solo', 'team'],
      translation: {
        name: 'WISO MeinBüro',
        shortDescription: 'Komplettlösung für Buchhaltung und Büroverwaltung für Selbstständige.',
        features: ['DATEV', 'Rechnungen', 'Buchhaltung', 'Lohn'],
        strengths: ['Komplettlösung', 'Umfangreich'],
        weaknesses: ['Teurer als Alternativen'],
        bestFor: ['Selbstständige & KMU'],
        notIdealFor: [],
      },
    },
    {
      slug: 'accountable',
      startingPriceMonthly: 8.0,
      hasFreePlan: false,
      targetAudiences: ['solo', 'freelancer'],
      translation: {
        name: 'Accountable',
        shortDescription: 'Moderne Buchhaltung für Selbstständige.',
        features: ['E-Rechnung', 'Steuererklärung', 'Belegerfassung'],
        strengths: ['Modern', 'Einfach', 'Günstig'],
        weaknesses: [],
        bestFor: ['Selbstständige'],
        notIdealFor: [],
      },
    },
    {
      slug: 'papierkram',
      startingPriceMonthly: 4.9,
      hasFreePlan: false,
      targetAudiences: ['solo'],
      translation: {
        name: 'Papierkram',
        shortDescription: 'Minimalistisches Rechnungstool für einfache Zwecke.',
        features: ['Rechnungen', 'Angebote'],
        strengths: ['Minimalistisch', 'Günstig'],
        weaknesses: ['Weniger Funktionen als Alternativen'],
        bestFor: ['Einfache Rechnungsstellung'],
        notIdealFor: ['Komplexe Buchhaltungsanforderungen'],
      },
    },
    {
      slug: 'loom',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'agency'],
      translation: {
        name: 'Loom',
        shortDescription: 'Screen Recording und Kundenupdates per Video.',
        features: ['Screen Recording', 'Video-Sharing', 'Kundenkommunikation'],
        strengths: ['Einfach zu benutzen', 'Kostenloser Plan'],
        weaknesses: [],
        bestFor: ['Freelancer', 'Remote Teams'],
        notIdealFor: [],
      },
    },
    {
      slug: 'figma',
      startingPriceMonthly: 12.0,
      hasFreePlan: false,
      targetAudiences: ['solo', 'team', 'agency', 'developer'],
      translation: {
        name: 'Figma',
        shortDescription: 'Design, Prototyping und Zusammenarbeit für Teams.',
        features: ['UI/UX Design', 'Prototyping', 'Kollaboration', 'Figma AI'],
        strengths: ['Beste Kollaborationsfunktionen', 'Browser-basiert', 'Industriestandard'],
        weaknesses: ['Preis für kleine Teams'],
        bestFor: ['Designer', 'Product Teams'],
        notIdealFor: [],
      },
    },
    {
      slug: 'clickup',
      startingPriceMonthly: 5.0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'agency'],
      translation: {
        name: 'ClickUp',
        shortDescription: 'Aufgaben, Projekte und Teamwork in einem Tool.',
        features: ['Aufgabenmanagement', 'Projekte', 'Zeiterfassung', 'Dashboards'],
        strengths: ['Sehr umfangreich', 'Gutes Free-Angebot'],
        weaknesses: ['Kann für Einsteiger überwältigend sein'],
        bestFor: ['Teams', 'Agenturen'],
        notIdealFor: [],
      },
    },
    {
      slug: 'canva',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'creator'],
      translation: {
        name: 'Canva',
        shortDescription: 'Social Designs und Vorlagen für alle.',
        features: ['Design-Vorlagen', 'Social Media Design', 'Präsentationen', 'Video'],
        strengths: ['Einfach zu bedienen', 'Riesige Vorlagen-Bibliothek', 'Kostenloser Plan'],
        weaknesses: ['Begrenzte Profi-Funktionen'],
        bestFor: ['Content Creator', 'Marketing'],
        notIdealFor: ['Profi-Designer'],
      },
    },
    {
      slug: 'claude',
      startingPriceMonthly: 18.0,
      hasFreePlan: false,
      targetAudiences: ['solo', 'team', 'developer', 'consultant'],
      translation: {
        name: 'Claude',
        shortDescription: 'KI-Assistent für Texte, Ideen und Automatisierung im Business-Alltag.',
        features: ['Texte schreiben', 'Recherche', 'Automatisierung', 'Coding', 'Analyse'],
        strengths: ['Vielseitig', 'Hohe Qualität', 'Langes Kontextfenster'],
        weaknesses: ['Kein dauerhaft kostenloser Plan'],
        bestFor: ['Selbstständige', 'Teams', 'Entwickler'],
        notIdealFor: [],
      },
    },
    {
      slug: 'vivid',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'freelancer'],
      translation: {
        name: 'Vivid',
        shortDescription: 'Modernes Geschäftskonto mit Karte und Cashback.',
        features: ['Geschäftskonto', 'Karte', 'Cashback', 'Ausgabenverwaltung'],
        strengths: ['Kostenloser Basis-Tarif', 'Modern', 'Einfach'],
        weaknesses: [],
        bestFor: ['Selbstständige', 'Freelancer'],
        notIdealFor: ['Große Unternehmen'],
      },
    },
    {
      slug: 'capcut',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['creator', 'solo'],
      translation: {
        name: 'CapCut',
        shortDescription: 'Videos schneiden und Reels erstellen für Instagram und TikTok.',
        features: ['Videoschnitt', 'Automatische Untertitel', 'Reels', 'Effekte'],
        strengths: ['Kostenlos', 'Einfach zu bedienen', 'KI-Funktionen'],
        weaknesses: [],
        bestFor: ['Content Creator', 'Social Media'],
        notIdealFor: [],
      },
    },
    {
      slug: 'buffer',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'creator', 'agency'],
      translation: {
        name: 'Buffer',
        shortDescription: 'Social Media planen und automatisch posten.',
        features: ['Post-Scheduling', 'Analytics', 'Multi-Platform', 'Kalender'],
        strengths: ['Kostenloser Plan', 'Einfach', 'Multi-Channel'],
        weaknesses: [],
        bestFor: ['Content Creator', 'Marketing Teams'],
        notIdealFor: [],
      },
    },
    {
      slug: 'calendly',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'consultant', 'freelancer'],
      translation: {
        name: 'Calendly',
        shortDescription: 'Terminbuchung direkt in deinen Kalender.',
        features: ['Terminbuchung', 'Kalender-Integration', 'Automatische Bestätigung', 'Zahlungen'],
        strengths: ['Sehr einfach', 'Kostenloser Plan', 'Professionell'],
        weaknesses: [],
        bestFor: ['Freelancer', 'Berater'],
        notIdealFor: [],
      },
    },
    {
      slug: 'tidycal',
      startingPriceMonthly: 0,
      hasFreePlan: false,
      targetAudiences: ['solo'],
      translation: {
        name: 'TidyCal',
        shortDescription: 'Günstige Terminbuchungs-Alternative mit einmaligem Kaufpreis.',
        features: ['Terminbuchung', 'Kalender-Integration', 'Zahlungen'],
        strengths: ['Einmaliger Kaufpreis', 'Günstig'],
        weaknesses: ['Weniger Integrationen als Calendly'],
        bestFor: ['Budgetbewusste Selbstständige'],
        notIdealFor: [],
      },
    },
    {
      slug: 'chatgpt',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'developer', 'creator'],
      translation: {
        name: 'ChatGPT',
        shortDescription: 'KI-Assistent von OpenAI für Texte, Recherche und mehr.',
        features: ['Textgenerierung', 'Recherche', 'Code', 'Bilder', 'Plugins'],
        strengths: ['Kostenloser Plan', 'Sehr bekannt', 'Viele Plugins'],
        weaknesses: [],
        bestFor: ['Alle Nutzergruppen'],
        notIdealFor: [],
      },
    },
    {
      slug: 'hubspot-crm',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'agency'],
      translation: {
        name: 'HubSpot CRM',
        shortDescription: 'CRM, Marketing und Vertrieb mit starkem Free-Angebot.',
        features: ['CRM', 'E-Mail Marketing', 'Deals', 'Kontakte', 'Pipelines'],
        strengths: ['Starkes Free-Angebot', 'Umfangreich', 'Gute Integrationen'],
        weaknesses: ['Kann komplex werden', 'Teure Premium-Pläne'],
        bestFor: ['Teams mit Vertriebsfokus'],
        notIdealFor: ['Sehr kleine Unternehmen ohne CRM-Bedarf'],
      },
    },
    {
      slug: 'zapier',
      startingPriceMonthly: 0,
      hasFreePlan: true,
      targetAudiences: ['solo', 'team', 'developer'],
      translation: {
        name: 'Zapier',
        shortDescription: 'Verbinde alle deine Tools automatisch miteinander.',
        features: ['Automatisierung', 'Integrationen', 'Workflows', 'No-Code'],
        strengths: ['Riesige App-Bibliothek', 'Kostenloser Einstieg', 'Einfach'],
        weaknesses: ['Teuer bei vielen Zaps'],
        bestFor: ['Selbstständige', 'Teams die Zeit sparen wollen'],
        notIdealFor: [],
      },
    },
  ]

  const createdTools: Record<string, string> = {}

  for (const t of toolsData) {
    const vendorSlug = toolVendorMap[t.slug] ?? 'unbekannt'
    const vendorId   = vendorMap[vendorSlug] ?? vendorMap['unbekannt']!

    const tool = await prisma.tool.upsert({
      where: { slug: t.slug },
      update: {
        startingPriceMonthly: t.startingPriceMonthly,
        hasFreePlan: t.hasFreePlan,
        targetAudiences: t.targetAudiences,
        published: true,
        publishedAt: new Date(),
        vendorId,
      },
      create: {
        slug: t.slug,
        startingPriceMonthly: t.startingPriceMonthly,
        hasFreePlan: t.hasFreePlan,
        targetAudiences: t.targetAudiences,
        published: true,
        publishedAt: new Date(),
        vendorId,
      },
    })
    createdTools[t.slug] = tool.id

    await prisma.toolTranslation.upsert({
      where: { toolId_locale: { toolId: tool.id, locale: Locale.de } },
      update: { ...t.translation },
      create: { toolId: tool.id, locale: Locale.de, ...t.translation },
    })
  }

  console.log(`  ✓ ${toolsData.length} Tools`)

  // ─── CATEGORIES ──────────────────────────────────────────────
  type CategorySeed = {
    slug: string
    icon: string
    sortOrder: number
    name: string
    description: string
    tools: string[]
  }

  const categoriesData: CategorySeed[] = [
    { slug: 'buchhaltung-rechnungen', icon: '⊞', sortOrder: 1, name: 'Buchhaltung & Rechnungen', description: 'Rechnungen schreiben, Belege verwalten und E-Rechnung vorbereiten.', tools: ['sevdesk', 'lexware-office', 'fastbill', 'wiso-meinburo', 'accountable', 'papierkram', 'lexoffice'] },
    { slug: 'geschaftskonto-finanzen', icon: '🏛', sortOrder: 2, name: 'Geschäftskonto & Finanzen', description: 'Geschäftskonten, Karten und Finanzlösungen für dein Business.', tools: ['vivid'] },
    { slug: 'controlling-ausgabenmanagement', icon: '📊', sortOrder: 3, name: 'Controlling & Ausgabenmanagement', description: 'Ausgaben im Blick behalten und Finanzen smarter steuern.', tools: [] },
    { slug: 'recht-datenschutz-esignatur', icon: '⚖️', sortOrder: 4, name: 'Recht, Datenschutz & E-Signatur', description: 'Verträge erstellen, unterschreiben und rechtlich sicher arbeiten.', tools: [] },
    { slug: 'produktivitat-notizen', icon: '✓', sortOrder: 5, name: 'Produktivität & Notizen', description: 'Notizen, Aufgaben und Ideen effizient organisieren.', tools: ['notion'] },
    { slug: 'projektmanagement', icon: '📋', sortOrder: 6, name: 'Projektmanagement', description: 'Projekte planen, Aufgaben verwalten und Teams koordinieren.', tools: ['clickup'] },
    { slug: 'kalender-calls', icon: '📅', sortOrder: 7, name: 'Kalender & Calls', description: 'Termine planen, Buchungen verwalten und Calls organisieren.', tools: ['calendly', 'tidycal'] },
    { slug: 'meetings-automatisierung', icon: '🎙', sortOrder: 8, name: 'Meetings & Automatisierung', description: 'Meetings aufzeichnen, transkribieren und Workflows automatisieren.', tools: [] },
    { slug: 'screen-recording-kundenupdates', icon: '🎬', sortOrder: 9, name: 'Screen Recording & Kundenupdates', description: 'Bildschirmaufnahmen erstellen und Kunden up-to-date halten.', tools: ['loom'] },
    { slug: 'design-video', icon: '✏️', sortOrder: 10, name: 'Design & Video', description: 'Design, Videoschnitt und Content für Social Media.', tools: ['canva', 'figma', 'capcut'] },
    { slug: 'bildbearbeitung', icon: '🖼', sortOrder: 11, name: 'Bildbearbeitung', description: 'Bilder bearbeiten, optimieren und freistellen.', tools: [] },
    { slug: 'ki-coding', icon: '✦', sortOrder: 12, name: 'KI & Coding', description: 'KI-Assistenten, Coding-Tools und Entwickler-Workflows.', tools: ['claude', 'chatgpt'] },
    { slug: 'website-hosting', icon: '🌐', sortOrder: 13, name: 'Website & Hosting', description: 'Websites erstellen, hosten und skalieren.', tools: [] },
    { slug: 'crm-marketing', icon: '👥', sortOrder: 14, name: 'CRM & Marketing', description: 'Kunden gewinnen, verwalten und Marketing automatisieren.', tools: ['hubspot-crm'] },
    { slug: 'musik-audio-voice', icon: '🎵', sortOrder: 15, name: 'Musik, Audio & Voice', description: 'Musik, Voiceover und Audioproduktionen erstellen.', tools: [] },
    { slug: 'nocode-automation', icon: '🔧', sortOrder: 16, name: 'No-Code & Automation', description: 'Prozesse automatisieren und Tools miteinander verbinden.', tools: ['zapier'] },
    { slug: 'social-media', icon: '📱', sortOrder: 17, name: 'Social Media', description: 'Social-Media-Inhalte planen, erstellen und veröffentlichen.', tools: ['buffer'] },
  ]

  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { icon: c.icon, sortOrder: c.sortOrder, published: true },
      create: { slug: c.slug, icon: c.icon, sortOrder: c.sortOrder, published: true },
    })

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: Locale.de } },
      update: { name: c.name, description: c.description },
      create: { categoryId: category.id, locale: Locale.de, name: c.name, description: c.description },
    })

    for (const toolSlug of c.tools) {
      const toolId = createdTools[toolSlug]
      if (!toolId) continue
      await prisma.toolCategory.upsert({
        where: { toolId_categoryId: { toolId, categoryId: category.id } },
        update: {},
        create: { toolId, categoryId: category.id },
      })
    }
  }

  console.log(`  ✓ ${categoriesData.length} Kategorien`)

  // ─── TAG-GRUPPEN & TAGS ──────────────────────────────────────
  const tagGroupDefs = [
    {
      slug: 'region-compliance',
      name: 'Region & Compliance',
      sortOrder: 1,
      tags: [
        { slug: 'dsgvo-konform',         name: 'DSGVO-konform',         sortOrder: 1 },
        { slug: 'deutsches-unternehmen', name: 'Deutsches Unternehmen', sortOrder: 2 },
        { slug: 'datev-kompatibel',      name: 'DATEV-kompatibel',      sortOrder: 3 },
        { slug: 'e-rechnung',            name: 'E-Rechnung',            sortOrder: 4 },
      ],
    },
    {
      slug: 'plattform',
      name: 'Plattform',
      sortOrder: 2,
      tags: [
        { slug: 'web-app',           name: 'Web-App',           sortOrder: 1 },
        { slug: 'mobile-app',        name: 'Mobile App',        sortOrder: 2 },
        { slug: 'desktop-app',       name: 'Desktop-App',       sortOrder: 3 },
        { slug: 'browser-extension', name: 'Browser-Extension', sortOrder: 4 },
      ],
    },
    {
      slug: 'preismodell',
      name: 'Preismodell',
      sortOrder: 3,
      tags: [
        { slug: 'free-plan-tag',  name: 'Free Plan',    sortOrder: 1 },
        { slug: 'open-source',    name: 'Open Source',  sortOrder: 2 },
        { slug: 'einmalkauf-tag', name: 'Einmalkauf',   sortOrder: 3 },
      ],
    },
  ]

  for (const groupDef of tagGroupDefs) {
    const group = await prisma.tagGroup.upsert({
      where: { slug: groupDef.slug },
      update: { name: groupDef.name, sortOrder: groupDef.sortOrder },
      create: { slug: groupDef.slug, name: groupDef.name, sortOrder: groupDef.sortOrder },
    })
    for (const tagDef of groupDef.tags) {
      await prisma.tag.upsert({
        where: { slug: tagDef.slug },
        update: { name: tagDef.name, sortOrder: tagDef.sortOrder },
        create: {
          slug: tagDef.slug,
          name: tagDef.name,
          sortOrder: tagDef.sortOrder,
          tagGroupId: group.id,
        },
      })
    }
  }

  console.log(`  ✓ ${tagGroupDefs.length} Tag-Gruppen`)

  // ─── TOOL STACK (Selbstständige) ─────────────────────────────
  const stack = await prisma.toolStack.upsert({
    where: { slug: 'selbststaendige' },
    update: { published: true },
    create: { slug: 'selbststaendige', published: true },
  })

  await prisma.toolStackTranslation.upsert({
    where: { toolStackId_locale: { toolStackId: stack.id, locale: Locale.de } },
    update: {
      name: 'Tool-Stack für Selbstständige',
      description: 'Diese 5 Tools decken deinen kompletten Business-Alltag ab — von Buchhaltung bis Social Media.',
      targetAudience: 'Solo-Selbstständige · Freelancer · Creator',
    },
    create: {
      toolStackId: stack.id,
      locale: Locale.de,
      name: 'Tool-Stack für Selbstständige',
      description: 'Diese 5 Tools decken deinen kompletten Business-Alltag ab — von Buchhaltung bis Social Media.',
      targetAudience: 'Solo-Selbstständige · Freelancer · Creator',
    },
  })

  const stackItems = [
    { slug: 'claude', sortOrder: 1, note: 'Texte, Ideen & Automatisierung' },
    { slug: 'lexoffice', sortOrder: 2, note: 'Rechnungen & Buchhaltung' },
    { slug: 'vivid', sortOrder: 3, note: 'Konto & Finanzen' },
    { slug: 'capcut', sortOrder: 4, note: 'Videos erstellen & editieren' },
    { slug: 'buffer', sortOrder: 5, note: 'Social Media planen & posten' },
  ]

  for (const item of stackItems) {
    const toolId = createdTools[item.slug]
    if (!toolId) continue
    await prisma.toolStackItem.upsert({
      where: { toolStackId_toolId: { toolStackId: stack.id, toolId } },
      update: { sortOrder: item.sortOrder, note: item.note },
      create: { toolStackId: stack.id, toolId, sortOrder: item.sortOrder, note: item.note },
    })
  }

  // ─── TOOL STACK (Vorschau / Starter-Stack) ──────────────────
  const stackVorschau = await prisma.toolStack.upsert({
    where: { slug: 'vorschau' },
    update: { published: true },
    create: { slug: 'vorschau', published: true },
  })

  await prisma.toolStackTranslation.upsert({
    where: { toolStackId_locale: { toolStackId: stackVorschau.id, locale: Locale.de } },
    update: {
      name: 'Empfohlener Starter-Stack',
      description: 'Ein ausgewogener Tool-Stack für den Start als Selbstständiger oder Gründer — von Buchhaltung bis Kundenkommunikation.',
      targetAudience: 'Gründer & Selbstständige',
    },
    create: {
      toolStackId: stackVorschau.id,
      locale: Locale.de,
      name: 'Empfohlener Starter-Stack',
      description: 'Ein ausgewogener Tool-Stack für den Start als Selbstständiger oder Gründer — von Buchhaltung bis Kundenkommunikation.',
      targetAudience: 'Gründer & Selbstständige',
    },
  })

  const stackVorschauItems = [
    { slug: 'claude',    sortOrder: 1, note: 'Texte, Ideen & Automatisierung' },
    { slug: 'sevdesk',   sortOrder: 2, note: 'Rechnungen & Buchhaltung' },
    { slug: 'notion',    sortOrder: 3, note: 'Notizen & Organisation' },
    { slug: 'calendly',  sortOrder: 4, note: 'Termine & Kundenbuchungen' },
    { slug: 'loom',      sortOrder: 5, note: 'Updates & Kundenkommunikation' },
  ]

  for (const item of stackVorschauItems) {
    const toolId = createdTools[item.slug]
    if (!toolId) continue
    await prisma.toolStackItem.upsert({
      where: { toolStackId_toolId: { toolStackId: stackVorschau.id, toolId } },
      update: { sortOrder: item.sortOrder, note: item.note },
      create: { toolStackId: stackVorschau.id, toolId, sortOrder: item.sortOrder, note: item.note },
    })
  }

  console.log('  ✓ 2 Tool-Stacks')

  // ─── ARTICLE ─────────────────────────────────────────────────
  const article = await prisma.article.upsert({
    where: { slug: 'beste-tools-freelancer-2025' },
    update: {
      title: 'Die besten Tools für Freelancer 2025',
      subtitle: 'Ein kompletter Guide für Buchhaltung, Projektmanagement, Termine, KI und Kundenorganisation.',
      type: ArticleType.top_list,
      published: true,
      publishedAt: new Date('2025-05-15'),
    },
    create: {
      slug: 'beste-tools-freelancer-2025',
      locale: Locale.de,
      title: 'Die besten Tools für Freelancer 2025',
      subtitle: 'Ein kompletter Guide für Buchhaltung, Projektmanagement, Termine, KI und Kundenorganisation.',
      type: ArticleType.top_list,
      published: true,
      publishedAt: new Date('2025-05-15'),
    },
  })

  await prisma.articleSection.deleteMany({ where: { articleId: article.id } })
  await prisma.articleSection.createMany({
    data: [
      { articleId: article.id, heading: 'Einleitung', content: 'Als Freelancer jonglierst du täglich zwischen Kundenprojekten, Rechnungen, Terminen und Administration. Die richtigen Tools können dir dabei helfen, Zeit zu sparen, professioneller aufzutreten und den Überblick zu behalten. In diesem Guide zeigen wir dir, welche Tools sich in der Praxis bewährt haben.', sortOrder: 0 },
      { articleId: article.id, heading: '1. Buchhaltung & Rechnungen', content: 'Als Freelancer musst du Rechnungen schreiben, Belege verwalten und die Steuer vorbereiten. Gute Buchhaltungssoftware spart dir dabei Stunden pro Monat.\n\n**Empfehlung:** sevdesk für den Einstieg, Lexware Office wenn du mit einem Steuerberater zusammenarbeitest.', sortOrder: 1 },
      { articleId: article.id, heading: '2. Projektmanagement & Organisation', content: 'Den Überblick über mehrere Kundenprojekte gleichzeitig zu behalten ist eine der größten Herausforderungen für Freelancer.\n\n**Empfehlung:** Notion für All-in-One Workspace, ClickUp für komplexere Projekte mit vielen Aufgaben.', sortOrder: 2 },
      { articleId: article.id, heading: '3. Terminbuchung', content: 'Statt endloser E-Mail-Ketten für Terminabsprachen: Lass Kunden einfach direkt in deinen Kalender buchen.\n\n**Empfehlung:** Calendly als Klassiker, TidyCal als günstigere Alternative.', sortOrder: 3 },
      { articleId: article.id, heading: 'Fazit', content: 'Du brauchst als Freelancer keine 20 Tools. Starte mit den Basics: Buchhaltung, Organisation und Terminbuchung. Baue deinen Stack Schritt für Schritt auf — und ersetze Tools nur dann, wenn du ein konkretes Problem damit löst.', sortOrder: 4 },
    ],
  })

  const articleToolSlugs = ['sevdesk', 'notion', 'calendly', 'loom', 'chatgpt']
  for (const toolSlug of articleToolSlugs) {
    const toolId = createdTools[toolSlug]
    if (!toolId) continue
    await prisma.articleTool.upsert({
      where: { articleId_toolId: { articleId: article.id, toolId } },
      update: {},
      create: { articleId: article.id, toolId },
    })
  }

  console.log('  ✓ 1 Artikel')

  // ─── COMPARISON (sevdesk vs Lexware Office) ──────────────────
  const toolAId = createdTools['sevdesk']
  const toolBId = createdTools['lexware-office']

  if (toolAId && toolBId) {
    const comparison = await prisma.comparison.upsert({
      where: { slug: 'sevdesk-vs-lexware-office' },
      update: {
        verdict: 'sevdesk passt besser, wenn du als Solo-Selbstständiger einfache Rechnungen, Belegerfassung und eine intuitive Bedienung suchst. Lexware Office kann besser passen, wenn du mehr kaufmännische Funktionen, strukturierte Buchhaltung und Zusammenarbeit mit Steuerberater:innen brauchst.',
        published: true,
      },
      create: {
        slug: 'sevdesk-vs-lexware-office',
        locale: Locale.de,
        verdict: 'sevdesk passt besser, wenn du als Solo-Selbstständiger einfache Rechnungen, Belegerfassung und eine intuitive Bedienung suchst. Lexware Office kann besser passen, wenn du mehr kaufmännische Funktionen, strukturierte Buchhaltung und Zusammenarbeit mit Steuerberater:innen brauchst.',
        toolAId,
        toolBId,
        published: true,
      },
    })

    await prisma.comparisonRow.deleteMany({ where: { comparisonId: comparison.id } })
    await prisma.comparisonRow.createMany({
      data: [
        { comparisonId: comparison.id, criterion: 'Preis ab', toolAValue: '9,90 € / Monat', toolBValue: '8,90 € / Monat', sortOrder: 1 },
        { comparisonId: comparison.id, criterion: 'Free Plan', toolAValue: '—', toolBValue: '—', sortOrder: 2 },
        { comparisonId: comparison.id, criterion: 'E-Rechnung', toolAValue: '✓', toolBValue: '✓', sortOrder: 3 },
        { comparisonId: comparison.id, criterion: 'DATEV', toolAValue: '✓', toolBValue: '✓', sortOrder: 4 },
        { comparisonId: comparison.id, criterion: 'Belegerfassung', toolAValue: '✓', toolBValue: '✓', sortOrder: 5 },
        { comparisonId: comparison.id, criterion: 'Bedienung', toolAValue: 'einfach', toolBValue: 'umfangreicher', sortOrder: 6 },
        { comparisonId: comparison.id, criterion: 'Für Solo', toolAValue: '✓', toolBValue: '✓', sortOrder: 7 },
        { comparisonId: comparison.id, criterion: 'Für Teams', toolAValue: 'bedingt', toolBValue: '✓', sortOrder: 8 },
      ],
    })

    console.log('  ✓ 1 Vergleich')
  }

  console.log('Seed abgeschlossen.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
