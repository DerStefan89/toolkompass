/**
 * Datei: lib/utils/format.ts
 *
 * Zweck: Gemeinsame Formatierungsfunktionen.
 */

/**
 * Formatiert einen Monatspreis auf deutsches Zahlenformat.
 *
 * null/undefined → '—'
 * 0              → 'Kostenlos'
 * 9.9            → '9,90 €' (ggf. mit prefix/suffix)
 *
 * Beispiele:
 *   formatPreis(9.9)                              → '9,90 €'
 *   formatPreis(9.9, { prefix: 'ab' })            → 'ab 9,90 €'
 *   formatPreis(9.9, { prefix: 'ab', suffix: '/ Monat' }) → 'ab 9,90 € / Monat'
 */
export function formatPreis(
  price: number | null | undefined,
  opts: { prefix?: string; suffix?: string } = {}
): string {
  if (price == null) return '—'
  if (price === 0) return 'Kostenlos'
  const { prefix = '', suffix = '' } = opts
  return [prefix, `${price.toFixed(2).replace('.', ',')} €`, suffix]
    .filter(Boolean)
    .join(' ')
}
