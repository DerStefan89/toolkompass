/**
 * Datei: app/admin/bewertungskriterien/neu/page.tsx
 *
 * Zweck: Admin-Seite zum Erstellen eines neuen Bewertungskriteriums.
 * Rendert CriterionForm im "create"-Modus ohne vorgeladene Daten.
 */

import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'
import CriterionForm from '@/components/admin/CriterionForm'
import { createCriterion } from '@/app/admin/bewertungskriterien/actions'

export default async function NewCriterionPage() {
  await requireAdmin()

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/admin/bewertungskriterien"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Kriterien-Liste
        </Link>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          Neues Bewertungskriterium anlegen
        </h1>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <CriterionForm action={createCriterion} />
      </div>
    </div>
  )
}
