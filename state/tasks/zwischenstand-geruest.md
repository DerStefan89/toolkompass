## TASK: zwischenstand-geruest
GOAL: Vorlage und zwei Hook-Skripte für den Zwischenstand existieren und sind einzeln
per direktem Aufruf belegt. Noch nicht registriert, noch nicht scharf.

CONTEXT: Ziel ist ein Rückwärts-Handoff, der Compaction und Sitzungswechsel überlebt.
Plan v1 wurde vom `architecture-advisor` geprüft (ein blockierender Befund, neun
Hinweise); Befunde und die daraus folgenden Entscheidungen stehen vollständig in
state/advisor-findings-zwischenstand.md — VOR dem Bau lesen.
Belegte Randbedingungen aus der Primärdoku: SessionStart-Matcher sind startup, resume,
clear, compact, fork; PreCompact-Matcher sind manual und auto; PreCompact ist
blockierbar; die stdout eines Hooks muss ausschließlich das JSON-Objekt enthalten;
additionalContext ist auf 10.000 Zeichen gedeckelt.
Muster für Hook-Skripte in diesem Repo: .claude/hooks/guard-settings.js (stdin lesen,
JSON auf stdout, immer Exit 0) und .claude/hooks/session-reminder.js.

SCOPE:
(1) state/zwischenstand/VORLAGE.md anlegen. Abschnitte in dieser Reihenfolge:
    eine Kopfzeile "Zuletzt aktualisiert: JJJJ-MM-TTThh:mm" als Platzhalter, dann
    "## Plan (fixiert)", "## Stand", "## Entscheidungen", "## Offen / Blockiert".
    Unter jeder Überschrift ein Satz, was dort hineingehört. KEIN
    "Stand dieser Fassung:"-Marker. Am Ende ein Hinweis, dass die Datei 10.000 Zeichen
    nicht überschreiten soll, weil der Ladeweg dort gedeckelt ist.
