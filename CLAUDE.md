# ToolSucher — Claude Code Master-Kontext

## Pflichtlektüre
Lies `ARCHITECTURE.md` bevor du Code schreibst.
Alle Konventionen dort sind verbindlich.

---

Du arbeitest am Produkt **ToolSucher**.

ToolSucher ist eine Plattform für Gründer, Selbstständige, Coaches, Berater, Agenturen und kleine Teams,
um digitale Business-Tools zu entdecken, zu vergleichen, zu bewerten, zu erwerben und später zu verwalten.

---

## 🎨 Design — VERBINDLICH

Die Design-Screenshots im Ordner `design-refs/` sind die **einzige** visuelle Referenz.
Das Design darf **nicht** frei interpretiert, modernisiert oder verändert werden.

### Design-Tokens
Siehe `app/globals.css` (CSS-Variablen `--color-*`, `--radius-*`, `--shadow-*`, dort kommentiert).

### Designprinzipien
- Vertrauenswürdig, kuratiert, ruhig, editorial, hochwertig — nicht verspielt
- Creme-/Offwhite-Hintergründe, feine Linien, Cards, abgerundete Ecken, dezente Icons
- Dunkles Grün = einzige CTA-Farbe
- Goldener Kompass = Markenzeichen (Logo)
- Kein Redesign ohne explizite Freigabe
- Keine neuen Farben, Schatten, Rundungen ohne Begründung

Screenshots in design-refs/ — Dateiname benennt die Seite.

---

## 🏗️ Technischer Stack

```
Framework:    Next.js 16.2.6 (App Router)
Sprache:      TypeScript (strict, 0 Fehler Pflicht)
Styling:      CSS Modules (Mobile-First) + CSS Variables aus globals.css
Datenbank:    PostgreSQL via Supabase (eu-central-1 Frankfurt)
ORM:          Prisma 7 mit pg Driver Adapter
Auth:         Supabase Auth (app_metadata.role für Admin)
Hosting:      Vercel (Hobby Plan)
Monitoring:   Sentry (nur Production, tracesSampleRate: 0)
Linting:      ESLint (eslint-config-next)
```
### Befehle

```
npm install              # Abhängigkeiten; erzeugt danach automatisch den Prisma-Client
npm run dev              # Entwicklungsserver → http://localhost:3000
npm run build            # Produktions-Build
npm run start            # Produktions-Server lokal
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run check            # lint + typecheck — das Tor vor jedem Commit
npx prisma generate      # Prisma-Client nach Schema-Änderung neu erzeugen
npx tsx prisma/seed.ts   # Seed-Daten einspielen
```

**Nicht im Projekt (nicht verwenden):**
- Kein Tailwind-Preflight (nur `@import "tailwindcss/utilities"` für PostCSS)
- Kein Zod (Pflicht vor Cashback-Webhooks in Phase 6)
- Kein Playwright, kein Vitest (Pflicht vor Cashback-Webhooks in Phase 6)
- Kein Prettier (ESLint reicht)

---

## 📐 Arbeitsweise — IMMER einhalten

### Vor jeder Aufgabe: Briefing
```
1. Ziel der Iteration
2. Relevante Design-Referenz (Dateiname nennen)
3. Komponenten und Datenbedarf
4. Zustände: Default / Hover / Empty / Loading / Error
5. Akzeptanzkriterien
6. Risiken
```

### Iterationsprinzip
- Jede Iteration ist klein, prüfbar und abgeschlossen
- Keine großen Funktionspakete auf einmal
- Erst planen, dann umsetzen
- Ein Task nach dem anderen — nie parallel
- Ein Schreiber pro Arbeitsverzeichnis. Keine zweite Claude-Sitzung im selben Ordner; parallele Arbeit nur in getrennten git-Worktrees.
- Iterationsende heißt: `git status` prüfen, Freigabe einholen, committen UND pushen. Gegenstück zur Commit-Freigabe-Regel — eine Bremse ohne Gaspedal erzeugt Halden.
- Keine Versionsnummern in Prosa. Versionen stehen ausschließlich in `package.json`.

