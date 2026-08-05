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

**Phasenmodell:** Diese Datei ist die einzige Quelle für Phasennummern. Ältere Dateien
verwendeten ein abweichendes Modell (dort war Phase 6 das Nutzerkonto, hier sind es die
Cashback-Webhooks). Phasennummern in `ARCHITECTURE.md` beziehen sich auf dieses Modell.

---
### Gebaut (Phase 4 + 5)
- Tool-Finder (interaktiver Fragebogen)
- PricingPlan-Modell + Admin-UI + Anzeige
- User-Accounts mit Magic Link (Supabase Auth)
- Bewertungssystem mit kategoriespezifischen Kriterien + Moderation
- Tool-Stack-Manager (eingeloggter Bereich)


### Nicht bauen
- Reselling
- Partnerzugänge
- Komplexes Abo-Management
- White-Label-Funktionen
- Automatische Preis-Scraper
- Cashback-UI für Endnutzer (erst wenn echte Conversions bestätigt sind)

---

## Gate für Phase 6 — Cashback

Cashback-Infrastruktur existiert **nicht** — weder Webhooks noch Admin. Die frühere
Statusdatei behauptete das Gegenteil; korrigiert am 31.07.2026.

Bevor damit begonnen wird, gilt die Regel aus `CLAUDE.md`: Zod, Vitest und Playwright
sind Pflicht **vor** dem ersten Webhook, nicht danach. Ein Endpunkt, der von außen
Daten annimmt und über Geldbeträge entscheidet, wird nicht ohne Schema-Validierung
und Tests gebaut.

**Bestehende Endpunkte:** `/api/anfrage`, `/api/search`, `/api/track/[linkId]`,
`/auth/confirm`. Alle nehmen Fremddaten entgegen, aktuell ohne Schema-Validierung.
Kein Geld im Spiel, aber dieselbe Fehlerklasse — bei Gelegenheit prüfen.

---

## Offene Punkte — Gate 2.5

Reihenfolge nach Schaden, nicht nach Aufwand.



1. **CI-Gate bauen** — `scripts/check-docs.mjs` (referenzierte Pfade existieren,
   Versionsnummern nur in `package.json`, verbotene Begriffe, CLAUDE.md ≤ 150 Zeilen,
   Groß-/Kleinschreibung von Verweisen) plus `scripts/check-rules.mjs` (`as any`,
   `<img `, `take` ohne `skip`, `createClient()` in Actions) — Letzteres existiert noch
   nicht, Zyklus-3-Thema. In `npm run check` und in `.github/workflows/ci.yml`.
   **Entschieden (04.08.2026, Zyklus 3):** blockierend, nicht warnend — Playbook 05
   definiert ein CI-Pflichttor genau darüber, dass ein PR bei Rot nicht mergen kann;
   ein Gate, das nicht blockiert, ist kein Pflichttor, sondern eine Beobachtung.
   Handgriff erledigt (04.08.2026): Branch-Protection-Regel für `main` gesetzt,
   `check`-Job als "Required status check" markiert — das stand nicht in der
   Workflow-Datei, sondern in den Repo-Einstellungen.
5. **Dry-Run-Konvention umstellen** — 9 Scripts schreiben in die DB, wenn `--dry-run`
   vergessen wird. `import-comparisons.ts` macht es richtig (`--execute` als Opt-in).
   Danach die Stand-Zeile in `ARCHITECTURE.md` 6b entfernen.
6. **Vercel-Plan klären** — Hobby erlaubt laut Fair-Use keine kommerzielle Nutzung,
   Affiliate-Links sind kommerziell. Entscheidung als ADR.
7. **Migrations-Historie prüfen** — Migrationen laufen manuell im Supabase-Editor.
   Liegen die SQL-Dateien versioniert in `prisma/`?
9. **Design-Block auslagern** nach `docs/design-system.md` — CLAUDE.md liegt über der
   150-Zeilen-Grenze aus Playbook 01.
10. **Duplikate auflösen** — README widerspricht CLAUDE.md beim Styling.
    Versionsnummern nur in `package.json`. Ordnerbäume in Prosa entfernen.
14. **Vertrauensgrenze `rehypeRaw`** — `InlineMarkdown` rendert rohes HTML, aktuell
    nur mit Admin-Inhalten aus importierten `.docx`. Sobald Dritte Inhalte liefern,
    ist das eine offene Tür. Als Satz in `ARCHITECTURE.md` §7 festhalten.
