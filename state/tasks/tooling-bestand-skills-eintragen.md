## TASK: tooling-bestand-skills-eintragen
GOAL: Die vier bestehenden Skills (git-flow, ponytail, repo-audit,
tool-anlegen) sind als Zeilen in state/tooling.md eingetragen.

CONTEXT: state/tooling.md existiert bereits mit Tabellenkopf (Name | Typ |
Zweck | Quelle/Lizenz | Status | Datum), siehe
state/tasks/tooling-bestand-geruest.md. Für ponytail steht die Quelle
bereits in CLAUDE.md: "ponytail v4.8.4 (fremd, MIT, Quelle:
github.com/DietrichGebert/ponytail) — nur SKILL.md kopiert, kein
ausführbarer Code." tool-anlegen ist laut CLAUDE.md "eigener Skill, im
Repo". Für git-flow und repo-audit ist die Herkunft hier nicht bekannt —
nicht raten.

SCOPE:
- Unter der bestehenden Kopfzeile in state/tooling.md vier Zeilen anfügen,
  eine je Skill: git-flow, ponytail, repo-audit, tool-anlegen
- Zweck: aus der jeweiligen .claude/skills/<name>/SKILL.md ableiten (kurz,
  ein Halbsatz)
- Quelle/Lizenz: für ponytail den oben genannten CLAUDE.md-Stand
  übernehmen; für tool-anlegen "eigen, im Repo"; für git-flow und
  repo-audit aus der jeweiligen SKILL.md ableiten, falls dort vermerkt —
  sonst siehe ESCALATE
- Typ: Skill (bei allen vieren)
- Status: aktiv
- Datum: heutiges Datum (Datum des Eintrags, nicht Erstelldatum des
  Skills)

NICHT: keine SKILL.md-Dateien verändern; keine neuen Spalten einführen;
keine weiteren Skills/MCPs/Plugins ergänzen; kein commit, kein push.

BUDGET: ein Baudurchgang, keine Korrekturrunde erwartet.

OUTPUT: state/tooling.md per cat; git status.

ESCALATE: Wenn Quelle/Lizenz für git-flow oder repo-audit nicht eindeutig
aus SKILL.md oder CLAUDE.md hervorgeht → als "unklar" eintragen und im
Bericht explizit benennen, nicht raten.
