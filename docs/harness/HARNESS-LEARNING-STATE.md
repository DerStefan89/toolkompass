<!--
Ziel-Pfad im Repo: docs/harness/HARNESS-LEARNING-STATE.md
Diese Datei verändert sich mit jedem abgeschlossenen Zyklus — bei Zyklus-Ende aktualisieren.
Stand dieser Fassung: 04.08.2026, nach Abschluss von Zyklus 3 (Playbook 05 — Qualität & Security).
-->
# Harness Learning State

## Abgeschlossene Zyklen

- **Zyklus 1** (Playbook 01 — Fundament) — 🚪✅ bestanden (2026-07-19)
- **Zyklus 2** (Playbook 02 — Context & Token Engineering) — 🚪✅ bestanden (2026-07-27)
- **Zyklus 2.5** (Sanierungsdurchgang) — 🚪✅ bestanden (30.07.–02.08.2026)
- **Zyklus 3** (Playbook 05 — Qualität & Security) — 🚪✅ bestanden (04.08.2026)

**Nicht begonnen:** Zyklus 4 (Playbook 04 — Orchestrierung & Loops), 🚪⬜. Reihenfolge danach laut
Master-Briefing: 03 → 06 → 07 → 09 → 08.

## Bereits gelernt und gebaut (mit Repo-Nachweis)

- CLAUDE.md als schlankes, immer geladenes Fundament (Design-Block ausgelagert, um unter der
  150-Zeilen-Faustregel zu bleiben); Agent-Tabelle korrigiert und aktuell (nur noch
  `design-guardian`, `frontend-reviewer`, `qa`, `architecture-advisor`, Pfade unter `.claude/agents/`)
- Vier unabhängige, schreibgeschützte Subagenten — drei Reviewer (`design-guardian`,
  `frontend-reviewer`, `qa`) und ein Advisor (`architecture-advisor`, prüft Pläne statt fertige Arbeit)
- Zwei vendorte/projekteigene Skills (Ponytail, tool-anlegen) plus ein neuer, noch ungetesteter Skill
  (`repo-audit`, Ist-Stand-Scan)
- `.claudeignore` gegen Cache-Invalidierung
- Doku-Gate (`check-docs.mjs`) scharf geschaltet: Teil von `npm run check`, damit auch Teil des
  CI-Gates in `ci.yml`
- Zwei registrierte Hooks in `.claude/settings.json`: `PostToolUse` (Matcher `Edit|Write`, führt
  `npm run lint --silent` aus) und `UserPromptSubmit` (führt `session-reminder.js` aus,
  Kontext-Hygiene-Hinweis alle 30 Nachrichten)
- Ein sicherer Script-Default (`_mode.ts`, Dry-Run ohne `--execute`)
- Eine laufende CI-Pipeline mit Merge-Block
- Erstes ADR-Paar: `docs/adr/TEMPLATE.md` + `docs/adr/0001-namensentscheidung.md`
- Objective-Gates-Matrix (`state/gates.md`) und Assumption-Ledger-Grundgerüst
  (`state/assumption-ledger.md`, aktuell ohne Einträge)
