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
│   ├── gates.md             ← Objective-Gates-Matrix (welches Gate, blockierend?, Evidenz)
│   └── assumption-ledger.md ← Annahmen-Protokoll (aktuell leeres Grundgerüst)
├── .claude/
│   ├── settings.json      ← permissions.allow + hooks (PostToolUse-Lint, UserPromptSubmit-Kontexthygiene)
│   ├── agents/            ← design-guardian, frontend-reviewer, qa, architecture-advisor — alle read-only
│   ├── skills/             ← ponytail (vendort), tool-anlegen, repo-audit (alle projekteigen/gevettet)
│   ├── commands/            ← lessons.md, resume-harness.md
│   └── hooks/               ← session-reminder.js (Kontext-Hygiene)
├── scripts/
│   ├── check-docs.mjs      ← Doku-Gate, Teil von `npm run check`
│   └── _mode.ts             ← Dry-Run-per-Default für schreibende Scripts
└── .github/workflows/ci.yml ← npm run check bei Push/PR

## Regelhierarchie (wichtigste Regel des ganzen Harness)

Eine Regel in CLAUDE.md oder ARCHITECTURE.md ist zunächst nur Text — eine Bitte. Erst eine der vier
Ebenen macht sie technisch:

1. **Mensch** — Freigabe, Commit, letzte Entscheidung.
2. **Modell-Evaluator** — `.claude/agents/*` (nur lesend, kein Schreibrecht). `architecture-advisor`
   prüft Pläne vor dem Bauen (Advisor), die anderen drei prüfen fertige Arbeit (Reviewer).
3. **Deterministische Gates** — CI (`npm run check`, inkl. `check-docs.mjs`), lokal zusätzlich ein
   `PostToolUse`-Hook, der bei jedem Edit/Write automatisch `npm run lint` auslöst.
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

## Bekannte Lücken (Kurzfassung — Details in HARNESS-LEARNING-STATE.md)

`scripts/check-rules.mjs` (Architektur-Regel-Gate) existiert noch nicht, ebenso kein Secret-Scanner —
beide sind Zyklus-3-Themen, keine offenen Restpunkte aus Zyklus 1/2/2.5. `state/assumption-ledger.md`
ist angelegt, aber noch leer (kein Projekt hat bisher einen Eintrag erzeugt). Der Skill `repo-audit`
ist gebaut, aber noch in keinem echten Zyklus angewendet worden.
