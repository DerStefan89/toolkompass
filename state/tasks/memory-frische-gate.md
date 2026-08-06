## TASK: memory-frische-gate
GOAL: Eine Datei, die ihren eigenen Stand älter angibt als ihr jüngster Inhalt,
lässt `npm run check` scheitern. Rot UND grün wurden beobachtet.

CONTEXT: Anlass ist ein echter Selbstwiderspruch:
docs/harness/HARNESS-LEARNING-STATE.md deklariert in Zeile 4
"Stand dieser Fassung: 05.08.2026", enthält aber in den Zeilen 15, 154 und 256
das jüngere Datum 06.08.2026. Kein bestehendes Gate merkt das.
Der Plan wurde vom `architecture-advisor` geprüft, Urteil "Freigegeben mit
Hinweisen", sechs Befunde — alle sechs sind unten eingearbeitet.
Vollständige Tabelle: state/advisor-findings-memory-gate.md.
Zielort ist scripts/check-docs.mjs: Prüfung 2 endet dort auf Zeile 131, der
Ergebnis-Block beginnt auf Zeile 133. Der Ergebnis-Block und das Befunde-Array
werden unverändert mitbenutzt.
Kalibrierungsregel: ein Gate gilt erst als belegt, wenn beide Zustände beobachtet
wurden (Playbook 05, Regel 2; Format siehe bestehende Kalibrierungsabsätze in
state/gates.md).
`npm run check` ist bereits Required Status Check auf `main` — ci.yml braucht
keine Änderung.

SCOPE:
(1) Neue "Prüfung 3" in scripts/check-docs.mjs zwischen Zeile 131 und 133,
    im Kommentarstil der bestehenden Prüfungen 1 und 2.
    Regel: Enthält eine Datei die exakte Phrase "Stand dieser Fassung:" gefolgt
    von einem Datum, darf kein Datum im übrigen Text jünger sein.
(2) Anker auf die VOLLE Phrase "Stand dieser Fassung:", nicht auf das Wort
    "Stand" allein. Grund im Code kommentieren und dabei
    state/tasks/vitest-gate-scharf.md:7,12 als reale Fehlalarm-Stelle namentlich
    nennen ("Stand 04.08.2026" / "Stand 06.08.2026") sowie
    docs/harness/HARNESS-LEARNING-STATE.md:100 ("Stand 480d140", ein
    Commit-Hash statt eines Datums).
(3) Geltungsbereich REKURSIV über docs/harness/ und state/, inklusive des
    Unterverzeichnisses state/tasks/ mit seinen acht .md-Dateien. Die
    bestehende Hilfsfunktion sammleDateinamen (Zeilen 55-66) sammelt nur
    Dateinamen ohne Pfad und ist für diesen Zweck nicht verwendbar — eine
    eigene rekursive Sammlung schreiben, die vollständige Pfade liefert.
(4) Datumsformate im Text: TT.MM.JJJJ und JJJJ-MM-TT, jeweils mit strikten
    Ziffern-Gruppenlängen, damit Versionsnummern, Zeilenbereiche und
    Commit-Hashes nicht als Datum gelesen werden. Die Gruppenlängen im Code
    kommentieren, im Stil des bestehenden Kommentars zu istDatum
    (Zeilen 108-114). Uhrzeit hinter einem Datum ist erlaubt und ändert nichts
    (Beispiel: HARNESS-LEARNING-STATE.md:130).
(5) Die Zeile mit dem Marker selbst zählt nicht als Fundstelle. Erscheint die
    Phrase mehr als einmal in derselben Datei: Befund "mehrdeutiger
    Stand-Marker" melden, statt stillschweigend den ersten zu nehmen.
(6) check-docs-ignore: der Mechanismus ist im Bestand pro Prüfung dupliziert
    (Zeilen 74 und 120), nicht global. In Prüfung 3 genauso replizieren, für
    die Zeile mit dem jüngeren Datum.
(7) Befund-Format, eine Zeile pro Fund:
    <datei>:<zeile>: Datum <gefundenes> ist jünger als "Stand dieser Fassung:
    <stand>" (Zeile <markerzeile>)
(8) Einen erklärenden Satz in docs/harness/HARNESS-OVERVIEW.md ergänzen: was
    der Marker "Stand dieser Fassung:" bedeutet und dass das Doku-Gate ihn
    erzwingt. Grund: die Konvention war bisher nirgends dokumentiert, und
    docs/adr/TEMPLATE.md:3 verwendet mit "**Datum:** YYYY-MM-DD" bewusst eine
    andere.
(9) state/gates.md: KEINE neue Tabellenzeile. Die Evidenz-Spalte der
    bestehenden Doku-Gate-Zeile um die Frische-Regel ergänzen, plus einen
    Kalibrierungsabsatz im Format der bestehenden Absätze.

