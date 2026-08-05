## TASK: check-rules-regeln-2
GOAL: `scripts/check-rules.mjs` (aus check-rules-geruest) um zwei Regeln erweitert:
`take` ohne `skip`, `createClient()` in Actions. Für jede neue Regel: ein bewusst
erzeugter Gegentest, der rot UND ein Gegentest, der grün belegt — beide im Bericht
dokumentiert (Muster: `state/gates.md`, Kalibrierungsfunde-Abschnitt).
CONTEXT: ARCHITECTURE.md §7. `scripts/check-rules.mjs` (Ergebnis des vorherigen
Vertrags) als Basisdatei — Pointer auf die Datei, nicht deren Inhalt hier duplizieren.
SCOPE: Nur diese zwei Regeln ergänzen. NICHT mehr Regeln erfinden. NICHT
CI-Einbindung.
BUDGET: ca. 20 Minuten.
OUTPUT: erweiterte `scripts/check-rules.mjs` + Nachweis-Abschnitt im Bericht (rot/grün
je Regel).
ESCALATE: Falls eine Regel nicht ohne Fehlalarm im Bestand formulierbar ist → als
offene Unsicherheit im Bericht markieren, NICHT die Regel künstlich entschärfen, bis
sie durchläuft.
