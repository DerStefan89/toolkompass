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
import { join } from 'node:path'

const befunde = []

console.log('\n=== Doku-Check ===\n')

// ─── Prüfung 1: Zeigt jeder Pfad-Verweis auf etwas Existierendes? ───────────
//
// Geprüft werden nur ANWEISUNGSDOKUMENTE — was dort steht, wird befolgt.
// docs/STATUS.md ist bewusst nicht dabei: Eine Planungsdatei spricht per Definition
// über Dateien, die noch nicht oder nicht mehr existieren.
//
// Verweise mit "/" werden gegen den genauen Pfad geprüft. Nackte Dateinamen ohne "/"
// sind im Repo-Root oft die korrekte Schreibweise (ARCHITECTURE.md, package.json,
// sentry.server.config.ts) — sie werden deshalb gegen alle Dateinamen im Repo geprüft,
// nicht übersprungen. Ausgeschlossen von dieser Suche: node_modules, .next, .git,
// _arbeitsmaterial, out, build.
//
// Ausnahmen: Eine Zeile mit "check-docs-ignore:" wird übersprungen. Die Begründung
// steht dann im selben Kommentar — wie bei eslint-disable. Eine Ausnahme ohne
// sichtbare Begründung ist eine Umgehung.

const agentDir = '.claude/agents'
const anweisungsDateien = [
  'CLAUDE.md',
  'ARCHITECTURE.md',
  'README.md',
  ...(existsSync(agentDir)
    ? readdirSync(agentDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => `${agentDir}/${f}`)
    : []),
]

const ausgeschlosseneVerzeichnisse = new Set([
  'node_modules',
  '.next',
  '.git',
  '_arbeitsmaterial',
  'out',
  'build',
])

function sammleDateinamen(dir, sammlung = new Set()) {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (ausgeschlosseneVerzeichnisse.has(eintrag.name)) continue
    const pfad = join(dir, eintrag.name)
    if (eintrag.isDirectory()) {
      sammleDateinamen(pfad, sammlung)
    } else {
      sammlung.add(eintrag.name)
    }
  }
  return sammlung
}

const alleDateinamenImRepo = sammleDateinamen('.')

for (const datei of anweisungsDateien) {
  const zeilen = readFileSync(datei, 'utf-8').split('\n')

  zeilen.forEach((zeile, i) => {
    if (zeile.includes('check-docs-ignore:')) return

    for (const roh of new Set(
      zeile.match(/`[a-zA-Z0-9_\-./[\]]+\.(md|ts|tsx|css|json|mjs)`/g) ?? []
    )) {
      const pfad = roh.replaceAll('`', '')

      if (pfad.includes('/')) {
        if (!existsSync(pfad)) {
          befunde.push(`${datei}:${i + 1}: Verweis auf \`${pfad}\` — Datei existiert nicht`)
        }
      } else if (!alleDateinamenImRepo.has(pfad)) {
        befunde.push(
          `${datei}:${i + 1}: Verweis auf \`${pfad}\` — Datei existiert nirgends im Repo`
        )
      }
    }
  })
}

// ─── Prüfung 2: Stehen Versionsnummern nur in package.json? ─────────────────
//
// Eine Version an zwei Stellen ist an einer Stelle schon falsch — man weiß nur noch
// nicht, an welcher. Quelle ist package.json, alles andere verweist darauf.
//
// Ausnahmen: Eine Zeile mit "check-docs-ignore:" wird übersprungen. Die Begründung
// steht dann im selben Kommentar — wie bei eslint-disable. Eine Ausnahme ohne
// sichtbare Begründung ist eine Umgehung.

const versionsMuster = [
  /\bv?\d+\.\d+\.\d+\b/g,
  /\b(Next\.js|React|Prisma|Tailwind|TypeScript|Node|ESLint|Supabase|Sentry)\s+v?\d[\d.]*/g,
]

// Deutsche Datumsangaben (Tag.Monat.Jahr, z. B. "02.08.2026") passen zufällig auf
// \d+\.\d+\.\d+ und sähen sonst wie Versionsnummern aus. Der Ausschluss steht hier
// in der Prüflogik und nicht als check-docs-ignore-Marker im Text: Eine Datumsangabe
// ist keine berechtigte Ausnahme von der Regel, sondern ein Muster, das der Prüfer
// von vornherein nicht hätte melden dürfen — sonst bräuchte jede künftige
// Datumsangabe in einem Anweisungsdokument denselben Marker.
const istDatum = (treffer) => /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(treffer)

for (const datei of ['CLAUDE.md', 'ARCHITECTURE.md']) {
  const zeilen = readFileSync(datei, 'utf-8').split('\n')

  zeilen.forEach((zeile, i) => {
    if (zeile.includes('check-docs-ignore:')) return

    for (const muster of versionsMuster) {
      for (const treffer of new Set(zeile.match(muster) ?? [])) {
        if (istDatum(treffer)) continue
        befunde.push(
          `${datei}:${i + 1}: Versionsnummer "${treffer}" — Versionen gehören nur in package.json`
        )
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