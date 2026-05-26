/**
 * Datei: app/admin/vergleiche/page.tsx
 *
 * Zweck: Liste aller Vergleiche im Admin-Bereich.
 * Zeigt Tool A, Tool B, Slug, Zeilen-Anzahl, klickbaren Published-Toggle
 * und Löschen-Button direkt in der Zeile.
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { toggleVergleichPublished, deleteVergleich } from '@/app/admin/vergleiche/actions'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'

const COLUMNS = [
  { label: 'Tool A',  width: '1fr'   },
  { label: 'Tool B',  width: '1fr'   },
  { label: 'Slug',    width: '200px' },
  { label: 'Zeilen',  width: '80px'  },
  { label: 'Status',  width: '140px' },
  { label: '',        width: '160px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

type Props = { searchParams: Promise<{ page?: string }> }

export default async function AdminVergleichePage({ searchParams }: Props) {
  const { page, skip, take } = parsePageParams(await searchParams)

  const [vergleiche, total, totalPublished] = await Promise.all([
    prisma.comparison.findMany({
      include: {
        toolA: { include: { translations: { where: { locale: 'de' } } } },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
        _count: { select: { rows: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.comparison.count(),
    prisma.comparison.count({ where: { published: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/vergleiche?page=${totalPages}`)

  return (
    <div>
      <AdminPageHeader
        title="Vergleiche"
        subtitle={`${total} Vergleiche · ${totalPublished} veröffentlicht`}
        actionLabel="+ Vergleich erstellen"
        actionHref="/admin/vergleiche/neu"
      />

      <AdminTable
        columns={COLUMNS}
        isEmpty={vergleiche.length === 0}
        emptyText="Noch keine Vergleiche vorhanden."
      >
        {vergleiche.map((v, index) => {
          const nameA = v.toolA.translations[0]?.name ?? v.toolA.slug
          const nameB = v.toolB.translations[0]?.name ?? v.toolB.slug

          return (
            <div
              key={v.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                padding: '14px 20px',
                borderBottom: index < vergleiche.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              {/* Tool A */}
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {nameA}
              </span>

              {/* Tool B */}
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {nameB}
              </span>

              {/* Slug */}
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {v.slug}
              </span>

              {/* Zeilen-Anzahl */}
              <span style={{ color: 'var(--color-text-primary)' }}>
                {v._count.rows}
              </span>

              {/* Status — klickbarer Toggle */}
              <PublishToggle
                published={v.published}
                action={toggleVergleichPublished.bind(null, v.id)}
              />

              {/* Aktionen: Bearbeiten + Löschen */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`/admin/vergleiche/${v.id}`}
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
                  action={deleteVergleich.bind(null, v.id)}
                  confirmMessage={`Vergleich "${nameA} vs. ${nameB}" wirklich löschen?\nAlle Vergleichszeilen werden ebenfalls entfernt.`}
                />
              </div>
            </div>
          )
        })}
      </AdminTable>
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/vergleiche" />
    </div>
  )
}
