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
- [ ] `npx tsc --noEmit` → Exit 0
- [ ] `npm run lint` → 0 neue Errors
- [ ] KEINE Commits ohne explizite Freigabe

---

Aktueller Phasen-Stand & Scope: siehe docs/STATUS.md

---



Kommentar-Standard für neue Dateien: siehe docs/kommentar-standard.md

## 🔧 Bestehende Helper (NUTZEN, nicht neu schreiben)

Vor dem Schreiben neuer Utility-, Format- oder Auth-Funktionen IMMER erst `lib/utils/`, `lib/data/` und `lib/auth/` prüfen — vorhandene Helper nutzen, nicht neu schreiben (z. B. `formatPreis()`, `toSlug()`, `requireAdmin()`)

### Bestehende Admin-Blaupausen (als Muster verwenden):
- `AffiliateLinkManager.tsx` → Inline-CRUD pro Tool
- `FaqEditor.tsx` → Dynamische Zeilen + Hidden-JSON-Field
- `app/admin/vendors/` → Einfachstes CRUD-Muster (3 Actions, AdminTable, Pagination)

---

## 🤖 Agent-Rollen — automatisch anwenden

Beim Start einer Aufgabe die passende Agent-Datei lesen und deren Regeln einhalten.
Mehrere Rollen können gleichzeitig aktiv sein (z. B. Builder + Guardian bei UI-Arbeit).

| Aufgabentyp                              | Agent-Datei lesen                    |
|------------------------------------------|--------------------------------------|
| UI-Komponente oder Seite bauen           | `agents/frontend-builder.md`         |
| Code nach dem Bauen prüfen              | `agents/frontend-reviewer.md`        |
| Design-Treue gegen Screenshot prüfen    | `agents/design-guardian.md`          |
| Neue Iteration planen / Scope klären    | `agents/orchestrator.md`             |
| Tests definieren oder schreiben         | `agents/qa.md`                       |
| Datenmodell oder Architektur entwerfen  | `agents/backend-architect.md`        |

### Pflicht-Reviews nach jeder UI-Aufgabe

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