NICHT: Eine Marker-PFLICHT für Dateien ohne "Stand dieser Fassung"-Zeile
einführen. Prüfung 1 oder Prüfung 2 anfassen. .github/workflows/ci.yml ändern.
Ein eigenes Script anlegen. Eine neue Gate-Zeile in state/gates.md. Dateien
außerhalb von docs/harness/ und state/ prüfen (docs/STATUS.md:15 und
datenschutz.md:3 nutzen "Stand: Juli 2026" — Monat ohne Tag, bewusst außerhalb).
Committen oder pushen.

BUDGET: ein Durchgang, Kalibrierung eingerechnet.

OUTPUT: Kurzbericht mit BEIDEN Terminalausgaben wörtlich.
Rot: `npm run check` liefert Exit ungleich 0, die Meldung stammt nachweislich
aus Prüfung 3 (nicht aus Lint, Typecheck, Prüfung 1, Prüfung 2, Regel-Gate oder
Test davor), und es werden ALLE DREI Fundstellen gemeldet (Zeilen 15, 154, 256).
Grün: Stand-Zeile in HARNESS-LEARNING-STATE.md auf 06.08.2026 korrigiert,
`npm run check` liefert Exit 0 und die 21 Tests bleiben grün.
Zusätzlich: der git-status-Auszug der geänderten Dateien, und die Bestätigung,
dass keine andere Datei unter state/ oder docs/harness/ neu rot wird.

ESCALATE: Prüfung 3 meldet eine Fundstelle in state/tasks/ → anhalten, Ausgabe
vorlegen, nicht durch Aufweichen der Regel reparieren. `npm run check` wird aus
einem anderen Grund als Prüfung 3 rot → anhalten, Ursache vorlegen.
Bei fehlender Information: Rückfrage statt Annahme.

## NACHTRAG (06.08.2026)

Genau der ESCALATE-Fall oben ist beim ersten Durchlauf eingetreten. Eine erste
Implementierung von Prüfung 3 zählte jede Zeile, die die Phrase "Stand dieser
Fassung:" als Teilstring enthält, als Marker-Vorkommen — unabhängig davon, ob
am Zeilenanfang und ob ein Datum folgt. Damit meldete Prüfung 3 zusätzlich zu
den drei erwarteten Fundstellen zwei Fehlalarme: `state/tasks/memory-
frische-gate.md:7` (dieser Vertrag selbst) und
`state/advisor-findings-memory-gate.md:11` — beide Dateien BESCHREIBEN die
Marker-Konvention in Prosa/Tabellenzellen, SETZEN sie aber nicht.

Angehalten und vorgelegt statt repariert (wie hier gefordert). Entscheidung
danach: ein Marker-Vorkommen zählt nur, wenn die Phrase am Zeilenanfang steht
(optional mit Whitespace oder einem Markdown-Präfix `>`, `-` oder `*`) und
unmittelbar von einem Datum gefolgt wird. Grund: ein Marker ist eine Aussage
einer Datei ÜBER SICH SELBST — eine Erwähnung mitten im Satz oder in
Anführungszeichen ist keine Deklaration. Wichtig dabei: "Phrase unmittelbar
gefolgt von einem Datum" allein hätte nicht gereicht — Zeile 7 dieses Vertrags
("Stand dieser Fassung: 05.08.2026", enthält aber…") erfüllt das ebenfalls und
wäre ohne die zusätzliche Zeilenanfang-Bedingung ein gültiger Marker geblieben,
mit Zeile 8 (06.08.2026) als neuem Fehlalarm.

Der Vertragstext oben (SCOPE 1–9, NICHT, ESCALATE) bleibt unverändert als
historischer Stand — diese Korrektur ist ausschließlich hier und im Code
(`scripts/check-docs.mjs`, Prüfung 3) dokumentiert, nicht rückwirkend in SCOPE
eingearbeitet. Nach der Korrektur: die drei erwarteten Fundstellen in
`docs/harness/HARNESS-LEARNING-STATE.md` (Zeilen 15, 154, 256) blieben
gemeldet, beide Fehlalarme verschwanden, keine der übrigen 21 geprüften
`.md`-Dateien unter `docs/harness/` und `state/` erzeugte einen Befund.

**Bekannte Grenze:** Die Marker-Zeile selbst wird beim Datums-Scan vollständig
übersprungen, damit das Stand-Datum sich nicht selbst als jüngeres Datum
meldet. Folge: Ein jüngeres Datum auf DERSELBEN Zeile wie der Marker (Beispiel:
"Stand dieser Fassung: 05.08.2026, ergänzt 09.09.2026") wird nicht erkannt.
Bewusst nicht behoben — die Regel deckt den beobachteten Fall ab; ein Ausbau
erfolgt erst, wenn dieser Fall real auftritt.
