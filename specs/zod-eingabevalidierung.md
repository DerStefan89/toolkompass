# Spec: Zod-Eingabevalidierung für bestehende Endpunkte

## Problem & Nutzer

- [Fakt] Vier öffentlich erreichbare Route-Handler nehmen Fremddaten entgegen, ohne sie
  gegen ein Schema zu prüfen: `app/api/anfrage/route.ts` (Body), `app/api/search/route.ts`
  (Query-Param `q`), `app/api/track/[linkId]/route.ts` (Route-Param `linkId`, mehrere
  Header), `app/auth/confirm/route.ts` (Query-Params `token_hash`, `type`, `next`)
  (docs/STATUS.md:50-51).
- [Fakt] `zod` ist nicht in `package.json` eingetragen (verifizierter Fakt aus dem
  Auftragskontext, nicht erneut geprüft).
- [Fakt] In `app/api/anfrage/route.ts:55-77` wird der geparste Body außerhalb eines
  try/catch-Blocks gelesen (Zeilen 63, 68-70); der try/catch bei Zeile 56-60 deckt nur
  `request.json()` selbst ab. Übergibt ein Client ein syntaktisch valides JSON, das kein
  Objekt ist (z. B. der Literal-Wert `null`), wirft der Zugriff auf `body._honeypot`
  (Zeile 63) bzw. `body.name` (Zeile 68) eine Laufzeitausnahme außerhalb jedes
  try/catch-Blocks.
- [Fakt] In `app/api/anfrage/route.ts:68-91` werden alle Fremdfelder per
  `String(x ?? '').trim()` in Strings gezwungen; ein Zahl-, Array- oder Objekt-Wert wird
  nicht abgelehnt, sondern stillschweigend zu einem String konvertiert (z. B. zu
  `"[object Object]"`) und in der `Inquiry`-Tabelle gespeichert.
- [Fakt] In `app/api/anfrage/route.ts:69` wird `email` nur auf Nicht-Leerheit geprüft
  (Zeile 72), nicht auf E-Mail-Format.
- [Fakt] `app/api/search/route.ts:71` begrenzt die Query-Länge auf 100 Zeichen, indem
  längere Eingaben serverseitig abgeschnitten (`.slice(0, MAX_QUERY_LENGTH)`) statt
  abgelehnt werden.
- [Fakt] `app/api/track/[linkId]/route.ts:93-119` verwendet `linkId` ungeprüft als
  Prisma-`where.id`. Da die Spalte laut `prisma/schema.prisma:462`
  (`id String @id @default(cuid())`) vom Typ `String` ist, führt ein falsch geformter
  Wert nicht zu einem Datenbankfehler, sondern zu keinem Treffer und damit zu einem
  302-Redirect zur Startseite (Zeile 122-124).
- [Fakt] `app/auth/confirm/route.ts:37` castet den Query-Param `type` per
  TypeScript-`as`-Assertion auf `EmailOtpType | null`, ohne den tatsächlichen Wert zur
  Laufzeit gegen die erlaubten Supabase-OTP-Typen zu prüfen.
- [Schlussfolgerung] Da keiner der vier Endpunkte ein gemeinsames Validierungsmuster
  nutzt (Honeypot + String-Coercion in `anfrage`, Length-Slice in `search`, keine Prüfung
  in `track`, ungeprüfter TS-Cast in `confirm`), würde eine Zod-Einführung vier
  unterschiedliche Ad-hoc-Ansätze durch ein einheitliches Muster ersetzen.
- [Annahme] Nutzer dieser Spec sind primär die Entwickler:innen, die im Rahmen des in
  `CLAUDE.md` und `docs/STATUS.md:45-48` genannten Zod-Pflicht-Gates vor Phase 6
  (Cashback-Webhooks) die vier bestehenden Endpunkte nachrüsten, sowie mittelbar
  Endnutzer, deren fehlerhafte oder untypisierte Eingaben heute teils zu einer
  unbehandelten Ausnahme statt einer verständlichen 400-Antwort führen können.

## Entschieden (vor dem Plan geklärt)

- V14: `type` wird per Zod-Enum gegen die gültigen Supabase-OTP-Typen geprüft,
  bevor der bestehende `as EmailOtpType | null`-Cast entfällt. Begründung: der
  ungeprüfte Cast ist selbst eine Lücke in einem TypeScript-strict-Projekt; die
  Prüfung ist billig und schließt sie. Beleg: `app/auth/confirm/route.ts:37`.
