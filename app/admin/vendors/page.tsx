/**
 * Datei: app/admin/vendors/page.tsx
 *
 * Zweck: Liste aller Vendors (Anbieter) im Admin-Bereich.
 * Zeigt Name, Slug, Website, Tool-Anzahl, Bearbeiten-Link und Löschen-Button.
 * Kein Published-Toggle — Vendors haben kein published-Feld.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Bereich)
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { deleteVendorById } from '@/app/admin/vendors/actions'

const COLUMNS = [
  { label: 'Anbieter', width: '1fr'   },
  { label: 'Slug',     width: '160px' },
  { label: 'Website',  width: '200px' },
  { label: 'Tools',    width: '70px'  },
  { label: '',         width: '160px' },
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

            {/* Slug */}
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {vendor.slug}
            </span>

            {/* Website */}
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

            {/* Tool-Anzahl */}
            <span style={{ color: 'var(--color-text-primary)' }}>
              {vendor._count.tools}
            </span>

            {/* Aktionen: Bearbeiten + Löschen */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a
                href={`/admin/vendors/${vendor.id}`}
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
                action={deleteVendorById.bind(null, vendor.id)}
                confirmMessage={`"${vendor.name}" wirklich löschen?\nNur möglich wenn keine Tools zugeordnet sind.`}
              />
            </div>
          </div>
        ))}
      </AdminTable>
    </div>
  )
}
