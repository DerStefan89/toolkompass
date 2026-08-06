## TASK: memory-map-geruest
GOAL: state/memory-map.md existiert mit vollständiger Info-Typ→Heimat-Tabelle. Die
belegte Settings-Guard-Dublette in "Praktisch getestet" ist auf einen auffindbaren
Verweis gekürzt, ebenso die Branch-Protection- und Test-Gate-Punkte. Kein Inhalt
verloren, der nicht auch in state/gates.md steht.

CONTEXT: Playbook 03, Übung 2 (Memory & State) — Heimat-Prinzip: jede Information hat
genau eine Heimat, Doppel-Heimaten werden markiert und eine wird aufgeräumt. Plan wurde
vom `architecture-advisor` geprüft (Urteil zu Plan v1: nicht freigegeben, vier
blockierende Befunde) und danach vom Menschen entschieden. Vollständige Tabelle und
Entscheidungen: state/advisor-findings-memory-map.md — VOR dem Bau lesen.
Betroffene Datei: docs/harness/HARNESS-LEARNING-STATE.md (aktueller Stand, Abschnitt
"## Praktisch getestet" ab Zeile 125, enthält Bullet-Punkte zu Branch-Protection,
Settings-Guard und Test-Gate mit Detail-Prosa, die inhaltlich bereits vollständig in
state/gates.md steht).

