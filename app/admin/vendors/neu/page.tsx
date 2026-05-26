/**
 * Datei: app/admin/vendors/neu/page.tsx
 *
 * Zweck: Admin-Seite zum Erstellen eines neuen Vendors.
 * Rendert VendorForm im "create"-Modus ohne vorgeladene Daten.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 */

import Link from 'next/link'
import VendorForm from '@/components/admin/VendorForm'
import { createVendor } from '@/app/admin/vendors/actions'

// Keine DB-Abfrage nötig — das Formular hat keine externen Abhängigkeiten
export default function NewVendorPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/admin/vendors"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Anbieter-Liste
        </Link>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          Neuen Anbieter anlegen
        </h1>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <VendorForm action={createVendor} />
      </div>
    </div>
  )
}
