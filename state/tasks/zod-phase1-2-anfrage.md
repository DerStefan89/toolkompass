## TASK: zod-phase1-2-anfrage
GOAL: zod ist installiert; POST /api/anfrage validiert den Body per Zod-Schema,
alle sechs V-Aussagen (V1-V6) aus specs/zod-eingabevalidierung.md sind erfüllt,
npm run check bleibt grün.

CONTEXT: Quelle der Wahrheit: specs/zod-eingabevalidierung.md (Abschnitt
"Gewünschtes Verhalten", V1-V6), state/plan-v2-zod-eingabevalidierung.md
(Phase 1 + Phase 2), state/advisor-findings-zod-eingabevalidierung.md
(Findings 1, 2, 3, 4, 10). Zwei zuvor offene Entscheidungen sind getroffen,
nicht mehr zu klären:
- E-Mail-Prüfung: dieselbe einfache Prüfung wie app/einloggen/actions.ts:38
  (email.includes('@') && email.includes('.')), nicht RFC-strikt, via
  z.string().refine(...).
- Fehlerantwort-Format: ein einzelner deutscher Freitext-String im Feld
  "error" (bestehende Konvention aus app/api/anfrage/route.ts:73-76), keine
  strukturierten Zod-Issues im Response-Body.
- Zod-Version: die von "npm install zod" aufgelöste Version verwenden
  (aktuell transitiv 4.4.3 im Repo) — safeParse() nutzen, die tatsächliche
  API der installierten Version verifizieren, nicht annehmen.

SCOPE:
- package.json / package-lock.json: zod als dependency.
- app/api/anfrage/route.ts: manueller Guard
  "body !== null && typeof body === 'object' && !Array.isArray(body)" VOR
  dem Honeypot-Zugriff (Advisor-Fix, Finding 1). Honeypot-Feld bleibt
  AUSSERHALB des Zod-Schemas, weiterhin String(body._honeypot ?? '')
  (Advisor-Entscheidung, Finding 2). Zod-Schema für name/email/description
  (Pflicht) plus optionale Felder ersetzt die String-Coercion in den
  aktuellen Zeilen 68-91.
- app/api/anfrage/route.test.ts (neu): sechs Vitest-Fälle, einer pro
  V-Aussage, plus Prüfung, dass bei V6 prisma.inquiry.create NICHT
  aufgerufen wird (vi.mock('@/lib/prisma', ...), Konvention wie
  lib/data/pricing.test.ts).

NICHT: kein lib/validation/-Utility anlegen (inline bleibt, siehe Plan v2
"Offener Punkt"); keine Zeichen-Obergrenzen erfinden; app/einloggen/actions.ts
NICHT anfassen (dieselbe E-Mail-Logik dort ist ein eigener, hier nicht
geplanter Schritt); andere Routen (search/track/confirm) NICHT anfassen;
kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: geänderte/neue Dateien; Kurzbericht mit Anzahl Tests, Ausgabe von
"npx vitest run" für die neue Testdatei, Ausgabe von "npm run check";
Bestätigung, dass jede der sechs V-Aussagen einzeln durchlaufen wurde.

ESCALATE: (a) installierte Zod-Version verhält sich anders als erwartet
(z. B. Fehlerformat) → anhalten, tatsächliche API aus node_modules/zod
ablesen und im Bericht nennen, nicht raten. (b) Der neue Guard ändert
unbeabsichtigt V6 (Honeypot-Kurzschluss) → anhalten, Reihenfolge im Bericht
zeigen. (c) Die E-Mail-Refine-Regel lässt einen offensichtlich ungültigen
Fall durch, den V3 nicht abdeckt → im Bericht melden, nicht eigenmächtig
verschärfen.
