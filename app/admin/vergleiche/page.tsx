/**
 * Datei: app/admin/vergleiche/page.tsx
 *
 * Zweck: Liste aller Vergleiche im Admin-Bereich.
 * Zeigt Tool A, Tool B, Slug, Zeilen-Anzahl, Status und Bearbeiten-Link.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'

const COLUMNS = [
  { label: 'Tool A',  width: '1fr'   },
  { label: 'Tool B',  width: '1fr'   },
  { label: 'Slug',    width: '220px' },
  { label: 'Zeilen', width: '80px'  },
  { label: 'Status',  width: '130px' },
  { label: '',        width: '110px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

export default async function AdminVergleichePage() {
  const vergleiche = await prisma.comparison.findMany({
    include: {
      toolA: { include: { translations: { where: { locale: 'de' } } } },
      toolB: { include: { translations: { where: { locale: 'de' } } } },
      _count: { select: { rows: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Vergleiche"
        subtitle={`${vergleiche.length} Vergleiche · ${vergleiche.filter(v => v.published).length} veröffentlicht`}
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
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {nameA}
              </span>
              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                {nameB}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                {v.slug}
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                {v._count.rows}
              </span>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: v.published ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
                color: v.published ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
              }}>
                {v.published ? 'Veröffentlicht' : 'Entwurf'}
              </span>
              <a
                href={`/admin/vergleiche/${v.id}`}
                style={{
                  display: 'inline-block',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
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
