/**
 * Datei: app/admin/artikel/page.tsx
 *
 * Zweck: Liste aller Artikel (Guides, Top-Listen, Vergleiche) im Admin-Bereich.
 * Zeigt Titel, Slug, Typ und published-Status.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'

const COLUMNS = [
  { label: 'Titel',  width: '1fr'   },
  { label: 'Slug',   width: '160px' },
  { label: 'Typ',    width: '110px' },
  { label: 'Status', width: '120px' },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

const typLabel: Record<string, string> = {
  guide:      'Guide',
  top_list:   'Top-Liste',
  comparison: 'Vergleich',
  tutorial:   'Anleitung',
}

export default async function AdminArtikelPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <AdminPageHeader
        title="Artikel"
        subtitle={`${articles.length} Artikel · ${articles.filter(a => a.published).length} veröffentlicht`}
        actionLabel="+ Artikel schreiben"
        actionHref="/admin/artikel/neu"
      />
      <AdminTable columns={COLUMNS} isEmpty={articles.length === 0} emptyText="Noch keine Artikel vorhanden.">
        {articles.map((article, index) => (
          <div
            key={article.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              padding: '14px 20px',
              borderBottom: index < articles.length - 1 ? '1px solid var(--color-border)' : 'none',
              alignItems: 'center',
              fontSize: '14px',
            }}
          >
            <div>
              <a
                href={`/admin/artikel/${article.id}`}
                style={{ fontWeight: '600', color: 'var(--color-text-primary)', textDecoration: 'none' }}
              >
                {article.title}
              </a>
              {article.subtitle && (
                <p style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '360px',
                }}>
                  {article.subtitle}
                </p>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {article.slug}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              backgroundColor: 'var(--color-badge-bg)',
              color: 'var(--color-text-secondary)',
            }}>
              {typLabel[article.type] ?? article.type}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: article.published ? 'var(--color-success-bg)' : 'var(--color-badge-bg)',
              color: article.published ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
            }}>
              {article.published ? 'Veröffentlicht' : 'Entwurf'}
            </span>
          </div>
        ))}
      </AdminTable>
    </div>
  )
}
