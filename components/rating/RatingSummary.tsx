/**
 * Datei: components/rating/RatingSummary.tsx
 *
 * Zweck: Zeigt die freigegebenen Bewertungen eines Tools — Gesamtdurchschnitt,
 * Durchschnitt pro Kriterium (als kompakte Balken) und die Kommentare
 * (aufklappbar über CommentList). Server Component.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx
 *
 * Wichtig (ARCHITECTURE §7):
 * - Kommentare werden als PLAIN TEXT gerendert (in CommentList) — niemals
 *   Markdown/rehypeRaw/dangerouslySetInnerHTML.
 * - Es wird nie die E-Mail gezeigt, nur der Anzeigename (firstName / "Nutzer").
 */

import Link from 'next/link'
import CommentList from './CommentList'
import type { ToolRatingSummary } from '@/lib/data/ratings'
import styles from './RatingSummary.module.css'

interface RatingSummaryProps {
  summary: ToolRatingSummary
  slug: string
}

function formatNum(n: number): string {
  return n.toFixed(1).replace('.', ',')
}

export default function RatingSummary({ summary, slug }: RatingSummaryProps) {
  const { count, averageOverall, criteriaAverages, comments } = summary

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Bewertungen</h2>

      {count === 0 || averageOverall === null ? (
        /* ─── Empty State ─────────────────────────────────── */
        <div className={styles.empty}>
          <p className={styles.emptyText}>Noch keine Bewertungen. Sei der Erste!</p>
          <Link href={`/tools/${slug}/bewerten`} className={styles.ctaBtn}>
            Tool bewerten
          </Link>
        </div>
      ) : (
        <>
          {/* Gesamt */}
          <div className={styles.overall}>
            <span className={styles.overallNum}>{formatNum(averageOverall)} ★</span>
            <span className={styles.overallCount}>
              ({count} {count === 1 ? 'Bewertung' : 'Bewertungen'})
            </span>
          </div>

          {/* Kriterien-Durchschnitte als Balken */}
          {criteriaAverages.length > 0 && (
            <div className={styles.criteriaList}>
              {criteriaAverages.map((c) => (
                <div key={c.criterionId} className={styles.criteriaRow}>
                  <span className={styles.criteriaName}>{c.criterionName}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(c.average / 5) * 100}%` }}
                    />
                  </div>
                  <span className={styles.criteriaValue}>{formatNum(c.average)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Kommentare (Server → Client: createdAt als ISO-String) */}
          {comments.length > 0 && (
            <CommentList
              comments={comments.map((c) => ({
                id: c.id,
                score: c.score,
                comment: c.comment,
                createdAt: c.createdAt.toISOString(),
                userName: c.userName,
              }))}
            />
          )}

          <Link href={`/tools/${slug}/bewerten`} className={styles.ctaBtn}>
            Deine Bewertung abgeben
          </Link>
        </>
      )}
    </section>
  )
}
