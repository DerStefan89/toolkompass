# Advisor-Findings — state/plan-v1-zod-eingabevalidierung.md

Erzeugt vom Subagenten `architecture-advisor`, mit gezieltem Fokus auf drei vom Plan
selbst als offen gekennzeichnete Stellen: den Abschnitt „Offener Punkt, nicht
stillschweigend entschieden" (inline Zod-Schemas vs. gemeinsames
`lib/validation/*.ts`-Utility), das Risiko in Phase 2 (Reihenfolge Honeypot-Check vs.
Zod-Parse bei `body === null`) und das Risiko in Phase 5 (V14 wird mitgebaut, obwohl
formal nicht Teil der 14 Pflicht-V-Aussagen). Der Advisor hat den Plan gegen
`specs/zod-eingabevalidierung.md`, die vier betroffenen Route-Dateien im aktuellen
Stand, `CLAUDE.md`, `ARCHITECTURE.md`, `prisma/schema.prisma` sowie ergänzend
`app/einloggen/actions.ts`, `app/einloggen/page.tsx` und die Supabase-Typdefinitionen
in `node_modules/@supabase/auth-js` geprüft, nicht dem Plan blind geglaubt.

Evidenz-Marker: **[Fakt]** belegt im Code · **[Schlussfolgerung]** aus Fakten
abgeleitet · **[Annahme]** unbelegte Prämisse (in Spec und/oder Plan) ·
**[offene Unsicherheit]** weder belegt noch widerlegt.

## Befunde

1. **[Fakt]** Der in Phase 2 (v1) als Alternative zu „zwei Zod-Parses" genannte Guard
   `typeof body === 'object'` ist technisch falsch: In JavaScript gilt
   `typeof null === 'object'`. Ein Guard dieser Form lässt `body === null`
   unverändert durch, und der nachfolgende Zugriff auf `body._honeypot`
   (`app/api/anfrage/route.ts:63`) wirft weiterhin die unbehandelte Laufzeitausnahme,
   die V1 gerade verhindern soll. Von den zwei im Plan skizzierten Optionen
   funktioniert damit nur eine. Ein korrekter Guard müsste lauten:
   `body !== null && typeof body === 'object' && !Array.isArray(body)`.

2. **[Schlussfolgerung]** Unbenannter Zielkonflikt zwischen V4 und dem
   Honeypot-Feld: Die aktuelle Honeypot-Prüfung (`app/api/anfrage/route.ts:63`,
   `String(body._honeypot ?? '')`) konvertiert jeden Wert — auch Zahl, Boolean, Array,
   Objekt — stillschweigend in einen String und wertet dessen Länge aus (z. B.
   `_honeypot: 0` → `"0"`, Länge 1 → fälschlich als Bot gewertet). Sobald das
   Honeypot-Feld in ein Zod-Schema überführt wird, kollidiert das mit V4 (keine
   stillschweigende Typkonvertierung mehr für Geschäftsfelder): Wird `_honeypot`
   strikt typisiert, ändert sich das Bot-Erkennungsverhalten für Nicht-String-Werte
   (Randfall von V6); bleibt es lose, entsteht eine dokumentierte Inkonsistenz zu V4.
   Der Plan (v1) adressiert diesen Zielkonflikt an keiner Stelle.

3. **[Fakt, entlastend]** Der vom Auftraggeber vermutete Array-Kollisionsfall ist
   dagegen unkritisch: `JSON.parse('[]')` liefert ein Array; `typeof [] === 'object'`
   ist `true`, `array._honeypot` ist `undefined` (kein Crash), der Fall fällt durch
   zum Zod-Parse und scheitert dort regulär an fehlenden Pflichtfeldern (400,
   konsistent mit V2). `body === null` und ein befüllter Honeypot können nie
   gleichzeitig auftreten, da `null` keine Properties tragen kann — hier war die
   Einschätzung des Plans (Umsetzungsdetail, keine echte Uneindeutigkeit) im Kern
   zutreffend.

4. **[Fakt]** `app/einloggen/actions.ts:38` enthält bereits eine
   E-Mail-Formatprüfung (`!email.includes('@') || !email.includes('.')`) — exakt die
   in der Spec als „offene Unsicherheit" markierte Frage zur Strenge der V3-Prüfung
   (Spec Zeile 162-164). Weder Spec noch Plan (v1) erwähnen diesen bestehenden
   Präzedenzfall, obwohl CLAUDE.md „vorhandene Helper nutzen, nicht neu schreiben"
   vorschreibt.

