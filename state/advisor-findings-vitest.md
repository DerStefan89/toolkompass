# Advisor-Findings — state/tasks/vitest-geruest.md, state/tasks/vitest-prisma-grenze.md, state/tasks/vitest-gate-scharf.md

Erzeugt von einem frischen Kontext des Subagenten `architecture-advisor`, Advisor-Pass auf
state/tasks/vitest-geruest.md, state/tasks/vitest-prisma-grenze.md,
state/tasks/vitest-gate-scharf.md, 06.08.2026. Die drei Verträge führen zusammen ein neues,
blockierendes CI-Gate ein (Vitest-Unit-Tests) nach dem Muster der fünf bestehenden Gates in
state/gates.md. Der Advisor hat alle drei Verträge, ARCHITECTURE.md, state/gates.md,
scripts/check-rules.mjs, scripts/check-docs.mjs, package.json, tsconfig.json,
.github/workflows/ci.yml, CLAUDE.md, docs/STATUS.md sowie die Zieldateien
(lib/utils/format.ts, form.ts, pagination.ts, lib/data/pricing.ts, lib/prisma.ts) gegen den
echten Code geprüft, nicht den Verträgen blind geglaubt. Kein Bash-/Git-/GitHub-API-Zugriff in
dieser Rolle (nur Read/Grep/Glob) — dort wo das die Prüftiefe begrenzt, ist es unten vermerkt.

Evidenz-Marker: **[Fakt]** belegt im Code · **[Schlussfolgerung]** aus Fakten abgeleitet ·
**[Annahme]** unbelegte Prämisse des Vertrags · **[offene Unsicherheit]** weder belegt noch
widerlegt.

## Befunde

