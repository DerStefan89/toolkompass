## TASK: check-rules-geruest
GOAL: `node scripts/check-rules.mjs` läuft; prüft `as any`/`: any` und `<img `;
Exit 1 bei mindestens einem Treffer, Exit 0 bei sauberem Baum.
CONTEXT: ARCHITECTURE.md §7 (Verbotstabelle, Z. 139–148) — Pointer, nicht kopieren.
`scripts/check-docs.mjs` als Vorbild für Aufbau/Stil eines Repo-Scan-Scripts.
SCOPE: Nur `scripts/check-rules.mjs` neu anlegen mit genau diesen zwei Regeln.
NICHT: Einbindung in `npm run check`, NICHT `.github/workflows/ci.yml` anfassen,
NICHT gefundene Verstöße im Bestand reparieren.
BUDGET: ca. 15 Minuten / ein Baudurchgang + eine Korrekturrunde.
OUTPUT: `scripts/check-rules.mjs`, ausführbar, mit Kurzbericht (wie viele Treffer im
aktuellen Bestand, welche Dateien).
ESCALATE: Mehr als 0 Fehlalarme im aktuellen Bestand → anhalten, Befund vorlegen,
NICHT die Regel stillschweigend aufweichen.

## Nachtrag (Advisor-Klärung, 2026-08-05)
Die `<img>`-Regel wurde aus `scripts/check-rules.mjs` wieder entfernt. Grund:
`@next/next/no-img-element` (`eslint.config.mjs:13`, Severity `error`, projektweit,
AST-basiert) deckt dasselbe Verbot bereits blockierend ab und respektiert dabei
`eslint-disable-next-line`-Ausnahmen korrekt — eine Text-Regex kann das nicht.
Beleg: `npm run lint` → Exit 0 im aktuellen Bestand, bei zwei bewusst mit
`eslint-disable-next-line` ausgenommenen `<img>`-Stellen (`LogoUpload.tsx:96`,
`ScreenshotUpload.tsx:94`). Entscheidung durch Advisor-Review + Freigabe des
Menschen, nicht durch Anpassung von GOAL/SCOPE oben — dieser Vertrag bleibt als
historischer Stand unverändert.
