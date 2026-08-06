# Advisor-Findings — Frische-Regel im Doku-Gate (06.08.2026, Plan v1)

Geprüft vom Subagenten `architecture-advisor` vor dem Bau. Urteil: **Freigegeben mit
Hinweisen**, kein blockierender Befund. Alle sechs Hinweise sind in den Vertrag
`state/tasks/memory-frische-gate.md` eingearbeitet.

| Befund | Schwere | Belegstelle | Vorschlag |
|---|---|---|---|
| Selbstwiderspruch ist nicht nur an Zeile 15 belegt — zwei weitere jüngere Daten stehen ebenfalls hinter dem Stand-Marker | Hinweis | HARNESS-LEARNING-STATE.md:15,154,256 | Kalibrierungstext auf alle drei Fundstellen erweitern, nicht nur eine |
| Plan v1 sagt "alle .md unter state/", aber state/tasks/ hat acht .md-Dateien in einem Unterverzeichnis — eine naive readdirSync würde sie verfehlen | Hinweis | state/tasks/vitest-gate-scharf.md; Vorbild scripts/check-docs.mjs:55-66 sammelt nur Dateinamen, nicht Pfade | Geltungsbereich präzisieren: rekursiv, inkl. state/tasks/ |
| Fehlalarm-Risiko bei laxer Implementierung: state/tasks/vitest-gate-scharf.md:7,12 hat exakt das Anlass-Muster ("Stand 04.08.2026" ... "Stand 06.08.2026") — nur weil der Plan die volle Phrase "Stand dieser Fassung:" verlangt und nicht bloß "Stand", trifft es aktuell nicht zu | Hinweis, aber realer Fehlalarm-Kandidat bei Fehlimplementierung | state/tasks/vitest-gate-scharf.md:7,12 | Im Code explizit auf die volle Phrase ankern, nicht auf das Wort "Stand" |
| Datumsformate kollidieren nicht mit Versionsnummern, Zeilenbereichen oder Commit-Hashes im Bestand — aber nur bei strikten Ziffern-Gruppenlängen | Hinweis | state/tasks/check-rules-regeln-2.md:18-21, HARNESS-LEARNING-STATE.md:100 | Gruppenlängen im Code kommentieren, analog zu scripts/check-docs.mjs:108-114 |
| Die Marker-Konvention "Stand dieser Fassung:" ist nirgends dokumentiert, weder in ARCHITECTURE.md noch in docs/kommentar-standard.md; das ADR-Template nutzt ein anderes Format | Hinweis | docs/adr/TEMPLATE.md:3 | Erklärenden Satz in docs/harness/HARNESS-OVERVIEW.md ergänzen, der Marker und Gate-Wirkung benennt |
| check-docs-ignore ist pro Prüfung im Code dupliziert, nicht global — die Formulierung "gilt unverändert" in Plan v1 war irreführend | Hinweis | scripts/check-docs.mjs:74,120 | Formulierung zu "wird in Prüfung 3 repliziert" ändern |

**Nachtrag beim Einarbeiten (nicht vom Advisor):** Plan v1 sprach von einem siebten
Gate. Falsch — die Prüfung läuft in `scripts/check-docs.mjs` und erweitert damit das
bestehende Doku-Gate. In `state/gates.md` entsteht deshalb keine neue Tabellenzeile,
sondern ein ergänzter Evidenz-Eintrag plus Kalibrierungsabsatz.
