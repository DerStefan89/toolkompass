/**
 * Datei: scripts/check-rules.mjs
 *
 * Zweck: Prüft den Quellcode gegen einen Eintrag der Verbotstabelle aus
 * ARCHITECTURE.md §7 — `as any`/`: any`.
 *
 * Das ebenfalls in §7 verbotene native `<img>`-Tag wird hier bewusst NICHT
 * geprüft: `@next/next/no-img-element` (eslint.config.mjs:13, Severity
 * "error", projektweit) deckt das bereits AST-basiert und blockierend ab
 * (bestätigt durch `npm run lint` → Exit 0 im aktuellen Bestand) und
 * respektiert dabei `eslint-disable-next-line`-Ausnahmen korrekt, was eine
 * Text-Regex nicht könnte. Zweite Prüfung hier wäre Doppelarbeit ohne
 * Mehrwert.
 *
 * Aufruf: node scripts/check-rules.mjs   (Stand jetzt NICHT Teil von npm run check)
 * Exit 0 = sauber, Exit 1 = Befund gefunden
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const befunde = []

console.log('\n=== Regel-Check ===\n')

// ─── Geprüfte Dateien ────────────────────────────────────────────────────────
//
// .ts und .tsx im gesamten Repo. Ausgeschlossen: node_modules, .next, .git,
// _arbeitsmaterial, out, build — wie in scripts/check-docs.mjs.

const ausgeschlosseneVerzeichnisse = new Set([
  'node_modules',
  '.next',
  '.git',
  '_arbeitsmaterial',
  'out',
  'build',
])

function sammleDateien(dir, sammlung = []) {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (ausgeschlosseneVerzeichnisse.has(eintrag.name)) continue
    const pfad = join(dir, eintrag.name)
    if (eintrag.isDirectory()) {
      sammleDateien(pfad, sammlung)
    } else if (pfad.endsWith('.ts') || pfad.endsWith('.tsx')) {
      sammlung.push(pfad)
    }
  }
  return sammlung
}

const geprüfteDateien = sammleDateien('.')

// ─── Regel: `as any` / `: any` ───────────────────────────────────────────────

const anyMuster = [/\bas any\b/, /:\s*any\b/]

for (const datei of geprüfteDateien) {
  const zeilen = readFileSync(datei, 'utf-8').split('\n')

  zeilen.forEach((zeile, i) => {
    for (const muster of anyMuster) {
      if (muster.test(zeile)) {
        befunde.push(`${datei}:${i + 1}: "as any"/": any" gefunden — ${zeile.trim()}`)
      }
    }
  })
}

// ─── Ergebnis ───────────────────────────────────────────────────────────────

if (befunde.length === 0) {
  console.log('✓ Keine Befunde.\n')
  process.exit(0)
}

console.log(`✗ ${befunde.length} Befund(e):\n`)
for (const b of befunde) console.log(`  - ${b}`)
console.log('')
process.exit(1)
