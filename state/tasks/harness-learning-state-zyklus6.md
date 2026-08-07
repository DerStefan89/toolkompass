## TASK: harness-learning-state-zyklus6

GOAL:
`docs/harness/HARNESS-LEARNING-STATE.md` bildet den Stand nach Zyklus 6 ab.
Prüfbar: Die Datei enthält (a) Zyklus 6 in der Liste „Abgeschlossene Zyklen",
(b) einen Abschnitt „### Zyklus 6 (Playbook 06 — Entwicklungs-Methodik)",
(c) einen Abschnitt „Verhaltensregeln für künftige Sessions (aus Zyklus 6 …)",
(d) keine Zeile mehr, die Zyklus 6 als „nicht begonnen" bezeichnet,
(e) einen Stand-Marker vom 07.08.2026. `npm run check` läuft mit Exit 0 durch.

CONTEXT:

- [Fakt] `docs/harness/HARNESS-LEARNING-STATE.md` trägt im Kopfkommentar
  „Stand dieser Fassung: 06.08.2026, nach Abschluss von Zyklus 5" und behauptet
  in Zeile 18: „**Nicht begonnen:** Zyklus 6 (Playbook 06 — Entwicklungs-Methodik), 🚪⬜."
- [Fakt] Zyklus 6 ist am 07.08.2026 abgeschlossen, Tor 06 bestanden.
  `docs/harness/HARNESS-CHANGELOG.md` enthält den vollständigen Zyklus-6-Eintrag
  unter dem Datum 07.08.2026. Nur die Learning-State-Datei wurde nicht mitgezogen.
- [Fakt] Der Kopfkommentar der Datei schreibt selbst vor: „Diese Datei verändert
  sich mit jedem abgeschlossenen Zyklus — bei Zyklus-Ende aktualisieren."
- [Fakt] Die Belege für Zyklus 6 liegen im Repo:
  `specs/zod-eingabevalidierung.md`,
  `state/plan-v1-zod-eingabevalidierung.md`, `state/plan-v2-zod-eingabevalidierung.md`,
  `state/advisor-findings-zod-eingabevalidierung.md`,
  `state/tasks/zod-phase1-2-anfrage.md`, `state/tasks/zod-phase3-search.md`,
  `state/tasks/zod-phase4-track.md`, `state/tasks/zod-review-fixes.md`,
  `state/framework-sichtung-superpowers.md`, `CLAUDE.md` Zeilen 84–86
  (Zuschnitt-Heuristik), Tests unter `app/api/anfrage/route.test.ts`,
  `app/api/search/route.test.ts`, `app/api/track/[linkId]/route.test.ts`.
  PRs #30 und #31.
- [Fakt] Das Lernjournal zu Zyklus 6 steht ausschließlich im privaten Repo
  `DerStefan89/claude-playbook` (`00-MASTER-BRIEFING.md`, Abschnitt 6, Eintrag
  07.08.2026) und ist aus diesem Repo nicht lesbar. Wortlaut deshalb unten unter
  MATERIAL mitgeliefert — er ist Quelle, nicht Vorschlag.
- [Fakt] `docs/harness/HARNESS-OVERVIEW.md`, Abschnitt „Repo-Grenze", begründet,
  dass `docs/harness/` bewusst im öffentlichen Repo liegt, damit ein frischer Chat
  sich per `raw.githubusercontent.com` bootstrappen kann. Solange Zyklus 6 dort
  fehlt, bekommt ein solcher Chat einen um einen Zyklus veralteten Stand.
- [Schlussfolgerung] Die Frische-Regel (`scripts/check-docs.mjs`, Prüfung 3) konnte
  das nicht melden, weil sie den Stand-Marker gegen andere Daten *im selben Dokument*
  vergleicht. Ohne eingefügten Zyklus-6-Inhalt existiert kein jüngeres Datum, also
  bleibt das Gate grün. Das Gate erkennt Inkonsistenz, nicht Auslassung.
