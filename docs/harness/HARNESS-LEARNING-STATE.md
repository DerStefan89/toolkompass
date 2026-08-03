<!--
Ziel-Pfad im Repo: docs/harness/HARNESS-LEARNING-STATE.md
Diese Datei verändert sich mit jedem abgeschlossenen Zyklus — bei Zyklus-Ende aktualisieren.
Stand dieser Fassung: 03.08.2026, nach Abschluss der Sanierungsschritte zu Zyklen 1, 2, 2.5.
-->
# Harness Learning State

## Abgeschlossene Zyklen

- **Zyklus 1** (Playbook 01 — Fundament) — 🚪✅ bestanden (2026-07-19)
- **Zyklus 2** (Playbook 02 — Context & Token Engineering) — 🚪✅ bestanden (2026-07-27)
- **Zyklus 2.5** (Sanierungsdurchgang) — 🚪✅ bestanden (30.07.–02.08.2026)

**Nicht begonnen:** Zyklus 3 (Playbook 05 — Qualität & Security), 🚪⬜. Reihenfolge danach laut
Master-Briefing: 04 → 03 → 06 → 07 → 09 → 08.

## Bereits gelernt und gebaut (mit Repo-Nachweis)

- CLAUDE.md als schlankes, immer geladenes Fundament (Design-Block ausgelagert, um unter der
  150-Zeilen-Faustregel zu bleiben); Agent-Tabelle korrigiert und aktuell (nur noch
  `design-guardian`, `frontend-reviewer`, `qa`, `architecture-advisor`, Pfade unter `.claude/agents/`)
- Vier unabhängige, schreibgeschützte Subagenten — drei Reviewer (`design-guardian`,
  `frontend-reviewer`, `qa`) und ein Advisor (`architecture-advisor`, prüft Pläne statt fertige Arbeit)
- Zwei vendorte/projekteigene Skills (Ponytail, tool-anlegen) plus ein neuer, noch ungetesteter Skill
  (`repo-audit`, Ist-Stand-Scan)
- `.claudeignore` gegen Cache-Invalidierung
- Doku-Gate (`check-docs.mjs`) scharf geschaltet: Teil von `npm run check`, damit auch Teil des
  CI-Gates in `ci.yml`
- Zwei registrierte Hooks in `.claude/settings.json`: `PostToolUse` (Matcher `Edit|Write`, führt
  `npm run lint --silent` aus) und `UserPromptSubmit` (führt `session-reminder.js` aus,
  Kontext-Hygiene-Hinweis alle 30 Nachrichten)
- Ein sicherer Script-Default (`_mode.ts`, Dry-Run ohne `--execute`)
- Eine laufende CI-Pipeline mit Merge-Block
- Erstes ADR-Paar: `docs/adr/TEMPLATE.md` + `docs/adr/0001-namensentscheidung.md`
- Objective-Gates-Matrix (`state/gates.md`) und Assumption-Ledger-Grundgerüst
  (`state/assumption-ledger.md`, aktuell ohne Einträge)
- Namensentscheidung getroffen: Repo/Domain bleiben `toolkompass`, Produktmarke bleibt „ToolSucher" —
  bewusst getrennt (siehe `docs/STATUS.md`, Abschnitt „Erledigt in Gate 2.5")

## Praktisch getestet (Nachweis im Repo vorhanden)

- CI läuft nachweislich bei Push/PR und prüft Lint + Typecheck + Doku-Gate
- Subagenten-Frontmatter korrekt ohne Schreibrechte gesetzt (vier von vier geprüft)
- `check-docs.mjs`-Einbindung in `npm run check` bestätigt über `package.json` und Commit `c321ffb`
  (2026-08-02 16:56)
- Beide Hooks bestätigt über den vollständigen `hooks`-Block in `.claude/settings.json`

## Noch unsicher / nicht aus dem Repo rekonstruierbar

- Ob das Kosten-Audit (Zyklus-2-Übung 1) und der Ponytail-Diff-Vergleich (Übung 3) je als eigene Datei
  festgehalten wurden (im Repo nicht auffindbar — reine Dokumentationslücke, kein Blocker)

## Offene Fragen für den Menschen (nicht durch Repo-Analyse lösbar)

- Sind die zwei genannten Übungsnachweise (Kosten-Audit, Ponytail-Diff) irgendwo anders dokumentiert,
  oder fehlen sie tatsächlich?

## Voraussetzungen und nächste Schritte für Zyklus 3

Alle vier ursprünglich identifizierten Restpunkte (Doku-Gate scharf schalten, CLAUDE.md-Agent-Tabelle
korrigieren, Hook-Registrierung verifizieren, Namensentscheidung treffen) sind geschlossen. Offen
bleibt nur die optionale, nicht blockierende Nachdokumentation von Kosten-Audit/Ponytail-Diff.
Zyklus 3 (Playbook 05 — Qualität & Security) kann beginnen; `check-rules.mjs` und Secret-Scanner sind
Teil dieses Zyklus, kein Vorbedingung dafür.
