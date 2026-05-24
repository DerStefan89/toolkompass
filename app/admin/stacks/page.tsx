/**
 * Datei: app/admin/stacks/page.tsx
 *
 * Zweck: Liste aller Tool-Stacks im Admin-Bereich.
 * Zeigt Name, Slug, Tool-Anzahl und published-Status.
 */

import { prisma } from '@/lib/prisma'

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
            Tool-Stacks
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {stacks.length} Stacks · {stacks.filter(s => s.published).length} veröffentlicht
          </p>
        </div>
        <a
          href="/admin/stacks/neu"
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
          + Stack erstellen
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
          gridTemplateColumns: '1fr 180px 80px 120px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Stack</span>
          <span>Slug</span>
          <span>Tools</span>
          <span>Status</span>
        </div>

        {stacks.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Noch keine Stacks vorhanden.
          </div>
        ) : (
          stacks.map((stack, index) => {
            const t = stack.translations[0]
            const name = t?.name ?? stack.slug

            return (
              <div
                key={stack.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 180px 80px 120px',
                  padding: '14px 20px',
                  borderBottom: index < stacks.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
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
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                  {stack.slug}
                </span>
                <span style={{ color: 'var(--color-text-primary)' }}>{stack._count.tools}</span>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: stack.published ? '#c6f6d5' : 'var(--color-badge-bg)',
                  color: stack.published ? '#276749' : 'var(--color-text-secondary)',
                }}>
                  {stack.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
