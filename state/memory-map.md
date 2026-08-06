# Memory Map — Schreib-Heimat pro Info-Typ

Abgrenzung zu `docs/harness/HARNESS-OVERVIEW.md`: Die Overview beschreibt die
Ordnerstruktur des Harness (welche Datei liegt wo). Diese Datei legt pro
Info-TYP die eine verbindliche Schreib-Heimat fest (welche Art von Information
gehört in welche Datei). Verschiedene Fragen, kein Duplikat.

## Info-Typ → Heimat

| Info-Typ | Heimat |
|---|---|
| Regeln | `CLAUDE.md`, `ARCHITECTURE.md` |
| Struktur / Aufbau des Harness | `docs/harness/HARNESS-OVERVIEW.md` |
| Begriffe | `docs/harness/HARNESS-GLOSSARY.md` |
| Phasenstand / Scope | `docs/STATUS.md` |
| Gates & Kalibrierung | `state/gates.md` (Künftige Kalibrierungsfunde gehören ausschließlich hierher; `docs/harness/HARNESS-LEARNING-STATE.md` bekommt nur einen Verweis-Satz, keine Detail-Prosa.) |
| Unausgesprochene Annahmen | `state/assumption-ledger.md` |
| Trigger-Inventar | `state/triggers.md` |
| Entscheidungen mit Alternativen | `docs/adr/*.md` |
| Aufgaben-Handoff-Verträge | `state/tasks/*.md` |
| Zwischenstand (Aufgaben-Gedächtnis, nicht committet) | `state/zwischenstand/*.md` |
| Advisor-Findings vor dem Bau | `state/advisor-findings-*.md` |
| Zyklus-Fortschritt & Lernjournal, Verhaltensregeln | `docs/harness/HARNESS-LEARNING-STATE.md` |
| Änderungshistorie (Kurzfassung, nur Struktur) | `docs/harness/HARNESS-CHANGELOG.md` |
| Playbook-Tor-Status (Kurs-Fortschritt) | `claude-playbook/00-MASTER-BRIEFING.md` (anderes, privates Repo) |

## Gefundene Doppel-Heimaten

(a) **Gate-Kalibrierungsbelege (aufgeräumt).** Drei Bullet-Punkte im Abschnitt
"## Praktisch getestet" von `docs/harness/HARNESS-LEARNING-STATE.md`
(Branch-Protection, Settings-Guard, Test-Gate) enthielten dieselbe
Detail-Prosa (WIE genau, mit Transkript-Zitat) wie `state/gates.md` — echte,
versehentliche Dubletten, da "Praktisch getestet" dieselbe Rolle wie
`state/gates.md` einnimmt (Evidenz-Katalog). Entscheidung: gekürzt auf den
einleitenden Fakt-Satz (WAS wurde bestätigt) plus Verweis auf den
Zeilenbereich und das wörtliche Fett-Label in `state/gates.md`. Kein Inhalt
verloren, der nicht auch dort steht.

(b) **Settings-Guard-Vorfall in "Bereits gelernt und gebaut" (Zyklus 3) — BEWUSST
NICHT aufgeräumt.** Wörtliche Begründung aus dem Advisor-Findings-Dokument
(`state/advisor-findings-memory-map.md`): "**a2:** Entscheidung **Option 2** —
die Zyklus-3-Stelle (Z. 57-63) bleibt unverändert stehen. Begründung:
„Praktisch getestet" ist ein Evidenz-Katalog (dieselbe Rolle wie gates.md,
daher echte Dublette, wird gekürzt). „Bereits gelernt und gebaut" ist eine
chronologische Baugeschichte (anderer Zweck: was ist in Zyklus 3 entstanden,
nicht nur wie es kalibriert wurde). Eine bewusst ausgesprochene Doppel-Heimat
ist zulässig, eine versehentliche nicht (Anti-Pattern 3) — diese Entscheidung
macht memory-map.md deshalb sichtbar, statt sie stillschweigend zu treffen."
