## TASK: status-phase3-korrektur
GOAL: docs/STATUS.md beschreibt korrekt, dass Phase 3 (/api/search) auf dem
aktuellen Stand von feat/zod-eingabevalidierung bereits per Zod validiert,
und nur noch Phase 5 (/auth/confirm) offen ist.

CONTEXT: Commit 871e70d ("feat(zod): Typ-Validierung für GET /api/search
(V7-V9)") ist auf diesem Branch bereits enthalten. docs/STATUS.md, Abschnitt
"Gate für Phase 6 — Cashback", ist seitdem nicht nachgezogen worden und
behauptet noch, /api/search sei ungeprüft und "Phase 3 und 5" seien offen.
Das stimmt nicht mehr. Reine Textkorrektur, kein Code betroffen.

SCOPE: In docs/STATUS.md, Abschnitt "Gate für Phase 6 — Cashback":

1. Ersetze "und für zwei der vier bestehenden Endpunkte im Einsatz." durch
   "und für drei der vier bestehenden Endpunkte im Einsatz."

2. Ersetze den Absatz beginnend mit "**Bestehende Endpunkte:**" komplett:

   Alt:
   **Bestehende Endpunkte:** /api/anfrage und /api/track/[linkId] validieren
   Fremddaten seit Zyklus 6 per Zod (specs/zod-eingabevalidierung.md). /api/search
   und /auth/confirm nehmen weiterhin Fremddaten ohne Schema-Validierung entgegen
   (Plan v2 deckte nur zwei Fresh-Context-Bau-Phasen ab, siehe
   state/plan-v2-zod-eingabevalidierung.md, Phase 3 und 5 offen). Kein Geld im Spiel,
   aber dieselbe Fehlerklasse — bei Gelegenheit fortsetzen.

   Neu:
   **Bestehende Endpunkte:** /api/anfrage, /api/track/[linkId] und /api/search
   validieren Fremddaten seit Zyklus 6 per Zod (specs/zod-eingabevalidierung.md).
   /auth/confirm nimmt weiterhin Fremddaten ohne Schema-Validierung entgegen
   (siehe state/plan-v2-zod-eingabevalidierung.md, Phase 5 offen). Kein Geld im
   Spiel, aber dieselbe Fehlerklasse — bei Gelegenheit fortsetzen.

NICHT: keine anderen Abschnitte von docs/STATUS.md anfassen; keine andere
Datei anfassen; kein commit, kein push.

BUDGET: ein Baudurchgang, keine Korrekturrunde erwartet.

OUTPUT: geänderter Ausschnitt von docs/STATUS.md (die beiden betroffenen
Stellen per grep -n oder Diff); git status.

ESCALATE: Falls der Alt-Text nicht exakt so in docs/STATUS.md steht (z. B.
zwischenzeitlich anders formuliert) → anhalten, aktuellen Wortlaut zeigen,
nicht blind ersetzen.