### Definition of Done
- [ ] Design bleibt treu (Design-Tokens, keine neuen Farben/Schatten)
- [ ] Komponenten sind wiederverwendbar
- [ ] Props sind typisiert (TypeScript strict, kein `any`)
- [ ] Fehlerzustände berücksichtigt (catch + console.error + captureException)
- [ ] Leere Zustände berücksichtigt (freundlicher Empty-State)
- [ ] Lange Texte zerstören das Layout nicht
- [ ] Mobile Darstellung berücksichtigt (375px default)
- [ ] Jeder Container mit max-width hat auch width: 100%
- [ ] Code ist sinnvoll kommentiert (Datei-Header + JSDoc)
- [ ] `npm run check` → Exit 0 (Lint + Typecheck)
- [ ] KEINE Commits ohne explizite Freigabe
---

Aktueller Phasen-Stand & Scope: siehe docs/STATUS.md

---

Kommentar-Standard für neue Dateien: siehe docs/kommentar-standard.md
Erwartete Skills: `tool-anlegen` (eigener Skill, im Repo). `ponytail` v4.8.4 (fremd, MIT, Quelle: github.com/DietrichGebert/ponytail) — nur SKILL.md kopiert, kein ausführbarer Code.

## 🔧 Bestehende Helper (NUTZEN, nicht neu schreiben)

Vor dem Schreiben neuer Utility-, Format- oder Auth-Funktionen IMMER erst `lib/utils/`, `lib/data/` und `lib/auth/` prüfen — vorhandene Helper nutzen, nicht neu schreiben (z. B. `formatPreis()`, `toSlug()`, `requireAdmin()`)

### Bestehende Admin-Blaupausen (als Muster verwenden):
- `AffiliateLinkManager.tsx` → Inline-CRUD pro Tool
- `FaqEditor.tsx` → Dynamische Zeilen + Hidden-JSON-Field
- `app/admin/vendors/` → Einfachstes CRUD-Muster (3 Actions, AdminTable, Pagination)

---

## 🤖 Prüfrollen als Subagenten

Drei Prüfrollen liegen als echte Subagenten in `.claude/agents/`: eigener Kontext, keine
Schreibrechte (`tools: Read, Grep, Glob`). Sie werden nicht gelesen, sondern delegiert —
Claude Code wählt sie anhand ihrer `description`.

| Rolle | Wofür |
|---|---|
| `frontend-reviewer` | Code nach dem Bauen prüfen |
| `design-guardian`   | Design-Treue gegen die Screenshots prüfen |
| `qa`                | Akzeptanztests und Randfälle definieren |

Nach jeder UI-Aufgabe Pflicht: `frontend-reviewer` und `design-guardian`.

Sie können ihre Befunde nicht selbst wegräumen — das ist Absicht. Ein Prüfer mit
Schreibrechten wird heimlich zum Autor.

Für das Bauen selbst gibt es bewusst keine Rollen-Datei: Stack und Regeln stehen in
`ARCHITECTURE.md`, der Ablauf im Briefing und in der Definition of Done oben.

---

## 🔄 Entscheidungsregel bei Unsicherheit

1. Design-Screenshot respektieren
2. Aktuellen Scope laut docs/STATUS.md einhalten
3. Wartbarkeit bevorzugen
4. Komplexität reduzieren
5. Entscheidung dokumentieren — niemals stillschweigend in Code verwandeln

---

## ✅ Status-Format (Jede Ausgabe endet damit)

```
## Status
- [ ] Freigegeben
- [ ] Freigegeben mit Hinweisen
- [ ] Nicht freigegeben
- [ ] Blockiert

## Nächster sinnvoller Schritt
...
```
## ⚠️ Bekannte Fallen

- Symptom: git add übernimmt manche Dateien stillschweigend nicht  (OneDrive-ReparsePoints) — Logos fehlten dadurch wochenlang im Repo
- Was tun: Nach jedem git add von Binärdateien (Logos, Bilder): mit git status prüfen, ob sie wirklich staged sind.