- V12 bleibt unverändert auf den Leerstring-Fall begrenzt, keine weitere
  Formatprüfung für `linkId`. Begründung: die Datei dokumentiert selbst den
  Grundsatz "Tracking darf den User-Flow nie aufhalten"; ein falsch geformter,
  nicht-leerer `linkId` fällt bereits auf denselben 302-Redirect wie eine
  unbekannte ID — zusätzliche Prüfung wäre Komplexität ohne Nutzen. Beleg:
  `app/api/track/[linkId]/route.ts:17`.

## Gewünschtes Verhalten

**`app/api/anfrage/route.ts`**

1. V1: Ein POST mit JSON-Body `null` antwortet mit Status 400 (nicht mit einem
   unbehandelten Serverfehler).
2. V2: Ein POST ohne das Feld `email` im Body antwortet mit Status 400.
3. V3: Ein POST mit `email: "kein-at-zeichen"` (keine gültige E-Mail-Form) antwortet mit
   Status 400.
4. V4: Ein POST mit `name: 12345` (Zahl statt String) antwortet mit Status 400, statt die
   Zahl stillschweigend in einen String zu konvertieren.
5. V5: Ein POST mit gültigen Pflichtfeldern (`name`, `email`, `description`) und ohne die
   optionalen Felder (`companyType`, `targetUsers`, `features`, `examples`, `budget`,
   `timeline`) antwortet mit Status 200 und `{ success: true }`.
6. V6: Ein POST mit befülltem Feld `_honeypot` antwortet weiterhin mit Status 200 und
   `{ success: true }`, ohne dass ein Datensatz erzeugt wird (unverändertes
   Bestandsverhalten, `app/api/anfrage/route.ts:62-66`).

**`app/api/search/route.ts`**

7. V7: Fehlt der Query-Param `q` vollständig, antwortet der Endpunkt mit Status 200 und
   einem leeren Array (unverändertes Bestandsverhalten, `app/api/search/route.ts:73-75`).
8. V8: Enthält `q` mehr als 100 Zeichen, antwortet der Endpunkt weiterhin mit Status 200
   und den Treffern für die auf 100 Zeichen gekürzte Eingabe (unverändertes
   Bestandsverhalten, `app/api/search/route.ts:71`) — die neue Validierung prüft Typ und
   Form, ändert aber nicht das bestehende Kürzungsverhalten.
9. V9: Wird `q` mehrfach als Query-Param übergeben (z. B. `?q=a&q=b`), antwortet der
   Endpunkt weiterhin mit Status 200 auf Basis des ersten Werts, statt mit Status 400
   wegen eines "falschen Typs" abzulehnen.

**`app/api/track/[linkId]/route.ts`**

10. V10: Ein GET auf `/api/track/` mit einem beliebigen, nicht existierenden
    `linkId`-String antwortet weiterhin mit Status 302 und Redirect zur Startseite
    (unverändertes Bestandsverhalten für unbekannte IDs,
    `app/api/track/[linkId]/route.ts:122-124`).
11. V11: Ein GET ohne `User-Agent`-Header wird weiterhin als Bot behandelt und mit Status
    302 zur Startseite umgeleitet (unverändertes Bestandsverhalten,
    `app/api/track/[linkId]/route.ts:40`).
12. V12: Ein GET mit leerem String als `linkId` antwortet mit Status 400, statt eine
    leere ID an die Datenbankabfrage weiterzureichen.

**`app/auth/confirm/route.ts`**

13. V13: Ein GET ohne `token_hash`-Query-Param antwortet weiterhin mit Status 302 und
    Redirect zu `/einloggen?fehler=link-ungueltig` (unverändertes Bestandsverhalten,
    `app/auth/confirm/route.ts:40-42`).
14. V14: Ein GET mit `type` gleich einem Wert, der keinem gültigen Supabase-OTP-Typ
    entspricht (z. B. `type=foo`), wird von der neuen Validierung abgefangen und führt zu
    Status 302 Redirect zu `/einloggen?fehler=link-ungueltig`, bevor `verifyOtp`
    aufgerufen wird.
15. V15: Ein GET mit `next=//evil.com` (protokoll-relative externe URL) wird weiterhin auf
    `/konto` umgeleitet statt auf die externe Domain (unverändertes Bestandsverhalten,
    `app/auth/confirm/route.ts:29-32`) — die neue Validierung übernimmt hier keine
    zusätzliche Aufgabe.

## Nicht-Ziele