5. **[Fakt]** `getIp()` existiert bereits identisch dreifach dupliziert
   (`app/api/anfrage/route.ts:24-28`, `app/api/search/route.ts:31-35`,
   `app/api/track/[linkId]/route.ts:72-76`) und wurde trotz derselben CLAUDE.md-Regel
   nie extrahiert. Das ist ein Präzedenzfall, der eher für „inline ist im Repo
   akzeptierte Praxis" spricht — stützt tendenziell die Plan-Entscheidung, route-für-
   Route mit inline-Schemas zu arbeiten, statt zwingend ein gemeinsames
   `lib/validation/*.ts`-Utility zu fordern. Die Grundfrage bleibt dennoch offen: die
   vier Zod-Schemas validieren unterschiedliche Datenformen (Body, Query, Route-Param,
   Enum), anders als `getIp()` liegt keine Zeile-für-Zeile-Duplikation vor, die
   zwingend zur Extraktion zwingt.

6. **[Annahme, in Spec und Plan]** Weder Spec noch Plan (v1) verifizieren, was
   `verifyOtp()` heute tatsächlich bei einem ungültigen `type`-Wert tut.
   `app/einloggen/page.tsx:28-29` zeigt zwei unterschiedliche deutsche Fehlertexte für
   `fehler=link-ungueltig` und `fehler=link-abgelaufen`. Läuft `type=foo` heute
   ungeprüft in `verifyOtp({ type: 'foo', token_hash })`
   (`app/auth/confirm/route.ts:37,45`) und scheitert dort, landet der Nutzer nach
   aktuellem Code bei `link-abgelaufen` (Zeile 48). Nach Einführung von V14 landet
   derselbe Fall neu bei `link-ungueltig` (neue Vorprüfung vor `verifyOtp`) — eine
   für Nutzer sichtbare Änderung der angezeigten Fehlermeldung in einem Edge Case,
   die weder Spec noch Plan als Verhaltensänderung benennen.

7. **[Fakt]** `node_modules/@supabase/auth-js/src/lib/types.ts:862-867` bestätigt:
   `EmailOtpType` ist ein reiner TypeScript-String-Union-Typ
   (`'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change'`), keine von
   Supabase exportierte Laufzeit-Konstante oder -Array. Ein Zod-Enum kann daraus
   nicht automatisch generiert werden. Das im Plan beschriebene Wartungsrisiko
   (manueller Nachzug bei Supabase-Upgrades) ist damit zutreffend und gut belegt —
   keine Korrektur nötig, nur Bestätigung.

8. **[Schlussfolgerung]** Phase 3 (`app/api/search/route.ts`) hat fragwürdigen Nutzen:
   Keine der drei zugehörigen V-Aussagen (V7, V8, V9) verlangt eine neue Ablehnung
   oder überhaupt eine Verhaltensänderung — alle drei sind laut Spec ausdrücklich
   „unverändertes Bestandsverhalten" (Spec Zeile 78-86). `q` ist als Rückgabewert von
   `URLSearchParams.get()` bereits statisch als `string | null` garantiert
   (Web-API-Standard) — es gibt keinen Laufzeitfall, den eine Zod-Typprüfung hier
   zusätzlich abfangen müsste. Der Plan übernimmt die Spec-Begründung
   (Einheitlichkeit über alle vier Endpunkte, Spec Zeile 35-38) unkritisch, ohne den
   Aufwand (neue Abhängigkeit im Codepfad, drei neue Regressionstests) gegen den
   Nutzen (keine Verhaltensänderung) abzuwägen.

9. **[offene Unsicherheit]** Falls das Zod-Schema in Phase 3 eine Mindestlänge
   (`.min(2)`) als harte Regel durchsetzt, müsste ein Fehlschlag auf 200 + `[]`
   gemappt werden — nicht auf die in Phase 2/4/5 etablierte 400-Konvention. Der Plan
   (v1) spricht diese Inkonsistenz nicht an; unklar bleibt, ob ein Zod-Fehlschlag in
   dieser einen Route andere Konsequenzen haben soll als in den anderen drei —
   genau das, was die Zod-Einführung laut Spec eigentlich vereinheitlichen soll.

