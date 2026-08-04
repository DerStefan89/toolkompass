# Objective Gates

| Gate | Werkzeug | Blockierend | Evidenz | Ausnahmeprozess |
|---|---|---|---|---|
| Lint | ESLint | Ja | `package.json` Script `check`: `npm run lint && ...`; CI-Job `check` in `.github/workflows/ci.yml` (Schritt "Lint, Typecheck, Doku-Gate", `run: npm run check`), ausgelöst bei Push auf `main` und bei Pull Requests; Branch-Protection-Regel `main` markiert `check` als Required Status Check (seit 04.08.2026) | Bewusst keine — "Do not allow bypassing the above settings" aktiviert (04.08.2026), auch Admin-Pushes werden geprüft. Abweichung nur durch aktives Ändern dieser Einstellung, sichtbar im Repo-Audit-Log. |
| Typecheck | `tsc --noEmit` | Ja | `package.json` Script `check`: `... && npm run typecheck && ...`; selber CI-Job/Schritt und Branch-Protection-Regel wie oben | s. Lint |
| Doku-Gate | `scripts/check-docs.mjs` | Ja | `package.json` Script `check`: `... && node scripts/check-docs.mjs`; selber CI-Job/Schritt und Branch-Protection-Regel wie oben | s. Lint |
| Regel-Gate | `scripts/check-rules.mjs` (geplant, noch nicht vorhanden) | Nein | — | — |
| Secret-Scan | geplant, noch nicht vorhanden | Nein | — | — |

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
