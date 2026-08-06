# Advisor-Findings — Memory-Map & Dubletten-Bereinigung (06.08.2026, Plan v1)

Geprüft vom Subagenten `architecture-advisor` vor dem Bau. Urteil zu Plan v1:
**Nicht freigegeben**, vier blockierende Befunde. Nach Einarbeitung (Plan v2):
freigegeben im Sinn der unten dokumentierten Entscheidungen.

| # | Befund | Schwere | Belegstelle | Vorschlag |
|---|---|---|---|---|
| a1 | Branch-Protection-Punkt in HARNESS-LEARNING-STATE.md ist reine Kurzfassung ohne Zusatzfakten gegenüber gates.md — echte Dublette | Hinweis | `docs/harness/HARNESS-LEARNING-STATE.md:134-135` vs. `state/gates.md:14-29` | Kürzen wie geplant |
| a2 | Zweite, vom ursprünglichen Plan nicht erfasste Settings-Guard-Dublette im Abschnitt "Zyklus 3 — Bereits gelernt und gebaut" | **Blockierend** | `docs/harness/HARNESS-LEARNING-STATE.md:57-63` vs. `state/gates.md:51-69` | Entscheidung nötig: kürzen oder als Build-Historie belassen |
| a3 | Test-Gate-Punkt ist bereits Verweis-Hybrid, minimaler Eingriff | Hinweis | `docs/harness/HARNESS-LEARNING-STATE.md:151-154` vs. `state/gates.md:71-83` | Nur straffen |
| a4 | Behauptete Doku-Gate-Prüfung-3-Dublette existiert nicht — kein Treffer in HARNESS-LEARNING-STATE.md | **Blockierend** (falsche Prämisse) | kein Treffer vs. `state/gates.md:85-104` | Aus dem Scope streichen, nichts ergänzen |
| b | memory-map.md könnte mit HARNESS-OVERVIEW.md ("Aufbau"-Baum) eine neue Doppel-Heimat bilden | Hinweis | `docs/harness/HARNESS-OVERVIEW.md:20-56` | Zweckunterschied explizit machen: Ordnerstruktur vs. Schreib-Heimat pro Info-Typ |
| c | Verweistext "Abschnitt <Gate-Name>" ist in gates.md nicht auffindbar — keine echten Überschriften, uneinheitliche Fett-Labels, Branch-Protection ohne Namens-Label | **Blockierend** | `state/gates.md:5-12,14,22,31,51,71,79,85,98` | Verweis über Zeilenbereich + wörtliches Zitat des Fett-Labels, nicht über Abschnittsnamen |
| d | Keine Regel gegen erneutes Nachwachsen der Dublette bei künftigen Zyklen | Hinweis | Plan Punkt 1 | Schreibregel in memory-map.md ergänzen |
| d | Kein Fehlerpfad für "erwartete Textstelle fehlt" (Fall a4) | **Blockierend** | Plan Punkt 2 | Erledigt sich durch Streichung von a4 aus dem Scope |

## Einarbeitung (Plan v2, Entscheidungen des Menschen)

- **a2:** Entscheidung **Option 2** — die Zyklus-3-Stelle (Z. 57-63) bleibt unverändert
  stehen. Begründung: "Praktisch getestet" ist ein Evidenz-Katalog (dieselbe Rolle wie
  gates.md, daher echte Dublette, wird gekürzt). "Bereits gelernt und gebaut" ist eine
  chronologische Baugeschichte (anderer Zweck: was ist in Zyklus 3 entstanden, nicht nur
  wie es kalibriert wurde). Eine bewusst ausgesprochene Doppel-Heimat ist zulässig, eine
  versehentliche nicht (Anti-Pattern 3) — diese Entscheidung macht memory-map.md deshalb
  sichtbar, statt sie stillschweigend zu treffen.
- **a4:** aus dem Scope gestrichen. Kein Ersatztext, keine neue Kalibrierungs-Notiz in
  HARNESS-LEARNING-STATE.md — "eine Dublette aufräumen" heißt nicht "eine Lücke füllen".
- **c:** Verweise zitieren künftig das wörtliche Fett-Label plus Zeilenbereich, z. B.
  `state/gates.md:14-29 ("Kalibrierungsfund (04.08.2026):", Required-Status-Check-Regel)`.
- **d:** memory-map.md bekommt unter "Gates & Kalibrierung" den Satz: künftige
  Kalibrierungsfunde gehören ausschließlich in `state/gates.md`; `HARNESS-LEARNING-STATE.md`
  bekommt nur den Verweis-Satz.
- **b:** memory-map.md grenzt sich in einem Kopfsatz von HARNESS-OVERVIEW.md ab:
  Overview beschreibt die Ordnerstruktur, memory-map.md legt pro Info-TYP die
  Schreib-Heimat fest — verschiedene Fragen, kein Duplikat.
