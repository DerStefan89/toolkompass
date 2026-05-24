/**
 * Datei: app/admin/tools/page.tsx
 *
 * Zweck: Liste aller Tools im Admin-Bereich.
 * Zeigt Published-Toggle (klickbar) und Löschen-Button direkt in der Zeile.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { togglePublished, deleteTool } from '@/app/admin/tools/actions'
import { formatPreis } from '@/lib/utils/format'

const COLUMNS = [
  { label: 'Tool',      width: '1fr'   },
  { label: 'Slug',      width: '140px' },
  { label: 'Preis ab',  width: '100px' },
  { label: 'Free Plan', width: '80px'  },
  { label: 'Status',    width: '140px' },
  { label: '',          width: '160px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminToolsPage() {
  const tools = await prisma.tool.findMany({
    include: {
      translations: { where: { locale: 'de' } },
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
                {formatPreis(tool.startingPriceMonthly)}
              </span>

              {/* Free Plan */}
              <span style={{ fontSize: '13px', color: tool.hasFreePlan ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                {tool.hasFreePlan ? '✓ Ja' : '—'}
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
    </div>
  )
}
