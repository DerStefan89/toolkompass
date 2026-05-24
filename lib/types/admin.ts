/**
 * Datei: lib/types/admin.ts
 *
 * Zweck: Gemeinsame TypeScript-Typen für alle Admin-Server-Actions.
 * Zentralisiert hier statt in jeder actions.ts einzeln definiert zu werden.
 */

// Rückgabetyp aller formularbasierten Server Actions (createX / updateX).
// Wird mit useActionState kombiniert: useActionState<ActionState, FormData>
export type ActionState = {
  error?: string                        // Allgemeiner Fehlertext (z. B. Datenbankfehler)
  fieldErrors?: Record<string, string>  // Validierungsfehler pro Formularfeld
}
