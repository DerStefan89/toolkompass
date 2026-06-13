/**
 * Datei: app/admin/bewertungskriterien/[id]/page.tsx
 *
 * Zweck: Admin-Seite zum Bearbeiten eines bestehenden Bewertungskriteriums.
 * Lädt das Kriterium und übergibt die Werte als defaultValues an CriterionForm.
 *
 * Wichtig:
 * - updateCriterion erwartet die ID als erstes Argument (.bind(null, id)).
 * - Löschen entfernt via Cascade auch Tool-Zuweisungen und RatingScores —
 *   die Bestätigung warnt davor.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import CriterionForm from '@/components/admin/CriterionForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateCriterion, deleteCriterion } from '@/app/admin/bewertungskriterien/actions'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditCriterionPage({ params }: Props) {
  await requireAdmin()

  const { id } = await params

  const criterion = await prisma.ratingCriterion.findUnique({
    where: { id },
    include: {
      _count: { select: { tools: true } },
    },
  })

  if (!criterion) notFound()

  const defaultValues = {
    name:      criterion.name,
    slug:      criterion.slug,
    sortOrder: String(criterion.sortOrder),
  }

  const boundUpdate = updateCriterion.bind(null, id)
  const boundDelete = deleteCriterion.bind(null, id)

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
          {criterion.name} bearbeiten
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
        }}>
          {criterion._count.tools} {criterion._count.tools === 1 ? 'Tool' : 'Tools'} zugewiesen
          <span style={{ marginLeft: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
            ID: {id}
          </span>
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <CriterionForm
          action={boundUpdate}
          defaultValues={defaultValues}
        />
      </div>

      {/* Gefahrenzone */}
      <div style={{
        marginTop: '24px',
        padding: '20px 24px',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Kriterium löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Entfernt das Kriterium dauerhaft — inklusive aller Tool-Zuweisungen und
            der dafür abgegebenen Sterne-Bewertungen. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`"${criterion.name}" wirklich löschen?\nDies entfernt auch alle Tool-Zuweisungen und die abgegebenen Sterne-Bewertungen für dieses Kriterium.`}
          redirectTo="/admin/bewertungskriterien"
        />
      </div>
    </div>
  )
}
