# Plan v1 — Zod-Eingabevalidierung für vier Endpunkte

Bezug: `specs/zod-eingabevalidierung.md` (PR #29, nach main gemergt). Deckt V1-V13 und
V15 ab. V14 ist laut Spec-Abschnitt "Entschieden" bereits als Entwurfsentscheidung
festgelegt (kein offener Planpunkt) und taucht deshalb nicht als eigene
DoD-Anforderung auf — wird aber technisch in Phase 5 mitgebaut, weil `type` und
`token_hash` im selben Schema derselben Datei geprüft werden und sich nicht sauber
trennen lassen (siehe Risiko in Phase 5). Kein Code wurde geändert — reine Planung.

## Offener Punkt, nicht stillschweigend entschieden

Die Spec legt nicht fest, ob vor den Routen-Änderungen ein gemeinsames
Zod-Utility (z. B. `lib/validation/*.ts`) entstehen soll, oder ob jede Route ihr
Schema inline definiert. Im Repo existiert aktuell keine `lib/validation/`-Konvention
(`ARCHITECTURE.md` kennt nur `lib/data/*.ts`, `lib/utils/*.ts`, `lib/auth/*.ts`).
Dieser Plan schneidet die Phasen route-für-Route mit **inline** definierten Schemas,
weil das der Zuschnitt-Heuristik (isoliert wiederholbar, kein Phasen-übergreifendes
Artefakt als Voraussetzung) am ehesten entspricht. Ob eine spätere Extraktion in ein
gemeinsames Utility sinnvoll ist (z. B. wenn sich `getIp()`-ähnliche Duplikation bei
den Zod-Schemas zeigt), ist damit nicht entschieden, sondern nur aufgeschoben — vor
Umsetzungsbeginn von Phase 2 mit dem Entwickler/der Entwicklerin zu klären.

Zusätzlich offen (aus Spec-Abschnitt "Offene Fragen", betrifft Phase 2 und 4): Format
der 400-JSON-Antwort bei Validierungsfehlern (einzelner deutscher Freitext-String wie
bisher in `app/api/anfrage/route.ts:73-76`, oder strukturierte Zod-Issues) und Strenge
der E-Mail-Formatprüfung (V3). Beide sind vor Phase 2 zu klären, da sie den Vitest-Fall
für V1-V4 und V12 formen. Dieser Plan geht vorläufig von der bestehenden Konvention
(einzelner String in `error`) aus, kennzeichnet das aber als Annahme, nicht als
Festlegung der Spec.

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
- Zod v3 vs. v4: `node_modules/zod` enthält bereits eine transitive Kopie (fremde
  Abhängigkeit, nicht projekteigen) — beim direkten Install sicherstellen, dass die
  gewählte Version zur in den folgenden Phasen verwendeten API passt (`safeParse`,
  Fehlerformat unterscheidet sich zwischen v3 und v4 spürbar).
- `package-lock.json`-Diff kann groß ausfallen (transitive Abhängigkeiten von zod
  selbst sind minimal, aber der Lock-Datei-Diff ist trotzdem zu prüfen vor Commit).

---

## Phase 2: `app/api/anfrage/route.ts` — Body-Validierung (V1-V6)

**Ziel:** Der manuell zusammengesetzte String-Coercion-Block (Zeilen 68-91) wird durch
ein Zod-Schema ersetzt, das Pflichtfelder, E-Mail-Format und Typen (kein stillschweigendes
`String(x)`) durchsetzt — ohne das Honeypot-Kurzschluss-Verhalten (V6) oder das
Bestandsverhalten bei optionalen Feldern (V5) zu verändern.

**Dateien:**
- `app/api/anfrage/route.ts`
- `app/api/anfrage/route.test.ts` (neu, Konvention wie `lib/data/pricing.test.ts`:
  `vi.mock('@/lib/prisma', ...)`)

**Definition of Done:**
- V1: POST mit Body `null` → Status 400 (kein unbehandelter Serverfehler).
- V2: POST ohne Feld `email` → Status 400.
- V3: POST mit `email: "kein-at-zeichen"` → Status 400.
- V4: POST mit `name: 12345` → Status 400 (keine stillschweigende String-Konvertierung).
- V5: POST mit gültigen Pflichtfeldern, optionale Felder fehlen → Status 200,
  `{ success: true }`.
- V6: POST mit befülltem `_honeypot` → weiterhin Status 200, `{ success: true }`, kein
  `prisma.inquiry.create`-Aufruf (per `vi.mocked(prisma).inquiry.create` verifiziert,
  dass er NICHT aufgerufen wurde).
- Je ein Vitest-Fall pro V-Aussage (6 Fälle) plus die o. g. Honeypot-Nichtaufruf-Prüfung.
- `npm run check` grün.

**Risiken:**
- Reihenfolge Honeypot-Check vs. Zod-Parse: aktuell wird `body._honeypot` (Zeile 63)
  gelesen, bevor überhaupt geprüft ist, dass `body` ein Objekt ist — das ist exakt der
  in der Spec [Fakt] beschriebene Absturzpfad für `body === null`. Der Honeypot-Check
  muss daher entweder Teil desselben permissiven Zod-Schemas sein (das auch bei
  fehlenden Pflichtfeldern nicht wirft, solange `_honeypot` befüllt ist) oder nach
  einem harten `typeof body === 'object'`-Guard laufen, der V1 selbst erfüllt. Zwei
  Zod-Parses (locker für Honeypot-Vorprüfung, streng für Pflichtfelder) sind eine
  Möglichkeit, aber nicht die einzige — Umsetzungsdetail, nicht in diesem Plan
  vorentschieden.
- Fehlerantwort-Format und E-Mail-Strenge sind offene Fragen (siehe oben) — ohne
  Klärung ist der Vitest-Fall für V1-V4 nicht eindeutig zu schreiben (Statuscode ist
  klar, Response-Body-Form nicht).
- Keine Zeichen-Obergrenze für `description`/`features`/`examples` einführen — laut
  Spec bewusst keine V-Aussage dazu, also kein erfundenes Limit in diese Phase
  einschmuggeln.

---

## Phase 3: `app/api/search/route.ts` — Query-Validierung (V7-V9)

**Ziel:** Der Query-Parameter `q` wird per Zod auf Typ/Form geprüft, ohne das
bestehende Kürzverhalten bei > 100 Zeichen (V8) oder das Erste-Wert-Verhalten bei
Mehrfachvorkommen (V9) zu ändern — beides bleibt 200, nicht 400.

**Dateien:**
- `app/api/search/route.ts`
- `app/api/search/route.test.ts` (neu)

**Definition of Done:**
- V7: `q` fehlt vollständig → Status 200, leeres Array (unverändert).
- V8: `q` mit > 100 Zeichen → Status 200, Treffer für die auf 100 Zeichen gekürzte
  Eingabe (unverändert, keine 400-Ablehnung durch eine neu eingeführte `max()`-Regel).
- V9: `q` mehrfach übergeben (`?q=a&q=b`) → Status 200 auf Basis des ersten Werts,
  keine 400-Ablehnung wegen "falschem Typ".
- Je ein Vitest-Fall pro V-Aussage (3 Fälle).
- `npm run check` grün.

**Risiken:**
- `URLSearchParams.get('q')` liefert bei Mehrfachvorkommen bereits nur den ersten
  Wert (Plattform-Standard) — die Versuchung, `q` stattdessen als `string[]` zu
  behandeln oder mit `z.string().max(100)` abzulehnen statt zu kürzen, würde V8/V9
  stillschweigend brechen. Die Kürzung (`.slice(0, MAX_QUERY_LENGTH)`) muss Teil des
  Datenflusses bleiben, das Zod-Schema darf nur Typ (`string`) und Minimallänge (für
  den bestehenden `< 2 Zeichen → []`-Pfad, V7 grenzt hier nicht ab) prüfen, keine
  Maximallänge als harte Grenze.

---

## Phase 4: `app/api/track/[linkId]/route.ts` — `linkId`-Validierung (V10-V12)

**Ziel:** Ein leerer `linkId`-String wird per Zod abgelehnt (400), bevor er die
Prisma-`where.id`-Abfrage erreicht — Bot-Filter (V11) und das Verhalten bei
unbekannten, aber wohlgeformten IDs (V10) bleiben exakt wie heute.

**Dateien:**
- `app/api/track/[linkId]/route.ts`
- `app/api/track/[linkId]/route.test.ts` (neu)

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
  verändern würde, obwohl V11 das nicht verlangt. Reihenfolge im Code ist daher
  Bestandteil der Umsetzung, nicht nur Schema-Definition.
- Laut Spec-Abschnitt "Entschieden" (V12) bewusst KEINE weitere Formatprüfung (z. B.
  `cuid()`) über die Leerstring-Prüfung hinaus — Zod-Schema darf nicht versehentlich
  strenger werden, sonst widerspricht die Umsetzung der bereits getroffenen
  Entwurfsentscheidung ("Tracking darf den User-Flow nie aufhalten").

---

## Phase 5: `app/auth/confirm/route.ts` — `type`-Validierung (V13, V15; V14 mitgebaut)

**Ziel:** Der ungeprüfte `as EmailOtpType | null`-Cast (Zeile 37) wird durch eine
Zod-Enum-Prüfung ersetzt, die vor `verifyOtp` greift. Bestandsverhalten bei fehlendem
`token_hash` (V13) und bei protokoll-relativem `next` (V15) bleibt unverändert.

**Dateien:**
- `app/auth/confirm/route.ts`
- `app/auth/confirm/route.test.ts` (neu — `vi.mock('@/lib/supabase/server', ...)` und
  `vi.mock('@/lib/data/users', ...)` nach demselben Muster wie die
  `vi.mock('@/lib/prisma', ...)`-Konvention in `lib/data/pricing.test.ts`)

**Definition of Done:**
- V13: GET ohne `token_hash` → weiterhin Status 302, Redirect zu
  `/einloggen?fehler=link-ungueltig`.
- V15: GET mit `next=//evil.com` → weiterhin Redirect zu `/konto`, nicht zur externen
  Domain (Regressionstest für `safeNext`, keine neue Zod-Aufgabe laut Spec).
- Je ein Vitest-Fall für V13 und V15 (2 Fälle, Pflicht laut Aufgabenstellung).
- Zusätzlich (nicht DoD-pflichtig laut Aufgabenstellung, aber technisch in derselben
  Schema-Änderung enthalten): V14 — GET mit `type=foo` → Status 302, Redirect zu
  `/einloggen?fehler=link-ungueltig`, `verifyOtp` wird NICHT aufgerufen (per Mock
  verifiziert). Ein Vitest-Fall dafür wird ergänzt, da ein ungetesteter Enum-Zweig im
  selben Schema sonst eine Lücke im Test-Gate wäre, die V13/V15 indirekt gefährdet.
- `npm run check` grün.

**Risiken:**
- Diskrepanz in der Aufgabenstellung: V14 ist laut Spec-Abschnitt "Entschieden" bereits
  festgelegtes Verhalten und laut Auftrag nicht Teil der 14 pflichtigen
  DoD-V-Aussagen — aber `type` und `token_hash` werden im selben Handler und ggf.
  selben Zod-Schema geprüft, lassen sich also nicht ohne künstlichen Schnitt trennen.
  Dieser Plan baut V14 mit, statt eine halbfertige Schema-Definition zu hinterlassen —
  wird hier explizit benannt, nicht stillschweigend über die Auftragsgrenze hinaus
  entschieden.
- `EmailOtpType` ist ein von `@supabase/supabase-js` importierter Typ, keine
  projekteigene Konstante — die Zod-Enum-Werte müssen manuell mit den von Supabase
  akzeptierten OTP-Typen synchron gehalten werden (Typ-Import allein liefert keine
  Laufzeitliste). Bei einem künftigen Supabase-Upgrade mit neuen OTP-Typen muss das
  Enum manuell nachgezogen werden — sonst würden gültige neue Typen fälschlich als
  V14-Fall abgelehnt.
