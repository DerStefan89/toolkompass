# Objective Gates

| Gate | Werkzeug | Blockierend | Evidenz | Ausnahmeprozess |
|---|---|---|---|---|
| Lint | ESLint | Ja | `package.json` Script `check`: `npm run lint && ...`; CI-Job `check` in `.github/workflows/ci.yml` (Schritt "Lint, Typecheck, Doku-Gate", `run: npm run check`), ausgelöst bei Push auf `main` und bei Pull Requests; Branch-Protection-Regel `main` markiert `check` als Required Status Check (seit 04.08.2026) | Bewusst keine — "Do not allow bypassing the above settings" aktiviert (04.08.2026), auch Admin-Pushes werden geprüft. Abweichung nur durch aktives Ändern dieser Einstellung, sichtbar im Repo-Audit-Log. |
| Typecheck | `tsc --noEmit` | Ja | `package.json` Script `check`: `... && npm run typecheck && ...`; selber CI-Job/Schritt und Branch-Protection-Regel wie oben | s. Lint |
| Doku-Gate | `scripts/check-docs.mjs` | Ja | `package.json` Script `check`: `... && node scripts/check-docs.mjs`; selber CI-Job/Schritt und Branch-Protection-Regel wie oben | s. Lint |
| Regel-Gate | `scripts/check-rules.mjs` | Ja | `package.json` Script `check`: `... && node scripts/check-rules.mjs`; selber CI-Job/Schritt und Branch-Protection-Regel wie oben | s. Lint |
| Secret-Scan | `gitleaks` (Docker-Image, nicht der proprietäre `gitleaks-action`-Wrapper) | Ja | Schritt "Secret-Scan (gitleaks)" im selben CI-Job `check` in `.github/workflows/ci.yml`; fällt der Schritt, fällt der ganze Job, der bereits Required Status Check ist — keine eigene Branch-Protection-Regel nötig | s. Lint |
| Settings-Guard | `.claude/hooks/guard-settings.js` (PreToolUse-Hook, Matcher `Edit|Write`, registriert in `.claude/settings.json` unter `hooks.PreToolUse`) | Ja — `permissionDecision: "deny"` (nicht `"ask"`, s. Kalibrierungsfund unten); blockiert jede Edit/Write-Ausführung auf `.claude/settings.json`, kein Bypass ohne den Hook selbst zu entfernen | Testfall B (Write auf `docs/_guard-test-scratch.md`, danach gelöscht): Hook lief, kein Treffer, keine Ausgabe, Datei ging normal durch. Testfall A NEU (Edit auf `.claude/settings.json` mit `deny`): Tool-Aufruf scheiterte direkt mit `is_error:true` und Inhalt = `permissionDecisionReason` des Hooks ("Schreibzugriff auf geteilte settings.json blockiert...") — kein `git diff` auf der Datei danach, die Änderung kam nie an. Belegt im Transkript (`"is_error":true,"content":"Schreibzugriff auf geteilte settings.json blockiert..."`). | Absichtliche, legitime Änderung an `.claude/settings.json`: Hook-Eintrag unter `hooks.PreToolUse` in `.claude/settings.json` selbst temporär entfernen (das ist die einzig funktionierende Ausnahme, da der Hook jede andere Editier-Route auf diese Datei blockiert), Grund im Commit nennen, danach Hook wiederherstellen. |

**Kalibrierungsfund (04.08.2026):** Direkt nach dem Einrichten der Required-Status-Check-Regel
wurde ein Push auf `main` mit der Meldung `Bypassed rule violations ... Required status check
"check" is expected` trotzdem durchgelassen — GitHub erlaubt Repo-Admins standardmäßig, eigene
Branch-Protection-Regeln zu umgehen. Anti-Pattern 7 aus Playbook 05 live beobachtet, nicht nur
gelesen. Fix: "Do not allow bypassing the above settings" nachträglich aktiviert. Ohne diesen
Fund hätte das Gate "Ja" bei Blockierend behauptet, ohne es für den einzigen tatsächlichen
Pusher (Admin) einzulösen.

**Gegentest bestanden (04.08.2026):** Nächster direkter Push auf `main` (Commit `beba20a`)
wurde mit `GH006: Protected branch update failed ... Required status check "check" is
expected` abgelehnt. Nach Regel „Gates kalibrieren" (Playbook 05, Regel 2) ist ein Gate erst
belegt, wenn beide Zustände beobachtet wurden — rot bei Verstoß, grün bei Sauberkeit. Der
Bypass-Fund oben war der erste Zustand (unbeabsichtigt grün trotz Verstoß), diese Ablehnung
ist der zweite (korrekt rot). Konsequenz für den Arbeitsablauf: Direkter Push auf `main` ist
ab jetzt technisch ausgeschlossen — Änderungen laufen über Branch + Pull Request, CI muss auf
dem PR grün sein, Merge erst danach über den GitHub-Button (kein reiner CLI-Push mehr).

