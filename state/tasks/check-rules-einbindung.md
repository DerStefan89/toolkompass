## TASK: check-rules-einbindung
GOAL: Das Gate ist blockierend — Teil von `npm run check` und damit des CI-Jobs
`check`.
CONTEXT: `package.json` (Script `check`), `.github/workflows/ci.yml` (Pointer,
tatsächlichen Inhalt vorher lesen statt raten), `state/gates.md` (Tabellenformat für
neue Gate-Zeile, Muster: bestehende Zeilen).
SCOPE: Nur Einbindung. NICHT Branch-Protection-Einstellungen ändern.
BUDGET: ca. 10 Minuten.
OUTPUT: `package.json` erweitert, neue Zeile in `state/gates.md` nach bestehendem
Tabellenformat.
ESCALATE: Falls CI durch Bestandsverstöße rot wird → NICHT die betroffene Datei
stillschweigend ausnehmen oder die Regel abschwächen — anhalten, Befund vorlegen.
