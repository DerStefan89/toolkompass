# ToolSucher — Architecture Guide
## Pflichtlektüre vor jedem Code-Commit

---

### 1. Styling

- CSS Modules pro Seite/Komponente (`<Komponente>.module.css`)
- Inline-Styles nur für dynamische Werte (berechnete Breiten etc.)
- Alle Farben/Abstände über CSS-Variablen aus `globals.css`
- Breakpoints: `640px` · `768px` · `1024px` · `1280px`
- Mobile-First: Default für 375 px, `@media (min-width: X)` für größere
- Jeder Container mit `max-width` braucht auch `width: 100%`

---

### 2. Error-Handling

- Jede Server Action gibt `ActionState` zurück
- Jeder `catch`: `console.error('[ActionName]', error)` + `captureException`
- User sieht deutsche Fehlermeldung, nie technische Details

**Bewusst nicht erfasst: Browser-Fehler.** Sentry läuft ausschließlich in Server- und
Edge-Runtime (`sentry.server.config.ts`, `sentry.edge.config.ts`) — es gibt kein
`sentry.client.config.ts`. <!-- check-docs-ignore: Dokumentiert bewusst das Fehlen von sentry.client.config.ts, kein Verweis darauf -->
Ein Client-SDK würde bei jedem Besucher ausgeliefert, Browser-Daten erheben und den DSN
öffentlich machen; das steht zum aktuellen Betriebsumfang nicht im Verhältnis. Entscheidung
vom 02.08.2026. <!-- check-docs-ignore: Datumsangabe, keine Versionsnummer -->
Bei wachsendem Angebot wird neu entschieden und `datenschutz.md` ergänzt.

---

### 3. Auth

- Erste Zeile jeder Admin-Server-Action: `await requireAdmin()`
- Erste Zeile jeder User-Server-Action: `await requireUser()`
- Kein direktes `createClient()` + `getUser()` in Actions
- `requireAdmin()` wirft `AuthError` wenn nicht eingeloggt oder nicht Admin
- `requireUser()` wirft `AuthError` wenn nicht eingeloggt (ab Phase 4.3)

```ts
// Admin-Action:
try {
  await requireAdmin()
} catch {
  return { error: 'Nicht autorisiert.' }
}

// User-Action (ab Phase 4.3):
try {
  const { userId } = await requireUser()
} catch {
  return { error: 'Bitte einloggen.' }
}

// Falsch (NIEMALS in Actions):
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Nicht autorisiert.' }
```

---

### 4. Pagination

- `lib/utils/pagination.ts` ist einzige Pagination-Quelle
- Default: 25 Einträge, Max: 100
- Kein `take` ohne `skip`

---

### 5. Datenbank

- Geldbeträge als `Int` in Cent (Float verboten)
- Redaktionelle und Community-Bewertungen bleiben getrennt — eigene Modelle, eigene
  Anzeige. Die Glaubwürdigkeit des Portals hängt daran.
- Affiliate-Links werden auditierbar gespeichert: Jede Änderung am Link und jeder Klick
  müssen nachvollziehbar bleiben. Provisionen ohne Prüfspur sind nicht verhandelbar.
- Slugs via `toSlug()` aus `lib/utils/form.ts`
- `revalidatePath` nach jeder Mutation auf Admin- UND public Pfad
- `Promise.all` für parallele Queries
- DB-Migrationen: SQL-Datei erstellen → MANUELL im Supabase SQL Editor ausführen → `npx prisma generate`. NICHT `prisma migrate` (crasht auf Vercel)
- Data-Access-Layer: wiederverwendbare Queries in `lib/data/*.ts` mit `React.cache()` — keine Prisma-Calls direkt in Page-Dateien duplizieren

---

### 6. SEO (ab Phase 3)

- `generateMetadata` auf jeder public Seite
- JSON-LD auf Tool-, Artikel-, Vergleichs-, Kategorie-Seiten
- `next/image` statt `<img>`, immer mit `alt`-Text

---

### 6b. Scripts — sicherer Default

**Ziel:** Scripts, die die DB verändern, schreiben nur mit `--execute`. Ohne Flag: Dry-Run.
Begründung: Ein Schalter, den man setzen muss, damit nichts kaputtgeht, ist keine
Sicherheitsmaßnahme, sondern eine Bitte an das Gedächtnis.

**Stand:** umgesetzt in allen zehn Scripts, die in die DB schreiben — über die
gemeinsame Modus-Logik `startScript()` in `scripts/_mode.ts`. `--dry-run` wird
nirgends mehr ausgewertet.

Jede Datei-Fehlermeldung nennt den vollständig aufgelösten Pfad, nicht nur den Dateinamen.

---

### 7. Verbotene Patterns

| Verboten | Erlaubt |
|---|---|
| Native `<img>`-Tags | `<Image>` aus `next/image` |
| `as any` oder `: any` | Konkrete Typen, `unknown` |
| `SUPABASE_SERVICE_ROLE_KEY` außerhalb `lib/supabase/admin.ts` | Nur in `admin.ts` |
| Direkter Prisma-Call in Client Components | Server Action / Route Handler |
| `take` ohne `skip` | Immer beide setzen |
| `createClient()` + `getUser()` in Actions | `requireAdmin()` / `requireUser()` |
| `prisma migrate` | SQL manuell in Supabase ausführen |
| Nutzergenerierter Content durch `rehypeRaw` / `dangerouslySetInnerHTML` | Plain Text rendern (XSS-Schutz) |

**Zur letzten Regel:** `react-markdown` mit `rehypeRaw` wird aktuell für Admin-Content verwendet
(Tool-Beschreibungen). Das ist vertretbar, weil der Inhalt nur von Admins stammt.
Ab Phase 4.4 (Bewertungssystem) kommt nutzergenerierter Content dazu —
Kommentare und Bewertungen werden **ausschließlich als Plain Text** gerendert.
Kein Markdown, kein HTML, kein `dangerouslySetInnerHTML` für User-Input.

**Ausnahme zur `<img>`-Regel:** In Upload-Vorschauen (`LogoUpload`, `ScreenshotUpload`)
zeigt `<img>` eine lokale Blob-URL der noch nicht hochgeladenen Datei; `next/image` kann
Blob-URLs nicht optimieren. Die Regel steht in `eslint.config.mjs` auf `error`, diese
beiden Stellen tragen ein `eslint-disable-next-line` mit Begründung. Jede weitere Ausnahme
braucht denselben Nachweis — sonst ist sie eine Umgehung.