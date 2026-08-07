# ToolSucher — Claude Code Master-Kontext

## Pflichtlektüre
Lies `ARCHITECTURE.md` bevor du Code schreibst.
Alle Konventionen dort sind verbindlich.

---

Du arbeitest am Produkt **ToolSucher**.

ToolSucher ist eine Plattform für Gründer, Selbstständige, Coaches, Berater, Agenturen und kleine Teams,
um digitale Business-Tools zu entdecken, zu vergleichen, zu bewerten, zu erwerben und später zu verwalten.

---

## 🎨 Design — VERBINDLICH

Die Screenshots in `design-refs/` sind die **einzige** visuelle Referenz; der Dateiname
benennt die Seite. Kein Redesign, keine neuen Farben, Schatten oder Rundungen ohne
explizite Freigabe.

Design-Tokens: `app/globals.css`. Gestaltungsprinzipien und Maßstäbe:
`docs/design-system.md`.

---

## 🏗️ Technischer Stack

```
Framework:    Next.js (App Router) — Version siehe package.json
Sprache:      TypeScript (strict, 0 Fehler Pflicht)
Styling:      CSS Modules (Mobile-First) + CSS Variables aus globals.css
Datenbank:    PostgreSQL via Supabase (eu-central-1 Frankfurt)
ORM:          Prisma mit pg Driver Adapter (Version siehe package.json)
Auth:         Supabase Auth (app_metadata.role für Admin)
Hosting:      Vercel (Hobby Plan)
Monitoring:   Sentry (nur Production, tracesSampleRate: 0)
Linting:      ESLint (eslint-config-next)
```
### Befehle

```
npm install              # Abhängigkeiten; erzeugt danach automatisch den Prisma-Client
npm run dev              # Entwicklungsserver → http://localhost:3000
npm run build            # Produktions-Build
npm run start            # Produktions-Server lokal
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run test             # Vitest Unit-Tests
npm run check            # lint, typecheck, Doku-Gate, Regel-Gate, Tests — das Tor vor jedem Commit
npx prisma generate      # Prisma-Client nach Schema-Änderung neu erzeugen
npx tsx prisma/seed.ts   # Seed-Daten einspielen
```

**Nicht im Projekt (nicht verwenden):**
- Kein Tailwind-Preflight (nur `@import "tailwindcss/utilities"` für PostCSS)
- Kein Playwright (Pflicht vor Cashback-Webhooks in Phase 6)
- Kein Prettier (ESLint reicht)

Zod ist seit Zyklus 6 im Einsatz (app/api/anfrage, app/api/search, app/api/track/[linkId], Muster: specs/zod-eingabevalidierung.md).

---

## 📐 Arbeitsweise — IMMER einhalten

### Vor jeder Aufgabe: Briefing
```
1. Ziel der Iteration
2. Relevante Design-Referenz (Dateiname nennen)
3. Komponenten und Datenbedarf
4. Zustände: Default / Hover / Empty / Loading / Error
5. Akzeptanzkriterien
6. Risiken
```

### Iterationsprinzip
- Jede Iteration ist klein, prüfbar und abgeschlossen
- Keine großen Funktionspakete auf einmal
- Erst planen, dann umsetzen
- Ein Task nach dem anderen pro Arbeitsverzeichnis — mehrere Arbeitsverzeichnisse (Worktrees) dürfen parallel laufen, siehe unten.
- Ein Schreiber pro Arbeitsverzeichnis. Keine zweite Claude-Sitzung im selben Ordner; parallele Arbeit nur in getrennten git-Worktrees.
- Iterationsende heißt: `git status` prüfen, Freigabe einholen, committen UND pushen. Gegenstück zur Commit-Freigabe-Regel — eine Bremse ohne Gaspedal erzeugt Halden.
- Keine Versionsnummern in Prosa. Versionen stehen ausschließlich in `package.json`.
- Zuschnitt-Heuristik für Handoff-Verträge (Playbook 06): richtig geschnitten heißt — ein Baudurchgang plus höchstens eine Korrekturrunde ohne Eskalation, mit eigenständig prüfbarem Artefakt (Test + grünes npm run check).
- Abhängigkeit von einer vorherigen Phase ist kein Zuschnittsfehler, solange sie im CONTEXT-Abschnitt explizit benannt ist.
- Bei Sonderzeichen/Escape-Sequenzen in Testdaten: Byte-Ebene-Verifikation (Hexdump) gehört in den OUTPUT-Abschnitt — Editor-Anzeige kann täuschen.

### Definition of Done
- [ ] Design bleibt treu (Design-Tokens, keine neuen Farben/Schatten)
- [ ] Komponenten sind wiederverwendbar
- [ ] Props sind typisiert (TypeScript strict, kein `any`)
- [ ] Fehlerzustände berücksichtigt (catch + console.error + captureException)
- [ ] Leere Zustände berücksichtigt (freundlicher Empty-State)
- [ ] Lange Texte zerstören das Layout nicht
- [ ] Mobile Darstellung berücksichtigt (375px default)
- [ ] Jeder Container mit max-width hat auch width: 100%
- [ ] Code ist sinnvoll kommentiert (Datei-Header + JSDoc)
- [ ] `npm run check` → Exit 0 (Lint + Typecheck)
- [ ] KEINE Commits ohne explizite Freigabe
---

Aktueller Phasen-Stand & Scope: siehe docs/STATUS.md

---

