# Plan v2 — Zod-Eingabevalidierung für vier Endpunkte

Überarbeitung von `state/plan-v1-zod-eingabevalidierung.md` auf Basis eines
architecture-advisor-Prüfpasses (Fokus: die drei in v1 selbst offen gekennzeichneten
Stellen, plus Regelkollisionen gegen CLAUDE.md/ARCHITECTURE.md). Grundstruktur
(5 Phasen, route-für-Route, inline Zod-Schemas) bleibt bestehen — die Findings
betrafen keine falsche Grundannahme, sondern fehlende oder fehlerhafte
Umsetzungsdetails sowie eine zu wenig hinterfragte Phase. Deckt weiterhin V1-V13 und
V15 ab, V14 bleibt technisch mitgebaut (Phase 5). Kein Code wurde geändert —
weiterhin reine Planung.

## Änderungen gegenüber v1 (Finding-für-Finding)

| # | Finding | Behebung in v2 |
|---|---|---|
| 1 | Phase 2 nannte als Alternative zu "zwei Zod-Parses" einen Guard `typeof body === 'object'` — technisch falsch, da `typeof null === 'object'` in JavaScript gilt. Dieser Guard hätte `body === null` gerade NICHT abgefangen, den Fall, den V1 verlangt. | Fehlerhafte Alternative gestrichen. Es bleibt genau **eine** Lösung: ein manueller Guard `body !== null && typeof body === 'object' && !Array.isArray(body)` vor jedem Feldzugriff, danach die bestehende Honeypot-Kurzschluss-Prüfung, danach das strikte Zod-Schema für die Geschäftsfelder. Kein "zwei Zod-Parses"-Vorschlag mehr nötig — der manuelle Guard reicht und ist die einfachere Lösung (Komplexität reduzieren, CLAUDE.md-Entscheidungsregel Punkt 3-4). |
| 2 | Unbenannter Zielkonflikt: V4 verlangt keine stille Typkonvertierung mehr, aber `_honeypot` nutzt aktuell genau diese Koerzion (`String(x ?? '').trim()`) auch für Nicht-Strings (z. B. `_honeypot: 0` → `"0"`, Länge 1 → fälschlich als befüllt gewertet). | Entschieden: `_honeypot` bleibt bewusst **außerhalb** des strikten Zod-Schemas, mit der bestehenden losen `String(x ?? '')`-Koerzion unverändert weitergeführt. Begründung: Honeypot ist Bot-Abwehr, keine Geschäftsdatenerfassung — die Spec-Nicht-Ziele schützen Bot-Filter-Verhalten ausdrücklich vor unbeabsichtigten Änderungen ("Keine Änderung des bestehenden Rate-Limiting- oder Bot-Filter-Verhaltens … ist Bestandsschutz, nicht Eingabevalidierung"). Eine strikte Typisierung des Honeypot-Felds wäre eine unverlangte Verhaltensänderung für Bots, die V6 nicht fordert. Die Inkonsistenz zu V4 (Honeypot bleibt lose, Geschäftsfelder werden streng) ist damit bewusst und dokumentiert, nicht übersehen. |
| 3 | Phase 5 behandelte V14 stillschweigend als reine Lückenschließung, ohne zu verifizieren, was `verifyOtp()` bei ungültigem `type` heute tatsächlich tut — dadurch könnte sich die für Nutzer sichtbare Fehlermeldung unbemerkt ändern (`app/einloggen/page.tsx:28-29` zeigt unterschiedliche Texte für `link-abgelaufen` vs. `link-ungueltig`). | Als offene Unsicherheit aufgenommen (siehe Phase 5, neuer Abschnitt "Vor Umsetzung zu klären"): das tatsächliche `verifyOtp()`-Verhalten bei ungültigem `type` muss vor Phase 5 verifiziert werden (z. B. manueller Testaufruf gegen die Supabase-Testumgebung). Erst danach lässt sich sagen, ob V14 eine sichtbare Fehlermeldungs-Änderung mit sich bringt, die dokumentiert und ggf. mit dem Team abgestimmt werden muss. |
| 4 | Das in Phase 5 geplante Zod-Enum deckte nur die fünf `EmailOtpType`-Werte ab, nicht den aktuellen Laufzeit-Default `'email'` (`app/auth/confirm/route.ts:37`, `?? 'email'`). Ein Request ohne `type`-Param hätte sich damit am eigenen neuen Schema selbst ausgesperrt. | Zod-Enum um `'email'` als sechsten gültigen Wert ergänzt (siehe Phase 5, Dateien/DoD). |
| 5 | Phase 3 wurde unkommentiert übernommen, obwohl keine der drei V-Aussagen (V7-V9) eine Verhaltensänderung verlangt und `q` über die Web-API bereits statisch `string \| null` ist — Zod prüft hier nichts, was nicht schon garantiert ist. | Entschieden: Phase 3 bleibt bestehen, aber umbenannt/reduziert zu "Konsistenz-Phase ohne Verhaltensänderung". Begründung: Spec Zeile 35-38 begründet die Zod-Einführung explizit mit Einheitlichkeit über alle vier Endpunkte, und die Route gehört laut Spec-Fakt (Zeile 5-9) zum Scope. Der geringe Nutzen wird nicht verschwiegen, sondern in Phase 3 selbst als Risiko benannt — inklusive der Option, sie bei Zeitdruck ohne V-Coverage-Verlust zu streichen (keine der 14 pflichtigen V-Aussagen hängt an einer Verhaltensänderung in dieser Phase). Das ist eine dokumentierte Entscheidung, keine stillschweigende Übernahme. |
| 6 | Ungeklärt: Wie wird ein Zod-Fehlschlag bei `q.length < 2` behandelt — 400 (wie in den anderen drei Phasen) oder 200+`[]` (Bestandsverhalten)? Ohne Klärung uneinheitliches Fehlerverhalten über die vier Routen. | Geklärt (Phase 3, DoD): Das Zod-Schema prüft ausschließlich Typ (`string`), keine Mindestlänge als harte Ablehnung. Die bestehende `q.length < 2 → 200 + []`-Logik bleibt als eigenständiger Anwendungslogik-Schritt NACH dem Zod-Parse bestehen, unabhängig vom Schema. Damit löst ein zu kurzer Query niemals einen Zod-Fehlschlag aus — kein 400-Sonderfall in dieser Route. |
| 7 | Phase 1 benannte das Zod v3/v4-Versionsrisiko (unterschiedliche `safeParse`-Fehlerstruktur), verknüpfte es aber nie mit der in Phase 2 offenen Fehlerformat-Frage — beide hängen zusammen. | Phase 1, Risiken-Abschnitt verweist jetzt explizit auf Phase 2 und verlangt, beide Entscheidungen (Zod-Version + Fehlerantwort-Format) gemeinsam vor Beginn von Phase 2 zu treffen, nicht getrennt. |
| 8 | Fehlender Hinweis: Im Repo existieren bislang keine Route-Handler-Tests (nur `lib/*.test.ts`) — `NextRequest`-Konstruktion mit Headern (`x-forwarded-for`, `user-agent`, `accept-language`) und Route-Params (`{ params: Promise<{ linkId: string }> }` in Phase 4) ist neuer Boden, keine reine Fortführung der bestehenden `vi.mock`-Konvention. | Neuer Abschnitt "Testaufbau — neuer Boden" vor Phase 1 ergänzt, plus Verweis darauf in den Risiken jeder der vier Testphasen (2, 3, 4, 5). |

