## TASK: zod-review-fixes
GOAL: Der ungeschützte prisma.affiliateLink.findUnique-Aufruf ist gegen
DB-Fehler (z. B. NUL-Byte in linkId) abgesichert und degradiert wie ein
unbekannter Link zu einem 302-Redirect zur Startseite, statt einer
unbehandelten Exception (Finding F3, qa-Review). Optionale Felder in der
anfrage-Route akzeptieren explizites null gleichwertig zu fehlendem Feld
(Finding F2, qa-Review). npm run check bleibt grün.

CONTEXT: Quelle: qa-Subagent-Review zu app/api/track/[linkId]/route.ts und
app/api/anfrage/route.ts (Findings F3 und F2, vollständiger Text im
Chat-Verlauf der Session, die den Review durchgeführt hat). Kein neuer
Advisor-Pass — Umfang ist klein und reversibel, kein neues Architekturmuster.

SCOPE:
- app/api/track/[linkId]/route.ts: prisma.affiliateLink.findUnique in
  try/catch kapseln. Bei Fehler: console.error('[track]', error) plus
  captureException (wenn SENTRY_DSN gesetzt — gleiches Muster wie der
  bestehende catch-Block bei affiliateClick.create weiter unten), danach
  NextResponse.redirect(home, { status: 302 }) zurückgeben.
- app/api/track/[linkId]/route.test.ts: neuer Testfall — linkId mit
  NUL-Byte ('foo\u0000bar'), findUnique-Mock wirft einen Error, erwartet
  Status 302 + Redirect zur Startseite, nicht 500.
- app/api/anfrage/route.ts: optionale Felder im Zod-Schema von .optional()
  auf .nullish() ändern (companyType, targetUsers, features, examples,
  budget, timeline).
- app/api/anfrage/route.test.ts: neuer Testfall — companyType: null
  explizit gesendet, erwartet Status 200, nicht 400.

NICHT: F1, F5, F7, F9, F10 NICHT beheben (laut QA nur Testlücken bzw.
geringes Risiko); F6, F8, F11 NICHT anfassen (bereits bewusste, dokumentierte
Entscheidungen); keine neue Zeichen-Obergrenze für linkId; kein commit,
kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: geänderte Dateien; Kurzbericht mit Testanzahl, Ausgabe von
"npx vitest run" für beide betroffenen Testdateien, Ausgabe von
"npm run check"; zusätzlich ein roter Gegentest-Nachweis für den neuen
NUL-Byte-Test (Fix kurz entfernen → Test schlägt fehl mit unbehandelter
Exception zeigen → Fix zurück → Test grün) nach dem Kalibrierungsmuster aus
state/gates.md.

ESCALATE: (a) Der try/catch um findUnique verändert das Verhalten bei einem
GÜLTIGEN, existierenden Link → anhalten, nur der Fehlerfall darf betroffen
sein. (b) .nullish() bricht einen bestehenden Test (V5 oder V6) → anhalten,
im Bericht zeigen, Test nicht ohne Rücksprache anpassen.
