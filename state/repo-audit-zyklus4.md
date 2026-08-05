# Repo-Audit Zyklus 4 — Playbook 04 (Orchestrierung & Loops) gegen `toolkompass`

Ist-Zustand-Scan nach dem Muster des Skills `.claude/skills/repo-audit/SKILL.md` — erstmals
auf ein echtes Playbook-Thema angewendet statt auf Doku-Drift. Erstellt am 04.08.2026, vor
Beginn von Zyklus 4 (`docs/harness/HARNESS-LEARNING-STATE.md` Z. 15: Zyklus 4 🚪⬜, nicht
begonnen).

**Grenzen dieses Dokuments:** Analyse und Vorschlag. Keine Änderung an Produktivcode, kein
Worktree, kein Branch, kein Trigger, kein Cron real angelegt. Kein Commit, kein Push.

**Aktualität der Quelle:** Jüngster Eintrag im Änderungslog des Master-Briefings
(`claude-playbook/00-MASTER-BRIEFING.md`, Abschnitt 6) ist vom 2026-08-04 („Tor 05 bestanden,
Zyklus 3 abgeschlossen"). Das ist der zuletzt abgeschlossene Zyklus — die vorliegende Fassung
von `04-ORCHESTRIERUNG-LOOPS.md` ist damit aktuell. **[Fakt]**

**Evidenz-Marker** (Muster: `state/assumption-ledger.md`, `state/advisor-findings-pricing.md`):
**[Fakt]** im Repo/in der Doku belegt · **[Schlussfolgerung]** aus Fakten abgeleitet ·
**[Annahme]** unbelegte Prämisse · **[offene Unsicherheit]** weder belegt noch widerlegt.

---

## Abschnitt 1 — Findings

### 1.1 Die acht Konzepte

| # | Konzept | Vorhanden? | Beleg (Datei : Zeile) | Bewertung | Marker |
|---|---|---|---|---|---|
| 1 | **Orchestrator** (zerlegt, weist zu, führt zusammen — fasst keinen Inhalt an) | Nein, auch nicht ansatzweise. Die Rolle wird ausdrücklich **nicht** besetzt. | `CLAUDE.md` Z. 132–133: „Für das Bauen selbst gibt es bewusst keine Rollen-Datei". `docs/harness/HARNESS-GLOSSARY.md` Z. 21 behauptet „In CLAUDE.md genannt, real nicht als Datei vorhanden" — der erste Halbsatz ist **falsch**: `grep -i orchestr` findet in `CLAUDE.md` keinen Treffer (Rest-Drift aus der Neun-Rollen-Zeit, s. `docs/STATUS.md` Z. 138–141). | Keine Lücke im Playbook-Sinn: Zerlegen/Zuweisen/Zusammenführen macht heute der Mensch, und es gibt genau einen Schreiber (`CLAUDE.md` Z. 78–79). Ein Orchestrator ohne Worker hätte niemanden zu steuern — Wachstumsreihenfolge (Playbook 04 §1) erlaubt ihn erst nach Übung 2. **Nebenbefund:** Glossar-Zeile 21 ist zu korrigieren. | **[Fakt]** + **[Schlussfolgerung]** |
| 2 | **Stern** (Orchestrator → parallele, unabhängige Worker) | Nur als **Prüf-Stern**, nicht als Arbeits-Stern. | `CLAUDE.md` Z. 127 („Nach jeder UI-Aufgabe Pflicht: `frontend-reviewer` und `design-guardian`") fächert dieselbe Arbeit an mehrere unabhängige Kontexte auf. Aber: alle vier Agenten sind schreibgeschützt (`.claude/agents/*.md` je Z. 4 `tools: Read, Grep, Glob`) — es gibt keine Worker, nur Prüfer. | Echte Lücke, aber **aktuell durch eine Regel gesperrt**: `CLAUDE.md` Z. 78 „Ein Task nach dem anderen — nie parallel". Diese Zeile steht in Spannung zu Z. 79, die parallele Arbeit in getrennten Worktrees ausdrücklich erlaubt. → Muss **vor** Übung 2 entschieden werden, s. 1.4. | **[Fakt]** + **[Schlussfolgerung]** |
| 3 | **Pipeline** (A→B→C mit Übergabe-Artefakt je Stufe) | Ja, einmal real durchlaufen — als Hand-Pipeline, nicht als Automatik. | `docs/harness/HARNESS-LEARNING-STATE.md` Z. 47–51: Plan v1 → Advisor-Findings → Plan v2 → Bau → Review → Merge. Übergabe-Artefakte liegen auf der Platte: `state/plan-v1-pricing.md`, `state/advisor-findings-pricing.md`, `state/plan-v2-pricing.md`. Soll-Ablauf beschrieben in `docs/harness/HARNESS-OVERVIEW.md` Z. 71–73. Zweite, rein technische Pipeline: `.github/workflows/ci.yml` Z. 11–30 (Checkout → Node → `npm ci` → `npm run check` → Secret-Scan). | Vorhanden und belegt. Was fehlt: die Stufenübergänge liefen per Prosa-Prompt, nicht per Handoff-Vertrag (Playbook 04 §4) — genau die Stelle, an der Context Drift entsteht. | **[Fakt]** |
| 4 | **Council** (mehrere unabhängige, adversariale Prüfer auf ein Artefakt) | Ansatzweise: Struktur da, adversariale Instruktion und Zusammenführung fehlen. | Vier unabhängige, schreibgeschützte Prüfkontexte: `.claude/agents/{frontend-reviewer,design-guardian,qa,architecture-advisor}.md`. Ein echter adversarialer Einzelpass ist belegt: `state/advisor-findings-pricing.md` Z. 3–5 („adversarial instruiert … hat den Plan gegen den echten Code geprüft, nicht dem Plan blind geglaubt") mit Urteil „Nicht freigegeben" (Z. 100) — das Nein hat den Plan tatsächlich angehalten (Plan v2 folgte). | Teil-Lücke, nicht dringend: Was fehlt, ist der *gleichzeitige* Fächer verschiedener adversarialer Rollen auf **dasselbe** Artefakt plus eine Regel, wie widersprüchliche Urteile aufgelöst werden. Die Befugnis-Frage aus Playbook 04 §2 („Wer darf wen stoppen?") ist heute nur sozial beantwortet: `CLAUDE.md` Z. 129–130 — Prüfer melden, der Mensch entscheidet. | **[Fakt]** + **[Schlussfolgerung]** |
| 5 | **Handoff-Vertrag** (`GOAL/CONTEXT/SCOPE/BUDGET/OUTPUT/ESCALATE` unter `state/tasks/`) | Nein. `state/tasks/` existiert nicht (`state/` enthält genau 5 Dateien, keine davon ein Vertrag). | Nächstverwandtes vorhandenes Format: das Briefing in `CLAUDE.md` Z. 64–72 (Ziel · Design-Referenz · Komponenten/Daten · Zustände · Akzeptanzkriterien · Risiken) — Mensch→Agent, ohne BUDGET, ohne OUTPUT-Pfad, ohne SCOPE-Negativliste, ohne ESCALATE. Zweite Vorstufe: die Anhang-A-Prompt-Standards, laut `docs/harness/HARNESS-LEARNING-STATE.md` Z. 102–104 bereits Pflicht vor dem Senden (Persona/Task/Context/Format, DoD, Grenzen, Eskalationspfad) — decken ESCALATE und SCOPE ab, landen aber **im Fenster, nicht auf der Platte**. | Echte Lücke, aber halb vorbereitet: Es fehlt nicht das Denken, sondern die Datei. Genau das ist Anti-Pattern 2 („Context Drift im Team", Playbook 04 §8) — und der real belegte Drift-Vorfall aus Zyklus 3 (Pflicht-Agents wurden per Verweis statt wörtlich übergeben, `HARNESS-LEARNING-STATE.md` Z. 96–98) ist sein Symptom. | **[Fakt]** + **[Schlussfolgerung]** |
| 6 | **Worktrees & Isolation** | Als **Regel** vorhanden, **nie angewendet**. | `CLAUDE.md` Z. 79: „parallele Arbeit nur in getrennten git-Worktrees". Regel entstand aus echtem Schaden: `docs/STATUS.md` Z. 154–158 (`WORKFLOW.md` empfahl drei parallele Sitzungen im selben Ordner) und `HARNESS-LEARNING-STATE.md` Z. 117–122 (zwei beschädigte Tabellenzellen in `state/assumption-ledger.md` durch Zweitschreiber). Gegenprobe: kein `.claude/worktrees/`-Verzeichnis, kein Eintrag dafür in `.gitignore` (Z. 1–57), keine `.worktreeinclude`, kein `isolation: worktree` in einem der vier Agent-Frontmatter. | Echte Lücke — und die einzige mit belegtem Vorschaden. Playbook 04 §5: Isolation wird VOR der ersten Parallelität gebaut. Sie ist also die Voraussetzung von Übung 2, nicht deren Ergebnis. Drei repo-spezifische Stolpersteine vor dem ersten `--worktree`: s. 1.3. | **[Fakt]** |
| 7 | **Trigger-Architektur** | Trigger existieren real (sechs Stück), ein Inventar existiert nicht. `state/triggers.md` fehlt. | **Event/Repo:** `.github/workflows/ci.yml` Z. 3–6 (`push` auf `main`, `pull_request`) → Job `check`. **Event/Agent-Werkzeug:** `.claude/settings.json` Z. 19–25 `PreToolUse` (`Edit|Write` → `guard-settings.js`), Z. 27–33 `PostToolUse` (`Edit|Write` → `npm run lint`), Z. 35–41 `UserPromptSubmit` (→ `session-reminder.js`). **Event/Mensch:** Slash-Command `/lessons` (`.claude/commands/lessons.md`). **Zeit/Cron:** keiner — kein `schedule:` in `ci.yml`, kein Cron im Repo. | Echte, kleine Lücke mit klarem Nutzen. `state/gates.md` deckt die *blockierende Wirkung* ab, nicht die *Auslösung*: kein Trigger hat dort Besitzer, Cap oder Eskalationsweg. Sechs undokumentierte Trigger sind Anti-Pattern 4 („Geister-Trigger") in Zeitlupe — heute harmlos, weil alle sechs von derselben Person eingerichtet wurden und im Kopf präsent sind. | **[Fakt]** + **[Schlussfolgerung]** |
| 8 | **Claude Managed Agents / Cloud-Betrieb** | Nein, und **zu Recht nicht** — kein Loop existiert, der die Maschine verlassen müsste. | Kein Agent im Repo läuft ohne Menschen: die vier Subagenten werden in einer Sitzung delegiert, die CI läuft ereignisgetrieben auf GitHub-Runnern (`ci.yml` Z. 10), es gibt keinen Zeit-Trigger (s. Zeile 7) und keinen Kundenbezug. `docs/harness/HARNESS-GLOSSARY.md` Z. 22 bestätigt: „Loop … Playbook-04-Thema, noch nicht gebaut". | Keine Lücke, sondern korrekt angewandte Entscheidungsregel aus Playbook 04 §7 („Prototyp lokal → Dauerbetrieb mit Kundenbezug: verwaltet"). Der nächste echte Anlass wäre ein **Zeit-Trigger**; der wäre mit GitHub Actions `schedule` (bereits vorhandene Infrastruktur) billiger als Managed Agents. | **[Fakt]** + **[Schlussfolgerung]** |

### 1.2 Websuche zum Feature-Stand (Ebene B) — Pflicht vor der Bewertung von 6 und 8

Geprüft am 04.08.2026 gegen die Primärdoku, nicht gegen Blogposts.

**Worktrees — Playbook-Aussage ist im Kern richtig, im Detail veraltet.** **[Fakt]**

| Playbook 04 §5 sagt | Doku-Stand 04.08.2026 | Konsequenz |
|---|---|---|
| `claude --worktree fix/<slug>` | `claude --worktree <name>` oder `-w <name>`. Das Argument ist ein **Name**, kein Branch-Pfad: Claude legt `.claude/worktrees/<name>/` an und erzeugt daraus den Branch `worktree-<name>`. Ohne Namen wird einer generiert. | Befehlszeile im Playbook nachschärfen — `fix/<slug>` erzeugt nicht den erwarteten Branchnamen. |
| (nicht erwähnt) | **`isolation: worktree` im Subagent-Frontmatter** — ein Subagent läuft dauerhaft in eigenem Worktree. | Direkt relevant: das ist die billigste Isolation für Übung 2, ohne zweite Sitzung. |
| (nicht erwähnt) | `.worktreeinclude` (gitignorierte Dateien wie `.env` in jeden neuen Worktree kopieren), `worktree.baseRef` (`fresh`/`head`), `--worktree "#1234"` (aus PR), `EnterWorktree`/`ExitWorktree`-Tools, automatischer Aufräum-Sweep nach `cleanupPeriodDays`. | Für `toolkompass` ist `.worktreeinclude` **nicht optional**, s. 1.3. |
| (nicht erwähnt) | **Agent Teams** — mehrere Claude-Code-Sitzungen mit geteilter Task-Liste und Mailbox, Lead + Teammates, die einander direkt schreiben. Experimentell, standardmäßig **aus** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), dokumentierte Limitierungen (kein `/resume` für In-Process-Teammates, keine verschachtelten Teams, Lead nicht wechselbar, deutlich höhere Token-Kosten). | **Echte Abweichung zum Playbook:** Playbook 04 §3 kennt nur Stern (Worker melden an den Orchestrator) und Council. Agent Teams sind eine vierte, dazwischenliegende Form — Peers, die sich gegenseitig widersprechen können. Für Zyklus 4 bewusst **nicht** einsetzen (experimentell + Rudel-Start-Risiko, Anti-Pattern 3), aber im Playbook als Fußnote nachtragen. |

**Managed Agents — Playbook-Aussage ist zu pessimistisch und in der Begrifflichkeit ungenau.** **[Fakt]**

| Playbook 04 §7 sagt | Doku-Stand 04.08.2026 | Konsequenz |
|---|---|---|
| „Sessions, Memory Stores, Dreams — Research-Preview-Status" | Managed Agents ist in **öffentlicher Beta** (Beta-Header `managed-agents-2026-04-01`), **für alle API-Konten standardmäßig freigeschaltet**. Memory (Public Beta seit 23.04.2026). **Nur** Dreaming und MCP-Tunnel sind noch eingeschränkte Research Preview mit separatem Zugangsformular. | Die pauschale Einordnung „Research Preview" gilt nur noch für Dreams. Playbook-Satz differenzieren. |
| Kernkonzepte nicht benannt | Vier Kernkonzepte: **Agent · Environment · Session · Events**. „Memory Store" ist ein Unterthema, keine Kernebene. | Begriffsliste im Playbook nachziehen. |
| (nicht erwähnt) | **Scheduled Deployments** (wiederkehrende Agent-Läufe per Cron) und **Multiagent-Orchestration** sind eigene Doku-Kapitel. | Gehört sachlich in §6 (Trigger-Architektur, Zeile „Zeit/Cron"), nicht nur in §7. |
| „vor Kundeneinsatz Doku prüfen!" | Bestätigt und konkretisierbar: Managed Agents ist zustandsbehaftet und **nicht** ZDR-fähig, **kein** HIPAA-BAA. | Warnung im Playbook mit diesem konkreten Grund unterlegen. |

**Nicht geprüft / offen:** Ob die neuen Worktree-Optionen in der von Stefan genutzten
VS-Code-Extension identisch funktionieren wie in der Terminal-CLI. Zyklus 3 hat gezeigt, dass
die Extension von der Doku abweichen kann (`state/gates.md` Z. 49–67,
`anthropics/claude-code#13339`). **[offene Unsicherheit]**

### 1.3 Drei repo-spezifische Stolpersteine vor dem ersten Worktree

1. **OneDrive-Reparse-Points.** `CLAUDE.md` Z. 161–162 dokumentiert bereits, dass `git add`
   in diesem Ordner wegen OneDrive-Reparse-Points Dateien stillschweigend übergeht. Die
   Worktree-Doku nennt zwei passende Fallen: Worktree-Erzeugung **verweigert**, wenn
   `.claude`, `.claude/worktrees` oder das Worktree-Verzeichnis ein Symlink ist; und beim
   Entfernen unter Windows löscht Claude nur den Link, nicht das Ziel. → Vor Übung 2 prüfen,
   ob `.claude` in diesem OneDrive-Ordner ein echtes Verzeichnis ist. **[Schlussfolgerung]**
2. **`.gitignore` kennt `.claude/worktrees/` nicht** (`.gitignore` Z. 1–57). Ohne Eintrag
   erscheint jeder Worktree-Inhalt als untracked im Hauptcheckout — genau das
   Verwirrungsmuster, das Zyklus 2.5 schon einmal aufgeräumt hat. **[Fakt]**
3. **`.env` und `.env.local` sind gitignoriert** (`.gitignore` Z. 34) und werden in einen
   frischen Worktree **nicht** mitkopiert. Ohne sie läuft weder Prisma noch Supabase noch
   `npm run build`. → `.worktreeinclude` mit `.env`, `.env.local` ist Voraussetzung, nicht
   Komfort. **[Schlussfolgerung]**

### 1.4 Was vor Zyklus 4 entschieden werden muss (nicht geraten, sondern vorgelegt)

- **Regelkonflikt `CLAUDE.md` Z. 78 vs. Z. 79.** Z. 78 verbietet Parallelität ausnahmslos,
  Z. 79 erlaubt sie in getrennten Worktrees. Übung 2 verlangt sie. Beide Zeilen stammen aus
  echtem Schaden und sind nicht falsch — aber die Reihenfolge ihrer Geltung ist ungeklärt.
  Vorschlag zur Entscheidung (nicht Festlegung): Z. 78 auf „ein Task pro Arbeitsverzeichnis"
  umformulieren, damit Z. 79 die Ausnahme sauber trägt. **[offene Unsicherheit]**
- **Zählt der Pipeline-Durchlauf aus Zyklus 3 als „Loop" im Sinne von Playbook 04?** Er hatte
  Stufen, Übergabe-Artefakte und einen Evaluator mit Stoppwirkung — aber keinen Trigger und
  keine Wiederholung; jede Stufe wurde von Hand angestoßen. Ich markiere das bewusst als
  ungeklärt statt es zu behaupten. **[offene Unsicherheit]**
- **Nebenbefund zur Korrektur** (kein Playbook-04-Thema, aber Repo-Drift): `docs/STATUS.md`
  Punkt 5 beschreibt die Dry-Run-Umstellung als offen („9 Scripts"), `ARCHITECTURE.md`
  Z. 129–131 meldet sie als erledigt („umgesetzt in allen zehn Scripts"). Eines von beidem
  ist veraltet. **[Fakt]**

---

## Abschnitt 2 — Übungsplan-Vorschlag (Vorschlag, keine Festlegung)

Alle drei Übungen greifen auf bereits dokumentierte offene Punkte zu. Keine erfundene
Beispielaufgabe. Reihenfolge ist bewusst: Isolation vor Parallelität (Playbook 04 §5).

### Übung 1 — Handoff-Vertrag (45 min)

**Vorgeschlagene echte Aufgabe: `scripts/check-rules.mjs` bauen.**
Belegt als offen an drei Stellen: `docs/STATUS.md` Punkt 1 (Z. 62–72), `state/gates.md` Z. 8
(„geplant, noch nicht vorhanden", einzige Gate-Zeile ohne Evidenz), `HARNESS-OVERVIEW.md`
Z. 87–88 („einziger noch offener Punkt aus der ursprünglichen Zyklus-3-Liste").

Warum diese und keine andere: Sie ist echt mehrschrittig (vier zu prüfende Regeln plus
Einbindung), sie ist **im Scope** (`docs/STATUS.md` ist die Scope-Quelle, und sie steht dort),
sie berührt keinen Produktivcode, und sie hat ein natürliches Abbruchkriterium für ESCALATE
(Fehlalarm-Rate — laut `HARNESS-GLOSSARY.md` Z. 46 „größtes Risiko für Gate-Akzeptanz").

Zerlegung in drei Verträge unter `state/tasks/`:

| Vertrag | GOAL (prüfbar) | OUTPUT | Negativliste im SCOPE | ESCALATE |
|---|---|---|---|---|
| `check-rules-geruest.md` | `node scripts/check-rules.mjs` läuft, prüft `as any`/`: any` und `<img `, Exit 1 bei Treffer, Exit 0 bei sauberem Baum | `scripts/check-rules.mjs` | Keine Einbindung in `npm run check`, keine `ci.yml`-Änderung, keine Reparatur gefundener Verstöße | Mehr als 0 Fehlalarme im Bestand → stoppen und vorlegen |
| `check-rules-regeln-2.md` | Zusätzlich `take` ohne `skip` und `createClient()` in Actions; beide mit je einem bewusst erzeugten Gegentest rot **und** grün belegt | Ergänzung derselben Datei + Nachweis im Vertrag | Keine neuen Regeln über die vier aus STATUS Punkt 1 hinaus | Regel nicht ohne Fehlalarm formulierbar → als offene Unsicherheit melden statt entschärfen |
| `check-rules-einbindung.md` | Gate ist blockierend: in `npm run check` und damit im CI-Job `check` | `package.json`, `.github/workflows/ci.yml`, neue Zeile in `state/gates.md` | Keine Änderung an Branch-Protection-Einstellungen | CI wird rot wegen Bestandsverstößen → nicht stillschweigend ausnehmen, vorlegen |

CONTEXT jeweils als **Pointer**: `ARCHITECTURE.md` §7 (Verbotstabelle), `state/gates.md`,
`scripts/check-docs.mjs` als Vorbild — keine Textkopien in den Vertrag.
**Nachweis laut Playbook:** die drei Vertragsdateien + 3 Sätze zur Drift-Stelle.

**Alternative, falls das zu groß wirkt:** `docs/STATUS.md` Punkt 16 (Schema-Validierung der
vier bestehenden Endpunkte). Zerfällt ebenso sauber in Verträge, ist aber die größere
Scope-Entscheidung, weil Zod laut `CLAUDE.md` Z. 56 aktuell bewusst nicht im Projekt ist.

### Übung 2 — Stern mit Isolation (60–90 min)

**Vorbedingung (nicht Teil der Übung, aber davor):** Regelkonflikt aus 1.4 entscheiden, die
drei Stolpersteine aus 1.3 abräumen (`.claude` kein Reparse-Point · `.claude/worktrees/` in
`.gitignore` · `.worktreeinclude` mit `.env`, `.env.local`).

**Zwei nachweislich unabhängige Tasks, disjunkte Dateimengen, beide bereits dokumentiert:**

| | Task α | Task β |
|---|---|---|
| Was | Dry-Run von `seed-rating-criteria.ts` nimmt denselben Codepfad wie der Echtlauf (statt Fake-IDs `dry-0`, `dry-1` und `count` statt echter Tool-IDs) | `zricethezav/gitleaks:latest` auf festen Tag/Digest pinnen + Entscheidung zu `actions/checkout`/`setup-node` v5 → v7 |
| Beleg | `docs/STATUS.md` Punkt 21 (Z. 109–117) | `state/assumption-ledger.md` A4 (Z. 12) + `docs/STATUS.md` Punkt 20 (Z. 105–108) |
| Berührte Dateien | `scripts/seed-rating-criteria.ts` | `.github/workflows/ci.yml` |
| Prüfer | `qa` (Randfälle Dry-Run vs. Echtlauf) | `architecture-advisor` (Plan vor Umsetzung: Pinning-Strategie) |
| Überschneidung | **keine** — verschiedene Verzeichnisse, verschiedene Prüfer | |

Isolation je Task über `claude --worktree seed-dryrun` bzw. `claude --worktree ci-pinning`,
Ergebnisse als zwei getrennte PRs — was ohnehin der einzige Weg nach `main` ist
(`state/gates.md` Z. 25–27: direkter Push technisch ausgeschlossen).

Eine Warnung, die aus dem Repo selbst kommt: Task β ändert die CI, die Task α prüft. Die
Dateimengen sind disjunkt, die **Prüfumgebung** ist es nicht. Das ist kein Grund, das Paar zu
verwerfen — aber genau die Sorte Kopplung, die der Nachweis „kein Merge-Konflikt" nicht
abdeckt. Reihenfolge beim Mergen bewusst wählen. **[Schlussfolgerung]**

**Nachweis laut Playbook:** beide Diffs/PRs + kein Merge-Konflikt + mindestens ein
Prüfer-Finding.

### Übung 3 — Trigger-Inventar `state/triggers.md` (30 min)

Sechs Trigger existieren bereits real und sind nirgends zusammen aufgeführt — das Inventar ist
also keine Fingerübung, sondern Nachdokumentation. Vorgeschlagene Startzeilen (Besitzer ist bei
allen Stefan; Cap und Eskalation sind zu ergänzen, nicht abzuschreiben):

| Trigger | Klasse/Quelle | Ziel | Beleg |
|---|---|---|---|
| Push auf `main` | Event / Repo | CI-Job `check` | `.github/workflows/ci.yml` Z. 3–5 |
| Pull Request | Event / Repo | CI-Job `check` (Required Status Check) | `ci.yml` Z. 6 + `state/gates.md` Z. 5 |
| `Edit`/`Write` (vor Ausführung) | Event / Agent-Werkzeug | `guard-settings.js`, `deny` auf `.claude/settings.json` | `.claude/settings.json` Z. 19–25 |
| `Edit`/`Write` (nach Ausführung) | Event / Agent-Werkzeug | `npm run lint --silent` | `.claude/settings.json` Z. 27–33 |
| Jeder Prompt | Event / Mensch | `session-reminder.js`, Hinweis alle 30 Nachrichten | `.claude/settings.json` Z. 35–41 + `session-reminder.js` Z. 6 |
| `/lessons` | Event / Mensch | Lessons-Learned-Format für die Playbook-Bibliothek | `.claude/commands/lessons.md` |
| *(geplant)* Agent → Agent | Event / Agent | Verträge aus Übung 1 unter `state/tasks/` bzw. `state/handoffs/` | Playbook 04 §6, Design-Regel 1 |
| *(geplant, offen)* Zeit | Zeit / Cron | Kandidat: wöchentlicher `schedule:`-Lauf des Secret-Scans gegen die volle Historie — heute läuft `gitleaks` nur mit `--no-git` auf dem Arbeitsbaum (`ci.yml` Z. 29–30) | Entscheidung offen, nicht Teil der Übung |

Abgrenzung, die ins Dokument gehört: `state/gates.md` beschreibt, **was blockiert**;
`state/triggers.md` beschreibt, **was auslöst**. Zwei Zeilen desselben Systems, aber nicht
dieselbe Frage — sonst entsteht die nächste ungeprüfte Kopie.

**Nachweis laut Playbook:** die Datei.

---

## Was dieser Scan NICHT geprüft hat

- Ob die Zyklus-3-Pipeline im Playbook-Sinn ein „Loop" ist (s. 1.4) — bewusst offen gelassen.
- Ob Worktrees in der VS-Code-Extension identisch funktionieren wie in der Terminal-CLI.
- `Content_Website/`, `components/`, `app/` — außerhalb der Fragestellung; nur per Volltextsuche
  auf die acht Begriffe gestreift, ohne Treffer mit Orchestrierungsbezug.
