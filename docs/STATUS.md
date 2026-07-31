# STATUS — Phasenstand & Scope

> Quelle der Wahrheit für „was ist gerade dran". Von `CLAUDE.md` referenziert
> (Arbeitsweise und Entscheidungsregel Punkt 2).
>
> **Regel:** Was hier nicht steht, ist nicht dran. Bei Unsicherheit über den Scope
> gilt diese Datei, nicht die Erinnerung.
>
> **Pflege:** Am Ende jeder Iteration aktualisieren — im selben Commit wie die Arbeit.

---

## Aktueller Stand

**Phase 5** · Stand: Juli 2026

### Gebaut (Phase 4 + 5)
- Tool-Finder (interaktiver Fragebogen)
- PricingPlan-Modell + Admin-UI + Anzeige
- User-Accounts mit Magic Link (Supabase Auth)
- Bewertungssystem mit kategoriespezifischen Kriterien + Moderation
- Tool-Stack-Manager (eingeloggter Bereich)
- Cashback-Infrastruktur (Webhooks + Admin) — **nicht öffentlich**, siehe Risiko 1

### Nicht bauen
- Reselling
- Partnerzugänge
- Komplexes Abo-Management
- White-Label-Funktionen
- Automatische Preis-Scraper
- Cashback-UI für Endnutzer (erst wenn echte Conversions bestätigt sind)

---

## Risiko 1 — Cashback-Webhooks ohne ihre Voraussetzungen

`CLAUDE.md` erklärt Zod, Vitest und Playwright zur **Pflicht vor** den Cashback-Webhooks.
Die Webhooks sind gebaut (Phase 4+5), die drei Voraussetzungen stehen nicht in
`package.json`. Ein Endpunkt, der von außen Daten annimmt und über Geldbeträge
entscheidet, läuft damit ohne Schema-Validierung und ohne Tests.

Drei mögliche Auflösungen — eine davon muss bewusst gewählt und hier dokumentiert werden:

1. Voraussetzungen nachbauen (Zod-Schema am Webhook, Tests für die Auszahlungslogik)
2. Endpunkt bis dahin deaktivieren oder hinter Auth legen
3. Regel korrigieren, falls sie so nie gemeint war — mit Begründung

Bis zur Entscheidung gilt: **kein öffentliches Cashback.**

---

## Offene Punkte — Gate 2.5

Reihenfolge nach Schaden, nicht nach Aufwand.

1. **Risiko 1 entscheiden** (siehe oben)
3. **Agent-Rollen nach `.claude/agents/` migrieren** — die neun Dateien in `agents/`
   sind keine Subagenten, sondern Text im Hauptkontext. Der Reviewer liest die
   Begründungen des Builders mit. Dabei entscheiden, welche Rollen bleiben:
   `content-data`, `documentation`, `research` stehen in keiner Tabelle.
4. **CI-Gate bauen** — `scripts/check-docs.mjs` (referenzierte Pfade existieren,
   Versionsnummern nur in `package.json`, verbotene Begriffe, CLAUDE.md ≤ 150 Zeilen,
   Groß-/Kleinschreibung von Verweisen) plus `scripts/check-rules.mjs` (`as any`,
   `<img `, `take` ohne `skip`, `createClient()` in Actions). In `npm run check`
   und in eine GitHub Action. Offene Entscheidung: blockierend oder warnend?
5. **Dry-Run-Konvention umstellen** — 9 Scripts schreiben in die DB, wenn `--dry-run`
   vergessen wird. `import-comparisons.ts` macht es richtig (`--execute` als Opt-in).
   Danach die Stand-Zeile in `ARCHITECTURE.md` 6b entfernen.
6. **Vercel-Plan klären** — Hobby erlaubt laut Fair-Use keine kommerzielle Nutzung,
   Affiliate-Links sind kommerziell. Entscheidung als ADR.
7. **Migrations-Historie prüfen** — Migrationen laufen manuell im Supabase-Editor.
   Liegen die SQL-Dateien versioniert in `prisma/`?
8. **Befehlsblock in CLAUDE.md** — `dev`, `build`, `check`, `typecheck`, `lint`, `seed`
   wörtlich. DoD auf `npm run check` statt `npx tsc --noEmit`.
9. **Design-Block auslagern** nach `docs/design-system.md` — CLAUDE.md liegt über der
   150-Zeilen-Grenze aus Playbook 01.
10. **Duplikate auflösen** — README widerspricht CLAUDE.md beim Styling.
    Versionsnummern nur in `package.json`. Ordnerbäume in Prosa entfernen.
11. **Logo-Ordner entfernen** — `Toolsucher_alle_Logos_PNG/` und
    `Toolsucher_fehlende_Logos_PNG/` stehen in `.gitignore` und liegen trotzdem im
    Repo. Fix: `git rm -r --cached`.
12. **Namensentscheidung** — Repo `toolkompass`, `package.json` `toolsucher`,
    CLAUDE.md „ToolSucher", Domain `toolkompass.vercel.app`.
13. **`Content_Website/` prüfen** — Arbeitsmaterial oder Code?
14. **Vertrauensgrenze `rehypeRaw`** — `InlineMarkdown` rendert rohes HTML, aktuell
    nur mit Admin-Inhalten aus importierten `.docx`. Sobald Dritte Inhalte liefern,
    ist das eine offene Tür. Als Satz in `ARCHITECTURE.md` §7 festhalten.
15. **Kursbibliothek unter git** — Playbooks liegen in `Downloads`, mit einer Dublette
    von `00-MASTER-BRIEFING.md`. Eigenes Repo, Dublette entfernen, Anhang B einsortieren.

---

## Erledigt in Gate 2.5 (30.–31.07.2026)

| Was | Commit |
|---|---|
| Permission-Leak geschlossen, Freigaben verengt, Lint-Hook versioniert | `da2e2dd` |
| Quellcode nachgetragen (`sort.ts` + 3 Scripts) | `7656453` |
| Arbeitsmaterial nach `_arbeitsmaterial/` ausgelagert, 3 Pfade umgestellt | `f81c661` |
| Regeln aus Gate 2.5 in CLAUDE.md und ARCHITECTURE.md | `5dce972` |
| `unpublished`-Warnung im Skill wiederhergestellt, Import-Grenzen dokumentiert | `182eb50` |
| `.claudeignore` versioniert, Kommentar-Standard nachgetragen | `4ce88ed` |
| `frontend-reviewer.md` überarbeitet und geprüft | `b4c7502` |
| Ponytail vendored mit MIT-Lizenz und Herkunftsangabe | `db04d56` |

Verschachtelte Skill-Dublette `.claude/skills/.claude/` entfernt.
`status.md` → `STATUS.md` umbenannt (Verweis in CLAUDE.md war unter Linux tot).
XSS-Regel für nutzergenerierten Content geprüft: eingehalten.

Vier Agent-Rollen entfernt (`content-data`, `documentation`, `research`, `frontend-builder`) —
allesamt Kopien von Wissen, das in `ARCHITECTURE.md`, `CLAUDE.md`, `prisma/schema.prisma`
und dem Skill `tool-anlegen` lebt. Der Stack-Widerspruch ist damit aufgelöst, ohne eine
einzige Zeile zu reparieren.