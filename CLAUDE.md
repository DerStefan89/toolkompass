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

### Design-Token-Übersicht (aus Screenshots abgeleitet)

```
Primärfarbe CTA:     #1e3a2a  (dunkles Grün)
CTA Hover:           #152d1f
Hintergrund:         #f5f0e8  (Creme/Offwhite)
Karten-Hintergrund:  #ffffff
Text primär:         #1a1a1a
Text sekundär:       #666666
Border:              #e0dbd0
Badge-Hintergrund:   #f0ece2
Erfolg:              #38a169
Fehler:              #e53e3e
Warnung:             #d97706
Border-Radius Card:  8px
Border-Radius Button: 6px
Schrift Headlines:   Playfair Display (Serif)
Schrift Body:        Inter oder System-Sans
Schatten:            0 1px 4px rgba(0,0,0,0.06)
```

### Designprinzipien
- Vertrauenswürdig, kuratiert, ruhig, editorial, hochwertig — nicht verspielt
- Creme-/Offwhite-Hintergründe, feine Linien, Cards, abgerundete Ecken, dezente Icons
- Dunkles Grün = einzige CTA-Farbe
- Goldener Kompass = Markenzeichen (Logo)
- Kein Redesign ohne explizite Freigabe
- Keine neuen Farben, Schatten, Rundungen ohne Begründung

### Design-Referenz-Dateien
```
design-refs/1_Landing_Page.png          → Startseite
design-refs/2_Tool_Detailseite.png      → Tool-Detailseite (Admin-Ansicht)
design-refs/3_Vergleichsseite.png       → Vergleiche
design-refs/4_Alle_Kategorien.png       → Kategorien-Übersicht + Tool-Discovery
design-refs/5_Tool_Stacks.png           → Tool-Stacks
design-refs/6_Tool_bewerten.png         → Bewertungsformular
```

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
- Kein Zod (kommt erst für Webhook-Validierung in Phase 4.6)
- Kein Playwright, kein Vitest (Vitest wird in Phase 4.6 eingeführt)
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

## 🔄 Aktueller Scope — Phase 4

### In Phase 4 (bauen!):
- Tool-Finder (interaktiver Fragebogen)
- PricingPlan-Modell + Admin-UI + Anzeige
- User-Accounts mit Magic Link (Supabase Auth)
- Bewertungssystem mit kategoriespezifischen Kriterien + Moderation
- Tool-Stack-Manager (eingeloggter Bereich)
- Cashback-Infrastruktur (Webhooks + Admin, NICHT öffentlich)

### Nicht bauen:
- Reselling
- Partnerzugänge
- Komplexes Abo-Management
- White-Label-Funktionen
- Automatische Preis-Scraper
- Cashback-UI für Endnutzer (erst wenn echte Conversions bestätigt)

---

## 📁 Projektstruktur

