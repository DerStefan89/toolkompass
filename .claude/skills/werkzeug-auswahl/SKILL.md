---
name: werkzeug-auswahl
description: Prüft, ob ein Skill, MCP oder Plugin in dieses Projekt gehört — Bedarf feststellen, Herkunft prüfen, Risiko bewerten, Entscheidung nach state/tooling.md schreiben. Nutzen, wenn ein neues Werkzeug im Gespräch ist, beim Aufsetzen eines neuen Projekts, oder wenn der Nutzer sagt "brauche ich das", "welches Werkzeug", "soll ich das installieren". NICHT nutzen, um ein bereits installiertes Werkzeug zu bedienen, und nicht als Ersatz für einen Advisor-Pass bei Aufgaben mit Nebenwirkungen.
---

<!-- Vendored aus DerStefan89/claude-playbook, skills/werkzeug-auswahl/SKILL.md
     Stand: 07.08.2026 (Commit 57ca0e7). Änderungen an der Prozedur gehören
     zuerst ins Playbook, dann als neuer Vendoring-Stand hierher. -->

# Werkzeug-Auswahl

**Grundregel: Bedarf zuerst.** Kein Werkzeug wird installiert, weil es
interessant aussieht — nur weil eine konkrete Aufgabe es braucht. Eine
Aufnahme im Werkzeug-Katalog ist keine Empfehlung zur Installation.

## Instructions

1. **Bedarf feststellen — vor allem anderen.** Frage nach der konkreten
   Aufgabe, für die das Werkzeug gebraucht wird. Gibt es keine, endet die
   Prüfung hier: als "Parkplatz" notieren, nicht installieren. Ordne dann
   ein: wiederkehrende Aufgabe → Skill · Zugriff auf ein externes System →
   MCP · ganze Arbeitsweise oder Rolle → Plugin.
2. **Prüfen, ob es das schon gibt.** Vorhandene Skills, Subagenten,
   Slash-Kommandos und selbst gebaute Mechanik zuerst durchsehen. Das
   häufigste Ergebnis einer ehrlichen Prüfung ist "brauchen wir nicht,
   haben wir schon". Zwei Werkzeuge für dieselbe Aufgabe erzeugen
   widersprüchliche Anweisungen, keine doppelte Leistung.
3. **Herkunfts-Check.** Quell-Repo aufrufen — nie einen
   Verzeichnis-Eintrag. Rund um Claude-Skills existiert ein Schwarm von
   Verzeichnis-Websites mit abgeschriebenen und teils erfundenen
   Kennzahlen. Prüfe: Wer pflegt es? Ist eine Lizenz erkennbar? Gibt es
   jüngere Aktivität? Sammelt es Telemetrie, und ist das abschaltbar?
   Bleibt etwas davon unklar, trage "unklar" ein — rate nicht.
4. **Installationsweg bewerten.** Wird nur eine SKILL.md kopiert, oder
   führt die Installation fremden Code aus (npx-Installer, Hooks, Gateway)?
   Skills und Hooks führen Code aus — jede Installation ist eine
   Supply-Chain-Entscheidung. Bei ausführbarem Code: Version pinnen und
   Herkunft dokumentieren. Muster: Ponytail-Vendoring.
5. **Risiko-Kriterien anwenden.**
   - *Blast Radius:* Berührt die Aufgabe Auth, Geld, öffentliche
     Endpunkte, DB-Writes oder schwer Rückgängigmachbares? Wenn ja, bleibt
     der manuelle Zyklus mit Advisor+Reviewer Pflicht — unabhängig davon,
     welches Werkzeug gewählt wird.
   - *Bewährt an dieser Größe?* Ein Werkzeug, das nur an einer trivialen
     Aufgabe beobachtet wurde, ist für eine mittlere nicht belegt. Vor dem
     ersten Einsatz an der größeren Klasse einmal bewusst beobachten.
   - *Freigabedisziplin:* Lässt sich einstellen, dass ohne Freigabe nicht
     committet, gepusht oder geschrieben wird? Ist das nicht
     konfigurierbar, kommt das Werkzeug nicht an Aufgaben mit echten
     Konsequenzen.
   - *Datenwirkung:* Was verlässt die Maschine? Was wird dauerhaft
     mitgeschrieben? Wo liegt es?
6. **Token- und Kostenwirkung benennen.** Unterscheide Grundlast (dauerhaft
   im Kontext, z. B. Werkzeugbeschreibungen eines verbundenen MCP,
   SessionStart-Injektionen) von Kosten je Aufruf. Grundlast ist die
   teurere Sorte, weil sie auch dann anfällt, wenn das Werkzeug ungenutzt
   bleibt.
7. **Entscheidung schreiben — auch die negative.** Ergebnis nach
   `state/tooling.md` des Projekts eintragen: Name, Typ, Zweck,
   Quelle/Lizenz, Status, Datum. Status "geprüft" nach bestandener
   Prüfung, "aktiv" erst nach tatsächlicher Installation. Abgelehnte
   Werkzeuge mit Begründung festhalten — sonst beginnt dieselbe Prüfung
   in einem halben Jahr von vorn.
8. **Nicht entscheiden, wo der Mensch entscheidet.** Schlage vor, begründe,
   benenne das Risiko — installiere nicht selbst. Installation, Erteilen
   von Berechtigungen und das Hinterlegen von Schlüsseln macht der Mensch.

## Grenzen

Dieser Skill wählt aus, er baut nicht. Er ersetzt weder einen
Advisor-Pass vor dem Bauen noch einen Reviewer-Pass danach. Sagt Schritt 5
"Blast Radius vorhanden", ist das Ergebnis dieses Skills die Feststellung,
dass zusätzlich der volle Zyklus nötig ist — nicht dessen Ersatz.