SCOPE:
(1) state/memory-map.md anlegen. Kopfsatz: Abgrenzung zu docs/harness/HARNESS-OVERVIEW.md
    (Overview = Ordnerstruktur, memory-map.md = Schreib-Heimat pro Info-Typ).
    Danach Tabelle Info-Typ | Heimat mit genau diesen 14 Zeilen:
    Regeln → CLAUDE.md, ARCHITECTURE.md
    Struktur / Aufbau des Harness → docs/harness/HARNESS-OVERVIEW.md
    Begriffe → docs/harness/HARNESS-GLOSSARY.md
    Phasenstand / Scope → docs/STATUS.md
    Gates & Kalibrierung → state/gates.md (mit dem Satz: "Künftige Kalibrierungsfunde
    gehören ausschließlich hierher; docs/harness/HARNESS-LEARNING-STATE.md bekommt nur
    einen Verweis-Satz, keine Detail-Prosa.")
    Unausgesprochene Annahmen → state/assumption-ledger.md
    Trigger-Inventar → state/triggers.md
    Entscheidungen mit Alternativen → docs/adr/*.md
    Aufgaben-Handoff-Verträge → state/tasks/*.md
    Zwischenstand (Aufgaben-Gedächtnis, nicht committet) → state/zwischenstand/*.md
    Advisor-Findings vor dem Bau → state/advisor-findings-*.md
    Zyklus-Fortschritt & Lernjournal, Verhaltensregeln → docs/harness/HARNESS-LEARNING-STATE.md
    Änderungshistorie (Kurzfassung, nur Struktur) → docs/harness/HARNESS-CHANGELOG.md
    Playbook-Tor-Status (Kurs-Fortschritt) → claude-playbook/00-MASTER-BRIEFING.md
    (anderes, privates Repo)
    Danach Abschnitt "## Gefundene Doppel-Heimaten" mit zwei Unterpunkten:
    (a) Gate-Kalibrierungsbelege (aufgeräumt, s. SCOPE 2) — kurz beschreiben, was
        gefunden und was entschieden wurde.
    (b) Settings-Guard-Vorfall in "Bereits gelernt und gebaut" (Zyklus 3) — BEWUSST
        NICHT aufgeräumt. Wörtlich die Begründung aus dem Advisor-Findings-Dokument
        übernehmen (Evidenz-Katalog vs. Baugeschichte, Anti-Pattern 3: ausgesprochene
        Doppel-Heimat ist zulässig).
(2) In docs/harness/HARNESS-LEARNING-STATE.md, ausschließlich im Abschnitt
    "## Praktisch getestet": die drei Bullet-Punkte zu Branch-Protection, Settings-Guard
    und Test-Gate kürzen. Jeder gekürzte Punkt behält den einleitenden Fakt-Satz (WAS
    wurde bestätigt), verliert aber die Detail-Prosa (WIE genau, mit welchem Transkript-
    Zitat) und endet stattdessen mit einem Verweis im Format:
    "Details und Belege: state/gates.md:<Zeilenbereich> (\"<wörtliches Fett-Label>\")."
    Konkrete Zeilenbereiche und Labels: Branch-Protection → gates.md:14-29
    ("Kalibrierungsfund (04.08.2026):"); Settings-Guard → gates.md:31-69
    ("Kalibrierungsfund (04.08.2026, Settings-Guard):" bis "... Fortsetzung —
    `ask` → `deny`):"); Test-Gate → gates.md:71-83 ("Kalibrierungsfund (06.08.2026,
    Test-Gate):").
    Alle anderen Bullet-Punkte in "Praktisch getestet" (Secret-Scan, Regel-Gate,
    Stern-Topologie, Reparse-Point, Zwischenstand-Handoff) NICHT anfassen — sie sind
    nicht Teil dieser Bereinigung.
(3) Kein anderer Abschnitt von HARNESS-LEARNING-STATE.md wird verändert — insbesondere
    NICHT der Abschnitt "Zyklus 3 — Bereits gelernt und gebaut" (Z. 57-63, bewusst
    stehen gelassen, s. SCOPE 1b), NICHT die Verhaltensregeln, NICHT "Noch unsicher",
    NICHT die Kopfzeile "Stand dieser Fassung:". Wird durch diese Änderung die Datei
    inhaltlich neuer (jüngstes referenziertes Datum ändert sich nicht — nur Kürzung,
    kein neues Datum) — die Stand-Zeile bleibt deshalb unverändert, das Doku-Gate
    (Prüfung 3) darf dadurch nicht rot werden.

NICHT: state/gates.md ändern. Neue Kalibrierungs-Notiz für Doku-Gate Prüfung 3
ergänzen (falsche Prämisse aus Plan v1, per Advisor widerlegt — siehe
state/advisor-findings-memory-map.md, Befund a4). CLAUDE.md, ARCHITECTURE.md oder
HARNESS-OVERVIEW.md ändern. Committen oder pushen.

BUDGET: ein Durchgang.

OUTPUT: Kurzbericht.
(a) Diff-artiger Vorher/Nachher-Auszug der drei gekürzten Bullet-Punkte in
    HARNESS-LEARNING-STATE.md (alter Text, neuer Text, je Punkt).
(b) `npm run check` vollständig ausführen, Ausgabe und Exit-Code wörtlich zeigen —
    Doku-Gate MUSS weiterhin grün sein (Beleg, dass die Stand-Zeile korrekt
    unangetastet blieb).
(c) git status --short.
(d) Ausdrückliche Bestätigung: Abschnitt "Zyklus 3 — Bereits gelernt und gebaut"
    (Z. 57-63) unverändert (git diff-Auszug NUR für diesen Bereich, falls vorhanden,
    sonst Bestätigung "keine Änderung in diesem Bereich").
Jede Aussage als Fakt / Schlussfolgerung / Annahme / offene Unsicherheit markieren.

ESCALATE: Einer der drei genannten Bullet-Punkte lässt sich nicht eindeutig in
HARNESS-LEARNING-STATE.md finden (Zeilennummern könnten sich seit Vertragserstellung
verschoben haben) → anhalten, tatsächliche Fundstelle vorlegen, nicht raten, welcher
Punkt gemeint war. `npm run check` wird nach der Änderung rot → anhalten, Ursache
vorlegen, nicht durch Anpassen der Stand-Zeile "reparieren" (das wäre eine
unbegründete Datumsänderung). Bei fehlender Information: Rückfrage statt Annahme.
