## TASK: zyklus5-abschluss-doku
GOAL: Alle vier Harness-Dokumentationsdateien spiegeln den echten Stand nach
Zyklus 5 (Playbook 03 — Memory & State, drei Übungen, PRs #25/#26/#27, alle
gemergt) wider. Kein Playbook-Inhalt wird neu erfunden, nur der reale Bau
dokumentiert.

CONTEXT: Zyklus 5 ist inhaltlich abgeschlossen. Gebaut und gemergt:
Übung 3 (Frische-Regel im Doku-Gate, PR #25) — scripts/check-docs.mjs Prüfung 3,
state/gates.md Kalibrierungsabsatz, state/tasks/memory-frische-gate.md,
state/advisor-findings-memory-gate.md.
Übung 1 (Rückwärts-Handoff, PR #26) — state/zwischenstand/ (gitignored bis auf
VORLAGE.md), .claude/hooks/zwischenstand-laden.js (SessionStart),
.claude/hooks/zwischenstand-pruefen.js (PreCompact), state/gates.md-Zeile
"Zwischenstand-Handoff", state/tasks/zwischenstand-geruest.md,
state/advisor-findings-zwischenstand.md.
Übung 2 (Memory-Map, PR #27) — state/memory-map.md (14 Info-Typen),
Kürzung dreier Bullet-Punkte in HARNESS-LEARNING-STATE.md ("## Praktisch
getestet": Branch-Protection, Settings-Guard, Test-Gate — jetzt Verweis auf
gates.md statt Detail-Prosa), state/tasks/memory-map-geruest.md,
state/advisor-findings-memory-map.md.
Zusätzlich, ungeplant: globale ~/.claude/settings.json (außerhalb dieses Repos)
enthielt pauschale Freigaben für `git push`, `git commit`, `Read(//c/**)`,
`Read(//c/Users/stefa/**)` — entfernt, Gegentest bestanden (git push löst jetzt
eine Rückfrage aus). state/triggers.md um zwei reale Trigger ergänzt
(SessionStart- und PreCompact-Hook aus Übung 1, ursprünglich vergessen,
nachträglich gefunden und ergänzt).
Websuche-Nachträge (Playbook-Regel 5) zu Playbook 03: AutoDream präzisiert
(24h UND mindestens 5 Sessions, vierphasig, MEMORY.md + Topic-Dateien, Index
unter 200 Zeilen); claude-mem-Sicherheitsrisiko ergänzt (Community-Audit
Februar 2026, HIGH risk, unauthentifizierte lokale HTTP-API Port 37777);
Dreams-API weiterhin Research Preview, bestätigt.

SCOPE:
(1) docs/harness/HARNESS-LEARNING-STATE.md:
    (a) Zeile 4 (Stand-Marker) auf "Stand dieser Fassung: 06.08.2026, nach
        Abschluss von Zyklus 5 (Playbook 03 — Memory & State)." setzen.
    (b) Im Abschnitt "## Abgeschlossene Zyklen": neue Zeile
        "- **Zyklus 5** (Playbook 03 — Memory & State) — 🚪✅ bestanden
        (06.08.2026)" nach der Zwischenzyklus-4.5-Zeile einfügen.
    (c) Die Zeile "**Nicht begonnen:** Zyklus 5 ..." ersetzen durch
        "**Nicht begonnen:** Zyklus 6 (Playbook 06 — Entwicklungs-Methodik),
        🚪⬜. Reihenfolge danach laut Master-Briefing: 6.5 → 07 → 09 → 08."
    (d) Neuer Unterabschnitt "### Zyklus 5 (Playbook 03 — Memory & State)"
        nach dem Zwischenzyklus-4.5-Abschnitt, im selben Stil (Bullet je
        Übung, PR-Nummer, Datei-Nachweise) wie die bestehenden Abschnitte —
        Inhalt aus CONTEXT oben, mit korrekten Dateipfaden.
    (e) Im Abschnitt "## Praktisch getestet": neue Bullet-Punkte für den
        Zwischenstand-Handoff (Kanarienprobe rot/grün, Blockade-Fund mit
        Zukunfts-Zeitstempel) und die Memory-Map-Dublette (gefunden +
        aufgeräumt, zweite Dublette vom Advisor gefunden).
    (f) Neuer Abschnitt "## Verhaltensregeln für künftige Sessions (aus
        Zyklus 5, konkret aus echten Funden)" mit mindestens diesen zwei
        Regeln: (i) Ein Advisor-Pass kann eine zweite, vom Menschen
        übersehene Dublette finden, nicht nur die im Auftrag benannte — ein
        Plan gilt erst nach der Advisor-Prüfung als vollständig, nicht beim
        Schreiben. (ii) Ein künstlicher Test-Zeitstempel kann in der Zukunft
        statt Vergangenheit liegen und dadurch das Gegenteil des gewollten
        Zustands erzeugen (negative Zeitdifferenz wird fälschlich als
        "frisch" gelesen) — vor jedem Alters-Test die Systemzeit gegenprüfen.
    (g) In "## Noch unsicher / nicht aus dem Repo rekonstruierbar": Zeile
        ergänzen zur offenen Unsicherheit, ob eine ECHTE `/compact` das
        Top-Level-Feld `decision` bei PreCompact respektiert (Details:
        state/tasks/zwischenstand-geruest.md, Nachtrag).
    (h) Abschnitt "## Voraussetzungen und nächste Schritte" umbenennen/
        aktualisieren auf Zyklus 6: Zyklus 5 abgeschlossen nennen, nächster
        Zyklus laut Master-Briefing Playbook 06, kein bekannter Blocker.
(2) docs/harness/HARNESS-CHANGELOG.md: neue Tabellenzeile
    "| 06.08.2026 | Zyklus 5 (Playbook 03 — Memory & State) abgeschlossen:
    Frische-Regel im Doku-Gate (PR #25), Rückwärts-Handoff über SessionStart-/
    PreCompact-Hooks (PR #26), Memory-Map mit aufgeräumter Gate-Kalibrierungs-
    Dublette (PR #27). Globale ~/.claude/settings.json-Wildcard-Freigaben
    (git push, Laufwerk-C-Lesezugriff) entfernt. state/triggers.md um zwei
    reale Trigger ergänzt. |"
(3) docs/harness/HARNESS-OVERVIEW.md, Abschnitt "## Aufbau": den Baum
    aktualisieren — unter state/ ergänzen: "memory-map.md ← Info-Typ→Heimat-
    Tabelle (Playbook 03)" und "zwischenstand/ ← Aufgaben-Gedächtnis,
    NICHT committet außer VORLAGE.md (Playbook 03)"; unter .claude/hooks/
    ergänzen: "zwischenstand-laden.js (SessionStart), zwischenstand-
    pruefen.js (PreCompact) — Rückwärts-Handoff (Playbook 03)". Im Abschnitt
    "## Wie Claude mit dem Harness arbeitet" einen neuen Punkt 13 ergänzen:
    "Bei einer Unterbrechung mitten in einer Aufgabe: Zwischenstand in
    state/zwischenstand/<branch>.md schreiben (Vorlage:
    state/zwischenstand/VORLAGE.md) — SessionStart lädt ihn in die nächste
    Sitzung, PreCompact blockiert eine manuelle Compaction ohne frischen
    Stand."
(4) docs/harness/HARNESS-GLOSSARY.md: vier neue Zeilen am Tabellenende
    ergänzen, im bestehenden Spaltenformat (Begriff | Einfache Erklärung |
    Funktion im Harness | Beispiel aus dem Projekt):
    - "Gedächtnis-Hierarchie" | "Vier Schichten mit je eigener Lebensdauer:
      Arbeits-, Aufgaben-, Projekt-, Organisationsgedächtnis" | "Bestimmt,
      wo eine Information hingehört" | "state/memory-map.md"
    - "Zwischenstand (Rückwärts-Handoff)" | "Datei, die eine unterbrochene
      Aufgabe für die nächste Sitzung zusammenfasst" | "Überlebt Compaction
      und Sitzungswechsel, Gegenstück zum Handoff-Vertrag (der wirkt
      vorwärts, Mensch zu Agent)" | "state/zwischenstand/<branch>.md"
    - "Kanarienprobe" | "Ein Codewort im Kontext platzieren und eine frische
      Sitzung danach fragen, um zu beweisen dass eine stille Kontext-
      Injektion wirklich ankommt" | "Ersetzt Vertrauen durch Beleg, wenn ein
      Mechanismus selbst nicht direkt einsehbar ist" | "SessionStart-Hook-
      Kalibrierung, Zyklus 5"
    - "Doppel-Heimat" | "Dieselbe Information lebt an zwei Stellen und kann
      dadurch auseinanderlaufen" | "Anti-Pattern, Gegenmittel ist das
      Heimat-Prinzip" | "Gate-Kalibrierungsbelege in gates.md UND
      HARNESS-LEARNING-STATE.md, gefunden und teilweise aufgeräumt in
      Zyklus 5"

NICHT: CLAUDE.md, ARCHITECTURE.md oder state/gates.md ändern (bereits aktuell).
Playbook-Inhalte erfinden, die nicht tatsächlich gebaut wurden. Andere Abschnitte
der vier Dateien als die genannten anfassen. Committen oder pushen.

BUDGET: ein Durchgang.

OUTPUT: Kurzbericht — für jede der vier Dateien: welcher Abschnitt geändert
wurde, wie viele Zeilen hinzugekommen sind. Danach `npm run check` vollständig,
Ausgabe + Exit-Code wörtlich (Doku-Gate MUSS grün bleiben — die neue Stand-Zeile
in HARNESS-LEARNING-STATE.md muss mindestens so aktuell sein wie jedes Datum im
restlichen Text). Danach git status --short.

ESCALATE: Eine der im CONTEXT genannten Fundstellen (PR-Nummern, Dateipfade)
lässt sich nicht im Repo verifizieren → anhalten, tatsächlichen Stand vorlegen.
npm run check wird rot → anhalten, Ursache vorlegen, nicht durch Zurückdatieren
"reparieren". Bei fehlender Information: Rückfrage statt Annahme.

Lies die Datei danach erneut, prüfe auf Formatfehler.
