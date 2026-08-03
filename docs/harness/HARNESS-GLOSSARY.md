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
| Skill | Fähigkeit, die erst bei Bedarf lädt | Spart Tokens bis zum Bedarf | `tool-anlegen`, `ponytail`, `repo-audit` |
| Agent / Subagent | Agent mit eigenem, isoliertem Kontext | Prüft unabhängig vom Hauptagenten | `design-guardian`, `frontend-reviewer`, `qa`, `architecture-advisor` |
| Command | Per `/name` aufrufbarer, vordefinierter Prompt | Standardisiert wiederkehrende Anfragen | `.claude/commands/lessons.md` |
| Hook | Script, das bei einem Lifecycle-Event IMMER läuft | Setzt Regeln technisch durch | `session-reminder.js`, PostToolUse-Lint-Hook |
| Tool | Fähigkeit, die Claude aufrufen kann | Verbindet Modell mit Außenwelt | Bash, Read, Edit |
| MCP | Offener Standard für externe System-Anbindung | Liefert Zugriff, den Skills anleiten | Playbook-Konzept, im Projekt nicht direkt sichtbar |
| Workflow | Feste Schrittfolge für eine Aufgabe | Wird in Skills/Commands festgehalten | 8-Schritte-Ablauf in `tool-anlegen` |
| Orchestrator | Rolle, die andere Agenten/Phasen koordiniert | Plant statt selbst zu bauen | In CLAUDE.md genannt, real nicht als Datei vorhanden |
| Loop | Wiederholender, automatisierter Ablauf mit Evaluator | Skaliert Arbeit über Sessions hinaus | Playbook-04-Thema, noch nicht gebaut |
| Template | Wiederverwendbare Vorlage-Struktur | Beschleunigt neue Projekte/Skills | Geplantes "Template-Repo" |
| Script | Ausführbarer Code für Daten-/Wartungsaufgaben | Automatisiert wiederkehrende Aufgaben | `check-docs.mjs`, `_mode.ts` |
| Dry-Run | Lauf, der alles außer Schreiben tut | Verhindert versehentliche Datenänderung | `_mode.ts` |
| Test | Automatisierte Verhaltensprüfung | Fängt Regressionen | Aktuell keiner im Projekt |
| Linting | Automatisierte Stilprüfung | Deterministisches Gate | `npm run lint` |
| Typecheck | Prüfung der Typkonsistenz | Deterministisches Gate | `npm run typecheck` |
| Build | Erzeugt lauffähiges Artefakt aus Quellcode | Muss fehlerfrei laufen vor Deploy | `next build` |
| CI | Automatische Prüfung nach jedem Push, fremde Maschine | Fängt lokal unsichtbare Fehler | `.github/workflows/ci.yml` |
| CI-Gate | CI-Prüfung, die das Mergen blockiert | Macht Regel technisch statt höflich | `npm run check` in `ci.yml` |
| Pre-Commit | Prüfung vor lokalem Commit | Fängt Fehler vor dem Repo | Im Projekt nicht gefunden |
| Permission | Explizit erteilte Erlaubnis | Ebene 1 der Qualitätspyramide | `.claude/settings.json` |
| Validierung | Prüfen, ob Eingabe/Zustand Regeln entspricht | Schützt Vertrauensgrenzen | Für API-Endpunkte noch offen |
| Verifikation | Prüfen, ob Behauptung mit Wirklichkeit übereinstimmt | Grundhaltung der Analyse | Agent-Tabelle vs. Realität |
| Guardrail | Leitplanke gegen riskante Aktionen | Trennt vertrauenswürdige von fremden Inhalten | Konzeptionell, noch nicht gebaut |
| Single Source of Truth | Ein Fakt hat genau eine Heimat | Verhindert Drift | `docs/STATUS.md` für Phasenstand |
| Anti-Pattern | Wiederkehrender, benannter Fehlerweg | Macht Fehler erkennbar | "Die ungeprüfte Kopie" |
| "Bitte statt Gesetz" | Regel nur im Text statt technisch erzwungen | Zentrale Diagnosefrage | ARCHITECTURE.md-Verbote ohne Linter |
| Drift | Lautloses Auseinanderlaufen zweier Stellen | Normalzustand, gegen den Sanierung arbeitet | CLAUDE.md-Agent-Tabelle vs. Realität |
| Deterministisches Gate | Prüfung, die nicht verhandelt | Ebene 2 der Qualitätspyramide | `npm run check` in CI |
| Evaluator | Instanz, die Nein sagen kann | Bestimmt, was nicht durchkommt | `qa`-Subagent, CI |
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
| ADR | Kurzdokument pro Architekturentscheidung | Hält "Warum" fest | `docs/adr/0001-namensentscheidung.md` |
| Prompt-Injection | Fremder Inhalt als Anweisung statt Material gelesen | Grund für eigene Datenblöcke | Relevant für ungeschützte API-Endpunkte |
