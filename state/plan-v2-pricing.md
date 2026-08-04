# Plan v2 — Tool.startingPriceCents vs. PricingPlan

Überarbeitung von `state/plan-v1-pricing.md` auf Basis von
`state/advisor-findings-pricing.md` (adversarialer Advisor-Pass, Urteil „Nicht
freigegeben"). Grundentscheidung (bedingt abgeleitet) bleibt bestehen — die Findings
betrafen keine falsche Grundannahme, sondern fehlende oder unstimmige Umsetzungsdetails.
Kein Code/Schema wurde geändert — weiterhin reine Planung.

## Entscheidung (unverändert, präzisiert)

**Bedingt abgeleitet:**

- Tools **ohne** `PricingPlan`-Zeilen: `startingPriceCents` bleibt manuell gepflegt.
- Tools **mit** mindestens einer `PricingPlan`-Zeile: `startingPriceCents` wird aus dem
  günstigsten `PricingPlan` mit `billingCycle = monthly` abgeleitet. Kein monatlicher
  Tarif vorhanden → `NULL`.
- **Neu (Finding 5):** Fällt ein Tool durch Löschen des letzten `PricingPlan` von „hat
  Pläne" zurück auf „hat keine Pläne", wird `startingPriceCents` **nicht** auf `NULL`
  gesetzt. Der zuletzt abgeleitete Wert bleibt stehen und wird ab diesem Moment wieder als
  normaler manueller Wert behandelt (Feld im `ToolForm` wird wieder editierbar). Begründung:
  ein automatisches Zurücksetzen auf `NULL` würde den zuletzt sichtbaren Preis ersatzlos
  von der Live-Seite entfernen — ein stillschweigender Datenverlust ohne Nutzen. Der
  Admin sieht den letzten bekannten Preis weiter und kann ihn bewusst ändern oder
  bestätigen.
- **Neu (Finding 9):** `isHighlighted`/`sortOrder` der Pläne fließen bewusst **nicht** in
  die Ableitung ein. `startingPriceCents` bildet den günstigsten Einstiegspreis ab (so wird
  es an jeder Lesestelle interpretiert — „Einstieg ab X"), nicht die redaktionell
  hervorgehobene Empfehlung. Das ist eine bewusste, dokumentierte Entscheidung, keine Lücke.

## Begründung

Unverändert gegenüber v1 (siehe dort, Punkte 1-4). Zusätzlich bestätigt der Advisor
unabhängig (Finding 10), dass die Bestandsaufnahme — getrennte Schreibpfade, kein Tool im
Seed mit beiden Quellen, Billing-Cycle-Problem — mit dem Code übereinstimmt.

## Änderungen gegenüber v1 (Finding-für-Finding)

| # | Finding | Behebung in v2 |
|---|---|---|
| 1 | `syncStartingPrice(toolId)` kann mit dieser Signatur nicht transaktional mit dem PricingPlan-Write laufen. | **Transaktion fallengelassen, nicht repariert.** Im gesamten Repo existiert kein einziges `prisma.$transaction`-Vorkommen (geprüft) — das wäre ein neues Pattern nur für diesen Zweck. Stattdessen: `syncStartingPrice(toolId)` läuft sequenziell direkt nach dem PricingPlan-Write, genauso wie `revalidateToolPaths(toolId)` bereits heute sequenziell danach läuft (`pricing-actions.ts:145,181,211,258`). Das kurze Konsistenzfenster wird als Risiko akzeptiert und benannt (Risiko 1), nicht mit ungewohnter Mechanik wegkonstruiert. |
| 2 | `revalidateToolPaths()` revalidiert `/admin/tools` (Liste) nicht. | `revalidateToolPaths()` in `pricing-actions.ts:68-75` bekommt eine dritte Zeile `revalidatePath('/admin/tools')`. Eine Stelle, wirkt für alle vier Actions (`create`/`update`/`delete`/`reorder`). |
| 3 | JSON-LD liefert bei `startingPriceCents === null && !hasFreePlan` fälschlich `price: '0'`. | `lib/seo/json-ld.ts:48` wird Teil der „Betroffene Dateien" (war in v1 fälschlich unter „nicht betroffen"). Fix: wenn `startingPriceCents == null && !hasFreePlan`, **kein** `offers`-Block ausgeben (statt `price: '0'`) — konsistent mit `formatPreis(null, { hasFreePlan: false })` → „Auf Anfrage", das ebenfalls keinen Preis behauptet. |
| 4 | `ToolForm` hat keinen Datenpfad zu `PricingPlan`-Zeilen; „Feld disabled" ist mit den v1-Dateien nicht umsetzbar. | `app/admin/tools/[id]/page.tsx` wird in „Betroffene Dateien" aufgenommen: `defaultValues` bekommt `hasPricingPlans: tool.pricingPlans.length > 0` (die Query lädt `pricingPlans` bereits, Zeile 44). `ToolForm.tsx` bekommt dieses Flag als Prop und deaktiviert das Feld entsprechend. **Wichtig:** Das ist reine UI-Führung. Die tatsächliche Durchsetzung passiert serverseitig in `actions.ts` (siehe unten), unabhängig davon, ob das UI-Flag korrekt ankommt. |
| 5 | Rückweg (letzter Plan gelöscht) war nicht entschieden. | Siehe Entscheidung oben: Wert bleibt stehen, Feld wird wieder editierbar. Keine zusätzliche Logik in `deletePricingPlan` nötig außer dem ohnehin laufenden `syncStartingPrice`-Aufruf, der bei null verbleibenden `monthly`-Plänen naturgemäß nichts mehr überschreibt (Aggregat über 0 Zeilen ⇒ Funktion bricht früh ab, statt zu schreiben — siehe Migrationsschritt-Pseudocode unten). |
| 6 | `scripts/update-prices.ts` kann einen bewusst-`NULL`-Wert (kein Monatstarif) mit einem Markdown-Preis überschreiben. | Skip-Bedingung erweitert: zusätzlich zu `startingPriceCents !== null` auch überspringen, wenn `tool._count.pricingPlans > 0` (Query um `select: { _count: { select: { pricingPlans: true } } }` ergänzen). Damit fasst das Script grundsätzlich keine Tools mehr an, die bereits im „abgeleitet"-Zweig sind — unabhängig vom aktuellen Wert. |
| 7 | Backfill-SQL nur inline im Markdown, keine Migrationsdatei. | Backfill wird als reguläre Migrationsdatei `prisma/migrations/20260805_backfill_starting_price_from_plans/migration.sql` angelegt (Namensschema wie `20260611_add_pricing_plan`), nicht nur im Plan-Dokument. |
| 8 | Backfill „gefahrlos" behauptet, ohne den Ist-Zustand geprüft zu haben. | Zweistufig: zuerst read-only `SELECT`-Audit-Query (siehe Migrationsschritt), Ergebnis manuell sichten; erst danach die `UPDATE`-Migration ausführen. „Gefahrlos" wird aus dem Plan gestrichen. |
| 9 | `isHighlighted` bei Ableitung ignoriert. | Siehe Entscheidung oben — als bewusste Entscheidung dokumentiert, keine offene Lücke mehr. |

## Betroffene Dateien (v2, vollständig)

| Datei | Änderung |
|---|---|
| `prisma/schema.prisma` | Kommentar an `Tool.startingPriceCents`: Ableitungsregel + Verweis auf `ARCHITECTURE.md`. |
| `ARCHITECTURE.md` | Neuer Abschnitt „Preis-Ableitung" mit der vollständigen Regel inkl. Rückweg-Verhalten (Finding 5) und JSON-LD-Sonderfall (Finding 3). |
| `lib/data/pricing.ts` (neu) | `syncStartingPrice(toolId)`: `MIN(priceCents)` der `monthly`-Pläne lesen, `Tool.startingPriceCents` schreiben. Sequenziell, kein `$transaction`. |
| `app/admin/tools/pricing-actions.ts` | `syncStartingPrice(toolId)` nach `create`/`update`/`delete` aufrufen (nicht `reorder`, ändert keine Preise). `revalidateToolPaths()` um `/admin/tools` ergänzen. |
| `app/admin/tools/actions.ts` (`updateTool`) | Vor dem Schreiben: `pricingPlan`-Anzahl für die Tool-ID serverseitig abfragen; bei ≥1 den übermittelten `startingPriceCents`-Formularwert verwerfen statt schreiben. |
| `components/admin/ToolForm.tsx` | Neuer Prop `hasPricingPlans: boolean`; Preisfeld `disabled` + Hinweistext, wenn `true`. |
| `app/admin/tools/[id]/page.tsx` | `defaultValues.hasPricingPlans = tool.pricingPlans.length > 0` ergänzen und an `ToolForm` durchreichen. |
| `lib/seo/json-ld.ts` | Zeile 48: bei `startingPriceCents == null && !hasFreePlan` keinen `offers`-Block ausgeben statt `price: '0'`. |
| `scripts/update-prices.ts` | Skip-Bedingung um `_count.pricingPlans > 0` erweitern. |
| `prisma/migrations/20260805_backfill_starting_price_from_plans/migration.sql` (neu) | Audit-Query + Backfill-`UPDATE` (siehe Migrationsschritt). |
| `docs/STATUS.md` | Punkt 18 als geklärt markieren, auf `plan-v2-pricing.md` verweisen. |

**Weiterhin nicht betroffen:** `prisma/seed.ts` (legt nie `PricingPlan` an),
`lib/utils/stack-costs.ts`, `lib/data/tool-finder.ts`, `app/tools/[slug]/page.tsx`,
`app/admin/tools/page.tsx` — lesen unverändert `startingPriceCents`.

## Migrationsschritt

Kein Schema-Migrationsschritt (`startingPriceCents` bleibt `Int?`). Datenmigration als
Migrationsdatei, zweistufig:

**Schritt 1 — Audit (read-only, vor jeder Freigabe manuell auswerten):**
```sql
SELECT
  t.id, t.slug, t."startingPriceCents" AS current_value,
  sub.min_monthly AS would_derive_to
FROM "Tool" t
JOIN (
  SELECT "toolId", MIN("priceCents") AS min_monthly
  FROM "PricingPlan"
  WHERE "billingCycle" = 'monthly'
  GROUP BY "toolId"
) sub ON sub."toolId" = t.id
WHERE t."startingPriceCents" IS DISTINCT FROM sub.min_monthly;
```
Ergebnis manuell sichten — jede Zeile ist ein Tool, dessen sichtbarer Preis sich durch den
Backfill ändert. Erst danach Schritt 2 ausführen.

**Schritt 2 — Backfill (nach manueller Freigabe der Audit-Ergebnisse):**
```sql
UPDATE "Tool" t
SET "startingPriceCents" = sub.min_price
FROM (
  SELECT "toolId", MIN("priceCents") AS min_price
  FROM "PricingPlan"
  WHERE "billingCycle" = 'monthly'
  GROUP BY "toolId"
) sub
WHERE t.id = sub."toolId";

-- Tools mit PricingPlan, aber ohne monatlichen Tarif: auf NULL setzen
UPDATE "Tool" t
SET "startingPriceCents" = NULL
WHERE EXISTS (SELECT 1 FROM "PricingPlan" p WHERE p."toolId" = t.id)
  AND NOT EXISTS (
    SELECT 1 FROM "PricingPlan" p
    WHERE p."toolId" = t.id AND p."billingCycle" = 'monthly'
  );
```
Nach ARCHITECTURE §5: manuell im Supabase SQL Editor ausführen, danach `npx prisma
generate` (kein Schema-Diff, aber Konvention konsequent eingehalten). Datei liegt als
`prisma/migrations/20260805_backfill_starting_price_from_plans/migration.sql` im Repo,
wie bei den bestehenden Migrationen (`20260611_add_pricing_plan`,
`20260531120000_price_float_to_int`).

## Risiken

1. **Konsistenzfenster ohne Transaktion (bewusst akzeptiert, nicht v1-„gelöst").**
   `syncStartingPrice()` läuft sequenziell nach dem PricingPlan-Write, nicht atomar damit
   gebündelt — dieselbe Größenordnung an Inkonsistenzrisiko wie das bereits bestehende
   sequenzielle `revalidateToolPaths()`. Kein neues Pattern eingeführt, aber das Fenster
   bleibt real.
2. **Zweiter Schreibpfad muss die Regel serverseitig durchsetzen.** `actions.ts` muss die
   `PricingPlan`-Anzahl selbst aus der DB lesen, nicht dem UI-`disabled`-Zustand vertrauen —
   ein direkter Formular-POST unter Umgehung des UI muss denselben Schutz erfahren.
3. **Sichtbarer Sprung beim ersten Tarif.** Bleibt wie in v1 — kein rein technisches Risiko,
   sondern eine Kommunikationsfrage mit dem Admin-/Content-Team vor dem Rollout.
4. **Tools mit ausschließlich Jahres-/Einmaltarifen verlieren ihren „ab"-Preis.** Bleibt
   bestehen (Design-Entscheidung), jetzt aber ohne den in v1 übersehenen JSON-LD-Fallback-Bug
   (Finding 3, behoben).
5. **Ungeprüfter Ist-Zustand der Produktiv-DB.** Wird jetzt durch den expliziten
   Audit-Schritt vor dem Backfill abgedeckt statt als offene Unsicherheit stehen zu bleiben —
   das Risiko selbst (unbekannter Umfang) besteht bis zur tatsächlichen Audit-Ausführung
   weiter.
6. **Neu:** Zwei parallele Kriterien für „hat Ableitung" — `ToolForm` prüft
   `hasPricingPlans` aus den beim Seitenaufruf geladenen Props, `actions.ts` prüft per
   Live-Query. Beide müssen bei jeder künftigen Änderung an `PricingPlanManager` (z. B.
   Bulk-Import von Plänen) synchron gehalten werden — zwei Stellen, eine Bedeutung, gleiches
   Muster wie das ursprüngliche Problem, nur eine Ebene tiefer. Kein Blocker, aber im Review
   im Auge behalten.

## Was hätte Plan v1 gekostet, wäre er direkt umgesetzt worden?

Die nicht transaktionsfähige `syncStartingPrice`-Signatur und das fehlende Datenkabel
zwischen `PricingPlanManager` und `ToolForm` hätten dazu geführt, dass die zentrale
Sicherung des Plans — „manuelles Feld wird gesperrt, sobald Pläne existieren" — schlicht nie
gegriffen hätte, während die Admin-Übersichtsliste nach jeder Preisänderung veraltete Werte
gezeigt hätte, beides vermutlich erst Wochen später durch zufällige Beobachtung entdeckt.
Gleichzeitig hätte der unveränderte JSON-LD-Fallback für Tools mit reinem Jahrestarif in
der Zwischenzeit live falsche „price: 0"-Daten an Suchmaschinen gemeldet, und
`update-prices.ts` hätte jeden bewusst gesetzten `NULL`-Wert beim nächsten Lauf still mit
einem veralteten Markdown-Preis überschrieben — der Zwei-Quellen-Konflikt aus STATUS.md
Punkt 18 wäre also, kaschiert durch scheinbar „gelöst", in neuer Form weitergelaufen.
