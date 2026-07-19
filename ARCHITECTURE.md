# ToolSucher — Architecture Guide
## Pflichtlektüre vor jedem Code-Commit

---

### 1. Styling

- CSS Modules pro Seite/Komponente (`Datei.module.css`)
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
- Slugs via `toSlug()` aus `lib/utils/form.ts`
- `revalidatePath` nach jeder Mutation auf Admin- UND public Pfad
- `Promise.all` für parallele Queries
- DB-Migrationen: SQL-Datei erstellen → MANUELL im Supabase SQL Editor ausführen → `npx prisma generate`. NICHT `prisma migrate` (crasht auf Vercel)
- Data-Access-Layer: wiederverwendbare Queries in `lib/data/*.ts` mit `React.cache()` — keine Prisma-Calls direkt in Page-Dateien duplizieren
- Jedes Script in scripts/, das die DB verändert, wird zuerst mit --dry-run ausgeführt
- Der Dry-Run-Output wird geprüft, bevor der Echtlauf startet
- Das gilt ausnahmslos (auch für „kleine" Scripts)

---

### 6. SEO (ab Phase 3)

- `generateMetadata` auf jeder public Seite
- JSON-LD auf Tool-, Artikel-, Vergleichs-, Kategorie-Seiten
- `next/image` statt `<img>`, immer mit `alt`-Text

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
