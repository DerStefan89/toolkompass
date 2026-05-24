/**
 * Datei: app/admin/page.tsx
 *
 * Zweck: Admin-Dashboard mit Übersicht über alle Inhalte.
 * Zählt Tools, Kategorien und Artikel direkt aus Prisma.
 */

import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage() {
  const [
    toolCount,
    publishedToolCount,
    categoryCount,
    articleCount,
    stackCount,
  ] = await Promise.all([
    prisma.tool.count(),
    prisma.tool.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.article.count(),
    prisma.toolStack.count(),
  ])

  const stats = [
    { label: 'Tools gesamt', value: toolCount, sub: `${publishedToolCount} veröffentlicht`, icon: '🔧', href: '/admin/tools' },
    { label: 'Kategorien', value: categoryCount, sub: 'aktive Kategorien', icon: '⊙', href: '/admin/kategorien' },
    { label: 'Artikel', value: articleCount, sub: 'Guides & Ratgeber', icon: '✍️', href: '/admin/artikel' },
    { label: 'Tool-Stacks', value: stackCount, sub: 'kuratierte Stacks', icon: '⊕', href: '/admin/stacks' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Übersicht über alle Inhalte auf ToolKompass
        </p>
      </div>

      {/* Stats-Karten */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              backgroundColor: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{stat.icon}</div>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                marginBottom: '2px',
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {stat.sub}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Schnellzugriff */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '18px',
          fontWeight: '700',
          marginBottom: '16px',
          color: 'var(--color-text-primary)',
        }}>
          Schnellzugriff
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/tools', label: '+ Tool hinzufügen' },
            { href: '/admin/kategorien', label: '+ Kategorie anlegen' },
            { href: '/admin/artikel', label: '+ Artikel schreiben' },
            { href: '/admin/stacks', label: '+ Stack erstellen' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-cta)',
                color: 'white',
                borderRadius: 'var(--radius-btn)',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
