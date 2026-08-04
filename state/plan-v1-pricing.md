# Plan v1 — Tool.startingPriceCents vs. PricingPlan

Bezug: docs/STATUS.md, Offene Punkte, Punkt 18. Kein Code/Schema wurde geändert — reine
Planung.

## Bestandsaufnahme (Fakten aus Code, nicht Annahme)

- `Tool.startingPriceCents` (prisma/schema.prisma:128): `Int?` auf `Tool`. Kein eigenes
  `billingCycle`-Feld.
- `PricingPlan` (prisma/schema.prisma:478-494): eigenes Modell, 1:N zu `Tool`, mit
  `priceCents Int` (pflicht) + `billingCycle` (Enum, Default `monthly`). Mehrere Zeilen pro
  Tool möglich (Starter/Pro/Enterprise).
- Herkunft: `startingPriceCents` existiert seit Migration `20260531120000_price_float_to_int`
  (Float→Int-Umstellung eines bereits vorher vorhandenen Felds). `PricingPlan` kam **elf Tage
  später** dazu (`20260611_add_pricing_plan`) als eigenständiges Admin-Feature.
- Schreibpfade für `startingPriceCents`: (1) `app/admin/tools/actions.ts` — manuelles Feld
  "Preis ab (€/Monat)" im `ToolForm`; (2) `scripts/update-prices.ts` — parst
  `Content_Website/*.md`, schreibt nur wenn Wert aktuell `NULL` ist; (3) `prisma/seed.ts` —
  direkte Werte im Seed, **keine** `PricingPlan`-Zeile wird dort je angelegt.
- Schreibpfade für `PricingPlan`: ausschließlich `app/admin/tools/pricing-actions.ts`
  (`createPricingPlan` / `updatePricingPlan` / `deletePricingPlan` / `reorderPricingPlans`),
  aufgerufen von `components/admin/PricingPlanManager.tsx`. Keine Berührung mit
  `startingPriceCents` — beide Schreibpfade sind heute vollständig getrennt.