1. **[Schlussfolgerung]** `scripts/check-rules.mjs:148-163` (Regel „take ohne skip") prüft rein
   syntaktisch: jedes Objekt-Literal mit einer direkten `take`-Property ohne direkte
   `skip`-Property im selben Literal schlägt an — unabhängig davon, ob es ein Prisma-Query oder
   eine Test-Assertion ist. `lib/utils/pagination.ts:8` gibt `{ page, pageSize, skip, take }`
   zurück. Schreibt `lib/utils/pagination.test.ts` (Vertrag 1) einen vollständigen
   `toEqual({...})`-Vergleich mit allen vier Feldern, bleibt das Objekt-Literal unauffällig;
   verwendet der Test aber `toMatchObject({ take: 25 })` oder ein Teil-Literal mit nur `take`,
   triggert das die Regel — `npm run check` wird beim Scharfschalten (Vertrag 3) aus einem
   anderen Grund rot als der dort vorgesehenen, bewusst gebrochenen Assertion. Keiner der drei
   Verträge schließt diesen Assertion-Stil bisher aus.

2. **[offene Unsicherheit]** Ob `resolve.alias` in `vitest.config.mts` (Vertrag 1) für
   `"@/..."`-Imports bei `moduleResolution: "bundler"` (tsconfig.json:11) tatsächlich ausreicht,
   ist im Repo nicht verifizierbar: keine bestehende Vite-/Vitest-Konfiguration, kein
   Alias-Mechanismus außerhalb von tsconfig.json als Präzedenzfall (Glob/Grep ohne Treffer
   außerhalb von node_modules). Die Annahme im Vertrag, dass kein Zusatzpaket
   (vite-tsconfig-paths) nötig ist, ist damit unbelegt — aber Vertrag 1 hat für genau diesen Fall
   bereits einen ESCALATE-Pfad (Punkt a) vorgesehen, also kein Stopp-Grund, nur ein Prüfpunkt
   beim ersten Testlauf.

3. **[offene Unsicherheit]** Zur Prämisse „keine offenen PRs betroffen" (Vertrag 3): Der
   Required-Status-Check-Name `check` ändert sich durch Vertrag 3 nicht (ci.yml wird laut NICHT-
   Liste nicht angefasst, Job-ID bleibt `check`), und ein neuer Commit-SHA erzwingt normalerweise
   einen neuen CI-Lauf mit dem erweiterten Skript — die Prämisse hält für den Regelfall. Ein
   Restrisiko bleibt bei einem reinen Fast-Forward-Merge ohne neuen Commit (alter, bereits
   grüner Status würde dann für denselben SHA weiterverwendet); ob ein solcher Branch aktuell
   existiert, konnte der Advisor mangels Git-/GitHub-API-Zugriff nicht prüfen.

4. **[Schlussfolgerung]** Keiner der drei Verträge aktualisiert den Befehlsblock in
   CLAUDE.md (Zeilen 42-52), der `npm run dev/build/start/lint/typecheck/check` sowie
   `npx prisma generate`/`npx tsx prisma/seed.ts` auflistet. `npm run test` (neu ab Vertrag 1)
   taucht dort nirgends auf, obwohl er ab jetzt dauerhafter Teil des Werkzeugkastens ist.
   `scripts/check-docs.mjs` erkennt diese Lücke nicht (prüft nur kaputte Verweise/Doppel-
   Versionen, keine Vollständigkeit).

5. **[Schlussfolgerung]** `state/tasks/vitest-gate-scharf.md:13-15` hängt `&& vitest run` direkt
   an `scripts.check` an, obwohl Vertrag 1 bereits ein `"test": "vitest run"`-Script anlegt.
   `&& npm run test` statt der wörtlichen Wiederholung von `vitest run` wäre DRYer — zwei Namen
   für denselben Befehl sind vermeidbare Redundanz.

6. **[Fakt, entlastend]** `scripts/check-rules.mjs:47` (`sammleDateien`) erfasst nur Pfade mit
   `.ts`/`.tsx`-Endung — `vitest.config.mts` bleibt außen vor (`"vitest.config.mts".endsWith('.ts')`
   ist `false`). `scripts/check-docs.mjs:35-44` prüft ausschließlich die feste Liste CLAUDE.md,
   ARCHITECTURE.md, README.md, `.claude/agents/*.md` auf kaputte Verweise/Doppel-Versionen — die
   neuen Testdateien und `vitest.config.mts` liegen außerhalb dieser Liste. Beide Mechanismen
   bergen kein Nebeneffekt-Risiko für das Scharfschalten.

7. **[Fakt, entlastend]** Alle Zeilenverweise in den drei Verträgen sind korrekt:
   `lib/utils/pagination.ts:6` enthält `(searchParams.page as string)` wie in
   state/tasks/vitest-geruest.md:30-31 referenziert; die vier SCOPE-Punkte in
   state/tasks/vitest-prisma-grenze.md:11-16 entsprechen exakt `lib/data/pricing.ts:31-47`;
   CLAUDE.md:57 lautet wörtlich „Kein Playwright, kein Vitest (Pflicht vor Cashback-Webhooks in
   Phase 6)" und CLAUDE.md:49 nennt tatsächlich nur „lint + typecheck" — beide von Vertrag 3 als
   Korrekturziel benannten Zeilen sind korrekt getroffen.

## Advisor-Urteil

- [ ] Freigegeben
- [x] Freigegeben mit Hinweisen
- [ ] Nicht freigegeben
- [ ] Blockiert

Begründung: Kein technischer Blocker, aber Finding 1 (take-ohne-skip-Fehlalarm) ist ein
konkreter, vermeidbarer Rot-Grund abseits der eigentlichen Tests und sollte vor dem Bau von
`pagination.test.ts` in den Vertrag aufgenommen werden. Findings 2 und 3 sind offene
Unsicherheiten mit bereits vorhandenem Auffangmechanismus (ESCALATE-Pfad bzw. Regelfall-Schutz
durch neue Commit-SHAs) — kein Stopp-Grund. Findings 4 und 5 sind kleinere Präzisierungen ohne
Risiko.

## Nächster sinnvoller Schritt (Advisor)

Vor dem Bau von `pagination.test.ts` (Vertrag 1) explizit festlegen, dass Assertions auf
`parsePageParams`-Rückgabewerte als vollständige Objektvergleiche (`toEqual` mit allen vier
Feldern) geschrieben werden, um den take/skip-Nebeneffekt in `check-rules.mjs` von vornherein
zu vermeiden statt ihn erst beim Scharfschalten (Vertrag 3) zu entdecken. Die
`resolve.alias`-Frage (Vertrag 1, Punkt a) bleibt ein legitimer Prüfpunkt beim ersten
Testlauf, kein Blocker vorab.

## Nachtrag (vitest-prisma-grenze, 06.08.2026)

Finding 2 (offene Unsicherheit zu `resolve.alias` und `"@/..."`-Imports) ist widerlegt: Beim
Bau von `lib/data/pricing.test.ts` (Vertrag `vitest-prisma-grenze`, erster Test im Repo mit
einem echten `@/lib/prisma`-Import) löste der Alias beim ersten Testlauf sofort auf —
`npx vitest run lib/data/pricing.test.ts` lief grün, kein `vite-tsconfig-paths` nötig. Aus
„offene Unsicherheit" wird „Fakt, bestätigt". Finding 2 oben bleibt als historischer Stand
unverändert stehen.