```
toolkompass/
├── app/
│   ├── page.tsx                          Startseite
│   ├── layout.tsx                        Root Layout
│   ├── globals.css                       Design Tokens
│   ├── sitemap.ts                        Auto-Sitemap
│   ├── api/search/route.ts              Autocomplete-API
│   ├── api/track/[linkId]/              Affiliate-Tracking
│   ├── suche/                           Suchseite
│   ├── kategorien/[slug]/               Kategorie-Detail
│   ├── tools/[slug]/                    Tool-Detail
│   ├── vergleichen/[slug]/              Vergleich
│   ├── ratgeber/[slug]/                 Artikel
│   ├── tool-stacks/[slug]/              Stack-Detail
│   ├── tool-finder/                     Tool-Finder
│   ├── einloggen/                       Login
│   └── admin/
│       ├── analytics/                   Affiliate-Dashboard
│       ├── tools/                       Tool-CRUD + Affiliate-Filter
│       ├── kategorien/                  Kategorie-CRUD
│       ├── artikel/                     Artikel-CRUD
│       ├── vergleiche/                  Vergleich-CRUD
│       ├── stacks/                      Stack-CRUD
│       ├── tags/                        Tag-CRUD
│       └── vendors/                     Vendor-CRUD
├── components/
│   ├── SearchInput.tsx                  Autocomplete (Client Component)
│   ├── admin/                           ToolForm, FaqEditor, AffiliateLinkManager, etc.
│   ├── category/CategoryFilter.tsx      Live-Filter (Client Component)
│   └── layout/                          Header, Footer
├── lib/
│   ├── prisma.ts                        Singleton mit Driver Adapter
│   ├── auth/require-admin.ts            Auth-Helper (prüft app_metadata.role)
│   ├── data/                            Data-Access-Layer (React cache)
│   ├── seo/json-ld.ts                   JSON-LD Helper
│   ├── utils/format.ts                  formatPreis(cents, {hasFreePlan})
│   ├── utils/pagination.ts              Pagination-Helper
│   ├── utils/form.ts                    toSlug(), parseStr(), parseLines()
│   └── supabase/                        server.ts, client.ts, admin.ts
├── scripts/                             Import/Update-Scripts (mit --dry-run)
├── proxy.ts                             Auth-Middleware (schützt /admin)
├── CLAUDE.md                            ← DU BIST HIER
├── ARCHITECTURE.md                      Code-Konventionen
└── prisma/schema.prisma                 DB-Schema (28 Tabellen)
```

---

## 💬 Kommentar-Standard

Jede neue Datei beginnt mit:

```typescript
/**
 * Datei: components/admin/PricingPlanManager.tsx
 *
 * Zweck: [Was macht diese Datei?]
 *
 * Wird aufgerufen von:
 * - app/admin/tools/[id]/page.tsx
 *
 * Wichtig:
 * [Was darf nicht leichtfertig geändert werden?]
 */
```

Jede neue Funktion bekommt JSDoc:

```typescript
/**
 * Formatiert einen Preis in Cent auf deutsches Euro-Format.
 * @param cents - Preis in Cent (null = kostenlos oder auf Anfrage)
 * @param opts.hasFreePlan - true → "Kostenlos" statt "Auf Anfrage"
 * @returns Formatierter Preis-String (z.B. "9,90 €")
 */
```

---

## 🔧 Bestehende Helper (NUTZEN, nicht neu schreiben)

| Helper | Datei | Zweck |
|--------|-------|-------|
| `requireAdmin()` | `lib/auth/require-admin.ts` | Auth-Guard für Admin-Actions |
| `formatPreis()` | `lib/utils/format.ts` | Preisformatierung Cent → Euro |
| `parsePageParams()` | `lib/utils/pagination.ts` | Prisma-Pagination (25 pro Seite) |
| `toSlug()` | `lib/utils/form.ts` | Slug-Generierung |
| `parseStr()` / `parseLines()` | `lib/utils/form.ts` | FormData-Parsing |
| `captureException()` | `@sentry/nextjs` | Error-Reporting |
| `createSupabaseAdmin()` | `lib/supabase/admin.ts` | Supabase Admin-Client |

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

**Frontend Reviewer** (`agents/frontend-reviewer.md`):
- [ ] Kein `any` in TypeScript
- [ ] `<button>` für Aktionen, `<a>` / `<Link>` für Navigation
- [ ] Empty State vorhanden
- [ ] Layout bricht bei langen Texten nicht

**Design Guardian** (`agents/design-guardian.md`):
- [ ] Farben stimmen mit Design Tokens überein
- [ ] Hintergrund Creme (`#f5f0e8`), nicht Weiß
- [ ] Nur `#1e3a2a` als CTA-Farbe
- [ ] Abstände und Typografie konsistent mit Screenshots

---

## 🔄 Entscheidungsregel bei Unsicherheit

1. Design-Screenshot respektieren
2. Aktuellen Phase-4-Scope einhalten
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
