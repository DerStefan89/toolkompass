# ToolKompass — Claude Code Master-Kontext

Du arbeitest am Produkt **ToolKompass**.

ToolKompass ist eine Plattform für Gründer, Selbstständige, Coaches, Berater, Agenturen und kleine Teams,
um digitale Business-Tools zu entdecken, zu vergleichen, zu bewerten, zu erwerben und später zu verwalten.

---

## 🎨 Design — VERBINDLICH

Die Design-Screenshots im Ordner `design-refs/` sind die **einzige** visuelle Referenz.
Das Design darf **nicht** frei interpretiert, modernisiert oder verändert werden.

### Design-Token-Übersicht (aus Screenshots abgeleitet)

```
Primärfarbe CTA:     #1e3a2a  (dunkles Grün)
Hintergrund:         #f5f0e8  (Creme/Offwhite)
Karten-Hintergrund:  #ffffff
Text primär:         #1a1a1a
Text sekundär:       #555555
Border:              #e0dbd0
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
Framework:    Next.js 14+ mit App Router
Sprache:      TypeScript (strict)
Styling:      Tailwind CSS + CSS Variables für Design Tokens
Datenbank:    PostgreSQL (Phase 3+)
ORM:          Prisma
Tests:        Playwright (E2E), Vitest (Unit)
Validierung:  Zod
Linting:      ESLint + Prettier
```

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
- Mock-Daten klar von echten Daten trennen

### Definition of Done
- [ ] Screenshot-Referenz wurde genannt
- [ ] Design bleibt treu
- [ ] Komponenten sind wiederverwendbar
- [ ] Props sind typisiert (TypeScript)
- [ ] Fehlerzustände berücksichtigt
- [ ] Leere Zustände berücksichtigt
- [ ] Lange Texte zerstören das Layout nicht
- [ ] Mobile Darstellung berücksichtigt
- [ ] Code ist sinnvoll kommentiert
- [ ] Testfälle definiert

---

## 🚫 Nicht im MVP (nicht bauen!)

- Cashback / Auszahlungen
- Reselling
- Partnerzugänge
- Komplexes Abo-Management
- Community-Bewertungen mit Moderation
- White-Label-Funktionen
- Automatische Preis-Scraper

Diese Themen dürfen **architektonisch vorbereitet**, aber **nicht produktiv umgesetzt** werden.

---

## 📁 Projektstruktur

```
toolkompass/
├── app/                    # Next.js App Router
│   ├── (public)/           # Öffentliche Seiten
│   │   ├── page.tsx        # Startseite
│   │   ├── tools/          # /tools und /tools/[slug]
│   │   ├── kategorien/     # /kategorien und /kategorien/[slug]
│   │   ├── vergleichen/    # /vergleichen und /vergleichen/[slug]
│   │   └── tool-stacks/    # /tool-stacks
│   ├── (admin)/            # Admin-Bereich (Phase 3)
│   └── layout.tsx
├── components/
│   ├── layout/             # Header, Footer, PageShell
│   ├── tool/               # ToolCard, ToolGrid, ToolFinder
│   ├── category/           # CategoryCard, CategoryGrid
│   ├── comparison/         # ComparisonCard, ComparisonTable
│   ├── ui/                 # Button, Badge, SearchBar, FilterPill etc.
│   └── shared/             # CTABox, AffiliateNotice, FAQAccordion
├── lib/
│   ├── types/              # TypeScript-Typen
│   ├── mock-data/          # Mock-Daten (klar als solche markiert)
│   └── utils/
├── styles/
│   └── globals.css         # Design Tokens als CSS Variables
├── design-refs/            # Design-Screenshots (Referenz)
├── agents/                 # Agent-Prompt-Dateien
└── docs/                   # Entscheidungen, Architektur
```

---

## 💬 Kommentar-Standard

Jede wichtige Datei beginnt mit:

```typescript
/**
 * Datei: components/tool/ToolCard.tsx
 *
 * Zweck: [Was macht diese Datei?]
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 * - design-refs/4_Alle_Kategorien.png
 *
 * Produkt-Kontext:
 * [Warum existiert diese Komponente? Was ist ihr Zweck im Produkt?]
 *
 * Wichtig:
 * [Was darf nicht leichtfertig geändert werden?]
 */
```

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

Nach dem Erstellen oder Ändern von UI-Komponenten und Seiten **immer** kurz prüfen:

**Frontend Reviewer** (`agents/frontend-reviewer.md`):
- [ ] Kein `any` in TypeScript
- [ ] `<button>` für Aktionen, `<a>` für Navigation
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
2. MVP-Scope einhalten
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