15. **Kursbibliothek unter git** — Playbooks liegen in `Downloads`, mit einer Dublette
    von `00-MASTER-BRIEFING.md`. Eigenes Repo, Dublette entfernen, Anhang B einsortieren.
16. **Eingaben der vier bestehenden Endpunkte prüfen** — `/api/anfrage` und `/api/search`
    verarbeiten Nutzereingaben ohne Schema. Kein akutes Risiko, aber die Vorstufe zu
    dem, was bei Cashback teuer würde.
17. **Phasenverweise in `ARCHITECTURE.md` prüfen** — „ab Phase 3", „ab Phase 4.3",
    „ab Phase 4.4" stammen aus der Zeit vor der Vereinheitlichung. Prüfen, ob sie noch
    stimmen, oder auf Features statt Nummern umstellen („sobald es Nutzerkonten gibt").
18. **`Tool.startingPriceCents` gegen `PricingPlan` klären** — geklärt (04.08.2026,
    Zyklus 3): bedingt abgeleitet. Tools ohne `PricingPlan` bleiben manuell gepflegt;
    Tools mit `PricingPlan` leiten `startingPriceCents` automatisch aus dem günstigsten
    monatlichen Tarif ab. Regel in `ARCHITECTURE.md`, Abschnitt "Preis-Ableitung".
    Entscheidung, Begründung, Advisor-Review und Umsetzung: `state/plan-v2-pricing.md`,
    gemergt nach `main` (04.08.2026, PR #4). Audit-Query aus der Backfill-Migration
    (`prisma/migrations/20260805_backfill_starting_price_from_plans/`, Schritt 1) am
    04.08.2026 im Supabase SQL Editor ausgeführt: 0 Zeilen — kein Tool mit abweichendem
    Preis, kein Backfill (Schritt 2) nötig. Migrationsdatei bleibt als Nachweis/für
    künftige Altdaten-Fälle im Repo.
20. **GitHub Actions auf v5, v7 bereits verfügbar** — `.github/workflows/ci.yml` nutzt
    aktuell `actions/checkout@v5` und `actions/setup-node@v5` (beide Node-24-fähig).
    Zum Zeitpunkt des Eintrags sind bei beiden Actions bereits v7-Releases verfügbar.
    Prüfen, ob ein Sprung auf v7 sinnvoll ist.
21. **`seed-rating-criteria.ts`: Dry-Run mit Fake-IDs statt echter Abfragen** —
    behoben (05.08.2026). Dry-Run und Echtlauf lesen jetzt beide unbedingt über
    `ratingCriterion.findMany()` und pro Kategorie `toolCategory.findMany()`; einzige
    verbleibende Verzweigung ist der Schreib-Call selbst. Beleg: echter Dry-Run-Lauf
    gegen die DB zeigt reale Tool-Zahlen und deckt real auf, dass die Kategorie-Slugs
    `geschaeftskonto-finanzen` und `produktivitaet-notizen` keine zugeordneten Tools
    haben — Vertrag `state/tasks/seed-dryrun-fix.md`.
    QA-Review (`qa`-Subagent) bestätigt: kein Datenfehler, keine Divergenz Dry-Run/
    Execute außer dem gewollten Upsert-vor-`findMany`-Timing im Execute-Modus. Vier
    Hinweise ohne Blockwirkung offen: (1) Dry-Run zeigt bei komplett leerer
    `ratingCriterion`-Tabelle irreführend „0 Zuweisungen (würden angelegt)" statt
    darauf hinzuweisen, dass ein Echtlauf ungleich 0 erzeugen würde; (2) das Script
    kann „Kategorie-Slug existiert nicht" nicht von „Kategorie existiert, hat aber
    0 Tools" unterscheiden (betrifft auch den doppelten Slug-Eintrag
    `geschaeftskonto-finanzen`/`geschaftskonto-finanzen`, Zeile 91–93); (3)
    `ratingCriterion.upsert()` überschreibt bei jedem `--execute`-Lauf `name`/
    `sortOrder` unbedingt, auch wenn diese über `app/admin/bewertungskriterien`
    manuell geändert wurden — keine Warnung; (4) bei leerer Kriterien-Tabelle
    entstehen ~114 redundante Warnzeilen (kosmetisch). Noch nicht als eigener
    Punkt aufgenommen — bei Bedarf neu nummerieren.
22. **`seed-rating-criteria.ts`: `geschaeftskonto-finanzen` ist vermutlich der
    Tippfehler, nicht `geschaftskonto-finanzen`** — Z. 91–93 pflegt beide
    Schreibweisen parallel, mit dem Kommentar „Slug in DB prüfen" (Z. 92).
    Gegenprobe gegen den echten Seed: `prisma/seed.ts` Z. 470 und
    `scripts/humanize-batch04.ts` Z. 22 verwenden beide ausschließlich
    `geschaftskonto-finanzen` (ohne zusätzliches „e"). Die Zeile
    `geschaeftskonto-finanzen` (Z. 91) trifft damit vermutlich nie eine echte
    Kategorie — sie dürfte der Tippfehler sein, nicht ihr Gegenstück. Beleg
    für den ursprünglichen Fund: qa-Hinweis aus Zyklus 4, dokumentiert bei
    Punkt 21 (Hinweis 2). Noch zu entscheiden: die tote Zeile aus dem Script
    entfernen, oder als bewusste Absicherung gegen einen künftigen echten
    Slug-Wechsel stehen lassen.
23. **`dotenv` druckt seit Version 17.4.0 eine an KI-Agenten adressierte Zeile
    in stdout** — beim Start wird eine Zeile ausgegeben, die KI-Agenten direkt
    anspricht ("auth for agents [vestauth.com]"), laut Angaben des
    dotenv-Autors selbst kein Angriff, aber derselbe Mechanismus wie
    Prompt-Injection: Text aus einer nicht vertrauenswürdigen Quelle (Terminal-
    Output eines Pakets), der wie eine Anweisung formuliert ist. Betrifft
    dieses Repo real: `node_modules/dotenv` liegt aktuell auf `17.4.2`
    (`package-lock.json`; verschachtelt bei `@sentry/bundler-plugin-core`
    weiterhin `16.6.1`, unbetroffen). `dotenv` steht nicht als direkte
    Abhängigkeit in `package.json` — kommt transitiv herein. Beleg: beobachtet
    beim `npm install` in Zyklus 4; Verhaltensregel dazu in
    `docs/harness/HARNESS-LEARNING-STATE.md`, Abschnitt „Verhaltensregeln für
    künftige Sessions (aus Zyklus 4)". Zu entscheiden: die transitive
    Abhängigkeit per Overrides auf eine Version vor 17.4.0 pinnen, die Ausgabe
    unterdrücken (falls vom Paket unterstützt), oder bewusst so belassen.

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

Falschaussage in der Statusdatei korrigiert: Cashback-Infrastruktur war als „gebaut"
gelistet, existiert aber nicht. Gefunden beim Abgleich der Statusdatei gegen die
tatsächlichen `route.ts`-Dateien.

Agent-Rollen bereinigt und migriert: Von neun Rollen bleiben drei — `frontend-reviewer`,
`design-guardian`, `qa` — als echte Subagenten in `.claude/agents/` mit eigenem Kontext
und ohne Schreibrechte (`tools: Read, Grep, Glob`). Die sechs entfernten waren Kopien von
Wissen aus `ARCHITECTURE.md`, `CLAUDE.md`, `docs/STATUS.md` und `prisma/schema.prisma`;
zwei Architekturregeln daraus wurden gerettet. Der Review-Schritt ist damit zum ersten Mal
tatsächlich unabhängig statt nur so benannt.

Drei Dokumente aus der Gründungswoche (25.05.) entfernt: `docs/WORKFLOW.md` und die zwei
Iterations-Prompts. `WORKFLOW.md` empfahl ausdrücklich drei parallele Claude-Code-Sitzungen
im selben Ordner — genau die Praxis, die während dieses Gates zu widersprüchlichen
Dateiständen führte. Veraltete Dokumentation war hier nicht nutzlos, sondern Ursache eines
konkreten Schadens.

Aus der offenen Lücke „`sentry.client.config.ts` fehlt" wurde am 02.08.2026 eine bewusste,
dokumentierte Entscheidung: Sentry bleibt aus Datenschutz- und Verhältnismäßigkeitsgründen
auf Server- und Edge-Runtime beschränkt, Browser-Fehler werden nicht erfasst. Festgehalten
in `ARCHITECTURE.md` Abschnitt 2, verwiesen aus `README.md`.

Namensentscheidung getroffen (03.08.2026): Repo/Domain bleiben `toolkompass` (Rename-Aufwand
höher als Nutzen), Produktmarke bleibt „ToolSucher" (`package.json`, `CLAUDE.md`, `README.md`,
UI-Texte) — bewusst getrennt, kein Code-Rename nötig.