**Kalibrierungsfund (04.08.2026, Settings-Guard):** Erster Versuch von `guard-settings.js`
gab `permissionDecision`/`permissionDecisionReason` als Top-Level-Felder aus — laut Aufgaben-
Vorgabe, aber laut echter Hooks-Doku (`code.claude.com/docs/en/hooks.md`, per Subagent
`claude-code-guide` verifiziert statt geraten) falsch: das gehört unter
`hookSpecificOutput.{hookEventName, permissionDecision, permissionDecisionReason}`. Mit dem
Top-Level-Schema lief der Hook (Transkript: `hook_success`), aber die Ausgabe wurde stillschweigend
ignoriert — Testfall A wäre grün gewesen, obwohl der Gate-Zweck (Rückfrage erzwingen) nicht
eingelöst wurde. Nach Korrektur des Schemas lief der Hook erneut korrekt (`hook_success` mit
`hookSpecificOutput.permissionDecision:"ask"`), aber die anschließende Edit-Ausführung auf
`.claude/settings.json` lief im Transkript direkt zu "erfolgreich" durch — kein
Permission-Prompt-Ereignis dazwischen. Laut Doku (per Subagent bestätigt) soll `"ask"` auch im
zu diesem Zeitpunkt aktiven Modus `acceptEdits` eskalieren; das beobachtete Verhalten weicht
davon ab. Zwei mögliche Ursachen (laut Subagent nicht dokumentiert, nicht geraten): (a) die
VSCode-Extension surfaced Hook-Prompts anders als die Terminal-CLI, oder (b) ein Defekt in
dieser Version. **Konsequenz:** Nach Regel „Gates kalibrieren" (Playbook 05, Regel 2) gilt
dieses Gate noch nicht als belegt — der grüne Zustand (Testfall B, keine Rückfrage bei
unbeteiligten Dateien) ist bestätigt, der rote Zustand (Testfall A, Rückfrage bei Verstoß) ist
es nicht. Nächster Schritt vor Vertrauen in dieses Gate: denselben Testfall A in einer
Terminal-CLI-Session (nicht VSCode-Extension) und/oder außerhalb von `acceptEdits` wiederholen.

**Kalibrierungsfund (04.08.2026, Settings-Guard, Fortsetzung — `ask` → `deny`):** Root Cause
für den ersten Fund oben ist kein Bug im Hook, sondern ein bestätigter, offener Bug in der
VS-Code-Extension: GitHub-Issue `anthropics/claude-code#13339` ("[BUG] VS Code Extension
Ignores Hook `permissionDecision: "ask"`") — per `WebFetch` gegen die echte Issue-URL
verifiziert, nicht nur aus dem Auftrag übernommen. Das Issue bestätigt exakt das beobachtete
Muster: `"ask"` wird in der VS-Code-Extension stillschweigend ignoriert (Befehl läuft ohne
Prompt durch), während dieselbe Hook-Ausgabe in der Terminal-CLI korrekt einen Prompt zeigt;
`"deny"`/`"block"` funktionieren dagegen in beiden Oberflächen. `guard-settings.js` wurde
entsprechend von `"ask"` auf `"deny"` umgestellt. Testfall A NEU (s. Tabellenzeile oben)
bestätigt das: Die Edit-Ausführung schlug diesmal tatsächlich fehl (`is_error:true`), nicht
nur der Hook lief durch. Damit ist jetzt auch der rote Zustand beobachtet — Gate gilt nach
Playbook 05 Regel 2 als belegt, allerdings als **Hard-Deny, nicht als Rückfrage** wie ursprünglich
geplant: Diese Version kennt keine Fallunterscheidung mehr zwischen "bewusst bestätigen" und
"blockieren" — jede Änderung an `.claude/settings.json`, auch eine legitime Team-Policy-Änderung,
muss künftig über den in der Tabellenzeile oben genannten Ausnahmeweg laufen (Hook-Eintrag
temporär selbst entfernen, Grund im Commit). Offen: Ob `"ask"` in einer Terminal-CLI-Session
tatsächlich funktioniert hätte (dort wäre die ursprünglich gewünschte Rückfrage statt Hard-Deny
möglich gewesen), ist mit dieser Session nicht geprüft — nicht weiter verfolgt, da außerhalb
der Grenzen dieses Auftrags ("keine weiteren Fixversuche über deny hinaus").
