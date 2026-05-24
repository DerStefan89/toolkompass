/**
 * Datei: app/admin/kategorien/page.tsx
 *
 * Zweck: Liste aller Kategorien im Admin-Bereich.
 * Zeigt Name, Slug, Icon, Tool-Anzahl und published-Status.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'

const COLUMNS = [
  { label: 'Kategorie', width: '1fr'   },
  { label: 'Slug',      width: '160px' },
  { label: 'Icon',      width: '60px'  },
  { label: 'Tools',     width: '80px'  },
  { label: 'Status',    width: '120px' },
  { label: '',          width: '100px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminKategorienPage() {
  const categories = await prisma.category.findMany({
    include: {
      translations: { where: { locale: 'de' } },
      _count: { select: { tools: true } },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Kategorien"
        subtitle={`${categories.length} Kategorien · ${categories.filter(c => c.published).length} veröffentlicht`}
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
                    maxWidth: '320px',
                  }}>
                    {t.description}
                  </p>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {cat.slug}
              </span>
              <span style={{ fontSize: '20px' }}>{cat.icon ?? '—'}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{cat._count.tools}</span>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: cat.published ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
                color: cat.published ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
              }}>
                {cat.published ? 'Veröffentlicht' : 'Entwurf'}
              </span>

              {/* Expliziter Bearbeiten-Link als letzte Spalte */}
              <a
                href={`/admin/kategorien/${cat.id}`}
                style={{
                  fontSize: '13px',
                  color: 'var(--color-cta)',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}
              >
                Bearbeiten →
              </a>
            </div>
          )
        })}
      </AdminTable>
    </div>
  )
}
