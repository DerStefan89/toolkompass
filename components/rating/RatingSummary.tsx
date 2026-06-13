/**
 * Datei: components/rating/RatingSummary.tsx
 *
 * Zweck: Zeigt die freigegebenen Bewertungen eines Tools — Gesamtdurchschnitt,
 * Durchschnitt pro Kriterium und die Kommentare. Server Component.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx
 *
 * Wichtig (ARCHITECTURE §7):
 * - Kommentare sind nutzergenerierter Content und werden als PLAIN TEXT
 *   gerendert ({comment}) — niemals Markdown/rehypeRaw/dangerouslySetInnerHTML.
 * - Es wird nie die E-Mail gezeigt, nur der Anzeigename (firstName / "Nutzer").
 */

import Link from 'next/link'
import StarDisplay from './StarDisplay'
import type { ToolRatingSummary } from '@/lib/data/ratings'
import styles from './RatingSummary.module.css'

interface RatingSummaryProps {
  summary: ToolRatingSummary
  slug: string
}

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

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

          {/* Kriterien-Durchschnitte */}
          {criteriaAverages.length > 0 && (
            <ul className={styles.critList}>
              {criteriaAverages.map((c) => (
                <li key={c.criterionId} className={styles.critItem}>
                  <span className={styles.critName}>{c.criterionName}</span>
                  <span className={styles.critValue}>
                    <StarDisplay value={c.average} size={14} />
                    <span className={styles.critNum}>{formatNum(c.average)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Kommentare */}
          {comments.length > 0 && (
            <div className={styles.comments}>
              {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentHead}>
                    <StarDisplay value={comment.score} size={14} />
                    <span className={styles.commentName}>{comment.userName}</span>
                    <span className={styles.commentDate}>{dateFmt.format(comment.createdAt)}</span>
                  </div>
                  {/* PLAIN TEXT — React escaped automatisch, kein Markdown */}
                  <p className={styles.commentText}>{comment.comment}</p>
                </div>
              ))}
            </div>
          )}

          <Link href={`/tools/${slug}/bewerten`} className={styles.ctaBtn}>
            Deine Bewertung abgeben
          </Link>
        </>
      )}
    </section>
  )
}
