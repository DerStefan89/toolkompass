/**
 * Datei: app/admin/stacks/page.tsx
 *
 * Zweck: Liste aller Tool-Stacks im Admin-Bereich.
 * Zeigt Name, Slug, Tool-Anzahl, klickbaren Published-Toggle
 * und Löschen-Button direkt in der Zeile.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { toggleStackPublished, deleteStackById } from '@/app/admin/stacks/actions'

const COLUMNS = [
  { label: 'Stack',   width: '1fr'   },
  { label: 'Slug',    width: '180px' },
  { label: 'Tools',   width: '70px'  },
  { label: 'Status',  width: '140px' },
  { label: '',        width: '160px' },
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
              {/* Name + Zielgruppe */}
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

              {/* Slug */}
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {stack.slug}
              </span>

              {/* Tool-Anzahl */}
              <span style={{ color: 'var(--color-text-primary)' }}>{stack._count.tools}</span>

              {/* Status — klickbarer Toggle */}
              <PublishToggle
                published={stack.published}
                action={toggleStackPublished.bind(null, stack.id)}
              />

              {/* Aktionen: Bearbeiten + Löschen */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={`/admin/stacks/${stack.id}`}
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
                  action={deleteStackById.bind(null, stack.id)}
                  confirmMessage={`"${name}" wirklich löschen?\nAlle Tool-Zuordnungen werden ebenfalls entfernt.`}
                />
              </div>
            </div>
          )
        })}
      </AdminTable>
    </div>
  )
}
