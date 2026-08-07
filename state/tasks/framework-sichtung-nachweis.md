## TASK: framework-sichtung-nachweis
GOAL: state/framework-sichtung-superpowers.md existiert und enthält den für
Übung 3 aus Playbook 06 §8 verlangten Nachweis: 5-Zeilen-Vergleich plus
Entscheidung mit Begründung.

CONTEXT:
- [Fakt] Playbook 06 §8 Übung 3 verlangt: ein Referenz-Framework
  installieren, EINE kleine Aufgabe hindurchfahren, dann
  "5-Zeilen-Vergleich + Entscheidung (adopt/trial/hold) mit Begründung".
- [Fakt] Superpowers (github.com/obra/superpowers) wurde in Zyklus 6
  installiert und an einer trivialen Aufgabe gefahren.
- [Fakt] Beobachtet dabei: es übersprang die eigenen Skills
  `writing-plans` und `requesting-code-review`; es führte einen Commit
  eines Design-Dokuments eigenständig aus, ohne zu fragen.
- [Fakt] Der Katalogeintrag in DerStefan89/claude-playbook
  (WERKZEUG-KATALOG.md, Abschnitt "Plugins & Skills") hält denselben Stand
  bereits fest, aber nicht in der von Übung 3 verlangten Vergleichsform.
- [Schlussfolgerung] Der Nachweis fehlt als Artefakt am Projekt. Ohne ihn
  ist Tor 06 nicht vollständig belegt.
- [offene Unsicherheit] Die Beobachtung deckt nur die triviale
  Aufgabengröße ab. Über das Verhalten bei mittleren und großen Aufgaben —
  gerade dort, wo die Zwei-Stufen-Review greifen soll — liegt keine eigene
  Beobachtung vor.

SCOPE: Neue Datei state/framework-sichtung-superpowers.md mit exakt diesem
Inhalt:

---
# Framework-Sichtung: Superpowers (Übung 3, Playbook 06)

Gefahren in Zyklus 6 an einer trivialen Aufgabe. Quelle:
github.com/obra/superpowers.

## Vergleich mit dem manuellen Kernzyklus

1. **Besser: Zeremonie skaliert mit der Aufgabengröße.** Bei der trivialen
   Aufgabe übersprang es `writing-plans` und `requesting-code-review`,
   statt beides starr zu erzwingen. Der manuelle Zyklus hat diese
   Automatik nicht — dort entscheidet der Mensch jedes Mal neu, was bei
   Kleinkram Aufwand kostet.
2. **Besser: Methodik ist auffindbar statt verstreut.** Die Skills sind
   benannt, durchsuchbar und einzeln aufrufbar. Dasselbe Wissen liegt hier
   verteilt über CLAUDE.md, ARCHITECTURE.md und drei Subagenten — wer es
   nicht kennt, findet es nicht.
3. **Verdeckt: die Auslassung wurde nicht berichtet.** Es hat entschieden,
   Plan und Review wegzulassen — aber nicht gesagt, dass es entschieden
   hat. Im manuellen Zyklus ist die Advisor-vor-Bau-Entscheidung eine
   explizite Zeile, auch wenn sie "nein, unverhältnismäßig" lautet. Eine
   stille richtige Entscheidung ist von einer stillen falschen nicht zu
   unterscheiden.
4. **Verdeckt: Freigabedisziplin.** Der eigenständige Commit ohne
   Rückfrage kollidiert mit der Regel "keine Commits ohne explizite
   Freigabe" (CLAUDE.md). Ob sich das über Permissions abstellen lässt,
   ist ungeprüft.
5. **Ungeprüft: alles oberhalb von trivial.** Die Zwei-Stufen-Review, das
   eigentliche Argument für das Framework, war im beobachteten Lauf gar
   nicht aktiv. Über sie liegt keine eigene Beobachtung vor — nur die
   Beschreibung des Anbieters.

## Entscheidung: trial, eng begrenzt

Einsetzbar für Aufgaben ohne Nebenwirkungen: keine Auth, kein Geld, keine
öffentlichen Endpunkte, keine DB-Writes, wenige Dateien. Dort fangen die
vorhandenen CI-Gates grobe Fehler ohnehin ab.

Nicht einsetzbar, solange nicht geprüft: (a) Aufgaben mit Blast Radius —
dort bleibt der manuelle Zyklus mit Advisor+Reviewer Pflicht; (b) das
Template-Repo selbst, weil Fehler dort in jedes Folgeprojekt vererbt
werden; (c) alles, wo ohne Freigabe committet werden könnte.

Bedingung für eine Höherstufung auf adopt: einmal bewusst an einer
mittleren Aufgabe beobachten, mit besonderem Blick auf
`requesting-code-review`, plus ein Nachweis, dass sich die
Commit-Freigabe erzwingen lässt.

## Bezug

Diese Entscheidung ist die Anwendung der Auswahlprozedur aus
`.claude/skills/werkzeug-auswahl/SKILL.md` (Schritt 5: Blast Radius,
Bewährt an dieser Größe, Freigabedisziplin). Der Katalogeintrag im
Playbook-Repo hält denselben Stand in Katalogform.
---

NICHT: WERKZEUG-KATALOG.md und andere Dateien im Playbook-Repo nicht
anfassen; state/tooling.md nicht ändern; CLAUDE.md nicht ändern; Superpowers
nicht installieren, deinstallieren oder konfigurieren. Kein commit, kein
push.

BUDGET: ein Baudurchgang.

OUTPUT: state/framework-sichtung-superpowers.md per cat; git status.
Grüner Fall: eine neue Datei plus diese Task-Datei als untracked, sonst
nichts.

ESCALATE: Falls die Datei bereits existiert → anhalten, nicht
überschreiben, vorhandenen Inhalt zeigen.