Kommentar-Standard für neue Dateien: siehe docs/kommentar-standard.md
Erwartete Skills: `tool-anlegen` (eigener Skill, im Repo). `ponytail` v4.8.4 (fremd, MIT, Quelle: github.com/DietrichGebert/ponytail) — nur SKILL.md kopiert, kein ausführbarer Code. `werkzeug-auswahl` (vendored aus DerStefan89/claude-playbook, Stand 07.08.2026, Commit 57ca0e7). <!-- check-docs-ignore: Versionspin des vendorten Skills, dient dem Herkunftsnachweis -->

## 🔧 Bestehende Helper (NUTZEN, nicht neu schreiben)

Vor dem Schreiben neuer Utility-, Format- oder Auth-Funktionen IMMER erst `lib/utils/`, `lib/data/` und `lib/auth/` prüfen — vorhandene Helper nutzen, nicht neu schreiben (z. B. `formatPreis()`, `toSlug()`, `requireAdmin()`)

### Bestehende Admin-Blaupausen (als Muster verwenden):
- `AffiliateLinkManager.tsx` → Inline-CRUD pro Tool
- `FaqEditor.tsx` → Dynamische Zeilen + Hidden-JSON-Field
- `app/admin/vendors/` → Einfachstes CRUD-Muster (3 Actions, AdminTable, Pagination)

---

## 🤖 Prüfrollen als Subagenten

Drei Prüfrollen liegen als echte Subagenten in `.claude/agents/`: eigener Kontext, keine
Schreibrechte (`tools: Read, Grep, Glob`). Sie werden nicht gelesen, sondern delegiert —
Claude Code wählt sie anhand ihrer `description`.

| Rolle | Wofür |
|---|---|
| `frontend-reviewer` | Code nach dem Bauen prüfen |
| `design-guardian`   | Design-Treue gegen die Screenshots prüfen |
| `qa`                | Akzeptanztests und Randfälle definieren |

Nach jeder UI-Aufgabe Pflicht: `frontend-reviewer` und `design-guardian`.

Sie können ihre Befunde nicht selbst wegräumen — das ist Absicht. Ein Prüfer mit
Schreibrechten wird heimlich zum Autor.

Für das Bauen selbst gibt es bewusst keine Rollen-Datei: Stack und Regeln stehen in
`ARCHITECTURE.md`, der Ablauf im Briefing und in der Definition of Done oben.

---

## 🔄 Entscheidungsregel bei Unsicherheit

1. Design-Screenshot respektieren
2. Aktuellen Scope laut docs/STATUS.md einhalten
3. Wartbarkeit bevorzugen
4. Komplexität reduzieren
5. Entscheidung dokumentieren — niemals stillschweigend in Code verwandeln

---

## ✅ Status-Format (Jede Ausgabe endet damit)

```
## Status
- [ ] Freigegeben
- [ ] Freigegeben mit Hinweisen
- [ ] Nicht freigegeben
- [ ] Blockiert

## Nächster sinnvoller Schritt
...
```
## ⚠️ Bekannte Fallen

- Symptom: git add übernimmt manche Dateien stillschweigend nicht  (OneDrive-ReparsePoints) — Logos fehlten dadurch wochenlang im Repo
- Was tun: Nach jedem git add von Binärdateien (Logos, Bilder): mit git status prüfen, ob sie wirklich staged sind.

- Symptom: eine per Write-Tool erzeugte Datei enthält ein rohes Steuerzeichen (z. B. NUL-Byte) statt der geschriebenen Escape-Sequenz — git diff zeigt danach "Binary files differ" statt eines Zeilen-Diffs.
- Was tun: bei Testdaten mit Sonderzeichen/Escape-Sequenzen den Dateiinhalt per Hexdump verifizieren, nicht der Editor-Anzeige trauen; Korrektur per Node-Skript auf Byte-Ebene, nicht per erneutem Editor-Write.

- Symptom: `git status` meldet Dutzende unangetasteter Dateien als geändert, der Diff zeigt jede Zeile als ersetzt (gleiche Zahl Einfügungen und Löschungen) — tritt auf, wenn dasselbe Repo aus einer Linux-Umgebung betrachtet wird (gemountetes Windows-Verzeichnis). Ursache: Arbeitskopie hat CRLF, die Git-Datenbank LF, und `core.autocrlf` ist dort nicht gesetzt.
- Was tun: Nicht von der Linux-Seite aus stagen oder committen — ein `git add -A` dort checkt hunderte Scheinänderungen ein. Windows-Git ist die maßgebliche Sicht. Zum Gegenprüfen aus Linux: `git diff --ignore-cr-at-eol` oder `file <datei>` gegen `git show HEAD:<datei> | cat -A`.

- Symptom: alle Vitest-Dateien scheitern beim Import ("Vitest failed to find the runner", "Cannot read properties of undefined (reading 'config')"), kein einziger Test läuft — obwohl weder Testcode noch Konfiguration geändert wurden. Das blockierende Test-Gate meldet dann Rot, ohne dass etwas kaputt ist.
- Was tun: Erst wiederholen, bevor man etwas repariert — beobachtet am 07.08.2026 (Node v24.16.0, Vitest-Lauf über npm und npx): mehrfach rot hintereinander, ~20 Minuten später ohne jede Änderung grün, 35 Tests. Die Ursache ist ungeklärt; Verdacht ist OneDrive-Synchronisation während des Laufs (siehe erste Falle), nicht belegt. Nicht am Worker-Pool drehen: `pool` ist in Vitest 4 ohnehin `forks`, eine explizite Angabe ändert nichts. Tritt es erneut auf: Uhrzeit, Node-Version und ob OneDrive gerade synchronisiert festhalten — ohne diese Angaben bleibt der Fehler unerklärbar. <!-- check-docs-ignore: beobachtete Node-Version, dokumentiert die Beobachtungsumgebung — keine Versionsanforderung, die steht in package.json unter engines -->

