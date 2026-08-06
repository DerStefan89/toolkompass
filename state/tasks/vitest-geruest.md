## TASK: vitest-geruest
GOAL: `npx vitest run` läuft grün mit Tests auf reine Logik ohne DB-Zugriff.
CONTEXT: Vitest 4.x. `tsconfig.json` inkludiert `**/*.ts` und `**/*.mts`
(tsconfig.json:27,31) — Testdateien und die Vitest-Config laufen automatisch
durch `npm run typecheck`. Deshalb: Imports explizit aus 'vitest'
(describe/it/expect), keine Globals, kein Eingriff in `tsconfig.json`.
Pfad-Alias "@" über `resolve.alias` in der Vitest-Config auflösen, nicht über
ein Zusatzpaket. Verhaltensregeln stehen in den JSDoc-Köpfen der Zieldateien —
Pointer, nicht kopieren.
SCOPE: `vitest.config.mts` (environment 'node', resolve.alias "@" auf
Repo-Root); `vitest` als devDependency; Script `"test": "vitest run"` in
`package.json`; drei Testdateien neben dem Quellcode:
- `lib/utils/format.test.ts` (formatPreis, alle im JSDoc dokumentierten Fälle
  inkl. der beiden null-Zweige und cents === 0 — siehe lib/utils/format.ts:7-22)
- `lib/utils/form.test.ts` (toSlug: Umlaute, ß, Sonderzeichen,
  führende/schließende Bindestriche; parseLines: leer, Nicht-String,
  Leerzeilen — siehe lib/utils/form.ts:14,26)
- `lib/utils/pagination.test.ts` (parsePageParams: gültige Seite, fehlender
  Parameter, nicht-numerisch, negativ — siehe lib/utils/pagination.ts:3).
  Assertions auf den Rückgabewert als vollständigen Objektvergleich schreiben
  (`toEqual` mit allen vier Feldern page/pageSize/skip/take) — NICHT
  `toMatchObject` oder Teil-Literale: Ein Teil-Literal mit `take` ohne `skip`
  löst scripts/check-rules.mjs' "take ohne skip"-Regel (Zeile 148-163)
  fälschlich aus, weil die Regel rein syntaktisch prüft, nicht ob es ein
  Prisma-Query ist (Advisor-Befund, siehe state/advisor-findings-vitest.md).
NICHT: "scripts.check" in package.json ändern; .github/workflows/ci.yml
anfassen; CLAUDE.md anfassen; state/gates.md anfassen; lib/data/pricing.ts
testen; eine einzige Zeile Produktivcode ändern.
BUDGET: ein Baudurchgang plus eine Korrekturrunde.
OUTPUT: die genannten Dateien plus Kurzbericht: Anzahl Tests, Ausgabe von
`npx vitest run`, Ausgabe von `npm run check` (muss unverändert Exit 0 sein).
ESCALATE: (a) resolve.alias löst "@/..." nicht auf → anhalten und
vite-tsconfig-paths VORSCHLAGEN, nicht installieren. (b) Ein Test deckt einen
echten Fehler im Produktivcode auf → Test schreibt das IST-Verhalten fest,
Fehler wird im Bericht gemeldet, Produktivcode bleibt unangetastet. Bekannter
Fall: parsePageParams castet searchParams.page mit `as string`
(lib/utils/pagination.ts:6), obwohl der Typ string | string[] ist.
