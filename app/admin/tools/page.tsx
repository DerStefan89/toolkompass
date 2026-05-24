/**
 * Datei: app/admin/tools/page.tsx
 *
 * Zweck: Liste aller Tools im Admin-Bereich.
 * Zeigt published/unpublished Status, Preis und Free-Plan-Kennzeichnung.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import { formatPreis } from '@/lib/utils/format'

const COLUMNS = [
  { label: 'Tool',      width: '1fr'   },
  { label: 'Slug',      width: '120px' },
  { label: 'Preis ab',  width: '100px' },
  { label: 'Free Plan', width: '80px'  },
  { label: 'Status',    width: '100px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminToolsPage() {
  const tools = await prisma.tool.findMany({
    include: {
      translations: { where: { locale: 'de' } },
      categories: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Tools"
        subtitle={`${tools.length} Tools insgesamt · ${tools.filter(t => t.published).length} veröffentlicht`}
        actionLabel="+ Tool hinzufügen"
        actionHref="/admin/tools/neu"
      />
      <AdminTable columns={COLUMNS} isEmpty={tools.length === 0} emptyText="Noch keine Tools vorhanden.">
        {tools.map((tool, index) => {
          const translation = tool.translations[0]
          const name = translation?.name ?? tool.slug

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
                    maxWidth: '320px',
                  }}>
                    {translation.shortDescription}
                  </p>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {tool.slug}
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                {formatPreis(tool.startingPriceMonthly)}
              </span>
              <span style={{ fontSize: '13px', color: tool.hasFreePlan ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {tool.hasFreePlan ? '✓ Ja' : '—'}
              </span>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: tool.published ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
                color: tool.published ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
              }}>
                {tool.published ? 'Veröffentlicht' : 'Entwurf'}
              </span>
            </div>
          )
        })}
      </AdminTable>
    </div>
  )
}
