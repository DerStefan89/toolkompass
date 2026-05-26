/**
 * Datei: app/admin/kategorien/page.tsx
 *
 * Zweck: Liste aller Kategorien im Admin-Bereich.
 * Zeigt Name, Slug, Icon, Tool-Anzahl, klickbaren Published-Toggle
 * und Löschen-Button direkt in der Zeile.
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { toggleKategoriePublished, deleteKategorie } from '@/app/admin/kategorien/actions'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'

const COLUMNS = [
  { label: 'Kategorie', width: '1fr'   },
  { label: 'Slug',      width: '180px' },
  { label: 'Icon',      width: '60px'  },
  { label: 'Tools',     width: '70px'  },
  { label: 'Status',    width: '140px' },
  { label: '',          width: '160px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

type Props = { searchParams: Promise<{ page?: string }> }

export default async function AdminKategorienPage({ searchParams }: Props) {
  const { page, skip, take } = parsePageParams(await searchParams)

  const [categories, total, totalPublished] = await Promise.all([
    prisma.category.findMany({
      include: {
        translations: { where: { locale: 'de' } },
        _count: { select: { tools: true } },
      },
      orderBy: { sortOrder: 'asc' },
      skip,
      take,
    }),
    prisma.category.count(),
    prisma.category.count({ where: { published: true } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/kategorien?page=${totalPages}`)

  return (
    <div>
      <AdminPageHeader
        title="Kategorien"
        subtitle={`${total} Kategorien · ${totalPublished} veröffentlicht`}
        actionLabel="+ Kategorie anlegen"
        actionHref="/admin/kategorien/neu"
      />
      <AdminTable columns={COLUMNS} isEmpty={categories.length === 0} emptyText="Noch keine Kategorien vorhanden.">
        {categories.map((cat, index) => {
          const t = cat.translations[0]
          const name = t?.name ?? cat.slug

          return (
            <div
              key={cat.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                padding: '14px 20px',
                borderBottom: index < categories.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              {/* Name + Beschreibung */}
              <div>
                <a
                  href={`/admin/kategorien/${cat.id}`}
                  style={{ fontWeight: '600', color: 'var(--color-text-primary)', textDecoration: 'none' }}
                >
                  {name}
                </a>
                {t?.description && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}>
                    {t.description}
                  </p>
                )}
              </div>

              {/* Slug */}
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {cat.slug}
              </span>

              {/* Icon */}
              <span style={{ fontSize: '20px' }}>{cat.icon ?? '—'}</span>

              {/* Tool-Anzahl */}
              <span style={{ color: 'var(--color-text-primary)' }}>{cat._count.tools}</span>

              {/* Status — klickbarer Toggle */}
              <PublishToggle
                published={cat.published}
                action={toggleKategoriePublished.bind(null, cat.id)}
              />

              {/* Aktionen: Bearbeiten + Löschen */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`/admin/kategorien/${cat.id}`}
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
                  action={deleteKategorie.bind(null, cat.id)}
                  confirmMessage={`"${name}" wirklich löschen?\nAlle Tool-Zuordnungen werden ebenfalls entfernt.`}
                />
              </div>
            </div>
          )
        })}
      </AdminTable>
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/kategorien" />
    </div>
  )
}
