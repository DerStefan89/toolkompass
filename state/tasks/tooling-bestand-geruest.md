## TASK: tooling-bestand-geruest
GOAL: state/tooling.md existiert als neue, dauerhafte Bestandsdatei für
Skills/MCPs/Plugins — nur mit Tabellenkopf, keine Einträge.

CONTEXT: Analog zu den bestehenden dauerhaften state/-Dateien
(state/memory-map.md, state/gates.md, state/triggers.md — nicht
aufgabenspezifisch wie die übrigen state/*.md). Zweck: ein Nachschlage-Ort,
der festhält welche Skills/MCPs/Plugins im Projekt im Einsatz sind, wofür,
und mit welchem Status. Reine Doku-Datei ohne Code, ohne Nebenwirkung —
kein Advisor-Pass nötig.

SCOPE:
- state/tooling.md neu anlegen mit Markdown-Tabelle, Spalten in dieser
  Reihenfolge: Name | Typ | Zweck | Quelle/Lizenz | Status | Datum
- Typ ∈ {Skill, MCP, Plugin}
- Status ∈ {Parkplatz, geprüft, aktiv}
- Nur die Kopfzeile (Überschrift „# Tooling-Bestand" + Tabellenkopf),
  keine Dateneinträge

NICHT: keine Einträge für die vier bestehenden Skills (git-flow, ponytail,
repo-audit, tool-anlegen) eintragen — folgt als eigener, separater Schritt.
Keine anderen Dateien anfassen. Kein commit, kein push.

BUDGET: ein Baudurchgang, keine Korrekturrunde erwartet (trivial).

OUTPUT: Pfad der neuen Datei; Inhalt per cat; Bestätigung per git status,
dass sonst nichts in state/ verändert wurde.

ESCALATE: Falls state/tooling.md bereits existiert → anhalten, nicht
überschreiben, zurückmelden.
