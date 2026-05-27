# ToolSucher — Architecture Guide
## Pflichtlektüre vor jedem Code-Commit

---

### 1. Styling

- CSS Modules pro Seite/Komponente (`Datei.module.css`)
- Inline-Styles nur für dynamische Werte (berechnete Breiten etc.)
- Alle Farben/Abstände über CSS-Variablen aus `globals.css`
- Breakpoints: `640px` · `768px` · `1024px` · `1280px`
- Mobile-First: Default für 375 px, `@media (min-width: X)` für größere

---

### 2. Error-Handling

- Jede Server Action gibt `ActionState` zurück
- Jeder `catch`: `console.error('[ActionName]', error)` + `captureException`
- User sieht deutsche Fehlermeldung, nie technische Details

---

### 3. Auth

- Erste Zeile jeder Admin-Server-Action: `await requireAdmin()`
- Kein direktes `createClient()` + `getUser()` in Actions
- `requireAdmin()` wirft `AuthError` wenn nicht eingeloggt

```ts
// Korrekt:
try {
  await requireAdmin()
} catch {
  return { error: 'Nicht autorisiert.' }
}

// Falsch:
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
| `createClient()` + `getUser()` in Actions | `requireAdmin()` |