- [offene Unsicherheit] Nach dem Einfügen von 07.08.2026-Daten wird die Frische-Regel
  scharf. Wird der Stand-Marker nicht mitgezogen, muss `npm run check` fehlschlagen.
  Das ist erwartetes Verhalten und keine Störung — es ist die erste echte
  Rot-Beobachtung dieser Regel an einer Harness-Datei.

SCOPE:

Zu ändern ist ausschließlich `docs/harness/HARNESS-LEARNING-STATE.md`:

1. Kopfkommentar: Stand-Marker auf 07.08.2026, Bezug „nach Abschluss von Zyklus 6
   (Playbook 06 — Entwicklungs-Methodik)".
2. Liste „Abgeschlossene Zyklen": Zeile für Zyklus 6 ergänzen (🚪✅, 07.08.2026).
3. Zeile 18 ersetzen: nicht begonnen ist jetzt Zwischenzyklus 6.5
   („Template & Werkzeuge", 🚪⬜), Reihenfolge danach 07 → 09 → 08.
4. Neuer Abschnitt „### Zyklus 6 (Playbook 06 — Entwicklungs-Methodik)" direkt nach
   dem Zyklus-5-Abschnitt, im Stil der bestehenden Zyklus-Abschnitte: pro Übung ein
   Punkt mit Nachweis-Dateipfaden und PR-Nummer. Drei Übungen (Kernzyklus an der
   Zod-Eingabevalidierung; Zuschnitt-Heuristik in CLAUDE.md; Framework-Sichtung
   Superpowers) plus ein Punkt „Zusätzlich, vorgezogen aus Zwischenzyklus 6.5"
   (`state/tooling.md`, vendorter Skill `werkzeug-auswahl`).
5. Abschnitt „Praktisch getestet": Zyklus-6-Belege ergänzen — insbesondere, dass die
   qa-Findings F2/F3 zu Fix und Test geführt haben und die Route-Tests grün sind.
6. Neuer Abschnitt „## Verhaltensregeln für künftige Sessions (aus Zyklus 6, konkret
   aus echten Funden)" — inhaltlich aus MATERIAL unten, im Stil der bestehenden
   Verhaltensregel-Abschnitte (fett gesetzte Regel, danach der Vorfall als Beleg).
7. Abschnitt „Noch unsicher / nicht aus dem Repo rekonstruierbar": zwei Einträge
   ergänzen — (a) der vollständige qa-Review-Text zu Übung 1 existiert nicht auf der
   Platte, `state/tasks/zod-review-fixes.md` verweist auf einen Chat-Verlauf, erhalten
   sind nur Fix und Test; (b) der Vitest-Ausfall vom 07.08.2026 ist ursächlich
   ungeklärt (siehe vierte bekannte Falle in `CLAUDE.md`).
8. Schlussabschnitt „Voraussetzungen und nächste Schritte für Zyklus 6" umbenennen und
   inhaltlich auf Zwischenzyklus 6.5 umstellen.

NICHT:

- Keine Änderung an `HARNESS-CHANGELOG.md`, `HARNESS-OVERVIEW.md`,
  `HARNESS-GLOSSARY.md`, `CLAUDE.md`, `docs/STATUS.md` oder irgendeiner Datei
  unter `state/`. Auch dann nicht, wenn dort etwas veraltet wirkt — melden statt
  beheben.
- Keine Reparatur der Frische-Regel selbst. Der blinde Fleck aus dem CONTEXT ist
  bekannt und bekommt einen eigenen Auftrag.
- Keine Bewertung, ob Zyklus 6 zu Recht als bestanden gilt. Der Stand wird
  abgebildet, nicht revidiert.
- Keine neuen Verhaltensregeln erfinden, die nicht in MATERIAL stehen oder sich
  nicht aus einer Datei im Repo belegen lassen.
- Kein Commit, kein Push, kein Branch-Wechsel ohne ausdrückliche Freigabe des Menschen.

BUDGET: ein Baudurchgang, höchstens eine Korrekturrunde.

OUTPUT:

