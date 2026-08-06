<!--
Ziel-Pfad im Repo: docs/harness/HARNESS-OVERVIEW.md
Stabil halten — nur bei echten Struktur-Änderungen am Harness pflegen, nicht bei jedem Feature.
-->
# Harness Overview — toolkompass

Stabile Beschreibung, wie das Claude-Code-Harness dieses Projekts aufgebaut ist und zusammenspielt.
Für Lernstand und offene Punkte siehe `HARNESS-LEARNING-STATE.md`, für Begriffe `HARNESS-GLOSSARY.md`.

## Repo-Grenze: warum `docs/harness/` hier liegt, nicht in `claude-playbook`

`docs/harness/` lebt bewusst in diesem (öffentlichen) Repo, nicht in der privaten Playbook-Bibliothek
(`claude-playbook`). Grund: Jeder neue Chat muss sich per unauthentifiziertem
`raw.githubusercontent.com`-Read selbst bootstrappen können — das funktioniert nur bei einem
öffentlichen Repo. `claude-playbook` bleibt die separate, private Kursbibliothek (Playbooks,
Master-Briefing) mit eigenem Änderungslog; dort landet nichts, das ein fremder Chat lesen muss, um
den Ist-Stand von toolkompass zu verifizieren. Entschieden am 04.08.2026, nach einer Verwechslung
in einer Cowork-Sitzung.

## Aufbau

toolkompass/
├── CLAUDE.md            ← immer geladen: Stack, Regeln, Definition of Done, Agent-Tabelle
├── ARCHITECTURE.md       ← verbindliche Code-Konventionen, Pflichtlektüre vor jedem Commit
├── README.md             ← Setup + Prüf-Workflow für Menschen
├── docs/
│   ├── STATUS.md          ← einzige Quelle für Phasenstand/Scope, Planungsdokument
│   ├── design-system.md   ← Gestaltungsmaßstäbe, nur bei UI-Arbeit lesen
│   ├── kommentar-standard.md
│   ├── adr/                ← Architecture Decision Records (TEMPLATE.md + 0001-namensentscheidung.md)
│   └── harness/             ← dieses Dateipaket
├── state/
│   ├── gates.md               ← Objective-Gates-Matrix, mit echten Kalibrierungsfunden befüllt
│   ├── assumption-ledger.md   ← Annahmen-Protokoll, 9 Einträge (Anhang B Phase 1, Zyklus 3)
│   ├── triggers.md             ← Trigger-Inventar (Playbook 04 §6), sechs reale + zwei geplante Trigger
│   ├── repo-audit-zyklus4.md   ← Ist-Stand-Scan gegen Playbook 04, erste reale Anwendung von `repo-audit`
│   ├── memory-map.md           ← Info-Typ→Heimat-Tabelle (Playbook 03)
│   ├── zwischenstand/          ← Aufgaben-Gedächtnis, NICHT committet außer VORLAGE.md (Playbook 03)
│   └── tasks/                  ← Handoff-Verträge (GOAL/CONTEXT/SCOPE/BUDGET/OUTPUT/ESCALATE je Datei)
├── .claude/
│   ├── settings.json      ← permissions.allow + hooks (PreToolUse-Settings-Guard, PostToolUse-Lint,
│   │                          UserPromptSubmit-Kontexthygiene)
│   ├── agents/            ← design-guardian, frontend-reviewer, qa, architecture-advisor — alle read-only
│   ├── skills/             ← ponytail (vendort), tool-anlegen, repo-audit, git-flow (alle
│   │                          projekteigen/gevettet)
│   ├── commands/            ← lessons.md
│   └── hooks/               ← session-reminder.js (Kontext-Hygiene), guard-settings.js (blockiert
│                                Edit/Write auf die geteilte settings.json, s. Regelhierarchie unten),
│                                zwischenstand-laden.js (SessionStart), zwischenstand-pruefen.js
│                                (PreCompact) — Rückwärts-Handoff (Playbook 03)
├── scripts/
│   ├── check-docs.mjs      ← Doku-Gate, Teil von `npm run check`
│   ├── check-rules.mjs      ← Regel-Gate (Architektur-Regeln aus ARCHITECTURE.md §7), Teil von
│   │                            `npm run check`
│   └── _mode.ts             ← Dry-Run-per-Default für schreibende Scripts
├── .worktreeinclude          ← in jeden neuen Worktree zu kopierende, gitignorierte Dateien (.env,
│                                .env.local)
└── .github/workflows/ci.yml ← npm run check + Secret-Scan (gitleaks) bei Push/PR, Required Status
                                 Check auf `main`, ohne Admin-Bypass

## Marker „Stand dieser Fassung:“

Eine Zeile, die am Zeilenanfang mit der Phrase `Stand dieser Fassung: TT.MM.JJJJ` (oder
`JJJJ-MM-TT`) beginnt, erklärt eine Datei für dieses Datum gültig. Das Doku-Gate
(`check-docs.mjs`, Prüfung 3) erzwingt das: `npm run check` scheitert, wenn irgendwo sonst
im selben Dokument ein jüngeres Datum steht, ohne dass diese Zeile mitgezogen wurde. Die
Konvention ist optional — nicht jede Datei unter `docs/harness/` oder `state/` braucht sie
— und unabhängig vom ADR-Datumsformat (`docs/adr/TEMPLATE.md`, `**Datum:** YYYY-MM-DD`).

