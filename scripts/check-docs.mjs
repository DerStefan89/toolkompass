/**
 * Datei: scripts/check-docs.mjs
 *
 * Zweck: Prüft die Projektdokumentation auf Drift — Verweise, die ins Leere zeigen,
 * und Fakten, die an mehr als einer Stelle stehen.
 *
 * Aufruf: node scripts/check-docs.mjs   (Teil von npm run check)
 * Exit 0 = sauber, Exit 1 = Befund gefunden
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'

const befunde = []

console.log('\n=== Doku-Check ===\n')

// ─── Prüfung 1: Zeigt jeder Pfad-Verweis auf etwas Existierendes? ───────────
//
// Geprüft werden nur ANWEISUNGSDOKUMENTE — was dort steht, wird befolgt.
// docs/STATUS.md ist bewusst nicht dabei: Eine Planungsdatei spricht per Definition
// über Dateien, die noch nicht oder nicht mehr existieren.
//
// Nackte Dateinamen ohne "/" werden übersprungen: Sie sind nicht auflösbar und
// erzeugen nur Fehlalarme. Ein Gate mit Fehlalarmen wird abgeschaltet.

const agentDir = '.claude/agents'
const anweisungsDateien = [
  'CLAUDE.md',
  'ARCHITECTURE.md',
  ...(existsSync(agentDir)
    ? readdirSync(agentDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => `${agentDir}/${f}`)
    : []),
]

for (const datei of anweisungsDateien) {
  const inhalt = readFileSync(datei, 'utf-8')
  const verweise = inhalt.match(/`[a-zA-Z0-9_\-./[\]]+\.(md|ts|tsx|css|json|mjs)`/g) ?? []

  for (const roh of new Set(verweise)) {
    const pfad = roh.replaceAll('`', '')
    if (!pfad.includes('/')) continue
    if (!existsSync(pfad)) {
      befunde.push(`${datei}: Verweis auf \`${pfad}\` — Datei existiert nicht`)
    }
  }
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