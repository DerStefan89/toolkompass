/**
 * Datei: lib/utils/form.ts
 *
 * Zweck: Gemeinsame Hilfsfunktionen für die Verarbeitung von Admin-Formulardaten.
 * Zentralisiert Muster die vorher in jeder actions.ts dupliziert waren.
 */

/** Liest einen FormData-Wert und gibt einen getrimmten String zurück. */
export function parseStr(formData: FormData, key: string): string {
  return ((formData.get(key) as string) ?? '').trim()
}

/** Liest einen Textarea-Wert (ein Eintrag pro Zeile) und gibt ein bereinigtes Array zurück. */
export function parseLines(formData: FormData, key: string): string[] {
  const raw = formData.get(key)
  if (!raw || typeof raw !== 'string') return []
  return raw.split('\n').map(s => s.trim()).filter(Boolean)
}

/** Gibt eine Fehlermeldung zurück wenn der Wert leer ist, sonst null. */
export function validateRequired(value: string, fieldName: string): string | null {
  return value ? null : `${fieldName} ist erforderlich.`
}

/** Wandelt einen beliebigen String in einen URL-sicheren Slug um. */
export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