- Kein Zod für Admin-Routen (`app/admin/**`) in diesem Zyklus — Scope ist auf die vier in
  `docs/STATUS.md:50-51` genannten Endpunkte begrenzt, Admin-Routen sind ein eigener Task.
- Kein Hinzufügen der `zod`-Abhängigkeit in `package.json` als Teil dieser Datei — diese
  Spec beschreibt nur das Zielverhalten; `npm install zod` ist Teil der späteren
  Umsetzung, nicht dieser Spec (Auftragsgrenze: kein npm install).
- Keine Änderung des bestehenden Rate-Limiting- oder Bot-Filter-Verhaltens — das ist
  bereits vorhanden (z. B. `app/api/anfrage/route.ts:30-42`,
  `app/api/track/[linkId]/route.ts:38-45`) und ist Bestandsschutz, nicht
  Eingabevalidierung.
- Keine Einführung von Playwright/E2E-Tests — laut `CLAUDE.md` ist Playwright erst vor
  Cashback-Webhooks in Phase 6 Pflicht, nicht Teil dieser Spec.
- Keine Änderung an der Supabase-OTP-Verifizierungslogik selbst (`verifyOtp`-Aufruf,
  `app/auth/confirm/route.ts:45`) — nur die Eingabewerte davor werden validiert, nicht
  das Auth-Backend.
- Keine weitere Härtung gegen Open-Redirect über `safeNext` hinaus — das ist bereits
  gelöst (`app/auth/confirm/route.ts:29-32`) und kein Zod-Thema.

## Constraints

- Stack laut `CLAUDE.md`/`ARCHITECTURE.md`: TypeScript strict (kein `any`), Next.js
  Route Handler (App Router), Node-Runtime — jede Validierung läuft innerhalb der
  bestehenden vier Dateien, kein neuer Layer.
- `zod` ist aktuell keine Abhängigkeit des Projekts; `CLAUDE.md` führt es explizit als
  "Pflicht vor Cashback-Webhooks in Phase 6" auf. Diese Spec deckt die vier
  Nicht-Zahlungs-Endpunkte ab, die `docs/STATUS.md:52` als "bei Gelegenheit prüfen"
  markiert — kein Vorgriff auf die Phase-6-Zahlungslogik selbst.
- Jede spätere Umsetzung muss `npm run check` grün bestehen: Lint, Typecheck, Doku-Gate,
  Regel-Gate, Secret-Scan und das seit Zwischenzyklus 4.5 blockierende Test-Gate
  (`state/gates.md`, Zeile "Test").
- Definition of Done aus `CLAUDE.md` gilt unverändert: Fehlerzustände mit
  catch + `console.error` + `captureException`, TypeScript strict ohne `any`, keine
  Commits ohne explizite Freigabe.
- `ARCHITECTURE.md:156` — Datenzugriff bleibt in Route Handlern (Server Action / Route
  Handler statt direktem Prisma-Call in Client Components); eine Zod-Validierung ändert
  daran nichts.
- Bestehende Rate-Limits, Bot-Filter und Honeypot-Logik (s. Nicht-Ziele) laufen
  unverändert weiter — die neue Validierung ergänzt diese Mechanismen, ersetzt sie nicht.

## Offene Fragen

- [offene Unsicherheit] Welches Fehlerantwort-Format bei Validierungsfehlern gelten
  soll, ist nicht festgelegt: Die bestehende Konvention in
  `app/api/anfrage/route.ts:73-76` liefert einen einzelnen deutschen Freitext-String im
  Feld `error`; ein Zod-`safeParse`-Fehlschlag liefert strukturiert mehrere Issues. Beide
  Formen sind mit den V-Aussagen oben vereinbar, solange der Status-Code stimmt — die
  konkrete JSON-Form ist vor der Umsetzung zu klären.
- [offene Unsicherheit] Ob die in V3 geforderte E-Mail-Formatprüfung strenger sein soll
  als eine einfache Regex (z. B. RFC-5322-nahe Prüfung vs. einfaches
  "enthält @ und einen Punkt danach"), ist nicht festgelegt.
- [offene Unsicherheit] Für Textfelder in `app/api/anfrage/route.ts` (`description`,
  `features`, `examples` u. a.) existiert aktuell keine Zeichen-Obergrenze im Code; ob
  Zod eine Maximallänge einführen soll und welcher Wert das sein soll, ist offen — dazu
  wurde bewusst keine V-Aussage mit erfundener Zahl aufgenommen.
