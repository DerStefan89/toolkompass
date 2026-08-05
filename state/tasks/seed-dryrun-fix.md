## TASK: seed-dryrun-fix
GOAL: Im Dry-Run von `scripts/seed-rating-criteria.ts` werden ratingCriterion-IDs
per echter `findMany()`-Abfrage ermittelt statt als `dry-0`/`dry-1`/... erzeugt,
und Tool-Zuweisungen laufen über die tatsächlich zugeordneten Tool-IDs statt
über `count()` — der Dry-Run nimmt denselben Codepfad wie der Echtlauf, schreibt
aber nichts.
CONTEXT: `docs/STATUS.md` Punkt 21 (Pointer, genaue Zeilen dort). `scripts/_mode.ts`
(bestehende Dry-Run-Konvention, Muster). `scripts/seed-rating-criteria.ts` selbst.
SCOPE: Nur diese eine Datei. NICHT andere der zehn DB-schreibenden Scripts
anfassen. NICHT tatsächlich in die DB schreiben.
BUDGET: ca. 30 Minuten.
OUTPUT: geänderte `scripts/seed-rating-criteria.ts` + Bericht, der zeigt: Dry-Run
und Echtlauf nehmen jetzt nachweislich denselben Abfragepfad (z. B. Log-Vergleich
oder Code-Beleg).
ESCALATE: Falls sich Dry-Run und Echtlauf aus einem echten Grund (nicht
Bequemlichkeit) nicht denselben Codepfad teilen können: als offene Unsicherheit
im Bericht markieren, nicht künstlich angleichen.
