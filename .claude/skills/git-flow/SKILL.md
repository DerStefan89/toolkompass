---
name: git-flow
description: Führt den Standard-Workflow für eine freigegebene, kleine Änderung aus — Branch anlegen, gezielt stagen, Diff zur Freigabe zeigen, ehrlich committen, pushen, PR-Link/Status nennen. Nutzen nach jeder abgeschlossenen Iteration, wenn eine geprüfte Änderung committet und ein PR eröffnet werden soll. Ersetzt NICHT die Freigabe des Menschen und merged niemals selbst.
---

# Git-Flow

## Instructions

1. `git status` und `git branch -vv` zeigen, bevor irgendetwas passiert.
2. Läuft die Sitzung bereits in einem dedizierten Worktree auf dem passenden
   Branch (Zweck des Worktrees deckt sich mit der Änderung): NICHT von `main`
   neu branchen. Direkt auf diesem Branch committen — ein zusätzlicher Branch-
   Wechsel würde den Sinn der Isolation aufheben und ggf. den Worktree auf
   einen fremden Branch umbiegen.
3. Sonst Ziel main-Basis: `git checkout main && git pull` zuerst. Verweigert
   Git den Checkout wegen uncommitted Änderungen: NICHT force/reset.
   Stattdessen `git stash`, wechseln, Branch anlegen, `git stash pop`, danach
   das Ergebnis verifizieren (z. B. relevanten Check erneut laufen lassen)
   statt dem Diff blind zu vertrauen.
4. `git add` NUR der explizit besprochenen Dateien — nie `git add .`.
5. `git diff --staged` vollständig zeigen, ausdrücklich um Freigabe bitten.
   Nicht committen ohne klares "ja".
6. Nach Freigabe: committen mit ehrlicher, inhaltsbeschreibender Message.
7. Pushen.
8. PR-Status klären: `gh auth status` prüfen. Verfügbar → `gh pr create`/
   `gh pr checks`. Nicht verfügbar → NICHT einrichten. Stattdessen den
   "Create a pull request..."-Link aus der Push-Ausgabe nennen, und per
   unauthentifizierter GitHub-API prüfen, ob bereits ein PR existiert
   (`api.github.com/repos/<owner>/<repo>/pulls?head=<owner>:<branch>`) —
   Race Conditions sind real: ein PR kann während der eigenen Prüfung bereits
   von Hand erstellt oder gemerged worden sein.
9. CI-Status: `gh pr checks` oder `api.github.com/repos/<owner>/<repo>/commits/<sha>/check-runs`.
10. NIEMALS selbst mergen — das bleibt beim Menschen. Nur melden, dass CI grün
    ist und der PR bereit wäre.

## Common Issues

- Checkout verweigert wegen uncommitted Changes → stash/pop mit Nachverifikation,
  nicht force.
- `gh` fehlt → nicht installieren, auf Push-Ausgabe/API ausweichen.
- Race Condition: PR existiert oder ist bereits gemerged, während man noch
  prüft → vor dem Erstellen immer erst per API nachsehen.
- Trotz grüner CI selbst mergen wollen → nein, das ist Ebene 1 (Mensch) der
  Regelhierarchie.
- Sitzung läuft schon in einem passenden Worktree → nicht trotzdem von `main`
  neu branchen (Fund aus Zyklus 4: ein zweiter Branch im selben Worktree
  untergräbt die Isolation, für die der Worktree angelegt wurde).

## Examples

Eine geprüfte, freigegebene Änderung liegt vor und soll committet werden →
Skill lädt → Status prüfen → Diff zur Freigabe zeigen → committen/pushen/
PR-Status nennen → NICHT mergen.
