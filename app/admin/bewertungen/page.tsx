/**
 * Datei: app/admin/bewertungen/page.tsx
 *
 * Zweck: Moderationsqueue für Tool-Bewertungen. Admin sieht ausstehende,
 * freigegebene oder alle Bewertungen und gibt sie frei / lehnt sie ab.
 *
 * Wichtig:
 * - requireAdmin() als Defense-in-Depth.
 * - Kommentare werden als PLAIN TEXT gerendert ({comment}) — niemals Markdown
 *   oder dangerouslySetInnerHTML (ARCHITECTURE §7).
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'
import StarDisplay from '@/components/rating/StarDisplay'
import ModerationActions from '@/components/admin/ModerationActions'
import styles from './page.module.css'

type Status = 'pending' | 'approved' | 'alle'

const TABS: { value: Status; label: string }[] = [
  { value: 'pending', label: 'Ausstehend' },
  { value: 'approved', label: 'Freigegeben' },
  { value: 'alle', label: 'Alle' },
]

const EMPTY_TEXT: Record<Status, string> = {
  pending: 'Keine ausstehenden Bewertungen.',
  approved: 'Keine freigegebenen Bewertungen.',
  alle: 'Noch keine Bewertungen vorhanden.',
}

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

type Props = { searchParams: Promise<{ page?: string; status?: string }> }

export default async function AdminBewertungenPage({ searchParams }: Props) {
  await requireAdmin()

  const sp = await searchParams
  const status: Status = sp.status === 'approved' ? 'approved' : sp.status === 'alle' ? 'alle' : 'pending'
  const { page, skip, take } = parsePageParams(sp)

  const where =
    status === 'pending' ? { isApproved: false } : status === 'approved' ? { isApproved: true } : {}

  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where,
      include: {
        tool: { include: { translations: { where: { locale: 'de' } } } },
        user: { select: { email: true } },
        scores: { include: { criterion: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.rating.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/bewertungen?status=${status}&page=${totalPages}`)

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
        Bewertungen
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
        {total} {total === 1 ? 'Bewertung' : 'Bewertungen'} ({TABS.find((t) => t.value === status)?.label})
      </p>

      {/* Filter-Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/bewertungen?status=${tab.value}`}
            className={`${styles.tab} ${tab.value === status ? styles.tabActive : ''}`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {ratings.length === 0 ? (
        <p className={styles.empty}>{EMPTY_TEXT[status]}</p>
      ) : (
        <div className={styles.list}>
          {ratings.map((rating) => {
            const toolName = rating.tool.translations[0]?.name ?? rating.tool.slug
            return (
              <div key={rating.id} className={styles.card}>
                {/* Kopf: Tool + Status + Aktionen */}
                <div className={styles.cardHead}>
                  <div style={{ minWidth: 0 }}>
                    <a href={`/tools/${rating.tool.slug}`} target="_blank" rel="noopener noreferrer" className={styles.toolLink}>
                      {toolName}
                    </a>
                    <p className={styles.meta}>
                      {rating.user.email} · {dateFmt.format(rating.createdAt)}
                    </p>
                  </div>
                  <span className={rating.isApproved ? styles.badgeApproved : styles.badgePending}>
                    {rating.isApproved ? 'Freigegeben' : 'Ausstehend'}
                  </span>
                </div>

                {/* Gesamtbewertung */}
                <div className={styles.overallRow}>
                  <StarDisplay value={rating.score} size={18} />
                  <span className={styles.overallNum}>{rating.score} von 5</span>
                </div>

                {/* Kriterien-Scores */}
                {rating.scores.length > 0 && (
                  <ul className={styles.critList}>
                    {rating.scores.map((sc) => (
                      <li key={sc.id} className={styles.critItem}>
                        <span className={styles.critName}>{sc.criterion.name}</span>
                        <span className={styles.critScore}>
                          <StarDisplay value={sc.score} size={13} /> {sc.score}/5
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Kommentar — PLAIN TEXT */}
                {rating.comment && (
                  <p className={styles.comment}>{rating.comment}</p>
                )}

                {/* Aktionen */}
                <div className={styles.actions}>
                  <ModerationActions ratingId={rating.id} isApproved={rating.isApproved} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/admin/bewertungen?status=${status}`} />
    </div>
  )
}