Zusätzlich durch den Advisor bestätigt, ohne dass eine Korrektur nötig war: Die
Einschätzung aus v1, dass die Wahl zwischen inline Zod-Schemas und einem
gemeinsamen `lib/validation/*.ts`-Utility echt offen ist, wurde geprüft und bestätigt
— dazu zwei zusätzliche Belege, die v1 nicht kannte und die den "Offener
Punkt"-Abschnitt unten ergänzen: `getIp()` existiert bereits identisch dreifach in
allen drei betroffenen Routen (`app/api/anfrage/route.ts:24-28`,
`app/api/search/route.ts:31-35`, `app/api/track/[linkId]/route.ts:72-76`) und wurde
nie extrahiert — ein Präzedenzfall, der eher für "inline ist im Repo akzeptierte
Praxis" spricht. Und: `app/einloggen/actions.ts:38` enthält bereits eine
E-Mail-Formatprüfung (`!email.includes('@') || !email.includes('.')`) — ein
bestehender Präzedenzfall für die in Phase 2 offene V3-Strenge-Frage, den weder Spec
noch v1 erwähnt hatten.

---

## Offener Punkt, nicht stillschweigend entschieden

Die Spec legt nicht fest, ob vor den Routen-Änderungen ein gemeinsames
Zod-Utility (z. B. `lib/validation/*.ts`) entstehen soll, oder ob jede Route ihr
Schema inline definiert. Im Repo existiert aktuell keine `lib/validation/`-Konvention
(`ARCHITECTURE.md` kennt nur `lib/data/*.ts`, `lib/utils/*.ts`, `lib/auth/*.ts`).
Dieser Plan schneidet die Phasen weiterhin route-für-Route mit **inline** definierten
Schemas — durch den Advisor-Pass zusätzlich gestützt: `getIp()` ist bereits
dreifach dupliziert und trotz CLAUDE.md-Regel ("vorhandene Helper nutzen, nicht neu
schreiben") nie extrahiert worden, und die vier Zod-Schemas validieren ohnehin
unterschiedliche Datenformen (JSON-Body, Query-String, Route-Param, Enum) statt
identischen Code wie bei `getIp()` — es gibt also keinen zwingenden Beleg für ein
gemeinsames Utility. Ob eine spätere Extraktion sinnvoll ist, bleibt dennoch offen
und ist vor Umsetzungsbeginn von Phase 2 mit dem Entwickler/der Entwicklerin zu
bestätigen, nicht durch diesen Plan vorentschieden.

Zusätzlich offen (aus Spec-Abschnitt "Offene Fragen", betrifft Phase 2 und 4): Format
der 400-JSON-Antwort bei Validierungsfehlern (einzelner deutscher Freitext-String wie
bisher in `app/api/anfrage/route.ts:73-76`, oder strukturierte Zod-Issues). Diese
Entscheidung hängt jetzt nachweislich mit der Zod-Versionswahl aus Phase 1 zusammen
(siehe Änderungstabelle, Punkt 7) und muss gemeinsam mit ihr getroffen werden.

Zur Strenge der E-Mail-Formatprüfung (V3) gibt es jetzt einen konkreten
Recherche-Anker: `app/einloggen/actions.ts:38` prüft bereits mit
`!email.includes('@') || !email.includes('.')`. Ob Zod dieselbe (bewusst einfache)
Prüfung übernimmt oder strenger wird, ist weiterhin eine offene Entscheidung — aber
nicht mehr ohne Referenzpunkt im Code.

## Testaufbau — neuer Boden

Im Repo existieren bislang ausschließlich Vitest-Tests unter `lib/*.test.ts` (z. B.
`lib/data/pricing.test.ts`, `lib/utils/form.test.ts`), die `vi.mock('@/lib/prisma', …)`
für reine Funktionsaufrufe nutzen. Für **Route-Handler-Tests** (Phasen 2-5) gibt es im
Repo noch keinen Präzedenzfall: `NextRequest`-Objekte müssen mit Query-Params,
Headern (`x-forwarded-for`, `user-agent`, `accept-language`) und — in Phase 4
zusätzlich — einem zweiten Handler-Argument `{ params: Promise<{ linkId: string }> }`
konstruiert werden. Das ist technisch lösbar (z. B. über
`new NextRequest(new URL(...), { headers: new Headers({...}) })`), aber kein reiner
Fortführungsfall der bestehenden `vi.mock`-Konvention, sondern zusätzlicher,
unbenannter Aufwand. Dieser Unsicherheitsfaktor gilt für alle vier Testphasen und wird
dort jeweils in den Risiken referenziert, statt ihn nur hier einmal zu erwähnen und in
den Phasen zu vergessen.

---

## Phase 1: Zod-Abhängigkeit einführen

**Ziel:** `zod` als Produktionsabhängigkeit verfügbar machen, bevor irgendeine Route
darauf zugreift. Reiner Setup-Schritt, deckt keine V-Aussage ab, ist aber Vorbedingung
für alle folgenden Phasen.

**Dateien:**
- `package.json` (neuer Eintrag unter `dependencies`)
- `package-lock.json`

**Definition of Done:**
- `npm install zod` ausgeführt, `zod` erscheint unter `dependencies` in `package.json`.
- `npm run check` grün (Baseline vor jeder Routen-Änderung — Lint, Typecheck,
  Doku-Gate, Regel-Gate, bestehende Tests unverändert grün).

**Risiken:**
- Zod v3 vs. v4: `node_modules/zod` enthält bereits eine transitive Kopie in Version
  4.4.3 (fremde Abhängigkeit, nicht projekteigen) — beim direkten Install muss die
  gewählte Version zur in Phase 2-5 verwendeten API passen (`safeParse`,
  Fehlerformat unterscheidet sich zwischen v3 und v4 spürbar).
- **Verknüpft mit Phase 2 (Änderung Nr. 7):** Die Zod-Versionswahl und die in Phase 2
  offene Frage nach dem 400-Fehlerantwort-Format hängen direkt zusammen — ein
  `safeParse`-Fehlschlag sieht in v3 und v4 strukturell unterschiedlich aus. Beide
  Entscheidungen müssen gemeinsam vor Beginn von Phase 2 getroffen werden, nicht
  Zod-Version isoliert in Phase 1 und Fehlerformat isoliert in Phase 2.
- `package-lock.json`-Diff ist vor Commit zu prüfen, auch wenn transitive
  Abhängigkeiten von zod selbst minimal sind.

---

## Phase 2: `app/api/anfrage/route.ts` — Body-Validierung (V1-V6)

**Ziel:** Der manuell zusammengesetzte String-Coercion-Block (Zeilen 68-91) wird durch
ein Zod-Schema ersetzt, das Pflichtfelder, E-Mail-Format und Typen (kein stillschweigendes
`String(x)`) für die Geschäftsfelder durchsetzt — ohne das Honeypot-Kurzschluss-Verhalten
(V6, bewusst weiter lose typisiert, siehe Änderungstabelle Punkt 2) oder das
Bestandsverhalten bei optionalen Feldern (V5) zu verändern.

**Dateien:**
- `app/api/anfrage/route.ts`
- `app/api/anfrage/route.test.ts` (neu — siehe "Testaufbau — neuer Boden" oben)

**Definition of Done:**
- V1: POST mit Body `null` → Status 400 (kein unbehandelter Serverfehler). Wird durch
  den Objekt-Guard erreicht (siehe unten), nicht durch Zod selbst.
- V2: POST ohne Feld `email` → Status 400.
- V3: POST mit `email: "kein-at-zeichen"` → Status 400.
- V4: POST mit `name: 12345` → Status 400 (keine stillschweigende String-Konvertierung
  im strikten Zod-Schema für Geschäftsfelder).
- V5: POST mit gültigen Pflichtfeldern, optionale Felder fehlen → Status 200,
  `{ success: true }`.
- V6: POST mit befülltem `_honeypot` → weiterhin Status 200, `{ success: true }`, kein
  `prisma.inquiry.create`-Aufruf (per `vi.mocked(prisma).inquiry.create` verifiziert).
  Der Honeypot-Wert wird weiterhin per `String(x ?? '')` gelesen, nicht per Zod-Schema
  (dokumentierte Entscheidung, siehe Änderungstabelle Punkt 2) — kein zusätzlicher
  Testfall für Nicht-String-Honeypot-Werte nötig, da sich das Verhalten dort bewusst
  nicht ändert.
- Je ein Vitest-Fall pro V-Aussage (6 Fälle).
- `npm run check` grün.

**Risiken:**
- **Einzige tragfähige Lösung (v1 nannte hier fälschlich eine zweite Alternative,
  siehe Änderungstabelle Punkt 1):** Ein manueller Guard
  `body !== null && typeof body === 'object' && !Array.isArray(body)` läuft vor jedem
  Feldzugriff (auch vor dem Honeypot-Zugriff). Erst danach folgen die bestehende
  Honeypot-Kurzschluss-Prüfung und das strikte Zod-Schema für `name`/`email`/
  `description`/optionale Felder. `typeof body === 'object'` allein reicht NICHT, da
  `typeof null === 'object'` in JavaScript gilt und `body === null` durchlassen würde.
- Fehlerantwort-Format und E-Mail-Strenge sind weiterhin offene Fragen (siehe oben,
  jetzt mit Recherche-Anker `app/einloggen/actions.ts:38`) — ohne Klärung ist der
  Vitest-Fall für V1-V4 nicht eindeutig zu schreiben (Statuscode ist klar,
  Response-Body-Form und Prüfschärfe nicht).
- Zielkonflikt V4 vs. Honeypot-Koerzion ist entschieden (Änderungstabelle Punkt 2),
  aber die Entscheidung selbst bleibt ein Risiko im Sinne von Konsistenz: `name`/
  `email` werden streng typisiert, `_honeypot` bleibt lose — beides im selben
  Handler. Bei künftigen Änderungen an der Honeypot-Logik muss diese bewusste
  Ausnahme im Kopf behalten werden, sonst wird sie versehentlich mit-„repariert".
- Keine Zeichen-Obergrenze für `description`/`features`/`examples` einführen — laut
  Spec bewusst keine V-Aussage dazu, also kein erfundenes Limit in diese Phase
  einschmuggeln.
- Testaufbau-Risiko (siehe "Testaufbau — neuer Boden" oben): erster Route-Handler-Test
  im Repo, kein bestehendes Muster für `NextRequest`-Konstruktion mit JSON-Body.

---

## Phase 3: `app/api/search/route.ts` — Query-Validierung, Konsistenz-Phase ohne Verhaltensänderung (V7-V9)

**Ziel:** Der Query-Parameter `q` wird per Zod auf Typ geprüft, ohne das bestehende
Kürzverhalten bei > 100 Zeichen (V8) oder das Erste-Wert-Verhalten bei
Mehrfachvorkommen (V9) zu ändern. **Bewusst benannt:** Diese Phase liefert keine der
drei zugehörigen V-Aussagen eine Verhaltensänderung — `q` ist über die Web-API bereits
statisch `string | null`, Zod prüft hier nichts, was nicht schon garantiert ist. Sie
bleibt trotzdem im Plan, weil Spec Zeile 35-38 die Zod-Einführung explizit mit
Einheitlichkeit über alle vier Endpunkte begründet und die Route laut Spec-Fakt
(Zeile 5-9) zum Scope gehört (siehe Änderungstabelle Punkt 5). Das ist eine
dokumentierte Entscheidung, keine unkommentierte Übernahme aus v1.

**Dateien:**
- `app/api/search/route.ts`
- `app/api/search/route.test.ts` (neu — siehe "Testaufbau — neuer Boden" oben)

**Definition of Done:**
- V7: `q` fehlt vollständig → Status 200, leeres Array (unverändert).
- V8: `q` mit > 100 Zeichen → Status 200, Treffer für die auf 100 Zeichen gekürzte
  Eingabe (unverändert, keine 400-Ablehnung durch eine neu eingeführte `max()`-Regel).
- V9: `q` mehrfach übergeben (`?q=a&q=b`) → Status 200 auf Basis des ersten Werts,
  keine 400-Ablehnung wegen "falschem Typ".
- **Geklärt (Änderungstabelle Punkt 6):** Das Zod-Schema prüft ausschließlich den Typ
  (`string`), keine Mindestlänge als harte Ablehnung. Die bestehende
  `q.length < 2 → 200 + []`-Logik bleibt als eigenständiger Schritt NACH dem
  Zod-Parse bestehen — ein zu kurzer Query löst niemals einen Zod-Fehlschlag/400 aus,
  anders als in Phase 2/4/5.
- Je ein Vitest-Fall pro V-Aussage (3 Fälle).
- `npm run check` grün.

**Risiken:**
- Geringer Nutzen ist bewusst in Kauf genommen (siehe Ziel oben) — bei Zeitdruck kann
  diese Phase ohne Verlust an Pflicht-V-Coverage gestrichen werden, da keine der drei
  V-Aussagen an einer Verhaltensänderung hängt. Diese Option wird hier offen benannt,
  nicht in der Umsetzung stillschweigend übersprungen.
- `URLSearchParams.get('q')` liefert bei Mehrfachvorkommen bereits nur den ersten
  Wert (Plattform-Standard) — die Versuchung, `q` stattdessen als `string[]` zu
  behandeln oder mit `z.string().max(100)` abzulehnen statt zu kürzen, würde V8/V9
  stillschweigend brechen. Die Kürzung (`.slice(0, MAX_QUERY_LENGTH)`) muss Teil des
  Datenflusses bleiben.
- Testaufbau-Risiko (siehe "Testaufbau — neuer Boden" oben).

---

## Phase 4: `app/api/track/[linkId]/route.ts` — `linkId`-Validierung (V10-V12)

**Ziel:** Ein leerer `linkId`-String wird per Zod abgelehnt (400), bevor er die
Prisma-`where.id`-Abfrage erreicht — Bot-Filter (V11) und das Verhalten bei
unbekannten, aber wohlgeformten IDs (V10) bleiben exakt wie heute.

**Dateien:**
- `app/api/track/[linkId]/route.ts`
- `app/api/track/[linkId]/route.test.ts` (neu — siehe "Testaufbau — neuer Boden" oben,
  zusätzlich zum Header-Aufbau auch das zweite Handler-Argument
  `{ params: Promise<{ linkId: string }> }` zu konstruieren)

**Definition of Done:**
- V10: GET mit beliebigem, nicht existierendem `linkId` → weiterhin Status 302,
  Redirect zur Startseite.
- V11: GET ohne `User-Agent`-Header → weiterhin als Bot behandelt, Status 302 zur
  Startseite.
- V12: GET mit leerem String als `linkId` → Status 400, kein
  `prisma.affiliateLink.findUnique`-Aufruf (per Mock verifiziert).
- Je ein Vitest-Fall pro V-Aussage (3 Fälle).
- `npm run check` grün.

**Risiken:**
- Platzierung der Validierung: sie muss nach Bot-Filter (Zeile 100) und Rate-Limit
  (Zeile 106-113) laufen, nicht davor — sonst würde ein leerer `linkId` von einem Bot
  einen 400 statt den laut Nicht-Ziel unveränderten Bot-302 auslösen, was V11 indirekt
  verändern würde, obwohl V11 das nicht verlangt.
- Laut Spec-Abschnitt "Entschieden" (V12) bewusst KEINE weitere Formatprüfung (z. B.
  `cuid()`) über die Leerstring-Prüfung hinaus — Zod-Schema darf nicht versehentlich
  strenger werden, sonst widerspricht die Umsetzung der bereits getroffenen
  Entwurfsentscheidung ("Tracking darf den User-Flow nie aufhalten").
- Testaufbau-Risiko am größten in dieser Phase (siehe "Testaufbau — neuer Boden"
  oben): zusätzlich zum Header-Aufbau muss das zweite Handler-Argument
  `{ params: Promise<{ linkId: string }> }` als Promise konstruiert werden — kein
  bestehendes Test-Beispiel im Repo dafür.

---

## Phase 5: `app/auth/confirm/route.ts` — `type`-Validierung (V13, V15; V14 mitgebaut)

**Ziel:** Der ungeprüfte `as EmailOtpType | null`-Cast (Zeile 37) wird durch eine
Zod-Enum-Prüfung ersetzt, die vor `verifyOtp` greift. Bestandsverhalten bei fehlendem
`token_hash` (V13) und bei protokoll-relativem `next` (V15) bleibt unverändert.

**Vor Umsetzung zu klären (Änderungstabelle Punkt 3, neu in v2):** Was tut
`verifyOtp()` heute tatsächlich bei einem ungültigen `type`-Wert (z. B. `type=foo`)?
Weder Spec noch v1 haben das verifiziert. `app/einloggen/page.tsx:28-29` zeigt zwei
unterschiedliche deutsche Fehlertexte für `link-ungueltig` und `link-abgelaufen`.
Landet ein ungültiger `type` heute bei `verifyOtp` in einem Supabase-Fehler, zeigt der
Nutzer aktuell vermutlich "Link abgelaufen oder bereits verwendet"
(`app/auth/confirm/route.ts:47-48`); nach Einführung von V14 würde derselbe Fall neu
zu "Link ungültig" (Zeile 40-41-Analogon) führen — eine für Nutzer sichtbare
Textänderung in einem Edge Case. Das muss vor Umsetzung durch einen manuellen
Testaufruf (z. B. gegen die Supabase-Testumgebung mit einem ungültigen `type`-Wert)
verifiziert werden. Ist die Textänderung real, ist zu entscheiden, ob sie als
akzeptabel dokumentiert wird oder ob V14 stattdessen ebenfalls auf
`link-abgelaufen` mappen soll, um das Nutzererlebnis unverändert zu lassen — diese
Entscheidung trifft dieser Plan nicht vorab, sondern markiert sie als
Umsetzungsvoraussetzung.

**Dateien:**
- `app/auth/confirm/route.ts`
- `app/auth/confirm/route.test.ts` (neu — `vi.mock('@/lib/supabase/server', ...)` und
  `vi.mock('@/lib/data/users', ...)`, siehe "Testaufbau — neuer Boden" oben)

**Definition of Done:**
- V13: GET ohne `token_hash` → weiterhin Status 302, Redirect zu
  `/einloggen?fehler=link-ungueltig`.
- V15: GET mit `next=//evil.com` → weiterhin Redirect zu `/konto`, nicht zur externen
  Domain (Regressionstest für `safeNext`, keine neue Zod-Aufgabe laut Spec).
- Je ein Vitest-Fall für V13 und V15 (2 Fälle, Pflicht laut Aufgabenstellung).
- **Korrigiert (Änderungstabelle Punkt 4):** Das Zod-Enum für `type` muss neben den
  fünf `EmailOtpType`-Werten zusätzlich `'email'` als gültigen Wert enthalten — der
  aktuelle Laufzeit-Default in `app/auth/confirm/route.ts:37` (`?? 'email'`). Ohne
  diesen sechsten Wert würde ein Request ohne `type`-Param (der intern auf `'email'`
  fällt) am eigenen neuen Schema scheitern und sich selbst aussperren.
- Zusätzlich (nicht DoD-pflichtig laut Aufgabenstellung, aber technisch in derselben
  Schema-Änderung enthalten): V14 — GET mit `type=foo` → Status 302, Redirect gemäß
  der oben zu klärenden Fehlermeldungs-Entscheidung, `verifyOtp` wird NICHT
  aufgerufen (per Mock verifiziert). Der Vitest-Fall dafür wird erst geschrieben,
  nachdem die Fehlermeldungs-Frage geklärt ist, sonst testet er das falsche Ziel.
- `npm run check` grün.

**Risiken:**
- Diskrepanz in der Aufgabenstellung bleibt bestehen (unverändert aus v1): V14 ist
  laut Spec-Abschnitt "Entschieden" bereits festgelegtes Verhalten und laut Auftrag
  nicht Teil der 14 pflichtigen DoD-V-Aussagen — aber `type` und `token_hash` werden
  im selben Handler und selben Zod-Schema geprüft, lassen sich also nicht ohne
  künstlichen Schnitt trennen. Dieser Plan baut V14 mit, statt eine halbfertige
  Schema-Definition zu hinterlassen.
- `EmailOtpType` ist ein von `@supabase/supabase-js` importierter reiner
  TypeScript-String-Union-Typ (`node_modules/@supabase/auth-js/src/lib/types.ts:
  862-867`), keine Laufzeit-Konstante — die Zod-Enum-Werte müssen manuell mit den von
  Supabase akzeptierten OTP-Typen synchron gehalten werden. Bei einem künftigen
  Supabase-Upgrade mit neuen OTP-Typen muss das Enum manuell nachgezogen werden,
  sonst würden gültige neue Typen fälschlich als V14-Fall abgelehnt.
- Testaufbau-Risiko (siehe "Testaufbau — neuer Boden" oben), hier zusätzlich
  verschärft durch die noch offene Fehlermeldungs-Frage: der V14-Testfall kann erst
  final geschrieben werden, wenn die Klärung oben abgeschlossen ist.
