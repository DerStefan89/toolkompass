/**
 * Datei: app/admin/tools/page.tsx
 *
 * Zweck: Liste aller Tools im Admin-Bereich.
 * Zeigt published/unpublished Status, Preis und Kategorie-Anzahl.
 */

import { prisma } from '@/lib/prisma'

export default async function AdminToolsPage() {
  const tools = await prisma.tool.findMany({
    include: {
      translations: {
        where: { locale: 'de' },
      },
      categories: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      {/* Header */}
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
            Tools
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {tools.length} Tools insgesamt · {tools.filter(t => t.published).length} veröffentlicht
          </p>
        </div>
        <a
          href="/admin/tools/neu"
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
          + Tool hinzufügen
        </a>
      </div>

      {/* Tabelle */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>

        {/* Tabellen-Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 100px 80px 100px',
          padding: '12px 20px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: '12px',
          fontWeight: '600',
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <span>Tool</span>
          <span>Slug</span>
          <span>Preis ab</span>
          <span>Free Plan</span>
          <span>Status</span>
        </div>

        {/* Zeilen */}
        {tools.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Noch keine Tools vorhanden.
          </div>
        ) : (
          tools.map((tool, index) => {
            const translation = tool.translations[0]
            const name = translation?.name ?? tool.slug

            return (
              <div
                key={tool.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 100px 80px 100px',
                  padding: '14px 20px',
                  borderBottom: index < tools.length - 1 ? '1px solid var(--color-border)' : 'none',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
                {/* Name + Beschreibung */}
                <div>
                  <a
                    href={`/admin/tools/${tool.id}`}
                    style={{
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      textDecoration: 'none',
                    }}
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
                      maxWidth: '320px',
                    }}>
                      {translation.shortDescription}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <span style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'monospace',
                }}>
                  {tool.slug}
                </span>

                {/* Preis */}
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {tool.startingPriceMonthly != null
                    ? tool.startingPriceMonthly === 0
                      ? 'Kostenlos'
                      : `${tool.startingPriceMonthly.toFixed(2).replace('.', ',')} €`
                    : '—'}
                </span>

                {/* Free Plan */}
                <span style={{
                  fontSize: '13px',
                  color: tool.hasFreePlan ? '#38a169' : 'var(--color-text-secondary)',
                }}>
                  {tool.hasFreePlan ? '✓ Ja' : '—'}
                </span>

                {/* Status Badge */}
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: tool.published ? '#c6f6d5' : 'var(--color-badge-bg)',
                  color: tool.published ? '#276749' : 'var(--color-text-secondary)',
                }}>
                  {tool.published ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
