## TASK: zod-phase3-search
GOAL: q wird per Zod auf Typ geprüft (Konsistenz mit den anderen drei
Routen); GET /api/search erfüllt V7-V9 aus specs/zod-eingabevalidierung.md
OHNE Verhaltensänderung; npm run check bleibt grün.

CONTEXT: Quelle der Wahrheit: specs/zod-eingabevalidierung.md (V7-V9),
state/plan-v2-zod-eingabevalidierung.md (Phase 3, "Konsistenz-Phase ohne
Verhaltensänderung"). Keine offenen Entscheidungen — Plan v2 hat bereits
geklärt: das Zod-Schema prüft NUR den Typ (string), keine Mindestlänge als
harte Ablehnung. Die bestehende q.length < 2 → 200 + []-Logik bleibt als
eigenständiger Schritt NACH dem Zod-Parse bestehen. Kein neuer
Advisor-Pass — diese Phase ändert nichts an der bereits geprüften
Einschätzung aus Plan v2.

SCOPE:
- app/api/search/route.ts: nach der bestehenden Rate-Limit-Prüfung
  (aktuell Zeile 64-68) und VOR der Query-Kappung (aktuell Zeile 71) ein
  Zod-Schema (z.string(), kein .min()/.max()) auf den rohen
  searchParams.get('q')-Wert anwenden. Die bestehende
  .trim().slice(0, MAX_QUERY_LENGTH)-Logik und der q.length < 2-Check
  bleiben danach unverändert bestehen.
- app/api/search/route.test.ts (neu): drei Vitest-Fälle (V7, V8, V9).
  Testaufbau-Muster wie app/api/track/[linkId]/route.test.ts (NextRequest
  mit Query-Params über die URL) — hier ohne zweites Handler-Argument, da
  kein Route-Param.

NICHT: keine Mindest-/Höchstlängenprüfung im Zod-Schema selbst (bleibt
Anwendungslogik danach, nicht Schema); Rate-Limit-Logik NICHT anfassen;
andere Routen NICHT anfassen; kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: geänderte/neue Dateien; Kurzbericht mit Anzahl Tests, Ausgabe von
"npx vitest run" für die neue Testdatei, Ausgabe von "npm run check";
Bestätigung, dass V7, V8 und V9 einzeln durchlaufen wurden.

ESCALATE: (a) Das Zod-Schema lehnt einen Fall ab, der laut V7/V8/V9
weiterhin Status 200 liefern soll → anhalten, nicht die V-Aussage
nachträglich uminterpretieren. (b) Mehrfaches q (?q=a&q=b) verhält sich
anders als erwartet → im Bericht das tatsächliche Verhalten zeigen, nicht
raten.
