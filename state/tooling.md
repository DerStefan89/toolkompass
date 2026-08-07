# Tooling-Bestand

| Name | Typ | Zweck | Quelle/Lizenz | Status | Datum |
|---|---|---|---|---|---|
| git-flow | Skill | Standard-Workflow für eine freigegebene Änderung: Branch, gezieltes Stagen, Diff zur Freigabe, Commit, Push, PR-Status | eigen, im Repo | aktiv | 07.08.2026 |
| ponytail | Skill | Erzwingt die einfachste, schlankste funktionierende Lösung (YAGNI, Stdlib/Bestehendes vor neuem Code) | v4.8.4 (fremd, MIT, Quelle: github.com/DietrichGebert/ponytail) — nur SKILL.md kopiert, kein ausführbarer Code | aktiv | 07.08.2026 |
| repo-audit | Skill | Sanierungs-Prüfung: gleicht Anweisungsdokumente gegen die reale Repo-Struktur ab, findet tote Verweise/veraltete Behauptungen | eigen, im Repo | aktiv | 07.08.2026 |
| tool-anlegen | Skill | Legt ein neues Tool auf ToolSucher vollständig an (Recherche, Content, Import, Logo, Pricing, Live-Verifikation) | eigen, im Repo | aktiv | 07.08.2026 |

## Bewusst nicht installiert

Geprüft am 07.08.2026 gegen den Werkzeug-Katalog im Playbook-Repo. Steht
hier, damit dieselbe Prüfung nicht in einem halben Jahr von vorn beginnt.

- **Playwright MCP** — Bedarf besteht und ist terminiert (CLAUDE.md:
  Pflicht vor dem ersten Cashback-Webhook, Phase 6), aber Phase 6 hat noch
  nicht begonnen. Bewusst später, nicht bewusst nie.
- **Supabase MCP** — schreibender Datenbankzugriff, höchster Blast Radius.
  Erst wenn geklärt ist, ob sich der Zugriff auf lesend beschränken lässt.
- **Superpowers** — in Zyklus 6 an einer trivialen Aufgabe beobachtet, dabei
  einen Commit ohne Freigabe ausgeführt. Solange die Freigabedisziplin nicht
  konfigurierbar belegt ist, nicht in diesem Projekt.
- **Design-Skills (frontend-design, Impeccable, taste-skill, UI/UX Pro Max)**
  — die visuelle Referenz ist fixiert (design-refs/, CLAUDE.md). Werkzeuge,
  die Design vorschlagen, arbeiten hier gegen die Design-Treue-Regel.
- **21st.dev Magic MCP** — erzeugt Komponenten für shadcn/ui + Tailwind +
  Radix. Der Stack hier ist CSS Modules ohne Tailwind-Preflight; strukturell
  unpassend.
- **Graphify** — sinnvoll ab etwa 500 Dateien. Dieses Repo hat 466
  versionierte Dateien (Stand 07.08.2026), also knapp darunter. Bei
  deutlichem Wachstum erneut prüfen.
- **claude-mem** — das Projektgedächtnis ist selbst gebaut und verstanden
  (state/memory-map.md, Zwischenstand-Hooks). Ein zweites Gedächtnis daneben
  erzeugt widersprüchliche Wahrheiten; zusätzlich offene Datenschutzfrage,
  weil es jeden Tool-Aufruf mitschreibt.
