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

// ─── Prüfung 3: Widerspricht ein Datum im Text dem "Stand dieser Fassung:"-Marker? ──
//
// Anlass: docs/harness/HARNESS-LEARNING-STATE.md deklariert in Zeile 4 "Stand dieser
// Fassung: 05.08.2026", enthält aber in den Zeilen 15, 154 und 256 das jüngere Datum
// 06.08.2026 — ein Selbstwiderspruch, den weder Prüfung 1 noch Prüfung 2 bemerkt.
//
// Geltungsbereich: rekursiv docs/harness/ und state/ (inklusive state/tasks/), nur
// .md-Dateien. sammleDateinamen (oben) sammelt nur nackte Dateinamen ohne Pfad und ist
// dafür nicht verwendbar — eigene rekursive Sammlung mit vollständigen Pfaden.
//
// Anker ist die VOLLE Phrase "Stand dieser Fassung:", nicht das Wort "Stand" allein:
// state/tasks/vitest-gate-scharf.md:7 und :12 enthalten "Stand 04.08.2026" bzw.
// "Stand 06.08.2026" — mit einem Anker nur auf "Stand" wäre das ein Fehlalarm. Ebenso
// docs/harness/HARNESS-LEARNING-STATE.md:100 mit "Stand `480d140`": ein Commit-Hash statt
// eines Datums hinter demselben Wort.
//
// Datumsformate im Text: TT.MM.JJJJ (strikt 2-2-4 Ziffern, z. B. "05.08.2026") und
// JJJJ-MM-TT (strikt 4-2-2 Ziffern, z. B. "2026-08-02") — die strikten Gruppenlängen
// verhindern, dass Versionsnummern (siehe Prüfung 2), Zeilenbereiche ("42-43" in
// state/tasks/check-rules-regeln-2.md:18-21) oder Commit-Hashes (480d140) als Datum
// gelesen werden. Eine Uhrzeit hinter dem Datum ist erlaubt und ändert am erkannten
// Datum nichts (Beispiel: HARNESS-LEARNING-STATE.md:130, "2026-08-02 16:56").
//
// Ausnahmen: Eine Zeile mit "check-docs-ignore:" wird übersprungen (repliziert aus
// Prüfung 1/2 oben, Zeilen 74 und 120 — der Mechanismus ist im Bestand pro Prüfung
// dupliziert, nicht global).
//
// Ein Marker-Vorkommen ist eine Aussage einer Datei ÜBER SICH SELBST, keine bloße
// Erwähnung der Konvention. Deshalb zählt nur eine Zeile, die am Zeilenanfang (optional
// mit Whitespace oder einem Markdown-Präfix >, - oder *) mit der Phrase beginnt und
// unmittelbar von einem Datum gefolgt wird. Ohne diese Einschränkung würden Verträge,
// die den Marker selbst BESCHREIBEN statt SETZEN, fälschlich als (mehrdeutiges)
// Vorkommen zählen — real beobachtet in state/tasks/memory-frische-gate.md (Zeilen 7,
// 24, 26, 50, 53 zitieren die Phrase in Prosa/Anführungszeichen, keine davon am
// Zeilenanfang) und state/advisor-findings-memory-gate.md (Zeilen 11, 13, Tabellenzellen
// beginnend mit "|"). Zeile 7 dort ("Stand dieser Fassung: 05.08.2026", enthält aber…")
// zeigt zusätzlich, dass "Phrase unmittelbar gefolgt von einem Datum" allein nicht
// reicht: ohne Zeilenanfang-Bedingung wäre diese Zeile ein gültiger Marker und Zeile 8
// (mit dem jüngeren Datum 06.08.2026) ein neuer Fehlalarm gewesen.

const standMarker = 'Stand dieser Fassung:'
const standDatumsMuster = /\b\d{2}\.\d{2}\.\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g
const standMarkerZeile = /^\s*[>\-*]?\s*Stand dieser Fassung:\s*(\d{2}\.\d{2}\.\d{4}|\d{4}-\d{2}-\d{2})/

function sammleMarkdownDateien(dir, sammlung = []) {
  for (const eintrag of readdirSync(dir, { withFileTypes: true })) {
    if (ausgeschlosseneVerzeichnisse.has(eintrag.name)) continue
    const pfad = join(dir, eintrag.name)
    if (eintrag.isDirectory()) {
      sammleMarkdownDateien(pfad, sammlung)
    } else if (pfad.endsWith('.md')) {
      sammlung.push(pfad)
    }
  }
  return sammlung
}

