## TASK: tooling-heimat-und-ausschluesse
GOAL: (a) docs/tooling-auswahl.md weist seine Herkunft aus, (b)
state/tooling.md hält fest, was bewusst NICHT installiert ist.

CONTEXT: Die Auswahlprozedur liegt seit Commit 81a9ffe in
docs/tooling-auswahl.md. Inzwischen ist geklärt, dass sie projektübergreifend
gilt: sie liegt als Skill `werkzeug-auswahl` im Playbook-Repo
(DerStefan89/claude-playbook, Commit 57ca0e7) und ist dort ihre Heimat. Die
Fassung hier ist damit eine Kopie — und eine Kopie ohne Herkunftsvermerk ist
nach dem Zwei-Achsen-Modell eine stille zweite Wahrheit. Muster für den
Vermerk: das Ponytail-Vendoring in CLAUDE.md (Quelle + Stand notiert).

Zweitens verlangt das Master-Briefing (Abschnitt 7, Baustein 2) von
state/tooling.md ausdrücklich beides: "Was hier installiert ist, warum, und
was bewusst NICHT". Der zweite Teil fehlt bisher. Die Begründungen unten
stammen aus der Katalog-Recherche vom 07.08.2026.

Reine Doku-Aufgabe, kein Code betroffen.

SCOPE Teil (a): In docs/tooling-auswahl.md direkt unter die H1-Überschrift
"# Auswahlprozedur für neue Skills/MCPs/Plugins" und VOR den Absatz
"Grundregel: ..." folgenden Vermerk einfügen:

> Herkunft: Skelett-Fassung im Playbook-Repo (`skills/werkzeug-auswahl/SKILL.md`),
> Stand 07.08.2026. Diese Datei ist die Projektkopie — Änderungen an der
> Prozedur gehören zuerst ins Playbook, dann hierher.

SCOPE Teil (b): In state/tooling.md UNTER die bestehende Tabelle einen neuen
Abschnitt anfügen:

## Bewusst nicht installiert

Geprüft am 07.08.2026 gegen den Werkzeug-Katalog im Playbook-Repo. Steht
hier, damit dieselbe Prüfung nicht in einem halben Jahr von vorn beginnt.

- **Playwright MCP** — Bedarf besteht und ist terminiert (CLAUDE.md:
  Pflicht vor dem ersten Cashback-Webhook, Phase 6), aber Phase 6 hat noch
  nicht begonnen. Bewusst später, nicht bewusst nie.
- **Supabase MCP** — schreibender Datenbankzugriff, höchster Blast Radius.
  Erst wenn geklärt ist, ob sich der Zugriff auf lesend beschränken lässt.
- **Superpowers** — in Zyklus 6 an einer trivialen Aufgabe beobachtet, dabei
  einen Commit ohne Freigabe ausgeführt. Solange die Freigabedisziplin nicht
  konfigurierbar belegt ist, nicht in diesem Projekt.
- **Design-Skills (frontend-design, Impeccable, taste-skill, UI/UX Pro Max)**
  — die visuelle Referenz ist fixiert (design-refs/, CLAUDE.md). Werkzeuge,
  die Design vorschlagen, arbeiten hier gegen die Design-Treue-Regel.
- **21st.dev Magic MCP** — erzeugt Komponenten für shadcn/ui + Tailwind +
  Radix. Der Stack hier ist CSS Modules ohne Tailwind-Preflight; strukturell
  unpassend.
- **Graphify** — sinnvoll ab etwa 500 Dateien. Dieses Repo hat 466
  versionierte Dateien (Stand 07.08.2026), also knapp darunter. Bei
  deutlichem Wachstum erneut prüfen.
- **claude-mem** — das Projektgedächtnis ist selbst gebaut und verstanden
  (state/memory-map.md, Zwischenstand-Hooks). Ein zweites Gedächtnis daneben
  erzeugt widersprüchliche Wahrheiten; zusätzlich offene Datenschutzfrage,
  weil es jeden Tool-Aufruf mitschreibt.

NICHT: die bestehende Tabelle in state/tooling.md nicht verändern (keine
neuen Spalten, keine geänderten Zeilen); den Status-Wertebereich nicht
erweitern; docs/tooling-auswahl.md inhaltlich nicht ändern, nur den Vermerk
ergänzen; keine weitere Datei anfassen. Kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: beide Dateien per cat; git status.

ESCALATE: Wenn die Zeilennummern oder der Wortlaut in
docs/tooling-auswahl.md vom hier beschriebenen abweichen → anhalten,
tatsächlichen Stand zeigen, nicht blind einfügen.
