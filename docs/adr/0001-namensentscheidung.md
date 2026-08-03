# ADR-0001 — Namensentscheidung: Repo/Domain vs. Marke

**Datum:** 03.08.2026
**Status:** Entschieden

## Kontext
Repo-Name (toolkompass), Domain (toolkompass.vercel.app), package.json-Name
(toolsucher) und Produktmarke (CLAUDE.md/README: "ToolSucher") liefen
auseinander. In docs/STATUS.md als offener Punkt (Gate 2.5, #12) vermerkt.

## Optionen
1. Alles auf "ToolSucher" vereinheitlichen — Repo umbenennen, Domain
   migrieren.
2. Alles auf "ToolKompass" vereinheitlichen — Marke/UI-Texte ändern.
3. Bewusst getrennt lassen — Repo/Domain bleiben "toolkompass", Marke
   bleibt "ToolSucher", keine Account-Änderung.

## Entscheidung
Option 3: bewusst getrennt lassen.

## Begründung
Rename-Aufwand (GitHub-Redirects, Vercel-Domain-Migration, DNS) steht in
keinem Verhältnis zum Nutzen. Repo-Name und Domain sind technische
Details, die Nutzer nie sehen; die Marke "ToolSucher" ist das, was nach
außen zählt.
