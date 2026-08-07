# Auswahlprozedur für neue Skills/MCPs/Plugins

Grundregel: Bedarf zuerst. Kein Werkzeug wird installiert, weil es
interessant aussieht — nur weil eine konkrete Aufgabe es braucht.

## Schritt 1 — Bedarf feststellen
Welche Aufgabe braucht das Werkzeug genau? Wiederkehrende Aufgabe → Skill.
Zugriff auf ein externes System → MCP. Ganze Arbeitsweise/Rolle → Plugin.

## Schritt 2 — Herkunfts-Check
Vertrauenswürdiges/offizielles Repo? Lizenz erkennbar? Wird es aktiv
gepflegt? Sammelt es Telemetrie, und ist das dokumentiert/abschaltbar?

## Schritt 3 — Risiko-Kriterien
- Blast Radius: berührt die Aufgabe Auth, Geld, öffentliche Endpunkte,
  DB-Writes oder Schwer-Rückgängigmachbares? Wenn ja: der manuelle Zyklus
  mit Advisor+Reviewer bleibt Pflicht, unabhängig vom Werkzeug.
- Bewährt an dieser Größe? Nur an einer trivialen Aufgabe beobachtet, aber
  für eine mittlere/große Aufgabe gedacht? Dann erst bewusst an einer
  mittleren Aufgabe testen, bevor es produktiv läuft.
- Freigabedisziplin: lässt sich das Werkzeug so einstellen, dass "kein
  Commit/Push ohne Freigabe" gilt? Wenn nicht konfigurierbar → nicht für
  Aufgaben mit echten Konsequenzen.

## Schritt 4 — Eintragen
Status "geprüft" in state/tooling.md, mit Datum und Kurzergebnis. Erst
nach bestandener Prüfung auf "aktiv" setzen.