function parseDatum(treffer) {
  const de = treffer.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (de) return new Date(Number(de[3]), Number(de[2]) - 1, Number(de[1]))
  const [, jahr, monat, tag] = treffer.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return new Date(Number(jahr), Number(monat) - 1, Number(tag))
}

const geprüfteMarkdownDateien = [
  ...sammleMarkdownDateien('docs/harness'),
  ...sammleMarkdownDateien('state'),
]

for (const datei of geprüfteMarkdownDateien) {
  const zeilen = readFileSync(datei, 'utf-8').split('\n')

  const markerZeilen = []
  zeilen.forEach((zeile, i) => {
    if (standMarkerZeile.test(zeile)) markerZeilen.push(i)
  })

  if (markerZeilen.length === 0) continue

  if (markerZeilen.length > 1) {
    befunde.push(
      `${datei}:${markerZeilen[0] + 1}: mehrdeutiger Stand-Marker — "${standMarker}" erscheint mehrfach in dieser Datei`
    )
    continue
  }

  const [markerZeile] = markerZeilen
  const standTreffer = zeilen[markerZeile].match(standMarkerZeile)[1]
  const stand = parseDatum(standTreffer)

  zeilen.forEach((zeile, i) => {
    if (i === markerZeile) return
    if (zeile.includes('check-docs-ignore:')) return

    for (const treffer of new Set(zeile.match(standDatumsMuster) ?? [])) {
      if (parseDatum(treffer) > stand) {
        befunde.push(
          `${datei}:${i + 1}: Datum ${treffer} ist jünger als "Stand dieser Fassung: ${standTreffer}" (Zeile ${markerZeile + 1})`
        )
      }
    }
  })
}

// ─── Prüfung 4: Zieht ein Dokument-Paar den Marker der Zieldatei nach? ──────
//
// Anlass: docs/harness/HARNESS-CHANGELOG.md kann ein jüngeres Datum enthalten als
// der "Stand dieser Fassung:"-Marker in docs/harness/HARNESS-LEARNING-STATE.md —
// eine Auslassung, die Prüfung 3 nicht erfasst, weil sie nur INNERHALB einer Datei
// vergleicht, nicht ZWISCHEN zwei Dateien.
//
// Aus quelle wird der gesamte Dateiinhalt nach Datumstreffern durchsucht (der
// Changelog hat keinen eigenen Marker, nur Tabellenzeilen) und das Maximum gebildet —
// Zellen mit zwei Daten (HARNESS-CHANGELOG.md:8, "2026-07-30 – 2026-08-02") liefern
// zwei Treffer, beide fließen ins Maximum ein. Aus ziel wird der Stand-Marker wie in
// Prüfung 3 gelesen. parseDatum() und standDatumsMuster werden aus Prüfung 3
// wiederverwendet, nicht neu geschrieben.
//
// Ausnahmen: Eine Zeile mit "check-docs-ignore:" wird übersprungen (repliziert aus
// Prüfung 1/2/3, wie dort begründet).

const dokumentPaare = [
  { quelle: 'docs/harness/HARNESS-CHANGELOG.md', ziel: 'docs/harness/HARNESS-LEARNING-STATE.md' },
]

for (const { quelle, ziel } of dokumentPaare) {
  const quellZeilen = readFileSync(quelle, 'utf-8').split('\n')

  let quellMaximum = null
  let quellMaximumTreffer = null
  quellZeilen.forEach((zeile) => {
    if (zeile.includes('check-docs-ignore:')) return
    for (const treffer of new Set(zeile.match(standDatumsMuster) ?? [])) {
      const datum = parseDatum(treffer)
      if (quellMaximum === null || datum > quellMaximum) {
        quellMaximum = datum
        quellMaximumTreffer = treffer
      }
    }
  })

  if (quellMaximum === null) continue

  const zielZeilen = readFileSync(ziel, 'utf-8').split('\n')
  const zielMarkerZeile = zielZeilen.findIndex((zeile) => standMarkerZeile.test(zeile))
  if (zielMarkerZeile === -1) continue

  const zielTreffer = zielZeilen[zielMarkerZeile].match(standMarkerZeile)[1]
  const zielDatum = parseDatum(zielTreffer)

  if (quellMaximum > zielDatum) {
    befunde.push(
      `${quelle}: jüngstes Datum ${quellMaximumTreffer} ist neuer als "Stand dieser Fassung: ${zielTreffer}" in ${ziel}:${zielMarkerZeile + 1} — Ziel-Datei nachziehen oder Marker aktualisieren`
    )
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