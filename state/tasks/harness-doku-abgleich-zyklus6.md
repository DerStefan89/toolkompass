## TASK: harness-doku-abgleich-zyklus6
GOAL: docs/harness/ beschreibt den realen Stand nach Zyklus 6 — Skill-Liste
vollständig, MCP-Aussage geprüft, neue State-Dateien aufgeführt,
Changelog-Eintrag vorhanden.

CONTEXT:
- [Fakt] HARNESS-OVERVIEW.md Zeile 44 listet die Skills als "ponytail
  (vendort), tool-anlegen, repo-audit, git-flow". Seit dem 07.08.2026
  existiert zusätzlich `.claude/skills/werkzeug-auswahl/` (vendored aus
  DerStefan89/claude-playbook, Stand 07.08.2026, Commit 57ca0e7).
- [Fakt] Neu unter state/ seit Zyklus 6: `tooling.md` (Bestand + Abschnitt
  "Bewusst nicht installiert"), `framework-sichtung-superpowers.md`.
- [Fakt] HARNESS-GLOSSARY.md enthält laut Master-Briefing Abschnitt 7 eine
  Zeile "MCP: Playbook-Konzept, im Projekt nicht direkt sichtbar". Das ist
  weiterhin zutreffend — es ist nach wie vor kein MCP installiert —, aber
  seit dem 07.08.2026 gibt es eine Ausschlussliste mit Begründung
  (state/tooling.md).
- [Fakt] HARNESS-CHANGELOG.md endet mit dem Eintrag zu Zyklus 5
  (06.08.2026).
- [Fakt] CLAUDE.md hat seit dem 07.08.2026 zwei zusätzliche Einträge unter
  "Bekannte Fallen" (CRLF/LF aus Linux-Sicht; nicht reproduzierbarer
  Vitest-Ausfall).
- [Annahme] Weitere Stellen in docs/harness/ könnten durch Zyklus 6
  veraltet sein. Dies ist ein Abgleich, kein Umbau — Abweichungen werden
  gemeldet, nicht stillschweigend korrigiert.

SCOPE:
1. HARNESS-OVERVIEW.md, Zeile 44 (Skill-Liste): `werkzeug-auswahl`
   ergänzen, mit dem Zusatz "(vendored aus claude-playbook)". Formulierung
   an die bestehende Zeile anpassen.
2. HARNESS-OVERVIEW.md, Baumdarstellung unter `state/`: die beiden neuen
   Dateien `tooling.md` und `framework-sichtung-superpowers.md` mit je
   einem Halbsatz Zweck ergänzen, im Stil der bestehenden Zeilen.
3. HARNESS-OVERVIEW.md: falls dort ein Marker "Stand dieser Fassung:
   TT.MM.JJJJ" existiert, auf 07.08.2026 setzen.
4. HARNESS-CHANGELOG.md: neue Tabellenzeile am Ende anfügen:

| 07.08.2026 | Zyklus 6 (Playbook 06 — Entwicklungs-Methodik) abgeschlossen: Kernzyklus manuell an der Zod-Eingabevalidierung gefahren (Spec mit 15 V-Aussagen, Plan v1/v2, Advisor-Pass mit acht Planänderungen, vier Handoff-Verträge, qa-Review F2/F3, F3-Testfall als Retro-Eval-Fall; PRs #30, #31), Zuschnitt-Heuristik in CLAUDE.md Z. 84–86, Framework-Sichtung Superpowers mit Entscheidung „trial, eng begrenzt" (`state/framework-sichtung-superpowers.md`). Zusätzlich, vorgezogen aus Zwischenzyklus 6.5: `state/tooling.md` als Werkzeug-Bestand inkl. Abschnitt „Bewusst nicht installiert"; Auswahlprozedur als vendorter Skill `.claude/skills/werkzeug-auswahl/` (Quelle: claude-playbook, Stand 07.08.2026, Commit 57ca0e7) statt als Prosa-Dokument; `docs/tooling-auswahl.md` dafür entfernt. Zwei neue Einträge unter „Bekannte Fallen" in CLAUDE.md: CRLF/LF-Rauschen bei Betrachtung aus einer Linux-Umgebung, und ein nicht reproduzierbarer Vitest-Ausfall, bei dem das blockierende Test-Gate rot meldete ohne dass etwas kaputt war. Weiterhin kein MCP installiert — jetzt aber mit begründeter Ausschlussliste statt stillschweigend. |

NICHT: HARNESS-LEARNING-STATE.md nicht ändern (eigener Schritt, falls
nötig); HARNESS-GLOSSARY.md nicht ändern; keine bestehende Changelog-Zeile
anfassen; CLAUDE.md, state/ und specs/ nicht anfassen; keine Datei im
Playbook-Repo anfassen. Kein commit, kein push.

BUDGET: ein Baudurchgang plus eine Korrekturrunde.

OUTPUT: die geänderten Stellen von HARNESS-OVERVIEW.md per grep/sed; die
letzte Zeile von HARNESS-CHANGELOG.md; Ausgabe von `npm run check`
inklusive Exit-Code; git status. Grüner Fall: zwei Dateien in docs/harness/
modifiziert, diese Task-Datei untracked, `npm run check` Exit 0.

ESCALATE: (a) Beim Abgleich fallen weitere veraltete Aussagen in
docs/harness/ auf, die nicht im SCOPE stehen → nicht korrigieren, sondern
im Bericht mit Datei und Zeilennummer auflisten. (b) `npm run check` rot →
erst ein zweites Mal laufen lassen und beide Ausgaben zeigen, bevor
irgendetwas repariert wird (siehe vierten Falleneintrag in CLAUDE.md).
