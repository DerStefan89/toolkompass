/**
 * Datei: lib/utils/sort.ts
 *
 * Zweck: Gemeinsame Sortier-Funktionen.
 *
 * Wichtig:
 * Sortiert immer eine Kopie (kein In-Place-Sort), damit aufrufender Code
 * sich auf unveränderte Eingabe-Arrays verlassen kann.
 */

/**
 * Sortiert eine Liste von Tools nach Preis.
 * @param tools - Liste von Tools mit `price`
 * @param order - 'asc' (Standard) für günstigste zuerst, 'desc' für teuerste zuerst
 * @returns Neue, sortierte Liste (Eingabe bleibt unverändert)
 */
export function sortToolsByPrice<T extends { name: string; price: number }>(
  tools: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  const direction = order === 'asc' ? 1 : -1
  return [...tools].sort((a, b) => (a.price - b.price) * direction)
}
