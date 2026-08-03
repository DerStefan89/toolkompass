<!-- Ziel-Pfad im Repo: docs/harness/HARNESS-CHANGELOG.md — nur wesentliche strukturelle Änderungen. -->
# Harness Changelog

| Datum | Änderung |
|---|---|
| 2026-07-19 | Zyklus 1 (Fundament) abgeschlossen: CLAUDE.md, erste Subagenten-Struktur, erster Skill. |
| 2026-07-27 | Zyklus 2 (Context & Token Engineering) abgeschlossen: `.claudeignore`, Ponytail vendort und gevettet, Context-Hygiene-Hook. |
| 2026-07-30 – 2026-08-02 | Zyklus 2.5 (Sanierungsdurchgang): elf Fundstellen „ungeprüfte Kopie" behoben, u. a. Cashback-Falschaussage korrigiert, Agent-Rollen von neun auf drei reduziert, `check-docs.mjs` gebaut und viermal kalibriert, `docs/design-system.md` ausgelagert, `status.md` → `STATUS.md` umbenannt, drei veraltete Anleitungsdokumente entfernt, CI-Pipeline eingerichtet. |
| 2026-08-03 | Abschlussdokumentation der Zyklen 1, 2, 2.5 erstellt. Verbleibender Rest aus Zyklus 2.5 (`agents/frontend-builder.md`, Altlast) identifiziert und bereits vor dieser Prüfung entfernt (Ordner `agents/` existiert nicht mehr). |
| 2026-08-03 | Sanierungsdurchgang zu den vier verbliebenen Restpunkten: Doku-Gate in `npm run check` verdrahtet (bereits durch Commit `c321ffb` erledigt, hier verifiziert), CLAUDE.md-Agent-Tabelle geprüft (bereits korrekt), Skill `repo-audit` angelegt, vierter Subagent `architecture-advisor` (Advisor-Rolle) angelegt, ADR-Vorlage + erstes ADR angelegt, `state/gates.md` und `state/assumption-ledger.md` angelegt, Namensentscheidung in `docs/STATUS.md` festgehalten, beide registrierten Hooks (PostToolUse-Lint, UserPromptSubmit-Kontexthygiene) verifiziert. |
