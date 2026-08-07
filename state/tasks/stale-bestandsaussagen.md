## TASK: stale-bestandsaussagen
GOAL: Vier veraltete Bestandsaussagen in Anweisungsdokumenten stimmen wieder
mit dem Repo überein; `npm run check` bleibt grün.

CONTEXT:
- [Fakt] Gefunden am 07.08.2026 beim Harness-Abgleich (ESCALATE-Meldung).
- [Fakt] `CLAUDE.md` Z. 60: "Zod ist seit Zyklus 6 im Einsatz
  (app/api/anfrage, app/api/track/[linkId], …)". Tatsächlich importieren
  drei Routen Zod: app/api/anfrage/route.ts, app/api/search/route.ts,
  app/api/track/[linkId]/route.ts (verifiziert per grep). `search` fehlt in
  der Aufzählung; `app/auth/confirm/route.ts` ist weiterhin ohne Zod
  (Phase 5 offen).
- [Fakt] `docs/harness/HARNESS-GLOSSARY.md` Z. 14 ("Skill") listet
  `tool-anlegen`, `ponytail`, `repo-audit`. Tatsächlich liegen fünf Skills
  unter .claude/skills/: zusätzlich `git-flow` (seit Zyklus 4) und
  `werkzeug-auswahl` (seit 07.08.2026, vendored).
- [Fakt] `docs/harness/HARNESS-GLOSSARY.md` Z. 26 ("Test") sagt "Aktuell
  keiner im Projekt". Tatsächlich laufen 35 Vitest-Tests in sieben Dateien,
  blockierend in `npm run check` seit Zwischenzyklus 4.5.
- [Fakt] `docs/harness/HARNESS-GLOSSARY.md` Z. 34 ("Validierung") sagt "Für
  API-Endpunkte noch offen". Siehe oben: an drei von vier Endpunkten
  erledigt.
- [Schlussfolgerung] Alle vier sind Anweisungsdokumente bzw.
  Nachschlagewerke, die wörtlich wahr sein müssen — kein Planungsdokument,
  bei dem Veraltetes normal wäre.
- [offene Unsicherheit] Der Zod-Stand wird an mindestens drei Stellen
  behauptet (CLAUDE.md, docs/STATUS.md, HARNESS-GLOSSARY.md). docs/STATUS.md
  wurde am 07.08.2026 bereits korrigiert (Commit ae703f6), die anderen
  beiden nicht — der Fakt hat keine Heimat. Ob eine Verweisstruktur statt
  drei Kopien sinnvoll ist, ist hier NICHT zu entscheiden, sondern im
  Bericht als Frage zu benennen.

SCOPE:
1. `CLAUDE.md` Z. 60: die Aufzählung um `app/api/search` ergänzen, sodass
   drei Routen genannt sind. Satzbau sonst unverändert.
2. `docs/harness/HARNESS-GLOSSARY.md` Z. 14, letzte Spalte: `git-flow` und
   `werkzeug-auswahl` ergänzen, Formatierung der bestehenden Einträge
   übernehmen (Backticks).
3. `docs/harness/HARNESS-GLOSSARY.md` Z. 26, letzte Spalte: "Aktuell keiner
   im Projekt" ersetzen durch eine Angabe, die den Ist-Stand nennt —
   Vitest, blockierend in `npm run check` seit Zwischenzyklus 4.5. Keine
   Testanzahl hineinschreiben (veraltet sofort).
4. `docs/harness/HARNESS-GLOSSARY.md` Z. 34, letzte Spalte: "Für
   API-Endpunkte noch offen" ersetzen durch eine Angabe, die den Ist-Stand
   nennt — Zod an drei von vier Endpunkten, `/auth/confirm` offen, Muster
   in `specs/zod-eingabevalidierung.md`.

NICHT: keine Route und keinen Testcode ändern; keine weiteren Zeilen von
HARNESS-GLOSSARY.md anfassen; docs/STATUS.md nicht anfassen (bereits
korrekt); keine Verweisstruktur einführen (siehe offene Unsicherheit);
keine Datei im Playbook-Repo anfassen. Kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: die vier geänderten Zeilen per sed; Ausgabe von `npm run check`
inklusive Exit-Code; git status. Grüner Fall: zwei Dateien modifiziert,
diese Task-Datei untracked, `npm run check` Exit 0.

ESCALATE: (a) Das Doku-Gate beanstandet eine der Änderungen → anhalten,
Befund zeigen, nicht durch Umformulieren passend machen. (b) `npm run
check` rot → erst ein zweites Mal laufen lassen und beide Ausgaben zeigen
(vierter Falleneintrag in CLAUDE.md). (c) Beim Ändern fallen weitere
veraltete Bestandsaussagen auf → nicht korrigieren, sondern mit Datei und
Zeilennummer auflisten.
