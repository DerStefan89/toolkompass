## TASK: vitest-befund-korrigieren
GOAL: Die falsche Diagnose aus dem Vortask ist zurückgenommen; der
Falleneintrag beschreibt den tatsächlich belegten Befund; `npm run check`
läuft grün.

CONTEXT: Der Vortask (state/tasks/vitest-pool-forks.md) ging davon aus, der
Vitest-Thread-Pool sei die Ursache des Testausfalls und `pool: 'forks'` die
Lösung. Beides ist widerlegt:

- In Vitest 4 ist `pool` bereits standardmäßig `'forks'` (Typdefinition
  node_modules/vitest/dist/chunks/reporters.d.*.d.ts: `@default 'forks'`).
  Die eingefügte Zeile ist ein No-Op.
- Nach dem Einfügen schlug `npm run check` weiterhin fehl — der Pool war
  also nie der Unterschied.
- Kurz darauf liefen `npx vitest run` UND `npm run test` ohne jede weitere
  Änderung grün durch: 7 Dateien, 35 Tests.

Belegter Befund: Der Testausfall trat mehrfach hintereinander auf
(07.08.2026, ca. 12:37 und 12:46) und war ~20 Minuten später nicht mehr
reproduzierbar, ohne dass am Repo etwas Relevantes geändert wurde. Die
Ursache ist NICHT bekannt. Ein Verdacht besteht (OneDrive-Synchronisation
während des Testlaufs, passend zur bestehenden Falle Nr. 1), ist aber nicht
belegt und darf nicht als Tatsache dokumentiert werden.

SCOPE:
1. In vitest.config.mts die Zeile `pool: 'forks',` samt dem darüber
   stehenden fünfzeiligen Erklärkommentar wieder entfernen. Die Datei soll
   danach exakt dem Stand vor dem Vortask entsprechen (Gegenprobe:
   `git diff vitest.config.mts` zeigt nach der Änderung keine Differenz
   mehr zu HEAD).
2. In CLAUDE.md den vierten Falleneintrag durch folgende Fassung ersetzen
   (die drei bestehenden Einträge bleiben unverändert):

- Symptom: alle Vitest-Dateien scheitern beim Import ("Vitest failed to find the runner", "Cannot read properties of undefined (reading 'config')"), kein einziger Test läuft — obwohl weder Testcode noch Konfiguration geändert wurden. Das blockierende Test-Gate meldet dann Rot, ohne dass etwas kaputt ist.
- Was tun: Erst wiederholen, bevor man etwas repariert — beobachtet am 07.08.2026 (Node v24.16.0, Vitest-Lauf über npm und npx): mehrfach rot hintereinander, ~20 Minuten später ohne jede Änderung grün, 35 Tests. Die Ursache ist ungeklärt; Verdacht ist OneDrive-Synchronisation während des Laufs (siehe erste Falle), nicht belegt. Nicht am Worker-Pool drehen: `pool` ist in Vitest 4 ohnehin `forks`, eine explizite Angabe ändert nichts. Tritt es erneut auf: Uhrzeit, Node-Version und ob OneDrive gerade synchronisiert festhalten — ohne diese Angaben bleibt der Fehler unerklärbar. <!-- check-docs-ignore: beobachtete Node-Version, dokumentiert die Beobachtungsumgebung — keine Versionsanforderung, die steht in package.json unter engines -->

NICHT: keine Testdatei ändern; keine Abhängigkeit installieren oder
aktualisieren; scripts/check-docs.mjs nicht ändern; die drei bestehenden
Falleneinträge nicht anfassen; keine weitere Datei anfassen. Kein commit,
kein push.

BUDGET: ein Baudurchgang.

OUTPUT: `git diff vitest.config.mts` (erwartet: leer); der Abschnitt
"## ⚠️ Bekannte Fallen" per cat; die vollständige Ausgabe von
`npm run check` inklusive Exit-Code; git status.

ESCALATE: `npm run check` schlägt erneut fehl → NICHT reparieren. Den Lauf
ein zweites Mal starten und beide Ausgaben zeigen. Genau dieses Verhalten
(wiederholen statt reparieren) ist der Inhalt des neuen Falleneintrags.
