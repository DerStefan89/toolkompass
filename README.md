# ToolSucher

Plattform für Gründer, Selbstständige, Coaches, Berater, Agenturen und kleine Teams — digitale Business-Tools entdecken, vergleichen, bewerten und verwalten.

---

## Stack

| Technologie | Version |
|---|---|
| Next.js (App Router) | 15+ |
| TypeScript | strict |
| Tailwind CSS | v4 (CSS-first) |
| Schriften | Playfair Display (Headlines), Inter (Body) |

---

## Quickstart

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

---

## Ordnerstruktur

```
toolsucher/
├── app/                    # Next.js App Router
│   ├── globals.css         # Design Tokens (CSS Variables + Tailwind @theme)
│   ├── layout.tsx          # Root Layout mit Fonts und Metadata
│   └── page.tsx            # Startseite
├── components/
│   ├── layout/             # Header, Footer, PageShell
│   ├── tool/               # ToolCard, ToolGrid, ToolFinder
│   ├── category/           # CategoryCard, CategoryGrid
│   ├── comparison/         # ComparisonCard, ComparisonTable
│   ├── ui/                 # Button, Badge, SearchBar, FilterPill
│   └── shared/             # CTABox, AffiliateNotice, FAQAccordion
├── lib/
│   ├── types/              # TypeScript-Typen (Tool, Category, …)
│   ├── mock-data/          # Mock-Daten (klar als solche markiert)
│   └── utils/
├── design-refs/            # Design-Screenshots (verbindliche Referenz)
├── agents/                 # Claude Code Agent-Definitionen
└── docs/                   # Entscheidungen, Iterationsprompts, Architektur
```

---

## Design

Das Design orientiert sich **verbindlich** an den Screenshots in `design-refs/`.

- Hintergrund: `#f5f0e8` (Creme)
- CTA-Farbe: `#1e3a2a` (dunkles Grün)
- Headlines: Playfair Display (Serif)
- Body: Inter (Sans-serif)

Kein Redesign ohne explizite Freigabe. Alle Design Tokens sind als CSS Variables in `app/globals.css` definiert und via `@theme inline` in Tailwind verfügbar.

---

## Error Monitoring

Sentry ist für Production-Fehler eingebunden — im lokalen Betrieb vollständig deaktiviert.

**Einrichten (Vercel):**
1. Projekt auf sentry.io anlegen (Free Tier reicht)
2. DSN aus Projekt-Einstellungen kopieren
3. In Vercel → Settings → Environment Variables eintragen: `SENTRY_DSN=https://...`

**Lokal:** `SENTRY_DSN` leer lassen oder nicht setzen — Sentry lädt nicht, null Overhead.

**Was wird erfasst:**
- DB-Fehler in allen Admin Server Actions (create/update/delete)
- Fehler im Affiliate-Click-Tracking (`/api/track/[linkId]`)

**Was nicht erfasst wird:**
- Performance-Daten (`tracesSampleRate: 0`)
- Session Replay (nicht konfiguriert)
- Auth-Fehler in `lib/supabase/server.ts` (bewusst stiller Catch)
