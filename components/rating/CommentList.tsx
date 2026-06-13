/**
 * Datei: components/rating/CommentList.tsx
 *
 * Zweck: Liste der Bewertungs-Kommentare mit Aufklapp-Logik (erst 5 neueste,
 * Rest per Toggle). Client Component wegen useState.
 *
 * Wird aufgerufen von:
 * - components/rating/RatingSummary.tsx
 *
 * Wichtig (ARCHITECTURE §7):
 * - Kommentare sind nutzergenerierter Content und werden als PLAIN TEXT
 *   gerendert ({comment}) — niemals Markdown/rehypeRaw/dangerouslySetInnerHTML.
 * - Kein Prisma-Import; createdAt kommt als ISO-String vom Server.
 * - Read-only Sterne sind hier inline (vermeidet Server/Client-Grenze).
 */

'use client'

import { useState } from 'react'
import styles from './CommentList.module.css'

interface CommentItem {
  id: string
  score: number
  comment: string
  createdAt: string // ISO-String (Server → Client)
  userName: string
}

interface CommentListProps {
  comments: CommentItem[]
}

const VISIBLE_DEFAULT = 5

const dateFmt = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const STARS = [1, 2, 3, 4, 5]

/** Read-only Sterne (inline — keine Server-Component-Grenze). */
function Stars({ score }: { score: number }) {
  return (
    <span className={styles.stars} aria-label={`${score} von 5 Sternen`}>
      {STARS.map((i) => (
        <span key={i} aria-hidden="true">{i <= score ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export default function CommentList({ comments }: CommentListProps) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? comments : comments.slice(0, VISIBLE_DEFAULT)

  return (
    <div className={styles.list}>
      {visible.map((c) => (
        <div key={c.id} className={styles.comment}>
          <div className={styles.head}>
            <Stars score={c.score} />
            <span className={styles.name}>{c.userName}</span>
            <span className={styles.date}>{dateFmt.format(new Date(c.createdAt))}</span>
          </div>
          {/* PLAIN TEXT — React escaped automatisch, kein Markdown */}
          <p className={styles.text}>{c.comment}</p>
        </div>
      ))}

      {comments.length > VISIBLE_DEFAULT && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Weniger anzeigen' : `Alle ${comments.length} Bewertungen anzeigen`}
        </button>
      )}
    </div>
  )
}
