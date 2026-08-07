## TASK: vitest-pool-forks
GOAL: `npm run check` läuft wieder vollständig grün (Exit 0). Die Ursache
des Testausfalls ist in vitest.config.mts umgangen und in CLAUDE.md als
Falle dokumentiert.

CONTEXT: Befund vom 07.08.2026. Alle sieben Testdateien scheiterten beim
Import ("Vitest failed to find the runner", "Cannot read properties of
undefined (reading 'config')"), kein einziger Test lief. Damit war das seit
Zwischenzyklus 4.5 blockierende Test-Gate (state/gates.md, Zeile "Test")
faktisch wirkungslos.

Diagnose belegt, nicht vermutet:
- Abhängigkeitsbaum stimmig: `npm ls vitest @vitest/runner @vitest/expect`
  → alle auf 4.1.10, keine invalid/UNMET-Meldung.
- vitest.config.mts unverändert und unauffällig.
- `npx vitest run --pool=forks` → alle 7 Dateien, 35 Tests grün.
- Standard-Pool (threads) → alle 7 Dateien scheitern beim Import.
- Node-Version: v24.16.0.
- Zeitfenster: Während der Zod-Arbeit lief `npm run check` grün; danach
  wurden ausschließlich Markdown-Dateien geändert. Die Ursache liegt damit
  in der Umgebung, nicht im Repo — ein Node-Update ist der plausibelste
  Auslöser, aber nicht bewiesen.

Einordnung: `pool: 'forks'` ist eine reguläre, unterstützte
Vitest-Einstellung (etwas langsamer, besser isoliert). Sie BEHEBT das
Thread-Problem nicht, sie UMGEHT es. Das ist vertretbar, muss aber als
Umgehung erkennbar bleiben — deshalb Begründung im Kommentar und
Wiedervorlage-Bedingung.

SCOPE:
1. In vitest.config.mts im `test`-Block `pool: 'forks'` ergänzen, mit einem
   Kommentar darüber, der Symptom, Datum, Node-Version und die
   Wiedervorlage-Bedingung nennt. Vorschlag für den Kommentar (Wortlaut
   anpassbar, Inhalt nicht):

   // Worker-Threads (Vitest-Standard) scheitern hier beim Import aller
   // Testdateien ("failed to find the runner"), Fork-Pool läuft grün.
   // Beobachtet 07.08.2026 unter Node v24.16.0; Ursache nicht behoben,
   // sondern umgangen. Bei Node- oder Vitest-Update erneut ohne diese
   // Zeile prüfen und sie entfernen, sobald threads wieder trägt.

2. In CLAUDE.md, Abschnitt "## ⚠️ Bekannte Fallen", einen vierten Eintrag
   im bestehenden Symptom/Was-tun-Format anfügen:

- Symptom: alle Vitest-Dateien scheitern beim Import ("Vitest failed to find the runner", "Cannot read properties of undefined (reading 'config')"), kein einziger Test läuft — obwohl weder Testcode noch Konfiguration geändert wurden. Das blockierende Test-Gate prüft dann nichts mehr, ohne dass es auffällt.
- Was tun: Nicht die Testdateien suchen — die Ursache liegt im Worker-Pool. Gegenprobe: `npx vitest run --pool=forks`. Läuft es damit, ist es der Thread-Pool (beobachtet 07.08.2026 unter Node v24.16.0), Umgehung ist `pool: 'forks'` in vitest.config.mts. Grundsätzlich: ein Gate kann durch eine Umgebungsänderung sterben, ohne dass jemand etwas am Repo tut — deshalb gehört zu jedem Commit die tatsächliche Ausgabe von `npm run check`, nicht die Erinnerung daran.

NICHT: keine Testdatei ändern; keine Abhängigkeit installieren,
aktualisieren oder entfernen; die Node-Version nicht ändern; die drei
bestehenden Falleneinträge nicht anfassen; keine weitere Datei anfassen.
Kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: vitest.config.mts per cat; der Abschnitt "## ⚠️ Bekannte Fallen"
per cat; die VOLLSTÄNDIGE Ausgabe von `npm run check` inklusive Exit-Code;
git status.

ESCALATE: (a) `npm run check` bleibt rot → anhalten, vollständige Ausgabe
zeigen, NICHT weitere Konfigurationsschalter ausprobieren, bis der neue
Fehler benannt ist. (b) Mit `pool: 'forks'` in der Konfiguration laufen
weniger als 35 Tests → anhalten, Abweichung zur manuellen Gegenprobe
benennen.
