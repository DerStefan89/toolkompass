## TASK: bekannte-falle-crlf
GOAL: CLAUDE.md, Abschnitt "⚠️ Bekannte Fallen", enthält einen dritten
Eintrag zur CRLF-/LF-Falle beim Zugriff aus einer Linux-Umgebung.

CONTEXT: Beobachtet am 07.08.2026. Beim Prüfen des Arbeitsverzeichnisses
aus einer Linux-Umgebung (gemountetes Windows-Repo) meldete `git status`
neun zusätzlich geänderte Dateien mit zusammen 1454 geänderten Zeilen
(.claude/hooks/*.js, .gitignore, .worktreeinclude, prisma/schema.prisma,
scripts/check-docs.mjs, scripts/check-rules.mjs, vitest.config.mts) —
obwohl keine davon angefasst worden war.

Ursache verifiziert, nicht vermutet: Die Arbeitskopie hat CRLF-
Zeilenenden (`file .gitignore` → "with CRLF line terminators"), die
Git-Objektdatenbank hält LF (`git show HEAD:.gitignore | cat -A` → nur
`$`, kein `^M$`). In der Linux-Umgebung ist `core.autocrlf` nicht gesetzt,
weshalb Git jede Zeile als geändert sieht. Windows-Git normalisiert und
meldet dieselben Dateien korrekt als unverändert.

Gleiche Fehlerklasse wie die beiden bestehenden Einträge: die Anzeige
täuscht, und wer ihr glaubt, committet Unsinn.

SCOPE: In CLAUDE.md, Abschnitt "## ⚠️ Bekannte Fallen", nach dem
bestehenden NUL-Byte-Eintrag einen dritten Eintrag im selben
Symptom/Was-tun-Format anfügen:

- Symptom: `git status` meldet Dutzende unangetasteter Dateien als geändert, der Diff zeigt jede Zeile als ersetzt (gleiche Zahl Einfügungen und Löschungen) — tritt auf, wenn dasselbe Repo aus einer Linux-Umgebung betrachtet wird (gemountetes Windows-Verzeichnis). Ursache: Arbeitskopie hat CRLF, die Git-Datenbank LF, und `core.autocrlf` ist dort nicht gesetzt.
- Was tun: Nicht von der Linux-Seite aus stagen oder committen — ein `git add -A` dort checkt hunderte Scheinänderungen ein. Windows-Git ist die maßgebliche Sicht. Zum Gegenprüfen aus Linux: `git diff --ignore-cr-at-eol` oder `file <datei>` gegen `git show HEAD:<datei> | cat -A`.

NICHT: die beiden bestehenden Falleneinträge nicht verändern; keinen
anderen Abschnitt von CLAUDE.md anfassen; keine weitere Datei anfassen.
Kein commit, kein push.

BUDGET: ein Baudurchgang.

OUTPUT: der Abschnitt "## ⚠️ Bekannte Fallen" per cat; Ausgabe von
`npm run check` (CLAUDE.md unterliegt dem Doku-Gate); git status.

ESCALATE: Wenn `npm run check` wegen dieser Ergänzung fehlschlägt (z. B.
Doku-Gate beanstandet einen Verweis) → anhalten, Fehlermeldung zeigen,
nicht durch Umformulieren "passend machen", bis klar ist was die Regel
tatsächlich verlangt.
