/**
 * Datei: app/admin/vendors/page.tsx
 *
 * Zweck: Liste aller Vendors (Anbieter) im Admin-Bereich.
 * Zeigt Name, Slug, Website, Tool-Anzahl und einen Bearbeiten-Link.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Bereich)
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'

const COLUMNS = [
  { label: 'Anbieter', width: '1fr'   },
  { label: 'Slug',     width: '160px' },
  { label: 'Website',  width: '200px' },
  { label: 'Tools',    width: '80px'  },
  { label: '',         width: '100px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    include: {
      _count: { select: { tools: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Anbieter"
        subtitle={`${vendors.length} ${vendors.length === 1 ? 'Anbieter' : 'Anbieter'} insgesamt`}
        actionLabel="+ Anbieter anlegen"
        actionHref="/admin/vendors/neu"
      />

      <AdminTable
        columns={COLUMNS}
        isEmpty={vendors.length === 0}
        emptyText="Noch keine Anbieter vorhanden."
      >
        {vendors.map((vendor, index) => (
          <div
            key={vendor.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              padding: '14px 20px',
              borderBottom: index < vendors.length - 1 ? '1px solid var(--color-border)' : 'none',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            {/* Name + optionale Beschreibung */}
            <div>
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {vendor.name}
              </span>
              {vendor.description && (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '320px',
                }}>
                  {vendor.description}
                </p>
              )}
            </div>

            {/* Slug in Monospace */}
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {vendor.slug}
            </span>

            {/* Website als klickbarer Link */}
            {vendor.website ? (
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '13px',
                  color: 'var(--color-cta)',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {vendor.website.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>—</span>
            )}

            {/* Anzahl zugeordneter Tools */}
            <span style={{ color: 'var(--color-text-primary)' }}>
              {vendor._count.tools}
            </span>

            {/* Bearbeiten-Link */}
            <a
              href={`/admin/vendors/${vendor.id}`}
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
        ))}
      </AdminTable>
    </div>
  )
}
