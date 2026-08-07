## TASK: werkzeug-auswahl-vendoring
GOAL: Die Auswahlprozedur liegt in diesem Projekt als vendorter Skill unter
.claude/skills/werkzeug-auswahl/SKILL.md statt als Prosa-Dokument;
docs/tooling-auswahl.md ist entfernt; die Herkunft steht in CLAUDE.md nach
dem Ponytail-Muster.

CONTEXT: docs/tooling-auswahl.md (Commit 81a9ffe) war eine Prosa-Fassung
der Auswahlprozedur. Inzwischen liegt die Prozedur als echter Skill im
Playbook-Repo (DerStefan89/claude-playbook,
`skills/werkzeug-auswahl/SKILL.md`, Commit 57ca0e7) und ist dort inhaltlich
weiter — acht Schritte statt vier, plus Abschnitt "Grenzen". Die
Projektfassung war damit schon veraltet, bevor sie committet wurde.

Entscheidung: statt zwei gepflegter Prosa-Fassungen wird der Skill vendored
— Quelle und Stand dokumentiert, kein freihändiger Nachbau. Muster:
ponytail (CLAUDE.md, Zeile "Erwartete Skills"). Begründung: ein Prosa-Doku-
ment in docs/ ist Teil keines Mechanismus, ein Skill schon — er wird über
seine `description` von selbst ausgewählt und ist damit reproduzierbar in
ein neues Projekt übertragbar. Das ist die Eigenschaft, auf die es beim
späteren Template-Extrakt ankommt.

Wichtig: In diesem Arbeitsverzeichnis liegen aus dem vorherigen Task noch
zwei nicht committete Änderungen (Herkunftsvermerk in
docs/tooling-auswahl.md, Abschnitt "Bewusst nicht installiert" in
state/tooling.md). Der Vermerk verschwindet mit der Datei — das ist
beabsichtigt, kein Konflikt. Der Abschnitt in state/tooling.md bleibt.

SCOPE:
1. Datei .claude/skills/werkzeug-auswahl/SKILL.md neu anlegen. Inhalt:
   wortgetreue Kopie von `skills/werkzeug-auswahl/SKILL.md` aus dem
   Playbook-Repo. Der Playbook-Ordner ist als zweites Verzeichnis
   verbunden; Pfad erfragen, falls nicht auffindbar — NICHT aus dem
   Gedächtnis rekonstruieren.
2. Unmittelbar unter der YAML-Frontmatter (also nach der schließenden
   `---`-Zeile) und vor der H1 folgenden Herkunftsblock einfügen — das ist
   die einzige erlaubte Abweichung vom Original:

   <!-- Vendored aus DerStefan89/claude-playbook, skills/werkzeug-auswahl/SKILL.md
        Stand: 07.08.2026 (Commit 57ca0e7). Änderungen an der Prozedur gehören
        zuerst ins Playbook, dann als neuer Vendoring-Stand hierher. -->

3. docs/tooling-auswahl.md löschen (git rm).
4. In CLAUDE.md die bestehende Zeile "Erwartete Skills: ..." um den neuen
   Skill ergänzen, im Stil der vorhandenen Angaben: `werkzeug-auswahl`
   (vendored aus DerStefan89/claude-playbook, Stand 07.08.2026, Commit
   57ca0e7).

NICHT: state/tooling.md nicht anfassen (die Änderung von dort bleibt
unverändert stehen); den Skill-Inhalt nicht umformulieren, kürzen oder
"verbessern"; keine weitere Datei anfassen. Kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: .claude/skills/werkzeug-auswahl/SKILL.md per cat; die geänderte
CLAUDE.md-Zeile; git status (erwartet: neue Skill-Datei, gelöschte
docs/tooling-auswahl.md, geänderte CLAUDE.md, weiterhin geänderte
state/tooling.md aus dem Vortask).

ESCALATE: (a) Das Playbook-Verzeichnis ist nicht erreichbar → anhalten und
zurückmelden, den Skill NICHT aus dem Gedächtnis nachbauen. (b) Der Inhalt
im Playbook weicht von der hier beschriebenen Struktur ab (acht Schritte +
Abschnitt "Grenzen") → tatsächlichen Inhalt zeigen, nicht angleichen.
