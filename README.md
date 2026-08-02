# ToolSucher

Plattform für Gründer, Selbstständige, Coaches, Berater, Agenturen und kleine Teams — digitale Business-Tools entdecken, vergleichen, bewerten und verwalten.

---

## Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js (App Router) |
| Sprache | TypeScript (strict) |
| Styling | CSS Modules (Mobile-First) + CSS Variables aus `app/globals.css`. Tailwind wird nur für den Utilities-Import (`@import "tailwindcss/utilities"`) und die Theme-Variablen (`@theme inline`) in `app/globals.css` genutzt, nicht als Styling-Ansatz. |
| Schriften | Playfair Display (Headlines), Inter (Body) |

Versionen: siehe `package.json`.

---

## Setup

1. `npm install` — installiert die Abhängigkeiten. Über das `postinstall`-Script läuft danach automatisch `prisma generate`.
2. `.env.example` nach `.env.local` kopieren und befüllen. `.env.local` deshalb, weil sowohl `prisma.config.ts` als auch `prisma/seed.ts` ihre Umgebungsvariablen explizit aus dieser Datei laden:
   - `DATABASE_URL` — Pooler-Verbindung, für den Query-Betrieb der App
   - `DIRECT_URL` — Direktverbindung, für Prisma-CLI und Seed
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase-Client
   - `SUPABASE_SERVICE_ROLE_KEY` — nur serverseitig verwenden
   - `IP_HASH_SALT` — optional; ohne diesen Wert wird beim Affiliate-Tracking kein IP-Hash gespeichert (Privacy-by-default)
   - `SENTRY_DSN` — für die lokale Entwicklung leer lassen
3. `npx prisma generate` — falls sich das Schema seit dem letzten `npm install` geändert hat.
4. Seed-Daten einspielen: `npx tsx prisma/seed.ts`
5. `npm run dev` → [http://localhost:3000](http://localhost:3000)

---

## Prüfen vor dem Commit

```bash
npm run check
```

Führt nacheinander aus: ESLint (`npm run lint`), TypeScript-Typecheck (`npm run typecheck`) und das Doku-Gate (`scripts/check-docs.mjs`, prüft Anweisungsdokumente auf tote Verweise und Versionsnummern in Prosa). Pflicht vor jedem Commit — kein Commit ohne grünes `npm run check`.

---

## Weiterlesen

- [`CLAUDE.md`](./CLAUDE.md) — Arbeitsregeln
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — verbindliche Code-Konventionen
- [`docs/STATUS.md`](./docs/STATUS.md) — Phasenstand und Scope
- [`docs/design-system.md`](./docs/design-system.md) — Gestaltungsmaßstäbe

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
- **Browser-Fehler generell:** Es existiert nur `sentry.server.config.ts` und `sentry.edge.config.ts`, kein `sentry.client.config.ts`. Erfasst werden ausschließlich Fehler in Server- und Edge-Runtime, keine im Browser. <!-- check-docs-ignore: Dokumentiert bewusst das Fehlen von sentry.client.config.ts, kein Verweis darauf -->