(2) .gitignore erweitern, im Muster der dort bereits vorhandenen Negation
    (`.yarn/*` + `!.yarn/patches`):
        state/zwischenstand/*
        !state/zwischenstand/VORLAGE.md
    Die Vorlage bleibt versioniert, alle echten Zwischenstände nicht.
(3) .claude/hooks/zwischenstand-laden.js anlegen (später SessionStart):
    Branch über `git rev-parse --abbrev-ref HEAD` ermitteln, Schrägstriche im
    Branchnamen durch Bindestriche ersetzen, Datei state/zwischenstand/<slug>.md
    lesen. Existiert sie nicht: nichts ausgeben, Exit 0. Existiert sie: auf stdout
    ausschließlich
    {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<inhalt>"}}
    ausgeben. Ist der Inhalt länger als 9.500 Zeichen: auf 9.500 kürzen und einen
    deutlichen Hinweis anhängen, dass gekürzt wurde und wo die vollständige Datei liegt.
    Jeder Fehler (kein git-Repo, kein Lesezugriff, kaputte Datei) führt zu stiller
    Rückkehr mit Exit 0 — ein Hook, der den Sitzungsstart scheitern lässt, ist
    schlimmer als kein Hook.
(4) .claude/hooks/zwischenstand-pruefen.js anlegen (später PreCompact):
    stdin-JSON lesen, Feld `trigger` auswerten. Datei wie in (3) bestimmen.
    "Veraltet" heißt: Datei fehlt, oder die Zeile "Zuletzt aktualisiert:" fehlt bzw.
    ist nicht als ISO-8601-Zeitstempel lesbar, oder der Zeitstempel liegt mehr als
    60 Minuten zurück.
    trigger "manual" UND veraltet → Compaction blockieren, mit einer Begründung, die
    den erwarteten Dateipfad nennt und auffordert, den Zwischenstand zu schreiben.
    trigger "auto" → NIEMALS blockieren; bei veraltet nur eine sichtbare Warnung.
    Alles andere → stille Rückkehr, Exit 0.
    Den Blockademechanismus nach der offiziellen Hooks-Doku umsetzen. Ist unklar,
    welche der dokumentierten Varianten für PreCompact greift: die gewählte Variante
    im Bericht benennen und als offene Unsicherheit markieren, nicht stillschweigend
    entscheiden.
(5) Datei-Header-Kommentar in beiden Skripten nach docs/kommentar-standard.md, der
    knapp sagt, wofür das Skript da ist und warum es bei Fehlern still zurückkehrt.

NICHT: Die Hooks in .claude/settings.json registrieren — das macht der Mensch von Hand
in einem eigenen Schritt. CLAUDE.md, docs/harness/HARNESS-OVERVIEW.md oder
state/gates.md ändern. Eine echte Compaction auslösen. Committen oder pushen. Die
Vorlage mit einem "Stand dieser Fassung:"-Marker versehen.

BUDGET: ein Durchgang.

OUTPUT: Kurzbericht. Für jeden der folgenden sechs Aufrufe die wörtliche Ausgabe und
den Exit-Code:
 a) zwischenstand-laden.js ohne vorhandene Zwischenstand-Datei → keine Ausgabe, Exit 0
 b) zwischenstand-laden.js mit einer testweise angelegten Zwischenstand-Datei →
    Ausgabe zusätzlich mit `node -e "JSON.parse(...)"` als gültiges JSON belegen
 c) zwischenstand-pruefen.js, stdin {"trigger":"manual"}, Zwischenstand frisch →
    keine Blockade
 d) zwischenstand-pruefen.js, stdin {"trigger":"manual"}, Zeitstempel künstlich auf
    vor 3 Stunden gesetzt → Blockade mit Begründung
 e) zwischenstand-pruefen.js, stdin {"trigger":"auto"}, derselbe veraltete Stand →
    KEINE Blockade
 f) `git check-ignore state/zwischenstand/<slug>.md` → ignoriert, und
    `git check-ignore state/zwischenstand/VORLAGE.md` → nicht ignoriert
Danach die Testdatei aus b–e wieder löschen und das mit `git status --short` belegen.
Jede Aussage als Fakt / Schlussfolgerung / Annahme / offene Unsicherheit markieren.

ESCALATE: `git rev-parse` schlägt fehl oder liefert einen unerwarteten Wert →
anhalten, Ausgabe vorlegen. Der Blockademechanismus in (4) lässt sich nicht eindeutig
aus der Doku ableiten → anhalten und fragen, nicht raten. Bei fehlender Information:
Rückfrage statt Annahme.

## NACHTRAG (06.08.2026) — Kalibrierung

Rot (SessionStart, Matcher `startup`/`resume`/`compact`/`fork`): Zwischenstand
unter einem absichtlich falschen Dateinamen angelegt (Branch ≠ Dateiname). Frische
Sitzung, Kanarienprobe: auf die Frage nach einem Codewort im Kontext antwortete sie
korrekt "KEIN CODEWORT" — der Hook injiziert nichts, wenn die branch-spezifische
Datei fehlt.

Grün (SessionStart, gleicher Mechanismus): Zwischenstand unter dem korrekten
Dateinamen (`state/zwischenstand/feat-zwischenstand-handoff.md`, ermittelt aus
`git rev-parse --abbrev-ref HEAD` = `feat/zwischenstand-handoff`) angelegt, neues
Codewort im Inhalt. Frische Sitzung nannte das Codewort korrekt wörtlich — die
Injektion über `hookSpecificOutput.additionalContext` ist belegt, nicht nur
angenommen.

Blockade (PreCompact-Skript direkt aufgerufen, `{"trigger":"manual"}`, echte
Zwischenstand-Datei mit künstlich veraltetem Zeitstempel): Skript lieferte
`{"decision":"block","reason":...}` mit dem erwarteten Dateipfad, Exit 0.

Realer Fund dabei, kein gestellter Testfall: der erste Versuch, den Zeitstempel
künstlich zu veralten, schlug fehl, weil die neue Zeit (`2026-08-06T11:00`) über
der tatsächlichen Systemzeit (`14:18`) lag — die Differenz `jetzt - Zeitstempel`
wurde dadurch negativ und damit kleiner als die 60-Minuten-Schwelle, das Skript
stufte den Stand fälschlich als frisch ein und blieb bei sonst korrekter Logik
stumm. Kein Fehler im Skript — ein zukunftsdatierter Zeitstempel ist ein Eingabefall,
den die Schwellenprüfung nicht als Sonderfall behandelt. Nach Korrektur auf einen
Zeitstempel klar VOR der Systemzeit (`12:30`) lieferte derselbe Aufruf die erwartete
Blockade.

Bewusst NICHT belegt: ob eine echte `/compact`-Ausführung in Claude Code das
Top-Level-Feld `decision` bei `PreCompact` tatsächlich respektiert und die
Verdichtung stoppt. Ein Testversuch scheiterte an "Not enough messages to compact"
(zu kurzer Sitzungsverlauf für eine echte Compaction). Die offizielle Doku
(code.claude.com/docs/en/hooks) sagt nur, Top-Level `decision`/`reason` würden
"by some events" verwendet — für `PreCompact` namentlich nicht bestätigt.
Nach Playbook 05 Regel 2 gilt dieser Teil des Gates NICHT als belegt: rot und grün
sind für die Skript-Logik gezeigt, nicht für die Wirkung auf den echten
Claude-Code-Compaction-Ablauf. Wird bei nächster Gelegenheit in einer natürlich
langen Sitzung nachgeholt, nicht künstlich erzwungen.
