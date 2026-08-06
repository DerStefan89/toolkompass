## TASK: vitest-prisma-grenze
GOAL: lib/data/pricing.test.ts prüft die vier dokumentierten Regeln von
syncStartingPrice, und `node scripts/check-rules.mjs` bleibt bei Exit 0.
CONTEXT: Voraussetzung ist Vertrag `vitest-geruest`. Mock-Weg:
`vi.mock('@/lib/prisma', factory)` plus `vi.mocked()` für typisierten Zugriff.
Die vier Regeln stehen im Dateikopf von lib/data/pricing.ts (Zeilen 11–21) —
Pointer, nicht kopieren. scripts/check-rules.mjs prüft "as any"/": any" per
Regex über ALLE .ts/.tsx im Repo (sammleDateien(), ausgeschlossen nur
node_modules/.next/.git/_arbeitsmaterial/out/build — Zeilen 49–56),
Testdateien eingeschlossen.
SCOPE: genau vier Testfälle für syncStartingPrice (lib/data/pricing.ts:30):
(a) keine Tarife vorhanden → prisma.tool.update wird NICHT aufgerufen; (b)
monatlicher Tarif vorhanden → update mit dessen priceCents; (c) Tarife
vorhanden, aber kein monthly → update mit null; (d) die an findFirst
übergebenen Argumente enthalten billingCycle 'monthly' und
orderBy { priceCents: 'asc' }.
NICHT: prüfen, ob Prisma korrekt sortiert — ein Mock kann das nicht, prüfbar
ist nur die abgeschickte Anfrage. Keine echte Datenbankverbindung. Kein
Zusatz-Mockpaket (prismock, prisma-mock-vitest). "scripts.check" nicht ändern.
BUDGET: ein Baudurchgang plus eine Korrekturrunde.
OUTPUT: die Testdatei plus Kurzbericht mit der Ausgabe von
`node scripts/check-rules.mjs` — als Beleg, dass kein "as any" nötig war.
ESCALATE: Typisierung erzwingt einen Cast → ANHALTEN, den konkreten Cast und
den Grund vorlegen. Die "as any"-Regel wird nicht aufgeweicht und Testdateien
werden nicht aus scripts/check-rules.mjs ausgenommen. Entscheidung trifft der
Mensch.
