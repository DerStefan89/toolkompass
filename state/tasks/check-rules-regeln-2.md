## TASK: check-rules-regeln-2
GOAL: `scripts/check-rules.mjs` (aus check-rules-geruest) um zwei Regeln erweitert:
`take` ohne `skip`, `createClient()` + `getUser()` in Actions. AST-basiert über die
TypeScript Compiler API (bereits Projekt-Dependency für `tsc --noEmit`) — keine
Zeilen-Regex, keine neue Abhängigkeit. Grund: Eine Zeilen-Regex hätte im echten
Bestand die unten gelisteten Testfälle fälschlich gemeldet (Advisor-Review,
2026-08-05). Für jede neue Regel: ein bewusst erzeugter Gegentest, der rot UND ein
Gegentest, der grün belegt — beide im Bericht dokumentiert (Muster: `state/gates.md`,
Kalibrierungsfunde-Abschnitt).
CONTEXT: ARCHITECTURE.md §7. `scripts/check-rules.mjs` (Ergebnis des vorherigen
Vertrags) als Basisdatei — Pointer auf die Datei, nicht deren Inhalt hier duplizieren.
Verbotene Kombination laut §7 ist `createClient()` + `getUser()` in derselben Action,
nicht `createClient()` allein.
SCOPE: Nur diese zwei Regeln ergänzen. NICHT mehr Regeln erfinden. NICHT
CI-Einbindung.
TESTFÄLLE — dürfen NICHT als Verstoß anschlagen (grün bleiben):
- `take`/`skip` im selben Objekt-Literal, auch über mehrere Zeilen verteilt:
  `lib/data/tools.ts:42-43`, `lib/data/tool-finder.ts:107-108`,
  `lib/data/tool-finder.ts:116-117`, `lib/data/tool-finder.ts:121-122`,
  `lib/data/categories.ts:39-40`, `app/api/search/route.ts:103-104`,
  `app/api/search/route.ts:117-118`
- Sanktionierte Referenzimplementierung von `createClient()` + `getUser()`:
  `lib/auth/require-admin.ts:11-12`, `lib/auth/require-user.ts:34-35`
- `createClient()`-Deklarationen selbst (kein Aufruf in einer Action):
  `lib/supabase/server.ts:12`, `lib/supabase/client.ts:10`
- `createClient()` ohne `getUser()` in öffentlichen/legitimen Actions:
  `app/konto/actions.ts:71` (logout, kein Guard nötig),
  `app/einloggen/actions.ts:47` (öffentliche Action, bewusst kein Guard)
BUDGET: ca. 20 Minuten.
OUTPUT: erweiterte `scripts/check-rules.mjs` + Nachweis-Abschnitt im Bericht (rot/grün
je Regel, inklusive Bestätigung, dass alle oben gelisteten Testfälle grün bleiben).
ESCALATE: Falls eine Regel nicht ohne Fehlalarm im Bestand formulierbar ist → als
offene Unsicherheit im Bericht markieren, NICHT die Regel künstlich entschärfen, bis
sie durchläuft.
