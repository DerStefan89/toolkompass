/**
 * Datei: app/admin/bewertungskriterien/page.tsx
 *
 * Zweck: Liste aller Bewertungskriterien (RatingCriterion) im Admin-Bereich.
 * Zeigt Name, Slug, Sortierung, Anzahl zugewiesener Tools, Bearbeiten + Löschen.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Bereich)
 *
 * Wichtig:
 * requireAdmin() als Defense-in-Depth zusätzlich zum Layout-/Middleware-Schutz.
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { deleteCriterion } from '@/app/admin/bewertungskriterien/actions'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'

const COLUMNS = [
  { label: 'Kriterium',  width: '1fr'   },
  { label: 'Slug',       width: '200px' },
  { label: 'Sortierung', width: '100px' },
  { label: 'Tools',      width: '70px'  },
  { label: '',           width: '160px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

type Props = { searchParams: Promise<{ page?: string }> }

export default async function AdminCriteriaPage({ searchParams }: Props) {
  await requireAdmin()

  const { page, skip, take } = parsePageParams(await searchParams)

  const [criteria, total] = await Promise.all([
    prisma.ratingCriterion.findMany({
      include: {
        _count: { select: { tools: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      skip,
      take,
    }),
    prisma.ratingCriterion.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/bewertungskriterien?page=${totalPages}`)

  return (
    <div>
      <AdminPageHeader
        title="Bewertungskriterien"
        subtitle={`${total} Kriterien insgesamt`}
        actionLabel="+ Neues Kriterium"
        actionHref="/admin/bewertungskriterien/neu"
      />

      <AdminTable
        columns={COLUMNS}
        isEmpty={criteria.length === 0}
        emptyText="Noch keine Bewertungskriterien angelegt."
      >
        {criteria.map((criterion, index) => (
          <div
            key={criterion.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              padding: '14px 20px',
              borderBottom: index < criteria.length - 1 ? '1px solid var(--color-border)' : 'none',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            {/* Name */}
            <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
              {criterion.name}
            </span>

            {/* Slug */}
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {criterion.slug}
            </span>

            {/* Sortierung */}
            <span style={{ color: 'var(--color-text-primary)' }}>
              {criterion.sortOrder}
            </span>

            {/* Tool-Anzahl */}
            <span style={{ color: 'var(--color-text-primary)' }}>
              {criterion._count.tools}
            </span>

            {/* Aktionen */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a
                href={`/admin/bewertungskriterien/${criterion.id}`}
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  padding: '5px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                }}
              >
                Bearbeiten →
              </a>
              <InlineDeleteButton
                action={deleteCriterion.bind(null, criterion.id)}
                confirmMessage={`"${criterion.name}" wirklich löschen?\nDies entfernt auch alle Tool-Zuweisungen und die abgegebenen Sterne-Bewertungen für dieses Kriterium.`}
              />
            </div>
          </div>
        ))}
      </AdminTable>
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/bewertungskriterien" />
    </div>
  )
}
