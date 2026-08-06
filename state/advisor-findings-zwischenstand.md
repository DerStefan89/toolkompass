# Advisor-Findings — Rückwärts-Handoff / Zwischenstand (06.08.2026, Plan v1)

Geprüft vom Subagenten `architecture-advisor` vor dem Bau. Urteil: **Freigegeben mit
Hinweisen**, ein blockierender Befund (Worktree-Kollision).

| Befund | Schwere | Belegstelle | Vorschlag |
|---|---|---|---|
| Prämissen zutreffend: kein Handoff, keine PreCompact/SessionStart-Hooks, kein Auto-Memory | — | `.claude/settings.json:18-42` | keiner |
| `state/` ist nicht in `.gitignore` — committen wäre möglich | — | `.gitignore:1-59` | keiner |
| Die Datei fiele automatisch unter die Frische-Regel des Doku-Gates (rekursiv über `state/`); der Plan sagt dazu nichts | Hinweis | `scripts/check-docs.mjs:197-200` | festlegen, ob die Datei den Marker führt |
| "Alter" ist nicht definiert; Dateisystem-mtime ist in einem git-Repo unzuverlässig (Checkout setzt sie neu) | Hinweis | kein Vorbild im Repo | Alter über eingebettetes Datum oder `git log -1 --format=%cI` messen, nicht über mtime |
| Registrierung über Edit/Write ist nicht ausführbar — `guard-settings.js` blockt unbedingt | Hinweis | `.claude/hooks/guard-settings.js:16-34` | Registrierungsweg explizit festhalten |
| Ein fester Pfad, parallel von mehreren Worktrees beschrieben, widerspricht der erprobten Disjunkt-Dateien-Regel | **Blockierend** (im Mehr-Worktree-Fall, den der Plan vorsieht) | `docs/harness/HARNESS-LEARNING-STATE.md:90-91,105-106`; `CLAUDE.md:79-80` | Scope klären oder Pfad pro Branch |
| Namenskollision "HANDOFF" gegen den bestehenden "Handoff-Vertrag" unter `state/tasks/` | Hinweis | `docs/harness/HARNESS-OVERVIEW.md:101-104` | anderen Namen wählen |
| Matcher-Namen sind nur aus dem Plan übernommen, nicht gegen Primärdoku belegt | offene Unsicherheit | Präzedenzfall `state/gates.md:30-48` | vor dem Bau verifizieren |
| Die Kalibrierung deckt nur den blockierenden `manual`-Pfad ab, nicht den kritischeren `auto`-Pfad | Hinweis | Plan Punkt 4/5 | Kalibrierungsschritt für `auto` ergänzen |
| Keine Event-Kollision mit den drei bestehenden Hooks | — | `.claude/settings.json:18-42` | keiner |
| Jeder Schreibvorgang löst zusätzlich den PostToolUse-Lint-Hook aus | Hinweis (nur Kosten) | `.claude/settings.json:27-34` | keiner |

## Einarbeitung (Plan v2, Entscheidungen des Menschen)

1. Pfad `state/zwischenstand/<branch>.md` — löst Worktree-Kollision und Namenskollision.
2. Nicht committet. Begründung aus der Vier-Schichten-Hierarchie (Playbook 03 §1):
   Aufgaben-Gedächtnis lebt so lange wie die Aufgabe, committet wird Projekt-Gedächtnis.
   Bleibendes wird per Beförderungsregel in `state/tasks/`-Nachträge, `state/gates.md`
   oder `docs/harness/HARNESS-LEARNING-STATE.md` gehoben.
3. Kein `Stand dieser Fassung:`-Marker — sonst bewachen zwei Wächter dieselbe Datei mit
   widersprüchlichen Fehlermodi (Build vs. Compaction).
4. Alter über die eingebettete Zeile `Zuletzt aktualisiert:`, nicht über mtime und nicht
   über git (die Datei ist nicht versioniert). Schwelle 60 Minuten.
5. `PreCompact` blockiert nur bei `manual`; bei `auto` nur Warnung.
6. Registrierung von Hand durch den Menschen. Der vom Advisor vorgeschlagene Bash-Weg
   wurde verworfen: er umgeht den Guard, und eine Umgehung, die einmal funktioniert,
   wird zur Gewohnheit.
7. Matcher gegen Primärdoku (code.claude.com/docs/en/hooks) belegt: `SessionStart` →
   `startup`, `resume`, `clear`, `compact`, `fork`; `PreCompact` → `manual`, `auto`;
   `PreCompact` ist blockierbar. Zusätzlich dort gefunden: `additionalContext` ist auf
   10.000 Zeichen gedeckelt, darüber wird der Text in eine Datei ausgelagert und nur
   Vorschau plus Pfad übergeben.

## Nachtrag: Fehler im eigenen Bestand

`docs/harness/HARNESS-OVERVIEW.md` Punkt 10 nennt als Ausnahmeweg für eine gewollte
Änderung an `.claude/settings.json`: "Hook-Eintrag in `hooks.PreToolUse` temporär
entfernen". Dieser erste Schritt ist selbst ein Edit auf genau die gesperrte Datei —
der dokumentierte Weg ist zirkulär und war nie erprobt. Korrektur gehört in Vertrag 2.
