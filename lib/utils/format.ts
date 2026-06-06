/**
 * Datei: lib/utils/format.ts
 *
 * Zweck: Gemeinsame Formatierungsfunktionen.
 */

/**
 * Formatiert einen Preis in Cent auf deutsches Euro-Format.
 * Geldbeträge werden intern als Int (Cent) gespeichert (ARCHITECTURE.md).
 *
 * null + hasFreePlan     → 'Kostenlos'   (prefix/suffix werden ignoriert)
 * null + !hasFreePlan    → 'Auf Anfrage' (prefix/suffix werden ignoriert)
 * 0                      → 'Kostenlos'
 * 990                    → '9,90 €' (ggf. mit prefix/suffix)
 *
 * Beispiele:
 *   formatPreis(990)                                          → '9,90 €'
 *   formatPreis(990, { prefix: 'ab' })                        → 'ab 9,90 €'
 *   formatPreis(990, { prefix: 'ab', suffix: '/ Monat' })     → 'ab 9,90 € / Monat'
 *   formatPreis(null, { hasFreePlan: true })                  → 'Kostenlos'
 *   formatPreis(null, { hasFreePlan: false })                 → 'Auf Anfrage'
 */
export function formatPreis(
  cents: number | null | undefined,
  opts: { prefix?: string; suffix?: string; hasFreePlan?: boolean } = {}
): string {
  if (cents == null) {
    return opts.hasFreePlan ? 'Kostenlos' : 'Auf Anfrage'
  }
  if (cents === 0) return 'Kostenlos'
  const { prefix = '', suffix = '' } = opts
  return [prefix, `${(cents / 100).toFixed(2).replace('.', ',')} €`, suffix]
    .filter(Boolean)
    .join(' ')
}