10. **[Fakt]** `node_modules/zod/package.json:3` zeigt, dass transitiv bereits Zod
    4.4.3 im Repo liegt. Phase 1 (v1) benennt das Risiko unterschiedlicher
    `safeParse`/Fehlerformat-Semantik zwischen v3 und v4, verknüpft es aber nie mit
    der in Phase 2 offen gelassenen Frage nach dem Format der 400-JSON-Antwort
    (strukturierte Zod-Issues vs. Freitext-String) — obwohl das Fehlerformat laut
    eigenem Risikohinweis zwischen v3 und v4 „spürbar" abweicht. Die DoD von Phase 1
    verlangt keine Versions-Festlegung, sodass das selbst benannte Risiko im Plan
    unadressiert bleibt.

11. **[Fakt]** Im Repo existieren bislang keine Route-Handler-Tests — `Glob` auf
    `app/**/*.test.ts` liefert keine Treffer. Vitest-Tests liegen ausschließlich unter
    `lib/*.test.ts` (z. B. `lib/data/pricing.test.ts`, `lib/utils/form.test.ts`) mit
    einer `vi.mock`-Konvention für reine Funktionsaufrufe. Der Plan (v1) verweist
    mehrfach auf diese Konvention, ohne zu benennen, dass für Route-Handler-Tests
    zusätzlich `NextRequest`-Objekte mit Headern (`x-forwarded-for`, `user-agent`,
    `accept-language`) und, in Phase 4, ein zweites Handler-Argument
    `{ params: Promise<{ linkId: string }> }` konstruiert werden müssen — kein
    bestehender Präzedenzfall im Repo.

12. **[Fakt, entlastend]** Keine Regelkollision mit ARCHITECTURE.md gefunden. Die
    Verbotene-Patterns-Tabelle (`ARCHITECTURE.md:151-160`), die
    Error-Handling-Vorgabe und die Datenzugriffsregeln werden vom Plan an keiner
    Stelle verletzt: Alle vier Routen bleiben Route Handler, keine `any`-Typisierung
    vorgesehen, bestehende `console.error` + `captureException`-Konvention wird nicht
    angetastet.

13. **[Fakt, entlastend]** Die Offenlegung der Scope-Überschreitung bei V14 (Plan
    benennt explizit, dass V14 formal nicht zu den 14 Pflicht-V-Aussagen gehört, aber
    technisch mitgebaut wird) ist sauber im Sinne von CLAUDE.md
    („Entscheidung dokumentieren — niemals stillschweigend in Code verwandeln") —
    keine Korrektur nötig.

## Advisor-Urteil

- [ ] Freigegeben
- [x] Freigegeben mit Hinweisen
- [ ] Nicht freigegeben
- [ ] Blockiert

Begründung: Kein Finding stellt die Grundentscheidung (route-für-Route, inline Zod,
5 Phasen) infrage. Finding 1 ist der einzige klar fehlerhafte Punkt (ein nicht
funktionierender Lösungsvorschlag) und lässt sich lokal in Phase 2 korrigieren.
Findings 2, 6, 8/9 und 10 sind fehlende Entscheidungen bzw. fehlende Verknüpfungen
zwischen bereits im Plan benannten Risiken — kein struktureller Mangel, aber vor
Umsetzungsbeginn zu klären, sonst entstehen stillschweigende
Verhaltensänderungen (Honeypot-Typisierung, Fehlermeldungstext bei V14,
uneinheitliches Fehlerverhalten in Phase 3). Findings 3, 7, 12, 13 bestätigen Teile
des Plans als korrekt bzw. unkritisch.

## Nächster sinnvoller Schritt (Advisor)

Vor Umsetzungsbeginn von Phase 2: den fehlerhaften
`typeof body === 'object'`-Guard-Vorschlag korrigieren oder streichen (Finding 1) und
explizit festlegen, wie das Honeypot-Feld typisiert wird (Finding 2). Vor Phase 5:
klären, ob die Änderung der Fehlermeldung (`link-abgelaufen` → `link-ungueltig`) für
ungültige `type`-Werte eine bewusste, dokumentierte Verhaltensänderung ist
(Finding 6), und das Zod-Enum um den Laufzeit-Default `'email'` ergänzen. Für Phase 3:
den tatsächlichen Nutzen der Zod-Einführung gegen den Aufwand abwägen (Finding 8) und
das Zod-Fehlschlag-Mapping bei Kurz-Queries klären (Finding 9). Für Phase 1: die
Zod-Versionswahl explizit mit der Fehlerformat-Frage aus Phase 2 verknüpfen
(Finding 10).
