## TASK: vitest-gate-scharf
GOAL: Das Test-Gate ist blockierend, rot UND grün wurden beobachtet, und kein
Anweisungsdokument widerspricht dem neuen Zustand.
CONTEXT: Voraussetzung sind `vitest-geruest` und `vitest-prisma-grenze`. Der
CI-Job `check` führt bereits `npm run check` aus
(.github/workflows/ci.yml:24-25) und ist Required Status Check auf `main`
(state/gates.md, Zeile "Lint", Stand 04.08.2026) — ci.yml braucht deshalb keine
Änderung. Kalibrierungsregel: ein Gate gilt erst als belegt, wenn beide
Zustände beobachtet wurden (Playbook 05, Regel 2; Format siehe bestehende
Kalibrierungsabsätze in state/gates.md, z. B. "Kalibrierungsfund
(04.08.2026): ..." / "Gegentest bestanden (04.08.2026): ..."). Offene Pull
Requests gibt es aktuell keine (Stand 06.08.2026, vom Menschen bestätigt).
SCOPE: (1) "scripts.check" in package.json um `&& npm run test` am ENDE
erweitern (aktuell package.json:14, endet auf
`... && node scripts/check-rules.mjs`) — Tests laufen zuletzt, damit die
schnellen Prüfungen zuerst Rückmeldung geben. Der Script-Name `test` existiert
bereits aus Vertrag `vitest-geruest`; `&& npm run test` statt der wörtlichen
Wiederholung von `vitest run` vermeidet zwei Namen für denselben Befehl
(Advisor-Befund, siehe state/advisor-findings-vitest.md). (2) Drei
Korrekturen in CLAUDE.md: Zeile 57 — Vitest aus der Liste "Nicht im Projekt"
entfernen, Playwright und Zod bleiben dort; Zeile 49 — der Kommentar hinter
`npm run check` im Befehlsblock nennt aktuell nur "lint + typecheck" und
verschweigt check-docs und check-rules, auf den tatsächlichen Inhalt bringen;
im selben Befehlsblock (wo bereits "npm run lint", "npm run typecheck" etc.
gelistet sind) die Zeile "npm run test # Vitest Unit-Tests" ergänzen — fehlte
bisher (Advisor-Befund, siehe state/advisor-findings-vitest.md). (3) Neue
Zeile in state/gates.md im Format der bestehenden Tabellenzeilen (Spalten
Gate | Werkzeug | Blockierend | Evidenz | Ausnahmeprozess), plus
Kalibrierungsabsatz im Format der bestehenden Absätze.
NICHT: .github/workflows/ci.yml ändern. --passWithNoTests setzen.
Branch-Protection-Einstellungen anfassen. Neue Tests schreiben.
BUDGET: ein Durchgang, Kalibrierung eingerechnet.
OUTPUT: Kurzbericht mit BEIDEN Terminalausgaben wörtlich — rot: eine Assertion
bewusst gebrochen, `npm run check` liefert Exit ungleich 0 und die Meldung
stammt aus dem Test-Schritt, nicht aus einem früheren; grün: Assertion
zurückgedreht, `npm run check` liefert Exit 0. Der Bericht nennt außerdem den
git-status-Auszug der geänderten Dateien.
ESCALATE: `npm run check` wird beim Scharfschalten aus einem anderen Grund als
den eigenen Tests rot → anhalten, Ursache vorlegen, nicht reparieren.
