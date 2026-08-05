/**
 * Datei: scripts/check-rules.mjs
 *
 * Zweck: Prüft den Quellcode gegen drei Einträge der Verbotstabelle aus
 * ARCHITECTURE.md §7 — `as any`/`: any` (Zeilen-Regex), `take` ohne `skip`
 * und `createClient()` + `getUser()` in Actions (beide AST-basiert über die
 * TypeScript Compiler API).
 *
 * Warum AST für die beiden neuen Regeln statt Zeilen-Regex:
 * - `take`/`skip` stehen im echten Bestand fast immer auf getrennten Zeilen
 *   innerhalb desselben Objekt-Literals (siehe lib/data/tools.ts,
 *   lib/data/tool-finder.ts, lib/data/categories.ts, app/api/search/route.ts).
 *   Eine Zeilen-Regex sähe pro Zeile nur "take" oder nur "skip" und würde
 *   jeden dieser Belege fälschlich als Verstoß melden.
 * - `createClient()` als Text kommt auch in den Funktions-*Deklarationen*
 *   `lib/supabase/server.ts`/`client.ts` vor — eine Text-Regex kann einen
 *   Aufruf nicht von einer Deklaration unterscheiden und würde dort ebenfalls
 *   fälschlich anschlagen. Die AST-Prüfung unten verlangt eine echte
 *   CallExpression.
 * Beide Kalibrierungsfunde und die zugehörigen Gegentests: Bericht zum
 * Vertrag `state/tasks/check-rules-regeln-2.md`.
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
import ts from 'typescript'

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

// ─── Hilfsfunktionen für die AST-Regeln ──────────────────────────────────────

function zeileVon(quelldatei, node) {
  return quelldatei.getLineAndCharacterOfPosition(node.getStart(quelldatei)).line + 1
}

function eigenschaftsName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }
  return null
}

// Eine Datei gilt als Server-Action-Datei, wenn 'use server' als Direktive
// im Prolog des Moduls steht (Next.js-Konvention, so in allen bestehenden
// */actions.ts dieses Repos — siehe app/konto/actions.ts, app/einloggen/actions.ts).
function istActionDatei(quelldatei) {
  for (const statement of quelldatei.statements) {
    if (ts.isExpressionStatement(statement) && ts.isStringLiteral(statement.expression)) {
      if (statement.expression.text === 'use server') return true
      continue
    }
    break
  }
  return false
}

function findeEinschliessendeFunktion(node) {
  let aktuell = node.parent
  while (aktuell) {
    if (
      ts.isFunctionDeclaration(aktuell) ||
      ts.isFunctionExpression(aktuell) ||
      ts.isArrowFunction(aktuell) ||
      ts.isMethodDeclaration(aktuell)
    ) {
      return aktuell
    }
    aktuell = aktuell.parent
  }
  return node.getSourceFile()
}

function enthaeltAufruf(scopeNode, praedikat) {
  let gefunden = false
  function besuchen(n) {
    if (gefunden) return
    if (praedikat(n)) {
      gefunden = true
      return
    }
    ts.forEachChild(n, besuchen)
  }
  besuchen(scopeNode)
  return gefunden
}

function istCreateClientAufruf(node) {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'createClient'
}

function istGetUserAufruf(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'getUser'
  )
}

// ─── Regeln, die pro Datei laufen ─────────────────────────────────────────────

const anyMuster = [/\bas any\b/, /:\s*any\b/]

// Regel: `take` ohne `skip` — direkte Geschwister-Properties im selben
// Objekt-Literal (nicht nur "irgendwo in derselben Datei").
function prüfeTakeOhneSkip(quelldatei, datei) {
  function besuchen(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const direktEigenschaften = node.properties.filter(
        (p) => ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)
      )
      const takeEigenschaft = direktEigenschaften.find((p) => eigenschaftsName(p.name) === 'take')
      const hatSkip = direktEigenschaften.some((p) => eigenschaftsName(p.name) === 'skip')
      if (takeEigenschaft && !hatSkip) {
        befunde.push(`${datei}:${zeileVon(quelldatei, takeEigenschaft)}: "take" ohne "skip" im selben Objekt-Literal`)
      }
    }
    ts.forEachChild(node, besuchen)
  }
  besuchen(quelldatei)
}

// Regel: `createClient()` + `getUser()` in Actions — nur innerhalb von
// Dateien mit 'use server'-Direktive, nur wenn beide Aufrufe in derselben
// umschließenden Funktion vorkommen (nicht nur in derselben Datei).
function prüfeCreateClientPlusGetUser(quelldatei, datei) {
  if (!istActionDatei(quelldatei)) return

  function besuchen(node) {
    if (istCreateClientAufruf(node)) {
      const scope = findeEinschliessendeFunktion(node)
      if (enthaeltAufruf(scope, istGetUserAufruf)) {
        befunde.push(`${datei}:${zeileVon(quelldatei, node)}: "createClient()" + "getUser()" in derselben Action — requireAdmin()/requireUser() verwenden`)
      }
    }
    ts.forEachChild(node, besuchen)
  }
  besuchen(quelldatei)
}

for (const datei of geprüfteDateien) {
  const quelltext = readFileSync(datei, 'utf-8')

  // Regel: `as any` / `: any` (Zeilen-Regex)
  const zeilen = quelltext.split('\n')
  zeilen.forEach((zeile, i) => {
    for (const muster of anyMuster) {
      if (muster.test(zeile)) {
        befunde.push(`${datei}:${i + 1}: "as any"/": any" gefunden — ${zeile.trim()}`)
      }
    }
  })

  // AST-basierte Regeln
  const scriptKind = datei.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  const quelldatei = ts.createSourceFile(datei, quelltext, ts.ScriptTarget.Latest, true, scriptKind)

  prüfeTakeOhneSkip(quelldatei, datei)
  prüfeCreateClientPlusGetUser(quelldatei, datei)
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
