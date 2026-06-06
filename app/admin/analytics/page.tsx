/**
 * Datei: app/admin/analytics/page.tsx
 *
 * Zweck: Affiliate-Analytics-Dashboard — Klick-Kennzahlen und per-Link-Statistik.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Bereich)
 *
 * Wichtig:
 * Read-only — keine Mutations.
 * requireAdmin() als Defense-in-Depth zusätzlich zum Middleware-Schutz.
 * $queryRaw liefert BigInt für COUNT() — immer mit Number() casten.
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import AdminTable from '@/components/admin/AdminTable'
import styles from './page.module.css'

const COLUMNS = [
  { label: 'Tool',        width: '1fr'   },
  { label: 'Label',       width: '160px' },
  { label: 'Klicks 7T',  width: '90px'  },
  { label: 'Klicks 30T', width: '100px' },
  { label: 'Gesamt',      width: '90px'  },
  { label: 'Status',      width: '90px'  },
]
const GRID = COLUMNS.map(c => c.width).join(' ')

type PerLinkStat = {
  affiliateLinkId: string
  clicks_7d: bigint
  clicks_30d: bigint
  clicks_total: bigint
}

export default async function AnalyticsPage() {
  try {
    await requireAdmin()
  } catch {
    redirect('/admin/login')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const DAY_MS = 24 * 60 * 60 * 1000
  const d7  = new Date(today.getTime() - 7  * DAY_MS)
  const d30 = new Date(today.getTime() - 30 * DAY_MS)

  const [
    clicksToday,
    clicks7d,
    clicks30d,
    clicksTotal,
    links,
    perLinkStats,
  ] = await Promise.all([
    prisma.affiliateClick.count({ where: { createdAt: { gte: today } } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: d7 } } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: d30 } } }),
    prisma.affiliateClick.count(),
    prisma.affiliateLink.findMany({
      include: {
        tool: { include: { translations: { where: { locale: 'de' } } } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.$queryRaw<PerLinkStat[]>`
      SELECT
        "affiliateLinkId",
        COUNT(*) FILTER (WHERE "createdAt" >= ${d7}::timestamptz)  AS clicks_7d,
        COUNT(*) FILTER (WHERE "createdAt" >= ${d30}::timestamptz) AS clicks_30d,
        COUNT(*)                                                    AS clicks_total
      FROM "AffiliateClick"
      GROUP BY "affiliateLinkId"
    `,
  ])

  const statsMap = new Map(
    perLinkStats.map(s => [s.affiliateLinkId, {
      clicks7d:    Number(s.clicks_7d),
      clicks30d:   Number(s.clicks_30d),
      clicksTotal: Number(s.clicks_total),
    }]),
  )

  const tableRows = links
    .map(link => ({
      ...link,
      stats: statsMap.get(link.id) ?? { clicks7d: 0, clicks30d: 0, clicksTotal: 0 },
    }))
    .sort((a, b) => b.stats.clicksTotal - a.stats.clicksTotal)

  const metrics = [
    { label: 'Klicks heute',   value: clicksToday },
    { label: 'Klicks 7 Tage',  value: clicks7d    },
    { label: 'Klicks 30 Tage', value: clicks30d   },
    { label: 'Klicks gesamt',  value: clicksTotal },
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
          Affiliate Analytics
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Klick-Statistiken für alle Affiliate-Links
        </p>
      </div>

      {/* ─── Kennzahlen ─────────────────────────────────────── */}
      <div className={styles.metricsGrid}>
        {metrics.map((m) => (
          <div key={m.label} className={styles.metricCard}>
            <p className={styles.metricValue}>{m.value}</p>
            <p className={styles.metricLabel}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Tabelle ────────────────────────────────────────── */}
      <AdminTable
        columns={COLUMNS}
        isEmpty={tableRows.length === 0}
        emptyText="Noch keine Affiliate-Links vorhanden. Erstelle Links über die Tool-Bearbeitungsseite."
      >
        {tableRows.map((row, index) => {
          const toolName = row.tool.translations[0]?.name ?? row.tool.slug
          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                padding: '14px 20px',
                borderBottom: index < tableRows.length - 1 ? '1px solid var(--color-border)' : 'none',
                alignItems: 'center',
                fontSize: '14px',
              }}
            >
              {/* Tool-Name */}
              <div>
                <a
                  href={`/admin/tools/${row.toolId}`}
                  style={{ fontWeight: '600', color: 'var(--color-text-primary)', textDecoration: 'none' }}
                >
                  {toolName}
                </a>
              </div>

              {/* Label */}
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {row.label}
              </span>

              {/* Klicks 7T */}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {row.stats.clicks7d}
              </span>

              {/* Klicks 30T */}
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                {row.stats.clicks30d}
              </span>

              {/* Gesamt */}
              <span style={{ fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                {row.stats.clicksTotal}
              </span>

              {/* Status */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                {/* backgroundColor: isActive-abhängig — erlaubter Inline-Style */}
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: row.isActive
                    ? 'var(--color-success)'
                    : 'var(--color-text-secondary)',
                }} />
                {row.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          )
        })}
      </AdminTable>
    </div>
  )
}
