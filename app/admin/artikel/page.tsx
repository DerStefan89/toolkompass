/**
 * Datei: app/admin/artikel/page.tsx
 *
 * Zweck: Liste aller Artikel (Guides, Top-Listen, Vergleiche) im Admin-Bereich.
 * Zeigt Titel, Slug, Typ, klickbaren Published-Toggle und Löschen-Button in der Zeile.
 */

import { prisma } from '@/lib/prisma'
import AdminTable, { AdminPageHeader } from '@/components/admin/AdminTable'
import PublishToggle from '@/components/admin/PublishToggle'
import InlineDeleteButton from '@/components/admin/InlineDeleteButton'
import { toggleArtikelPublished, deleteArtikel } from '@/app/admin/artikel/actions'

const COLUMNS = [
  { label: 'Titel',   width: '1fr'   },
  { label: 'Slug',    width: '160px' },
  { label: 'Typ',     width: '110px' },
  { label: 'Status',  width: '140px' },
  { label: '',        width: '160px' },
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
    take: 100,
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
            {/* Titel + Untertitel */}
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

            {/* Slug */}
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {article.slug}
            </span>

            {/* Typ-Badge */}
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

            {/* Status — klickbarer Toggle */}
            <PublishToggle
              published={article.published}
              action={toggleArtikelPublished.bind(null, article.id)}
            />

            {/* Aktionen: Bearbeiten + Löschen */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a
                href={`/admin/artikel/${article.id}`}
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
                action={deleteArtikel.bind(null, article.id)}
                confirmMessage={`"${article.title}" wirklich löschen?\nAlle Abschnitte werden ebenfalls entfernt.`}
              />
            </div>
          </div>
        ))}
      </AdminTable>
      {articles.length === 100 && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px', textAlign: 'center' }}>
          Zeige erste 100 Einträge. Nutze die Suche um weitere zu finden.
        </p>
      )}
    </div>
  )
}
