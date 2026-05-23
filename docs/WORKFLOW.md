# ToolKompass — Claude Code Workflow-Guide

## Wie du Claude Code für dieses Projekt nutzt

---

## 1. Einmalig: Projekt vorbereiten

```bash
# Neuen Ordner erstellen
mkdir toolkompass && cd toolkompass

# Diese Dateien hier rein kopieren:
# - CLAUDE.md                     ← Master-Kontext (PFLICHT)
# - agents/                       ← Alle Agent-Prompts
# - docs/                         ← Iterations-Prompts
# - design-refs/                  ← Screenshots (manuell kopieren!)

# Claude Code starten
claude
```

**Wichtig:** Die Datei `CLAUDE.md` im Root-Verzeichnis wird von Claude Code automatisch als Kontext geladen. Das ist dein permanentes Regelwerk.

---

## 2. Standard-Workflow pro Iteration

### Schritt 1: Iteration starten

Öffne Claude Code und kopiere den Inhalt aus `docs/iteration-XX-prompt.md` direkt in den Chat.

Beispiel für Iteration 1:
```
> [Inhalt von docs/iteration-01-prompt.md einfügen]
```

Claude Code liest automatisch die CLAUDE.md und kennt alle Regeln.

### Schritt 2: Code wird generiert

Claude Code erstellt alle Dateien direkt in deinem Projekt.

### Schritt 3: Review (optional, aber empfohlen)

Für wichtige Komponenten: Reviewe den Code mit dem Frontend Reviewer Agent:

```
> Lies die Datei components/layout/PublicHeader.tsx
  und führe ein Frontend Review nach agents/frontend-reviewer.md durch.
```

### Schritt 4: Design-Prüfung

```
> Vergleiche die Umsetzung von PublicHeader mit design-refs/1_Landing_Page.png
  und führe ein Design Review nach agents/design-guardian.md durch.
```

### Schritt 5: Weiter zu nächster Iteration

---

## 3. Agenten gezielt aufrufen

Anstatt einen Agent manuell zu wechseln, sagst du Claude Code einfach welche Rolle er einnehmen soll:

### Orchestrator aufrufen
```
> Agiere als Orchestrator nach agents/orchestrator.md
  und plane Iteration 3 (ToolCard und Mock-Daten).
```

### Research Agent aufrufen
```
> Agiere als Research Agent nach agents/research.md
  Fragestellung: Wie bauen andere Plattformen ihre Tool-Detailseite auf?
  Untersuche G2, Capterra und AlternativeTo.
```

### Design Guardian aufrufen
```
> Agiere als Design Guardian nach agents/design-guardian.md
  Prüfe die Komponente in components/tool/ToolCard.tsx
  gegen design-refs/4_Alle_Kategorien.png
```

### Backend Architect aufrufen
```
> Agiere als Backend Architect nach agents/backend-architect.md
  Erstelle das Prisma-Datenmodell für Tools, Categories und PricingPlans.
```

---

## 4. Parallele Sessions (fortgeschritten)

Für schnellere Entwicklung kannst du mehrere Claude Code Sessions parallel öffnen:

**Terminal 1 — Research:**
```bash
cd toolkompass
claude
> Agiere als Research Agent: Untersuche UX-Muster für Tool-Discovery-Seiten.
```

**Terminal 2 — Frontend:**
```bash
cd toolkompass
claude
> Agiere als Frontend Builder: Baue die ToolCard nach Iteration-03-Prompt.
```

**Terminal 3 — Review:**
```bash
cd toolkompass
claude
> Agiere als Frontend Reviewer: Prüfe alle neuen Komponenten in components/tool/
```

---

## 5. Iterationen-Übersicht

| # | Iteration | Status | Prompt |
|---|-----------|--------|--------|
| 1 | Projektstruktur & Design Tokens | 🔜 | docs/iteration-01-prompt.md |
| 2 | Header & Footer | 🔜 | docs/iteration-02-prompt.md |
| 3 | ToolCard & Mock-Daten | 🔜 | (noch zu erstellen) |
| 4 | Startseite statisch | 🔜 | (noch zu erstellen) |
| 5 | Alle-Tools-Seite statisch | 🔜 | (noch zu erstellen) |
| 6 | Tool-Detailseite statisch | 🔜 | (noch zu erstellen) |
| 7 | Kategorien-Übersicht statisch | 🔜 | (noch zu erstellen) |
| 8 | Kategorie-Detailseite statisch | 🔜 | (noch zu erstellen) |
| 9 | Vergleiche-Übersicht statisch | 🔜 | (noch zu erstellen) |

---

## 6. Nützliche Claude Code Befehle

```bash
# Gesamten Projektstand erfassen
> Gib mir einen Überblick über den aktuellen Stand des Projekts.
  Welche Dateien existieren, was fehlt noch für Iteration X?

# Fehler debuggen
> Die Seite zeigt einen Fehler: [Fehlermeldung].
  Lies die betroffene Datei und behebe das Problem.

# Code erklären lassen
> Erkläre mir die Komponente in components/tool/ToolCard.tsx
  Warum wurde sie so aufgebaut?

# Entscheidung dokumentieren
> Agiere als Documentation Agent nach agents/documentation.md
  Dokumentiere die Entscheidung: [Entscheidung]
  in docs/DECISIONS.md
```

---

## 7. Goldene Regeln

1. **CLAUDE.md ist heilig** — sie wird nie verändert ohne Überlegung
2. **Screenshots entscheiden** — bei Design-Fragen gewinnt der Screenshot
3. **Erst Briefing, dann Code** — kein Code ohne Plan
4. **Klein bleiben** — eine Iteration = eine kleine, prüfbare Einheit
5. **MVP first** — Cashback, Reselling etc. kommen später
6. **Dokumentieren** — jede wichtige Entscheidung wird in docs/ festgehalten
