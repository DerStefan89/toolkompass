/**
 * Datei: app/admin/artikel/page.tsx
 *
 * Zweck: Liste aller Artikel (Guides, Top-Listen, Vergleiche) im Admin-Bereich.
 * Zeigt Titel, Slug, Typ und published-Status.
 */

import { prisma } from '@/lib/prisma'

const typLabel: Record<string, string> = {
  guide: 'Guide',
  top_list: 'Top-Liste',
  comparison: 'Vergleich',
  tutorial: 'Anleitung',
}

export default async function AdminArtikelPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Artikel
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {articles.length} Artikel · {articles.filter(a => a.published).length} veröffentlicht
          </p>
        </div>
        <a
          href="/admin/artikel/neu"
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          + Artikel schreiben
        </a>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 160px 110px 120px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Titel</span>
          <span>Slug</span>
          <span>Typ</span>
          <span>Status</span>
        </div>

        {articles.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Noch keine Artikel vorhanden.
          </div>
        ) : (
          articles.map((article, index) => (
            <div
              key={article.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 160px 110px 120px',
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
                backgroundColor: article.published ? '#c6f6d5' : 'var(--color-badge-bg)',
                color: article.published ? '#276749' : 'var(--color-text-secondary)',
              }}>
                {article.published ? 'Veröffentlicht' : 'Entwurf'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
