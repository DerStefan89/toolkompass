# Iteration 2 — Public Header & Footer
# Dieser Prompt wird direkt in Claude Code eingegeben (nach Iteration 1).

---

## PROMPT

Du arbeitest am Produkt ToolSucher.
Lies zuerst die CLAUDE.md im aktuellen Verzeichnis als Kontext.

**Aufgabe: Iteration 2 — Public Header und Footer**

Ziel: Header und Footer exakt nach den Design-Screenshots umsetzen.

### Referenz-Screenshots
- `design-refs/1_Landing_Page.png` → Header oben, Footer unten
- `design-refs/4_Alle_Kategorien.png` → Header mit aktiver Navigation
- `design-refs/5_Tool_Stacks.png` → Header Variante

### Briefing (zuerst ausgeben)
1. Ziel
2. Annahmen zum Design (aus Screenshots abgeleitet)
3. Komponenten die entstehen
4. Props und Zustände
5. Akzeptanzkriterien

### Was gebaut wird

**PublicHeader** (`components/layout/PublicHeader.tsx`)

Aus den Screenshots:
- Logo links: goldener Kompass + "ToolSucher" (Serif-Font)
- Navigation Mitte: "Entdecken", "Vergleichen", "Tool-Stacks", "Ratgeber"
- Rechts: Herz-Icon (Merkliste), Button "Einloggen" oder "Tool-Finder starten" (je nach Seite)
- Aktiver Nav-Link: unterstrichen (grün)
- Hintergrund: Creme (#f5f0e8) oder transparent auf Startseite
- Mobile: Hamburger-Menü

Props:
```typescript
type PublicHeaderProps = {
  activePage?: 'entdecken' | 'vergleichen' | 'tool-stacks' | 'ratgeber';
  ctaVariant?: 'einloggen' | 'tool-finder' | 'zur-website';
  ctaLabel?: string;
};
```

**PublicFooter** (`components/layout/PublicFooter.tsx`)

Aus den Screenshots:
- Logo + Tagline links
- 6 Spalten: Entdecken, Vergleichen, Tool-Stacks, Ratgeber, Über uns / Unternehmen, Rechtliches
- Social Icons: LinkedIn, Twitter/X, Instagram, E-Mail
- Copyright-Zeile: "© 2025 ToolSucher – Alle Rechte vorbehalten."
- Hintergrund: Creme

**PageShell** (`components/layout/PageShell.tsx`)
Wrapper-Komponente: Header + {children} + Footer

### Akzeptanzkriterien
- [ ] Header wirkt visuell wie in den Screenshots
- [ ] Navigation-Links sind vorbereitet (href als Platzhalter)
- [ ] Aktiver Link-State funktioniert (via `activePage` Prop oder `usePathname`)
- [ ] CTA-Button ist dunkelgrün, weißer Text
- [ ] Footer hat alle 6 Spalten mit Platzhalter-Links
- [ ] Social Icons sind vorhanden
- [ ] Mobile: Navigation klappt zusammen (Hamburger)
- [ ] Hintergrund beider Komponenten: Creme, nicht Weiß
- [ ] PageShell kann auf allen Seiten verwendet werden

### Nicht Teil dieser Iteration
- Kein Login-System
- Keine echte Merkliste
- Keine Suche im Header

Am Ende: Status ausgeben.
