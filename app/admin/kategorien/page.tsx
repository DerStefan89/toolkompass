/**
 * Datei: app/admin/kategorien/page.tsx
 *
 * Zweck: Liste aller Kategorien im Admin-Bereich.
 * Zeigt Name, Slug, Tool-Anzahl und published-Status.
 */

import { prisma } from '@/lib/prisma'

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
            Kategorien
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {categories.length} Kategorien · {categories.filter(c => c.published).length} veröffentlicht
          </p>
        </div>
        <a
          href="/admin/kategorien/neu"
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
          + Kategorie anlegen
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
          gridTemplateColumns: '1fr 160px 60px 80px 120px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Kategorie</span>
          <span>Slug</span>
          <span>Icon</span>
          <span>Tools</span>
          <span>Status</span>
        </div>

        {categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Noch keine Kategorien vorhanden.
          </div>
        ) : (
          categories.map((cat, index) => {
            const t = cat.translations[0]
            const name = t?.name ?? cat.slug

            return (
              <div
                key={cat.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 60px 80px 120px',
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
                  backgroundColor: cat.published ? '#c6f6d5' : 'var(--color-badge-bg)',
                  color: cat.published ? '#276749' : 'var(--color-text-secondary)',
                }}>
                  {cat.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