- Namensentscheidung getroffen: Repo/Domain bleiben `toolkompass`, Produktmarke bleibt „ToolSucher" —
  bewusst getrennt (siehe `docs/STATUS.md`, Abschnitt „Erledigt in Gate 2.5")

### Zyklus 3 (Playbook 05 — Qualität & Security)

- **Übung 1 (Gates):** Secret-Scanner (`gitleaks`-Docker-Image, nicht die proprietäre
  `gitleaks-action`) als Schritt im selben CI-Job wie Lint/Typecheck/Doku-Gate. CI-Pflichttor auf
  blockierend gestellt und per GitHub Branch Protection erzwungen — inkl. „Do not allow bypassing"
  (Admin-Bypass war sonst Standard). `state/gates.md` mit echter Objective-Gates-Matrix befüllt.
- **Übung 2 (Advisor vor dem Bau):** Feature „Preis-Ableitung aus PricingPlan" (STATUS.md Punkt 18)
  komplett nach Executor/Advisor-Muster durchgeführt: Plan v1 → `architecture-advisor`-Findings
  (4 echte Lücken) → Plan v2 → Umsetzung → `frontend-reviewer`/`design-guardian`/`qa`-Review →
  Live-Verifikation gegen laufenden Dev-Server. Gemergt (`feat/pricing-derivation`, PR #4).
  Nachweis: `state/plan-v1-pricing.md`, `state/advisor-findings-pricing.md`, `state/plan-v2-pricing.md`.
- **Übung 3 (Anhang B, Phase 1):** Assumption Ledger gegen das reale Repo erzeugt, in frischem
  Kontext (nicht in der Session, die die Pricing-Entscheidungen getroffen hatte). 9 Einträge mit
  Datei-/Zeilenbeleg, keine Überschneidung mit `STATUS.md`. Nachweis: `state/assumption-ledger.md`.
- **Settings-Guard-Hook (aus einem wiederholten Vorfall, nicht ursprünglich geplant):**
  `.claude/hooks/guard-settings.js`, PreToolUse-Hook, blockiert (`deny`) jede Edit/Write-Ausführung
  auf die geteilte `.claude/settings.json`. Grund: dreimal in diesem Zyklus wurde eine
  Permission-Freigabe versehentlich dort statt in `.claude/settings.local.json` persistiert.
  Kalibriert nach Playbook-05-Regel 2 (rot + grün belegt) — erste Version mit `permissionDecision:
  "ask"` war wirkungslos (VS-Code-Extension ignoriert das laut `anthropics/claude-code#13339`),
  zweite Version mit `"deny"` belegt blockierend.
- GitHub-Workflow für `main` verbindlich umgestellt: Branch Protection ohne Admin-Bypass bedeutet,
  direkter Push auf `main` ist technisch ausgeschlossen. Jede Änderung — auch reine Doku-Zeilen —
  läuft über eigenen Branch + PR + grüner CI-Check + Merge-Button.

## Praktisch getestet (Nachweis im Repo vorhanden)

- CI läuft nachweislich bei Push/PR und prüft Lint + Typecheck + Doku-Gate
- Subagenten-Frontmatter korrekt ohne Schreibrechte gesetzt (vier von vier geprüft)
- `check-docs.mjs`-Einbindung in `npm run check` bestätigt über `package.json` und Commit `c321ffb`
  (2026-08-02 16:56)
- Beide Hooks bestätigt über den vollständigen `hooks`-Block in `.claude/settings.json`
- Secret-Scan bestätigt über echten Gegentest: AWS-Beispiel-Key wurde fälschlich allowlistet (Fund),
  zufälliger Fake-Key hat den CI-Job korrekt scheitern lassen (Beleg im CI-Log)
- Branch Protection bestätigt über echten Gegentest: erster Push wurde per Admin-Bypass durchgelassen
  (Fund), nach „Do not allow bypassing" hat derselbe Push-Versuch korrekt abgelehnt
- Settings-Guard-Hook bestätigt über echten Gegentest: `"ask"` lief durch ohne Rückfrage (Fund, Issue
  #13339 per `WebFetch` gegen die echte GitHub-Issue-URL verifiziert), `"deny"` hat den Edit-Aufruf
  nachweislich mit `is_error:true` scheitern lassen (Transkript-Beleg in `state/gates.md`)
- Pricing-Ableitung live gegen laufenden Dev-Server verifiziert (Preis-Update, Cross-Page-Freshness,
  Löschen des letzten Tarifs) — nicht nur code-verifiziert

## Noch unsicher / nicht aus dem Repo rekonstruierbar

- Ob das Kosten-Audit (Zyklus-2-Übung 1) und der Ponytail-Diff-Vergleich (Übung 3) je als eigene Datei
  festgehalten wurden (im Repo nicht auffindbar — reine Dokumentationslücke, kein Blocker)
- Ob `permissionDecision: "ask"` in einer Terminal-CLI-Session (statt VS-Code-Extension) funktioniert
  hätte — nicht geprüft, außerhalb der Auftragsgrenze der Settings-Guard-Übung geblieben
- Root Cause des dreimaligen `.claude/settings.json`-Lecks selbst (welche Klick-Option in der
  Permission-Dialog genau dazu führt) ist nicht abschließend diagnostiziert — durch den
  Settings-Guard-Hook aber technisch irrelevant geworden (Ebene 2 schlägt die Notwendigkeit,
  Ebene 3 zu verstehen)

## Verhaltensregeln für künftige Sessions (aus Zyklus 3, konkret aus echten Vorfällen)

- **Pflicht-Agents wörtlich zitieren.** Ein genereller Verweis auf CLAUDE.md in einem
  Implementierungs-Prompt wurde nachweislich übersehen. Jeder Prompt an eine bauende Session nennt
  die Pflicht-Agents-Zeile aus CLAUDE.md wörtlich, nicht nur per Verweis.
- **„Fertig" ist keine Antwort.** Bei jedem Abschlussbericht fragen: code-verifiziert oder
  live-verifiziert? Ein „Sollbild" (Anti-Pattern 9) wird nie ungeprüft übernommen, auch wenn es vom
  Auftraggeber selbst stammt.
- **Eigene Prompts vor dem Senden selbst gegen die Anhang-A-Checkliste prüfen** (Persona/Task/
  Context/Format, DoD, Grenzen, Eskalationspfad, Knappheitsklausel) — nicht erst, wenn danach
  gefragt wird.
- **Advisor-vor-Bau-Entscheidung immer explizit benennen, auch wenn sie „Nein" ist.** Für kleine,
  reversible Änderungen (ein Hook, eine Doku-Zeile) ist ein voller Plan-v1/Advisor/Plan-v2-Zyklus
  unverhältnismäßig — aber das ist eine Entscheidung, die ausgesprochen gehört, kein stillschweigender
  Sprung zum Bau-Prompt.
- **`.claude/settings.json` ist jetzt technisch gesperrt** (`guard-settings.js`, `permissionDecision:
  "deny"`). Für eine legitime Team-Policy-Änderung: Hook-Eintrag in `hooks.PreToolUse` selbst
  temporär entfernen, Grund im Commit nennen, danach wiederherstellen (Ausnahmeweg in
  `state/gates.md` dokumentiert).
- **Cross-Environment-Git-Diffs nicht blind glauben.** Ein Diff aus einer gemounteten
  Linux-Sandbox-Sicht auf einen Windows-Ordner kann reines CRLF/LF-Rauschen als „modified" zeigen,
  das in der echten Arbeitskopie nicht existiert. Bei einem verdächtig großen Full-File-Diff: die
  native Session (Windows/Claude Code) fragen, nicht dem Sandbox-Diff vertrauen.
- **Zwei Schreiber im selben Ordner (Cowork + Claude Code) sind eine bewusste, dokumentierte
  Abweichung von der Ein-Schreiber-Regel aus CLAUDE.md — kein Fehler, aber ein reales Risiko.**
  In diesem Zyklus hat das echte Korruption erzeugt (zwei beschädigte Tabellenzellen in
  `state/assumption-ledger.md`, „| A2" ohne führenden Strich, ein `|` mitten im Wort). Konsequenz:
  nach jedem gemeinsam bearbeiteten Edit-Vorgang die Datei erneut lesen, nicht dem letzten
  Tool-Output vertrauen.
- **Main ist geschützt, ohne Ausnahme.** Jede Änderung, auch eine einzelne Doku-Zeile, läuft über
  Branch + PR + grüner CI-Check + Merge-Button. Kein direkter Push mehr, auch nicht für den
  Repo-Admin.

## Voraussetzungen und nächste Schritte für Zyklus 4

Zyklus 3 (Playbook 05 — Qualität & Security) ist vollständig abgeschlossen: alle drei
Praxisschleifen-Übungen, plus eine ungeplante, aber echte Gate-Kalibrierung (Settings-Guard) nach
demselben Ritual. Nächster Zyklus laut Reihenfolge in `00-MASTER-BRIEFING.md`: Playbook 04
(Orchestrierung & Loops). Kein bekannter Blocker. Offen bleibt nur die Diagnose-Frage zum
`settings.json`-Root-Cause oben — nicht blockierend, da der Hook das eigentliche Risiko bereits
technisch ausschließt.
