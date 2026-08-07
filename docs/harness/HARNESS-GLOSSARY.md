<!-- Ziel-Pfad im Repo: docs/harness/HARNESS-GLOSSARY.md -->
# Harness Glossary

Begriffe aus der Playbook-Bibliothek (`claude-playbook`, Zyklen 1–2.5) und aus der Harness-Praxis
dieses Projekts. Vollständige Herleitung siehe `Lessons-Learned-Zyklen-1-2-2.5.md`, Abschnitt 13.

| Begriff | Einfache Erklärung | Funktion im Harness | Beispiel aus dem Projekt |
|---|---|---|---|
| Harness | Die Arbeitsumgebung um ein Modell herum statt der einzelne Auftrag | Rahmen für Zuverlässigkeit aus Struktur | CLAUDE.md + ARCHITECTURE.md + `.claude/` |
| Kontextfenster | Wie viel Text ein Modell gleichzeitig "im Kopf" hat | Begrenzt, was pro Runde geladen werden sollte | Grund für Auslagerung `design-system.md` |
| Token | Kleinste abgerechnete Texteinheit | Kostenbasis | Jede geladene Datei zählt |
| CLAUDE.md | Immer geladene Projekt-Bibel | Stabiles Grundwissen jeder Runde | `toolkompass/CLAUDE.md` |
| ARCHITECTURE.md | Verbindliche Code-Konventionen | Einheitliche Architekturentscheidungen | Tabelle "Verboten/Erlaubt" |
| Skill | Fähigkeit, die erst bei Bedarf lädt | Spart Tokens bis zum Bedarf | `tool-anlegen`, `ponytail`, `repo-audit`, `git-flow`, `werkzeug-auswahl` |
| Agent / Subagent | Agent mit eigenem, isoliertem Kontext | Prüft unabhängig vom Hauptagenten | `design-guardian`, `frontend-reviewer`, `qa`, `architecture-advisor` |
| Command | Per `/name` aufrufbarer, vordefinierter Prompt | Standardisiert wiederkehrende Anfragen | `.claude/commands/lessons.md` |
| Hook | Script, das bei einem Lifecycle-Event IMMER läuft | Setzt Regeln technisch durch | `session-reminder.js`, PostToolUse-Lint-Hook |
| Tool | Fähigkeit, die Claude aufrufen kann | Verbindet Modell mit Außenwelt | Bash, Read, Edit |
| MCP | Offener Standard für externe System-Anbindung | Liefert Zugriff, den Skills anleiten | Playbook-Konzept, im Projekt nicht direkt sichtbar |
| Workflow | Feste Schrittfolge für eine Aufgabe | Wird in Skills/Commands festgehalten | 8-Schritte-Ablauf in `tool-anlegen` |
| Orchestrator | Rolle, die andere Agenten/Phasen koordiniert | Plant statt selbst zu bauen | Bewusst nicht besetzt — `grep -i orchestr` in `CLAUDE.md` liefert keinen Treffer (Korrektur 05.08.2026, per Repo-Audit `state/repo-audit-zyklus4.md` widerlegt; vorherige Zeile hier behauptete fälschlich das Gegenteil) |
| Loop | Wiederholender, automatisierter Ablauf mit Evaluator und Zeit-/Event-Trigger | Skaliert Arbeit über Sessions hinaus | Playbook-04-Thema — in Zyklus 4 bewusst nicht gebaut, da kein Zeit-Trigger existiert (`state/triggers.md`, Abschnitt „Geplante Trigger"); Abgrenzung zu Pipeline/Stern in `state/repo-audit-zyklus4.md` Abschnitt 1.4 |
| Template | Wiederverwendbare Vorlage-Struktur | Beschleunigt neue Projekte/Skills | Geplantes "Template-Repo" |
| Script | Ausführbarer Code für Daten-/Wartungsaufgaben | Automatisiert wiederkehrende Aufgaben | `check-docs.mjs`, `_mode.ts` |
| Dry-Run | Lauf, der alles außer Schreiben tut | Verhindert versehentliche Datenänderung | `_mode.ts` |
| Test | Automatisierte Verhaltensprüfung | Fängt Regressionen | Vitest, blockierend in `npm run check` seit Zwischenzyklus 4.5 |
| Linting | Automatisierte Stilprüfung | Deterministisches Gate | `npm run lint` |
| Typecheck | Prüfung der Typkonsistenz | Deterministisches Gate | `npm run typecheck` |
| Build | Erzeugt lauffähiges Artefakt aus Quellcode | Muss fehlerfrei laufen vor Deploy | `next build` |
| CI | Automatische Prüfung nach jedem Push, fremde Maschine | Fängt lokal unsichtbare Fehler | `.github/workflows/ci.yml` |
| CI-Gate | CI-Prüfung, die das Mergen blockiert | Macht Regel technisch statt höflich | `npm run check` in `ci.yml` |
| Pre-Commit | Prüfung vor lokalem Commit | Fängt Fehler vor dem Repo | Im Projekt nicht gefunden |
| Permission | Explizit erteilte Erlaubnis | Ebene 1 der Qualitätspyramide | `.claude/settings.json` |
| Validierung | Prüfen, ob Eingabe/Zustand Regeln entspricht | Schützt Vertrauensgrenzen | Zod an drei von vier Endpunkten, `/auth/confirm` offen, Muster in `specs/zod-eingabevalidierung.md` |
| Verifikation | Prüfen, ob Behauptung mit Wirklichkeit übereinstimmt | Grundhaltung der Analyse | Agent-Tabelle vs. Realität |
| Guardrail | Leitplanke gegen riskante Aktionen | Trennt vertrauenswürdige von fremden Inhalten | Konzeptionell, noch nicht gebaut |
| Single Source of Truth | Ein Fakt hat genau eine Heimat | Verhindert Drift | `docs/STATUS.md` für Phasenstand |
| Anti-Pattern | Wiederkehrender, benannter Fehlerweg | Macht Fehler erkennbar | "Die ungeprüfte Kopie" |
| "Bitte statt Gesetz" | Regel nur im Text statt technisch erzwungen | Zentrale Diagnosefrage | ARCHITECTURE.md-Verbote ohne Linter |
| Drift | Lautloses Auseinanderlaufen zweier Stellen | Normalzustand, gegen den Sanierung arbeitet | CLAUDE.md-Agent-Tabelle vs. Realität |
| Deterministisches Gate | Prüfung, die nicht verhandelt | Ebene 2 der Qualitätspyramide | `npm run check` in CI |
| Evaluator | Instanz, die Nein sagen kann | Bestimmt, was nicht durchkommt | `qa`-Subagent, CI |
| Advisor | Prüft einen Plan, bevor gebaut wird — anders als der Reviewer, der das fertige Ergebnis beurteilt | Findet unbelegte Annahmen/fehlende Fehlerpfade vor den Bau-Kosten | `architecture-advisor`, Plan v1 → Findings → Plan v2 bei der Preis-Ableitung |
| Branch Protection | GitHub-Regel, die Pushes/Merges auf einen Branch an Bedingungen bindet | Macht „CI muss grün sein" technisch statt höflich; ohne „Do not allow bypassing" kann der Repo-Admin sie umgehen | `main` in toolkompass, Required Status Check `check`, seit Zyklus 3 ohne Bypass |
| Kalibrieren | Gate so einstellen, dass es Echtes findet | Voraussetzung für Vertrauen | `check-docs.mjs`, "viermal kalibriert" |
| Fehlalarm | Befund, der keiner ist | Größtes Risiko für Gate-Akzeptanz | Datums-Ausnahme in `check-docs.mjs` |
| Gegentest | Absichtlich Verstoß erzeugen zum Beweis | Ohne ihn ist "grün" unbewiesen | Nicht dokumentiert im Projekt |
| Isolation | Getrennter Kontext/Arbeitsverzeichnis | Voraussetzung für unabhängige Prüfung | Jeder Subagent |
| Frontmatter | YAML-Block am Dateianfang | Bestimmt Name/Trigger/Tools | `.claude/agents/*.md` |
| Progressive Disclosure | Drei-Ebenen-Ladeprinzip bei Skills | Grund für geringe Kosten ungenutzter Skills | Ponytail/tool-anlegen |
| Vendoring | Fremden Code bewusst ins Repo aufnehmen | Pinning + Lizenzpflicht | `ponytail/LICENSE` |
| Case-Sensitivity | Groß-/Kleinschreibung linux=ja, windows=nein | Erklärt CI-Funde, die lokal unsichtbar bleiben | `status.md` → `STATUS.md` |
| Anweisungsdokument vs. Planungsdokument | Ersteres muss wörtlich wahr sein, Letzteres nicht | Bestimmt Prüfbarkeit | CLAUDE.md vs. STATUS.md |
| State-File | Datei, die aktuellen Stand festhält | Gegenstück zum "Verlaufs-Gläubigen" | `docs/STATUS.md`, `state/gates.md` |
| Assumption Ledger | Tabelle unausgesprochener Annahmen, von einem frischen Kontext gegen ein reales System erzeugt | Macht Annahmen sichtbar, die niemand hinterfragt hat, bevor sie zum Vorfall werden | `state/assumption-ledger.md`, 9 Einträge (Anhang B Phase 1) |
| ADR | Kurzdokument pro Architekturentscheidung | Hält "Warum" fest | `docs/adr/0001-namensentscheidung.md` |
| Prompt-Injection | Fremder Inhalt als Anweisung statt Material gelesen | Grund für eigene Datenblöcke | Relevant für ungeschützte API-Endpunkte |
| Handoff-Vertrag | Datei mit GOAL/CONTEXT/SCOPE/BUDGET/OUTPUT/ESCALATE für eine Übergabe zwischen Sessions/Kontexten | Verhindert Context Drift beim Weiterreichen einer Aufgabe | `state/tasks/check-rules-geruest.md` |
| Worktree | Zweites Arbeitsverzeichnis desselben Git-Repos auf einem eigenen Branch | Isolation für parallele Arbeit ohne Zweitschreiber im selben Ordner | Zwei externe Worktrees in Zyklus 4 (Übung 2), außerhalb von OneDrive wegen Cloud-Files-Tag auf `.claude` |
| Stern (Topologie) | Ein Orchestrator/Mensch verteilt an mehrere unabhängige, parallele Worker/Prüfer | Fächert Arbeit oder Prüfung gleichzeitig auf | Als Prüf-Stern: `frontend-reviewer` + `design-guardian` nach jeder UI-Aufgabe; als Arbeits-Stern real erprobt in Zyklus 4 Übung 2 (zwei Tasks, zwei Worktrees) |
| Pipeline (Topologie) | A→B→C mit einem Übergabe-Artefakt je Stufe | Macht Zwischenstände prüfbar statt nur das Endergebnis | Plan v1 → Advisor-Findings → Plan v2 → Bau → Review (Zyklus 3, `state/plan-v1-pricing.md` u. a.) |
| Council (Topologie) | Mehrere unabhängige, adversariale Prüfer auf dasselbe Artefakt | Deckt Lücken auf, die ein einzelner Prüfer übersieht | Ansatzweise vorhanden: vier read-only Subagenten, aber ohne gleichzeitigen Fächer auf ein Artefakt (`state/repo-audit-zyklus4.md`, Konzept 4) |
| Trigger-Inventar | Tabelle aller Ereignisse, die ein Gate oder eine Aktion auslösen, mit Besitzer/Cap/Eskalation | Macht Auslösung sichtbar, nicht nur die Blockierwirkung | `state/triggers.md`, sechs reale Trigger |
| Agent Teams | Mehrere Claude-Code-Sitzungen mit geteilter Task-Liste und Mailbox (Peers statt Stern) | Vierte Koordinationsform neben Stern/Pipeline/Council | Experimentell (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), im Projekt bewusst nicht eingesetzt (Rudel-Start-Risiko), s. `state/repo-audit-zyklus4.md` Abschnitt 1.2 |
| Gedächtnis-Hierarchie | Vier Schichten mit je eigener Lebensdauer: Arbeits-, Aufgaben-, Projekt-, Organisationsgedächtnis | Bestimmt, wo eine Information hingehört | `state/memory-map.md` |
| Zwischenstand (Rückwärts-Handoff) | Datei, die eine unterbrochene Aufgabe für die nächste Sitzung zusammenfasst | Überlebt Compaction und Sitzungswechsel, Gegenstück zum Handoff-Vertrag (der wirkt vorwärts, Mensch zu Agent) | `state/zwischenstand/<branch>.md` |
| Kanarienprobe | Ein Codewort im Kontext platzieren und eine frische Sitzung danach fragen, um zu beweisen dass eine stille Kontext-Injektion wirklich ankommt | Ersetzt Vertrauen durch Beleg, wenn ein Mechanismus selbst nicht direkt einsehbar ist | SessionStart-Hook-Kalibrierung, Zyklus 5 |
| Doppel-Heimat | Dieselbe Information lebt an zwei Stellen und kann dadurch auseinanderlaufen | Anti-Pattern, Gegenmittel ist das Heimat-Prinzip | Gate-Kalibrierungsbelege in gates.md UND HARNESS-LEARNING-STATE.md, gefunden und teilweise aufgeräumt in Zyklus 5 |
