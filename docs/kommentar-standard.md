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