## Regelhierarchie (wichtigste Regel des ganzen Harness)

Eine Regel in CLAUDE.md oder ARCHITECTURE.md ist zunächst nur Text — eine Bitte. Erst eine der vier
Ebenen macht sie technisch:

1. **Mensch** — Freigabe, Commit, letzte Entscheidung.
2. **Modell-Evaluator** — `.claude/agents/*` (nur lesend, kein Schreibrecht). `architecture-advisor`
   prüft Pläne vor dem Bauen (Advisor), die anderen drei prüfen fertige Arbeit (Reviewer).
3. **Deterministische Gates** — CI (`npm run check` inkl. `check-docs.mjs` und `check-rules.mjs`,
   plus Secret-Scan per `gitleaks`), Required Status Check auf `main` ohne Admin-Bypass (kein
   direkter Push mehr möglich, auch nicht für den Repo-Admin — nur Branch + PR + Merge-Button).
   Lokal zusätzlich zwei Hooks: `PostToolUse` (`npm run lint` bei jedem Edit/Write) und
   `PreToolUse` (`guard-settings.js`, blockiert Edit/Write auf die geteilte
   `.claude/settings.json` — Permission-Freigaben gehören nach `settings.local.json`).
4. **Permissions/Sandbox** — `.claude/settings.json`.

## Wie Claude mit dem Harness arbeitet

1. CLAUDE.md lädt automatisch beim Session-Start.
2. Vor jeder Aufgabe: Briefing nach CLAUDE.md-Vorlage.
3. Bei UI-Arbeit gezielt `docs/design-system.md` + passende `design-refs/*.png` nachladen.
4. Jeder Edit/Write löst automatisch den Lint-Hook aus (`.claude/settings.json`, `PostToolUse`).
5. Nach UI-Änderung: `design-guardian` prüfen lassen. Nach Frontend-Aufgabe: `frontend-reviewer`.
   Vor einer Architekturentscheidung: `architecture-advisor` gegenprüfen lassen. Vor „fertig": `qa`.
6. Vor Commit: `npm run check` lokal. Push/PR: CI wiederholt es auf frischer Maschine.
7. Neues Tool: Skill `tool-anlegen` (erzwingt Duplikat-Check + Dry-Run). Vor größeren Änderungen:
   Skill `repo-audit` für einen Ist-Stand-Scan.
8. Architekturentscheidungen mit Alternativen: ADR anlegen (`docs/adr/TEMPLATE.md`).
9. Jede Änderung an `main` — auch Doku — läuft über einen eigenen Branch, einen PR und einen grünen
   CI-Check; erst danach über den GitHub-Merge-Button. Direkter Push auf `main` ist technisch
   ausgeschlossen (Branch Protection ohne Admin-Bypass, seit Zyklus 3).
10. Versuch, `.claude/settings.json` per Edit/Write zu ändern: wird vom `guard-settings.js`-Hook
    blockiert. Für eine echte, gewollte Team-Policy-Änderung den Hook-Eintrag in
    `hooks.PreToolUse` selbst vorübergehend entfernen, Grund im Commit nennen, danach
    wiederherstellen.
11. Mehrschritt-Aufgaben, die an eine andere Session/Kontext übergeben werden, als
    Handoff-Vertrag unter `state/tasks/` ablegen (GOAL/CONTEXT/SCOPE/BUDGET/OUTPUT/ESCALATE) —
    nicht nur als Prosa-Prompt im Fenster, sonst entsteht Context Drift (Muster:
    `state/tasks/check-rules-geruest.md`).
12. Für parallele Arbeit an mehreren Tasks: externe git-Worktrees außerhalb des OneDrive-Baums
    anlegen (nicht das `--worktree`-Flag), weil `.claude` in diesem Ordner OneDrives
    Cloud-Files-Tag trägt — Details und Belege in `HARNESS-LEARNING-STATE.md`, Abschnitt
    Zyklus 4.
13. Bei einer Unterbrechung mitten in einer Aufgabe: Zwischenstand in
    state/zwischenstand/<branch>.md schreiben (Vorlage: state/zwischenstand/VORLAGE.md) —
    SessionStart lädt ihn in die nächste Sitzung, PreCompact blockiert eine manuelle
    Compaction ohne frischen Stand.

## Bekannte Lücken (Kurzfassung — Details in HARNESS-LEARNING-STATE.md)

`scripts/check-rules.mjs` (Architektur-Regel-Gate) existiert jetzt (seit Zyklus 4) und ist
blockierender Teil von `npm run check` — der einzige noch offene Punkt aus der ursprünglichen
Zyklus-3-Liste ist damit erledigt. Der Skill `repo-audit` wurde in Zyklus 4 erstmals real auf ein
Playbook-Thema angewendet (`state/repo-audit-zyklus4.md`), nicht mehr nur gebaut und ungetestet.
Ein Loop im engeren Sinn (wiederholender, automatisierter Ablauf mit Zeit-/Event-Trigger) existiert
weiterhin nicht — kein Cron/`schedule:` im Repo, s. `state/triggers.md`, Abschnitt „Geplante
Trigger". Korrektur (04.08.2026): Der Aufbau-Baum oben nannte bis Zyklus 3 eine Datei
`.claude/commands/resume-harness.md`, die im Repo nie existiert hat — entfernt, kein Vorhaben
dahinter bekannt.