- Geänderte Datei: `docs/harness/HARNESS-LEARNING-STATE.md`.
- Im Bericht erscheinen:
  1. `git status` (unstaged, nichts gestaged) — erwartet: genau eine geänderte Datei.
  2. `git diff --stat` und der vollständige `git diff` der Datei.
  3. Ausgabe von `npm run check`. Grüner Fall: Exit 0, alle sechs Gates durch.
     Meldet das Test-Gate rot, ohne dass Testcode angefasst wurde: Lauf einmal
     wiederholen, bevor irgendetwas repariert wird (vierte bekannte Falle in
     `CLAUDE.md`, beobachtet am 07.08.2026). Beide Läufe im Bericht zeigen.
  4. Falls die Frische-Regel zwischenzeitlich rot war: die Fehlermeldung im Bericht
     zeigen, bevor sie behoben wurde — sie ist die erste echte Rot-Beobachtung dieser
     Regel an einer Harness-Datei und gehört als Kalibrierungsbeleg festgehalten.

ESCALATE:

- Wenn ein Punkt aus SCOPE sich nicht aus dem Repo oder aus MATERIAL belegen lässt:
  anhalten und fragen, statt plausibel zu ergänzen.
- Wenn `npm run check` nach zwei Läufen aus einem Grund rot bleibt, der nicht die
  Frische-Regel ist: anhalten und berichten.
- Wenn beim Lesen der Belegdateien auffällt, dass eine andere Datei denselben
  Zyklus-6-Stand falsch behauptet: nur melden, nicht ändern (NICHT-Liste).

---

## MATERIAL — Lernjournal Zyklus 6, Wortlaut aus dem privaten Playbook-Repo

Quelle: `DerStefan89/claude-playbook`, `00-MASTER-BRIEFING.md`, Abschnitt 6,
Eintrag vom 07.08.2026. Aus diesem Repo nicht lesbar, deshalb hier zitiert.

> (1) Der Advisor traf den Plan am härtesten bei einer Alternative, die beim Lesen
> plausibel wirkte und technisch falsch war (`typeof body === 'object'` fängt `null`
> nicht ab — genau den Fall, den V1 verlangt); der Fehler wäre beim Bauen nicht
> aufgefallen, sondern erst im Betrieb.
>
> (2) Falscher Zuschnitt zeigte sich bei Phase 3 (search-Route): Sie liefert keine
> Verhaltensänderung, weil `q` über die Web-API bereits `string | null` ist — gemerkt
> hat es der Advisor, nicht der Plan; die Phase blieb bewusst bestehen, aber als
> „Konsistenz-Phase ohne Verhaltensänderung" umbenannt und mit dem Hinweis versehen,
> dass sie bei Zeitdruck streichbar ist.
>
> (3) Kunden-PO-Erklärung: Ihr Scrum-Wissen gilt weiter — nur wird aus der User Story
> eine Spec mit prüfbaren Aussagen, und sie bekommt einen Abschnitt, den Scrum nicht
> kennt: Nicht-Ziele. Der hält die Arbeit klein, weil ein hilfsbereiter Agent sonst
> nebenan gleich mitrepariert.

Weiter aus demselben Eintrag, für SCOPE-Punkt 7 relevant:

> **Fund mit offener Konsequenz:** Der vollständige qa-Review-Text zu Übung 1
> existiert nicht auf der Platte; `state/tasks/zod-review-fixes.md` verweist auf einen
> Chat-Verlauf. Erhalten sind nur die Findings in Form von Fix und Test. Das verstößt
> gegen den Grundsatz aus Playbook 03 („die Platte ist das Gedächtnis").

Und zur Tor-Abnahme, für SCOPE-Punkt 4:

> **Abweichung von der Tor-Prozedur:** Die zweite Tor-Bedingung (Agile-Übersetzungs-
> tabelle frei anwenden) wurde nicht vom Nutzer selbst demonstriert, sondern vom Coach
> erklärt — Tor dennoch als bestanden gewertet, da alle drei Praxisnachweise
> vollständig als Artefakte vorliegen. Gleiches Vorgehen wie bei Zyklus 5.
