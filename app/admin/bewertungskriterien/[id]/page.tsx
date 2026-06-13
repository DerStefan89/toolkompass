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
import CriterionAssigner from '@/components/admin/CriterionAssigner'
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

  // Alle publizierten Kategorien mit Tools + ob das Tool dieses Kriterium schon hat.
  // Kleine Datenmenge (≈17 Kategorien / ≈98 Tools) → vorab laden, Client filtert.
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' } },
      tools: {
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              ratingCriteria: { where: { criterionId: id } },
            },
          },
        },
      },
    },
    orderBy: { slug: 'asc' },
  })

  const toolsByCategory = categories.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.translations[0]?.name ?? cat.slug,
    tools: cat.tools
      .map((tc) => ({
        id: tc.tool.id,
        name: tc.tool.translations[0]?.name ?? tc.tool.slug,
        isAssigned: tc.tool.ratingCriteria.length > 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de')),
  }))

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

      {/* Tools zuweisen */}
      <div style={{
        marginTop: '24px',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Tools zuweisen
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          Kategorie wählen und festlegen, welche Tools dieses Kriterium bewerten lassen.
          Gespeichert wird nur die gewählte Kategorie — andere bleiben unberührt.
        </p>
        <CriterionAssigner criterionId={id} toolsByCategory={toolsByCategory} />
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
