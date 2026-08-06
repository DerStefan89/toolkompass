## TASK: zod-phase4-track
GOAL: linkId wird per Zod auf leeren String geprüft; GET
/api/track/[linkId] erfüllt V10-V12 aus specs/zod-eingabevalidierung.md;
npm run check bleibt grün.

CONTEXT: Quelle der Wahrheit: specs/zod-eingabevalidierung.md (V10-V12,
Abschnitt "Entschieden" zu V12), state/plan-v2-zod-eingabevalidierung.md
(Phase 4), state/advisor-findings-zod-eingabevalidierung.md (Finding 11,
Testaufbau neuer Boden). Keine offenen Entscheidungen mehr — V12 ist in der
Spec bereits als "nur Leerstring, keine weitere Formatprüfung" festgelegt,
nicht neu zu verhandeln.

SCOPE:
- app/api/track/[linkId]/route.ts: Leerstring-Guard für linkId. Muss NACH
  dem Bot-Filter (aktuell Zeile 100) und NACH dem Rate-Limit-Block (aktuell
  Zeile 106-113) laufen, aber VOR dem prisma.affiliateLink.findUnique-Aufruf
  (aktuell Zeile 116-119) — sonst würde ein leerer linkId von einem Bot
  fälschlich einen 400 statt den unveränderten Bot-302 auslösen und V11
  indirekt verändern, obwohl V11 das nicht verlangt.
- app/api/track/[linkId]/route.test.ts (neu): drei Vitest-Fälle (V10, V11,
  V12). Testaufbau ist neuer Boden im Repo (Finding 11) — NextRequest mit
  Headern (user-agent, x-forwarded-for, accept-language) UND zweitem
  Handler-Argument { params: Promise<{ linkId: string }> } konstruieren,
  kein bestehendes Testmuster im Repo dafür.

NICHT: keine cuid()-Formatprüfung oder andere Struktur-Validierung über den
Leerstring-Fall hinaus (V12 ist bewusst so entschieden); Bot-Filter- oder
Rate-Limit-Logik NICHT anfassen; andere Routen NICHT anfassen; kein commit,
kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: geänderte/neue Dateien; Kurzbericht mit Anzahl Tests, Ausgabe von
"npx vitest run" für die neue Testdatei, Ausgabe von "npm run check";
Bestätigung, dass V10, V11 und V12 einzeln durchlaufen wurden.

ESCALATE: (a) Der Leerstring-Guard verändert das Bot-Verhalten (V11) →
anhalten, Reihenfolge im Bericht zeigen, nicht committen. (b) Die
NextRequest-Konstruktion mit Promise-Params gelingt nicht wie erwartet →
anhalten, tatsächliches Verhalten im Bericht zeigen, nicht raten.
