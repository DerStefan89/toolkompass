# Iteration 1 — Projektstruktur & Design Tokens
# Dieser Prompt wird direkt in Claude Code eingegeben.
# Kopiere den Inhalt unter "PROMPT" 1:1 in Claude Code.

---

## PROMPT

Du arbeitest am Produkt ToolKompass.
Lies zuerst die CLAUDE.md im aktuellen Verzeichnis als Kontext.

**Aufgabe: Iteration 1 — Next.js-Projektstruktur und Design Tokens**

Ziel dieser Iteration ist das technische Fundament: ein laufendes Next.js-Projekt mit korrekter Ordnerstruktur, Design Tokens als CSS Variables und Tailwind-Konfiguration.

### Briefing (zuerst ausgeben, bevor du Code schreibst)

1. Ziel
2. Annahmen
3. Relevante Design-Referenz
4. Was entsteht (Komponenten/Dateien)
5. Risiken
6. Akzeptanzkriterien

### Was gebaut wird

Führe diese Schritte in dieser Reihenfolge aus:

**Schritt 1: Next.js-Projekt erstellen**
```bash
npx create-next-app@latest toolkompass \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**Schritt 2: Ordnerstruktur anlegen**
```
components/
  layout/
  tool/
  category/
  comparison/
  ui/
  shared/
lib/
  types/
  mock-data/
  utils/
docs/
design-refs/   ← Platzhalter, Screenshots werden manuell kopiert
```

**Schritt 3: Design Tokens als CSS Variables** in `styles/globals.css`

Aus den Screenshots abgeleitet:
- `--color-bg`: #f5f0e8 (Creme-Hintergrund)
- `--color-bg-card`: #ffffff
- `--color-cta`: #1e3a2a (dunkles Grün)
- `--color-cta-hover`: #152d1f
- `--color-text-primary`: #1a1a1a
- `--color-text-secondary`: #666666
- `--color-border`: #e0dbd0
- `--color-badge-bg`: #f0ece2
- `--radius-card`: 8px
- `--radius-btn`: 6px
- `--shadow-card`: 0 1px 4px rgba(0,0,0,0.06)

**Schritt 4: Tailwind-Konfiguration** in `tailwind.config.ts`
Mappe die CSS Variables auf Tailwind-Klassen:
- `cream` → var(--color-bg)
- `cta` → var(--color-cta)
- etc.

**Schritt 5: Fonts einbinden** in `app/layout.tsx`
- Playfair Display (Google Fonts, für Headlines)
- Inter (Google Fonts, für Body)

**Schritt 6: Basis-Layout** in `app/layout.tsx`
- Body-Hintergrundfarbe: `--color-bg` (Creme)
- Font-Variablen korrekt gesetzt
- Grundlegendes Meta-Setup (title, description)

**Schritt 7: Basis-Typen** in `lib/types/index.ts`
Erstelle die Tool-Typen aus CLAUDE.md:
```typescript
export type TargetAudience = 'solo' | 'team' | 'agency' | 'creator' | 'consultant' | 'developer';

export type Tool = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  categoryIds: string[];
  useCaseIds: string[];
  targetAudiences: TargetAudience[];
  startingPriceMonthly?: number;
  hasFreePlan: boolean;
  isAffiliate: boolean;
  vendorId: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notIdealFor: string[];
  lastCheckedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  toolCount?: number;
  exampleTools?: string[];
};
```

**Schritt 8: README erstellen**
Grundstruktur mit: Was ist ToolKompass, Stack, Quickstart, Ordnerstruktur, Design-Hinweis.

### Akzeptanzkriterien

- [ ] `npm run dev` startet ohne Fehler auf localhost:3000
- [ ] `npm run build` schlägt nicht fehl
- [ ] Hintergrundfarbe ist Creme (#f5f0e8), nicht Weiß
- [ ] Playfair Display und Inter sind eingebunden
- [ ] CSS Variables sind in globals.css definiert
- [ ] Tailwind nutzt die Design Tokens
- [ ] TypeScript Types sind definiert
- [ ] Ordnerstruktur entspricht der Vorgabe
- [ ] README existiert

### Nicht Teil dieser Iteration
- Kein Header/Footer (kommt in Iteration 2)
- Keine Seiteninhalte
- Keine Mock-Daten
- Kein Backend

Am Ende: Status ausgeben (Freigegeben / Nicht freigegeben / Blockiert)
