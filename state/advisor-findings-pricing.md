# Advisor-Findings — state/plan-v1-pricing.md

Erzeugt von einem frischen Kontext des Subagenten `architecture-advisor`, adversarial
instruiert: „Finde unbelegte Annahmen, unnötige Komplexität, fehlende Fehlerpfade in
diesem Plan." Der Advisor hat den Plan gegen den echten Code geprüft (prisma/schema.prisma,
app/admin/tools/pricing-actions.ts, app/admin/tools/actions.ts, lib/utils/stack-costs.ts,
components/admin/ToolForm.tsx, prisma/seed.ts, scripts/update-prices.ts, ARCHITECTURE.md),
nicht dem Plan blind geglaubt.

Evidenz-Marker: **[Fakt]** belegt im Code · **[Schlussfolgerung]** aus Fakten abgeleitet ·
**[Annahme]** unbelegte Prämisse des Plans · **[offene Unsicherheit]** weder belegt noch
widerlegt.

## Befunde

1. **[Schlussfolgerung]** `syncStartingPrice(toolId)` kann mit der im Plan beschriebenen
   Signatur (nur `toolId`, kein `tx`-Parameter) nicht „im selben `prisma.$transaction`"
   laufen wie der PricingPlan-Write. Prisma-interaktive Transaktionen erfordern, dass alle
   beteiligten Queries denselben `Prisma.TransactionClient` nutzen, nicht den globalen
   `prisma`-Singleton. Damit ist die zentrale Mitigation von Risiko 1 im Plan
   („beide Writes bündeln") mit der vorgeschlagenen Funktionssignatur nicht umsetzbar.

2. **[Fakt]** `revalidateToolPaths()` in `app/admin/tools/pricing-actions.ts:68-75`
   revalidiert nur `/admin/tools/${toolId}` und `/tools/${tool.slug}`, **nicht**
   `/admin/tools` (die Übersichtsliste). Der Plan selbst nennt `app/admin/tools/page.tsx`
   als Lesepfad von `startingPriceCents`. Sobald `syncStartingPrice` diesen Wert als
   Seiteneffekt eines PricingPlan-Writes ändert, verstößt der resultierende Code gegen
   ARCHITECTURE.md §5 („`revalidatePath` nach jeder Mutation auf Admin- UND public Pfad")
   für genau diese Seite — die „Betroffene Dateien"-Tabelle im Plan sieht keine Anpassung
   von `revalidateToolPaths` vor.

3. **[Fakt]** `lib/seo/json-ld.ts:48` — `price: tool.hasFreePlan ? '0' : (startingPriceCents
   != null ? … : '0')`. Bei `startingPriceCents === null` **und** `hasFreePlan === false`
   wird der JSON-LD-Preis immer `'0'`, nicht weggelassen. Plan-Risiko 4 erzeugt aktiv neue
   `NULL`-Werte für Tools mit ausschließlich Jahres-/Einmaltarifen — also für Tools mit
   echtem, nicht-kostenlosem Preis. Ergebnis: strukturierte Daten melden für real
   kostenpflichtige Tools `price: '0'`. Der Plan benennt „JSON-LD-Offer" nur pauschal unter
   Risiko 4, ohne diese konkrete irreführende Fallback-Kaskade — Schweregrad im Plan
   unterschätzt.

4. **[Fakt]** `components/admin/ToolForm.tsx` hat aktuell **keinen** PricingPlan-Datenzugriff.
   `ToolFormDefaults` enthält kein PricingPlan-Feld; `PricingPlanManager` wird in
   `app/admin/tools/[id]/page.tsx:167` komplett separat von `ToolForm` gerendert (eigene
   Props `toolId`/`plans`, nicht über `ToolForm` geleitet). Die „Betroffene Dateien"-Tabelle
   des Plans listet weder `app/admin/tools/[id]/page.tsx` noch eine Typerweiterung von
   `ToolFormDefaults`. Die geplante Änderung „Preisfeld disabled, wenn Tool bereits
   PricingPlan-Zeilen hat" ist mit den im Plan gelisteten Dateien nicht umsetzbar — ein
   Datenfluss-Schritt fehlt.

5. **[Schlussfolgerung]** Der Rückweg (letzter PricingPlan gelöscht) ist im Plan nicht
   behandelt. `deletePricingPlan` kann den letzten verbleibenden Tarif eines Tools löschen,
   wodurch die Bedingung „≥1 PricingPlan" wieder falsch wird. Plan-Risiko 3 beschreibt nur
   den Hinweg (erster Tarif angelegt). `syncStartingPrice` würde dann ein leeres
   `MIN`-Aggregat (effektiv `NULL`) liefern — ein vor dem ersten PricingPlan eingetragener
   manueller Wert wird nicht wiederhergestellt. Stiller Datenverlust, nicht in den Risiken
   erfasst.

6. **[Schlussfolgerung]** `scripts/update-prices.ts` kann die neue `NULL`-Regel unterlaufen —
   der Plan stuft das fälschlich unter „Nicht betroffen" ein. Das Script überspringt ein
   Tool nur wenn `startingPriceCents !== null` (Zeile 231-234). Wird `startingPriceCents`
   durch die neue Ableitungsregel bewusst auf `NULL` gesetzt (Jahres-/Einmaltarif-Fall), ist
   das für das Script nicht von „hat noch keinen Preis" unterscheidbar — beim nächsten Lauf
   mit `--execute` schreibt es einen aus Markdown geparsten Preis hinein, obwohl `NULL` nach
   neuer Regel „bewusst abgeleitet: kein Monatstarif vorhanden" bedeutet. Genau der
   Zwei-Quellen-Konflikt, den der Plan lösen soll, entsteht hier neu.

7. **[Fakt]** Existierende Migrationen liegen als committete Dateien unter
   `prisma/migrations/<timestamp>_name/migration.sql`, passend zu ARCHITECTURE §5
   („SQL-Datei erstellen → manuell ausführen → `prisma generate`"). Der Plan formuliert das
   Backfill-SQL nur inline im Markdown, ohne eine entsprechende Migrationsdatei in der
   „Betroffene Dateien"-Tabelle vorzusehen — Abweichung von der etablierten Konvention, nicht
   als bewusste Entscheidung benannt (vgl. CLAUDE.md: „Entscheidung dokumentieren — niemals
   stillschweigend").

8. **[Annahme]** Der Backfill wird als „gefahrlos" bezeichnet, obwohl der
   Produktiv-Ist-Zustand laut Plan selbst ungeprüft ist (eigenes Risiko 5). Ein
   irreversibles `UPDATE` ohne vorherigen `SELECT`-Vorablauf zur Sichtung der betroffenen
   Zeilen ist nicht „gefahrlos" nur weil der Erwartungswert ein No-Op ist — falls die
   Annahme falsch ist, ändert es sichtbare Preise (Tool-Finder-Sortierung/-Filter,
   Hero-Anzeige) ohne Staging-Schritt.

9. **[offene Unsicherheit]** Die `MIN(priceCents)`-Regel ignoriert `isHighlighted`/
   `sortOrder` der PricingPlan-Zeilen. Falls ein Admin bewusst einen teureren, hervorgehobenen
   Tarif als redaktionellen Fokus markiert hat, überschreibt die reine `MIN`-Regel dies mit
   dem günstigsten (ggf. nicht hervorgehobenen) Tarif als „ab"-Preis. Inhaltlich vermutlich
   unproblematisch (billigster = übliche Konvention für „ab"-Preis), aber im Plan nicht mit
   den redaktionellen Erwartungen abgeglichen.

10. **[Fakt, entlastend]** Die Bestandsaufnahme des Plans ist an den geprüften Stellen
    zutreffend: `Tool.startingPriceCents` (schema.prisma:128), `PricingPlan`
    (schema.prisma:478-494), getrennte Schreibpfade (`pricing-actions.ts` vs. `actions.ts`),
    `stack-costs.ts`-Prioritätskette und die Aussage „kein Tool im Seed hat PricingPlan-
    Zeilen" sind mit dem Code konsistent (verifiziert: keine `pricingPlan.create`/
    `pricingPlans:`-Vorkommen in `prisma/seed.ts`).

## Advisor-Urteil

- [ ] Freigegeben
- [ ] Freigegeben mit Hinweisen
- [x] Nicht freigegeben
- [ ] Blockiert

Begründung: Findings 1, 2, 4 und 6 sind konkrete technische Lücken (Transaktions-Signatur,
fehlender Revalidate-Pfad, fehlende Datenfluss-Änderung in `page.tsx`, Wiederauftreten des
Zwei-Quellen-Konflikts über `update-prices.ts`), die vor Umsetzung geschlossen werden
müssen.

## Nächster sinnvoller Schritt (Advisor)

Plan um die fehlenden Datei-Änderungen (`app/admin/tools/[id]/page.tsx`,
`revalidateToolPaths`) ergänzen, `syncStartingPrice`-Signatur mit explizitem
`tx`-Parameter spezifizieren, und die Wechselwirkung mit `scripts/update-prices.ts`
(Finding 6) sowie den Lösch-Rückweg (Finding 5) explizit entscheiden, bevor der Plan
erneut vorgelegt wird.