- Lesepfade `startingPriceCents`: `lib/data/tool-finder.ts` (Budget-Filter + Sortierung über
  den gesamten Katalog, ohne `PricingPlan` zu laden), `lib/utils/stack-costs.ts` (Fallback,
  Stufe 3 nach `customPriceCents` und `pricingPlan.priceCents`, mit explizitem Kommentar
  „Annahme: Startpreis ist monatlich"), `lib/seo/json-ld.ts` (JSON-LD `Offer.price`),
  `app/tools/[slug]/page.tsx` (Hero: „Einstieg ab X / Monat"), `app/admin/tools/page.tsx`
  (Admin-Übersichtsliste).
- Lesepfade `PricingPlan`: `components/tools/PricingSection.tsx` (Card-Grid auf der
  Detailseite, nur gerendert wenn `plans.length > 0`), `components/tools/ToolPriceEditor.tsx`
  (Nutzer wählt Tarif für sein eigenes Tool-Tracking), `lib/utils/stack-costs.ts` (Stufe 2).
- **Kein Tool im Seed hat aktuell beide Quellen gleichzeitig befüllt** — `PricingPlan` wird
  ausschließlich über die Admin-UI nachträglich pro Tool angelegt. Ob in der echten
  Supabase-DB (Produktivstand, nicht im Repo sichtbar) bereits Tools mit beiden Werten
  existieren, ist **nicht geprüft** — offene Unsicherheit, siehe Risiken.

## Entscheidung

**Bedingt abgeleitet** (dritte Option, weder reines „abgeleitet" noch reines „unabhängig
gepflegt"):

- Tools **ohne** `PricingPlan`-Zeilen: `startingPriceCents` bleibt wie heute manuell
  gepflegt über `ToolForm`. Status quo, keine Änderung.
- Tools **mit** mindestens einer `PricingPlan`-Zeile: `startingPriceCents` wird
  automatisch aus dem günstigsten `PricingPlan` mit `billingCycle = monthly` abgeleitet
  (`MIN(priceCents) WHERE billingCycle = 'monthly'`). Existiert kein monatlicher Tarif
  (nur yearly/one_time), wird `startingPriceCents` auf `NULL` gesetzt statt einen falsch
  etikettierten „/Monat"-Preis zu zeigen.
- Das manuelle Eingabefeld in `ToolForm` wird für Tools mit ≥1 `PricingPlan` deaktiviert
  und mit einem Hinweistext versehen; der Server-Action-Pfad ignoriert einen trotzdem
  übermittelten Wert für diese Tools (UI-Sperre allein reicht nicht, siehe Risiko 2).

## Begründung

1. **Der Konflikt betrifft faktisch nur eine Teilmenge.** Ein globaler Zwangswechsel
   (Feld entfernen, überall live `MIN(PricingPlan)` berechnen) würde alle bestehenden
   Konsumenten — Tool-Finder-Filter/Sortierung über den ganzen Katalog, JSON-LD, Admin-Liste —
   zwingen, für jedes Tool zusätzlich `PricingPlan` zu laden, obwohl die meisten Tools laut
   Seed-Datenlage nie welche bekommen. Das ist Mehraufwand ohne Nutzen für den Regelfall.
2. **Reines „unabhängig pflegen" löst das eigentliche Problem nicht.** Genau das
   Auseinanderlaufen, das STATUS.md Punkt 18 beschreibt, bliebe bestehen — es wäre nur
   dokumentiert statt behoben.
3. **Billing-Cycle-Inkompatibilität macht eine naive Ableitung falsch.**
   `startingPriceCents` hat kein eigenes Zyklus-Feld und wird überall implizit als „/Monat"
   interpretiert (`stack-costs.ts`-Kommentar „Annahme: Startpreis ist monatlich",
   Detailseiten-Text „Einstieg ab X / Monat", JSON-LD ohne Periodenangabe). Ein `MIN()` über
   alle Zyklen hinweg würde für ein Tool mit nur einem Jahrestarif einen falschen
   Monatspreis vortäuschen. Deshalb Ableitung nur aus `monthly`-Plänen, sonst `NULL`.
4. **Für Tools ohne `PricingPlan` gibt es keine zweite Quelle, also kein Risiko.** Der
   Status quo (manuelle Pflege) ist dort korrekt und muss nicht angetastet werden.

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `prisma/schema.prisma` | Kommentar an `Tool.startingPriceCents` ergänzen: Ableitungsregel + Verweis auf `ARCHITECTURE.md`. Kein Strukturwechsel. |
| `ARCHITECTURE.md` | Neuer Abschnitt „Preis-Ableitung" mit der Regel aus diesem Plan (Pflicht laut STATUS.md Punkt 18: „Regel muss in ARCHITECTURE.md stehen"). |
| `lib/data/pricing.ts` (neu) | Helper `syncStartingPrice(toolId)`: liest `MIN(priceCents)` der `monthly`-Pläne, schreibt `Tool.startingPriceCents`. Folgt der Konvention „wiederverwendbare Queries in `lib/data/*.ts`" (ARCHITECTURE §5). |
| `app/admin/tools/pricing-actions.ts` | `syncStartingPrice(toolId)` am Ende von `createPricingPlan`, `updatePricingPlan`, `deletePricingPlan` aufrufen, im selben `prisma.$transaction` wie der jeweilige Schreibzugriff (Risiko 1). `reorderPricingPlans` ändert keine Preise → kein Aufruf nötig. |
| `app/admin/tools/actions.ts` (`updateTool`) | Bei Tools mit ≥1 `PricingPlan`: übermittelten `startingPriceCents`-Wert aus dem Formular verwerfen statt schreiben (serverseitige Absicherung, nicht nur UI). |
| `components/admin/ToolForm.tsx` | Preisfeld `disabled`, wenn Tool bereits `PricingPlan`-Zeilen hat; Hinweistext „wird aus Preistarifen unten abgeleitet". |
| `docs/STATUS.md` | Punkt 18 als geklärt markieren, auf diesen Plan verweisen. |

**Nicht betroffen (geprüft, keine Änderung nötig):**
- `prisma/seed.ts` — legt nie `PricingPlan`-Zeilen an, bleibt im „nur manuell"-Zweig.
- `scripts/update-prices.ts` — Skip-Bedingung ist bereits `startingPriceCents IS NOT NULL`;
  ein abgeleiteter Wert ist ebenfalls `NOT NULL` und wird also automatisch übersprungen,
  ohne Codeänderung. Einzige Ausnahme: Tools ganz ohne `monthly`-Plan (siehe Risiko 4).
- `lib/utils/stack-costs.ts`, `lib/seo/json-ld.ts`, `lib/data/tool-finder.ts`,
  `app/tools/[slug]/page.tsx`, `app/admin/tools/page.tsx` — lesen weiterhin unverändert
  `startingPriceCents`, profitieren automatisch von der Ableitung ohne eigene Anpassung.

## Migrationsschritt

- **Kein Schema-Migrationsschritt** — `startingPriceCents` bleibt `Int?`, keine neue Spalte,
  kein Typwechsel.
- **Backfill nötig** (einmalig, für bereits existierende `PricingPlan`-Datensätze, die vor
  dieser Regel angelegt wurden): SQL-Datei nach ARCHITECTURE §5 manuell im Supabase SQL
  Editor ausführen:
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

  -- Tools mit PricingPlan aber ohne monatlichen Tarif: auf NULL setzen
  UPDATE "Tool" t
  SET "startingPriceCents" = NULL
  WHERE EXISTS (SELECT 1 FROM "PricingPlan" p WHERE p."toolId" = t.id)
    AND NOT EXISTS (
      SELECT 1 FROM "PricingPlan" p
      WHERE p."toolId" = t.id AND p."billingCycle" = 'monthly'
    );
  ```
  Vor dem Ausführen: prüfen, ob die Produktiv-DB überhaupt Tools mit beiden Quellen enthält
  (siehe offene Unsicherheit oben) — wenn nicht, ist der Backfill ein No-Op und kann
  trotzdem gefahrlos laufen.
- `npx prisma generate` nach der SQL-Änderung ist nicht nötig, da sich das Schema nicht
  ändert — nur Daten werden korrigiert.

## Risiken

1. **Konsistenzfenster ohne Transaktion.** Wenn `syncStartingPrice()` nicht in derselben
   `prisma.$transaction` wie der `PricingPlan`-Write läuft, kann zwischen „Plan gespeichert"
   und „Tool aktualisiert" kurzzeitig ein inkonsistenter Lesezustand entstehen.
   Mitigation: beide Writes bündeln.
2. **Zweiter Schreibpfad umgeht die Regel.** `app/admin/tools/actions.ts` muss die neue
   Bedingung (Wert verwerfen bei ≥1 `PricingPlan`) tatsächlich serverseitig durchsetzen —
   ein reines UI-`disabled`-Attribut lässt sich per direktem Formular-POST umgehen und würde
   die Ableitung still wieder aufheben, ohne dass ein Fehler sichtbar wird.
3. **Sichtbarer Sprung beim ersten Tarif.** Sobald ein Admin den ersten `PricingPlan` für
   ein Tool anlegt, wechselt `startingPriceCents` in diesem Moment von „manuell zuletzt
   eingetragen" auf „abgeleitet" — der zuvor eingetragene Wert kann sich dabei ändern, ohne
   dass der Admin das im UI unmittelbar erklärt bekommt.
4. **Tools mit ausschließlich Jahres-/Einmaltarifen verlieren ihren „ab"-Preis.** Für diese
   wird `startingPriceCents` auf `NULL` gesetzt → `formatPreis(null, …)` zeigt „Auf Anfrage"
   oder „Kostenlos" statt eines Preises. Das ist eine funktionale Verhaltensänderung
   (Tool-Finder-Budgetfilter, Hero-Preiszeile, JSON-LD-Offer), keine reine
   Implementierungsdetail-Frage, und muss vor Umsetzung mit dem Content-/Admin-Team
   abgestimmt werden.
5. **Ungeprüfter Ist-Zustand der Produktiv-DB.** Ob und wie viele Tools dort bereits beide
   Quellen mit abweichenden Werten haben, ist unbekannt — der Umfang des Backfills und
   damit die Sichtbarkeit der Änderung für Endnutzer ist nicht beziffert.
