/**
 * Datei: app/admin/tools/page.tsx
 *
 * Zweck: Liste aller Tools im Admin-Bereich.
 * Zeigt Published-Toggle (klickbar) und Löschen-Button direkt in der Zeile.
 * Filter-Leiste: Alle / Mit Affiliate / Ohne Affiliate (URL-basiert via ?filter=).
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { togglePublished, deleteTool } from '@/app/admin/tools/actions'
import { formatPreis } from '@/lib/utils/format'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'
import styles from './page.module.css'

// ─── Filter-Typen ────────────────────────────────────────────────────────────

type FilterType = 'all' | 'with-affiliate' | 'without-affiliate'

function parseFilter(raw: string | undefined): FilterType {
  if (raw === 'with-affiliate' || raw === 'without-affiliate') return raw
  return 'all'
}

function buildFilterWhere(filter: FilterType) {
  if (filter === 'with-affiliate')    return { affiliateLinks: { some: {} } }
  if (filter === 'without-affiliate') return { affiliateLinks: { none: {} } }
  return {}
}

// ─── Spalten-Definition ──────────────────────────────────────────────────────

const COLUMNS = [
  { label: 'Tool',       width: '1fr'   },
  { label: 'Slug',       width: '140px' },
  { label: 'Preis ab',   width: '100px' },
  { label: 'Free Plan',  width: '80px'  },
  { label: 'Affiliate',  width: '80px'  },
  { label: 'Status',     width: '140px' },
  { label: '',           width: '160px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

// ─── Page ────────────────────────────────────────────────────────────────────

type Props = { searchParams: Promise<{ page?: string; filter?: string }> }

export default async function AdminToolsPage({ searchParams }: Props) {
  const params = await searchParams
  const { page, skip, take } = parsePageParams(params)
  const filter = parseFilter(params.filter)
  const filterWhere = buildFilterWhere(filter)

  const [tools, total, totalPublished, countAll, countWithAffiliate, countWithoutAffiliate] =
    await Promise.all([
      prisma.tool.findMany({
        where: filterWhere,
        include: {
          translations: { where: { locale: 'de' } },
          _count: {
            select: {
              affiliateLinks: { where: { isActive: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.tool.count({ where: filterWhere }),
      prisma.tool.count({ where: { ...filterWhere, published: true } }),
      prisma.tool.count(),
      prisma.tool.count({ where: { affiliateLinks: { some: {} } } }),
      prisma.tool.count({ where: { affiliateLinks: { none: {} } } }),
    ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) {
    const base = filter !== 'all' ? `/admin/tools?filter=${filter}&page=` : `/admin/tools?page=`
    redirect(`${base}${totalPages}`)
  }

  // Pagination-basePath erhält filter als Query-Param damit Seitenwechsel den Filter behält
  const paginationBase = filter !== 'all' ? `/admin/tools?filter=${filter}` : '/admin/tools'

  // Filter-Buttons
  const filterButtons: { label: string; value: FilterType; count: number }[] = [
    { label: 'Alle',            value: 'all',              count: countAll            },
    { label: 'Mit Affiliate',   value: 'with-affiliate',   count: countWithAffiliate  },
    { label: 'Ohne Affiliate',  value: 'without-affiliate', count: countWithoutAffiliate },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Tools"
        subtitle={`${total} Tools insgesamt · ${totalPublished} veröffentlicht`}
        actionLabel="+ Tool hinzufügen"
        actionHref="/admin/tools/neu"
      />

      {/* ─── Filter-Leiste ─────────────────────────────────── */}
      <div className={styles.filterBar}>
        {filterButtons.map((btn) => {
          const isActive = filter === btn.value
          const href = btn.value === 'all' ? '/admin/tools' : `/admin/tools?filter=${btn.value}`
          return (
            <a
              key={btn.value}
              href={href}
              className={`${styles.filterBtn}${isActive ? ` ${styles.filterBtnActive}` : ''}`}
            >
              {btn.label}
              <span className={styles.filterCount}>({btn.count})</span>
            </a>
          )
        })}
      </div>

      {/* ─── Tabelle ───────────────────────────────────────── */}
      <AdminTable columns={COLUMNS} isEmpty={tools.length === 0} emptyText="Keine Tools gefunden.">
        {tools.map((tool, index) => {
          const translation = tool.translations[0]
          const name = translation?.name ?? tool.slug
          const affiliateCount = tool._count.affiliateLinks

          return (
            <div
              key={tool.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                padding: '14px 20px',
                borderBottom: index < tools.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              {/* Tool-Name + Kurzbeschreibung */}
              <div>
                <a
                  href={`/admin/tools/${tool.id}`}
                  style={{ fontWeight: '600', color: 'var(--color-text-primary)', textDecoration: 'none' }}
                >
                  {name}
                </a>
                {translation?.shortDescription && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '300px',
                  }}>
                    {translation.shortDescription}
                  </p>
                )}
              </div>

              {/* Slug */}
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {tool.slug}
              </span>

              {/* Preis */}
              <span style={{ color: 'var(--color-text-primary)' }}>
                {formatPreis(tool.startingPriceCents)}
              </span>

              {/* Free Plan */}
              <span style={{ fontSize: '13px', color: tool.hasFreePlan ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {tool.hasFreePlan ? '✓ Ja' : '—'}
              </span>

              {/* Affiliate-Links (aktive) */}
              <span style={{
                fontSize: '13px',
                fontWeight: affiliateCount > 0 ? '600' : '400',
                color: affiliateCount > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)',
              }}>
                {affiliateCount > 0 ? affiliateCount : '—'}
              </span>

              {/* Status — klickbarer Toggle */}
              <PublishToggle
                published={tool.published}
                action={togglePublished.bind(null, tool.id)}
              />

              {/* Aktionen: Bearbeiten + Löschen */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`/admin/tools/${tool.id}`}
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
                  action={deleteTool.bind(null, tool.id)}
                  confirmMessage={`"${name}" wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden.`}
                />
              </div>
            </div>
          )
        })}
      </AdminTable>

      <Pagination currentPage={page} totalPages={totalPages} basePath={paginationBase} />
    </div>
  )
}
