/**
 * Datei: app/admin/stacks/page.tsx
 *
 * Zweck: Liste aller Tool-Stacks im Admin-Bereich.
 * Zeigt Name, Slug, Tool-Anzahl und published-Status.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'

const COLUMNS = [
  { label: 'Stack',  width: '1fr'   },
  { label: 'Slug',   width: '180px' },
  { label: 'Tools',  width: '80px'  },
  { label: 'Status', width: '120px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminStacksPage() {
  const stacks = await prisma.toolStack.findMany({
    include: {
      translations: { where: { locale: 'de' } },
      _count: { select: { tools: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Tool-Stacks"
        subtitle={`${stacks.length} Stacks · ${stacks.filter(s => s.published).length} veröffentlicht`}
        actionLabel="+ Stack erstellen"
        actionHref="/admin/stacks/neu"
      />
      <AdminTable columns={COLUMNS} isEmpty={stacks.length === 0} emptyText="Noch keine Stacks vorhanden.">
        {stacks.map((stack, index) => {
          const t = stack.translations[0]
          const name = t?.name ?? stack.slug

          return (
            <div
              key={stack.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                padding: '14px 20px',
                borderBottom: index < stacks.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              <div>
                <a
                  href={`/admin/stacks/${stack.id}`}
                  style={{ fontWeight: '600', color: 'var(--color-text-primary)', textDecoration: 'none' }}
                >
                  {name}
                </a>
                {t?.targetAudience && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '320px',
                  }}>
                    Zielgruppe: {t.targetAudience}
                  </p>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {stack.slug}
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>{stack._count.tools}</span>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: stack.published ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
                color: stack.published ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
              }}>
                {stack.published ? 'Veröffentlicht' : 'Entwurf'}
              </span>
            </div>
          )
        })}
      </AdminTable>
    </div>
  )
}
