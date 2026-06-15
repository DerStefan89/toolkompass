/**
 * Datei: lib/config/site.ts
 *
 * Zweck: Zentrale Site-Konfiguration (kanonische Domain, Site-Name).
 *
 * Wird aufgerufen von:
 * - app/layout.tsx (metadataBase, Organization JSON-LD)
 * - allen generateMetadata-Funktionen (Canonicals, OG-URLs)
 * - app/sitemap.ts (Basis-URLs)
 *
 * WICHTIG: Die kanonische Domain ist www.toolsucher.de (mit www).
 * Vercel leitet toolsucher.de → www.toolsucher.de per Redirect weiter.
 * Diese Konstante ist die EINZIGE Quelle der Wahrheit für die Domain.
 */

export const SITE_URL = 'https://www.toolsucher.de'
export const SITE_NAME = 'ToolSucher'
