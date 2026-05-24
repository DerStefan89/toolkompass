/**
 * Datei: app/admin/kategorien/neu/page.tsx
 *
 * Zweck: Admin-Seite zum Erstellen einer neuen Kategorie.
 * Rendert KategorieForm im "create"-Modus ohne vorgeladene Daten.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 */

import KategorieForm from '@/components/admin/KategorieForm'
import { createKategorie } from '@/app/admin/kategorien/actions'

// Keine DB-Abfrage nötig — das Formular hat nur einfache Felder ohne externe Abhängigkeiten
export default function NewKategoriePage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <a
          href="/admin/kategorien"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Kategorien-Liste
        </a>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          Neue Kategorie anlegen
        </h1>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <KategorieForm action={createKategorie} />
      </div>
    </div>
  )
}
