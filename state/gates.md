# Objective Gates

| Gate | Werkzeug | Blockierend | Evidenz | Ausnahmeprozess |
|---|---|---|---|---|
| Lint | ESLint | Ja | `package.json` Script `check`: `npm run lint && ...`; CI-Job `check` in `.github/workflows/ci.yml` (Schritt "Lint, Typecheck, Doku-Gate", `run: npm run check`), ausgelöst bei Push auf `main` und bei Pull Requests | — |
| Typecheck | `tsc --noEmit` | Ja | `package.json` Script `check`: `... && npm run typecheck && ...`; selber CI-Job/Schritt wie oben | — |
| Doku-Gate | `scripts/check-docs.mjs` | Ja | `package.json` Script `check`: `... && node scripts/check-docs.mjs`; selber CI-Job/Schritt wie oben | — |
| Regel-Gate | `scripts/check-rules.mjs` (geplant, noch nicht vorhanden) | Nein | — | — |
| Secret-Scan | geplant, noch nicht vorhanden | Nein | — | — |
