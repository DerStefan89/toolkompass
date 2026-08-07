## TASK: tooling-bestand-quelle-korrektur
GOAL: Quelle/Lizenz für git-flow und repo-audit in state/tooling.md ist
korrigiert.

CONTEXT: state/tasks/tooling-bestand-skills-eintragen.md hatte für beide
Skills ESCALATE ausgelöst (Herkunft ging weder aus SKILL.md noch aus
CLAUDE.md hervor) und sie korrekt als "unklar" eingetragen. Auf Nachfrage
beim Menschen bestätigt: beide sind selbst geschrieben, wie tool-anlegen.

SCOPE: In state/tooling.md die Spalte "Quelle/Lizenz" für die Zeilen
git-flow und repo-audit von "unklar" auf "eigen, im Repo" ändern (Wortlaut
identisch zur bestehenden tool-anlegen-Zeile). Sonst nichts an der Datei
ändern.

NICHT: keine weiteren Spalten oder Zeilen anfassen; keine SKILL.md-Dateien
anfassen; kein commit, kein push.

BUDGET: ein Baudurchgang.

OUTPUT: state/tooling.md per cat; git status.

ESCALATE: keiner erwartet — bei Abweichung zurückmelden statt selbst
entscheiden.
