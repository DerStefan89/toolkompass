/**
 * Datei: components/rating/RatingForm.tsx
 *
 * Zweck: Bewertungsformular — Gesamtbewertung, Sterne pro Kriterium und ein
 * optionaler Plain-Text-Kommentar. Bestehende Bewertung wird vorausgefüllt.
 * Client Component wegen useActionState und Zeichenzähler.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/bewerten/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-Import — die Action kommt als RPC-Referenz.
 * - Der Kommentar ist Plain Text (kein Markdown), max. 2000 Zeichen.
 */

'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import StarInput from './StarInput'
import { submitRating, type RatingState } from '@/app/tools/[slug]/bewerten/actions'
import styles from './RatingForm.module.css'

const MAX_COMMENT_LENGTH = 2000

interface RatingFormProps {
  toolId: string
  slug: string
  criteria: { id: string; name: string }[]
  existingRating?: {
    score: number
    comment: string | null
    scores: { criterionId: string; score: number }[]
  } | null
}

export default function RatingForm({ toolId, slug, criteria, existingRating }: RatingFormProps) {
  const [state, formAction, isPending] = useActionState<RatingState, FormData>(submitRating, {})
  const [comment, setComment] = useState(existingRating?.comment ?? '')

  // Score eines Kriteriums aus der bestehenden Bewertung (für Vorbelegung)
  const scoreFor = (criterionId: string) =>
    existingRating?.scores.find((s) => s.criterionId === criterionId)?.score ?? 0

  // ─── Erfolgs-Zustand ────────────────────────────────────────
  if (state.success) {
    return (
      <div className={styles.successBox}>
        <p className={styles.successTitle}>✓ Danke!</p>
        <p className={styles.successText}>
          Deine Bewertung wird geprüft und bald veröffentlicht.
        </p>
        <Link href={`/tools/${slug}`} className={styles.backLink}>
          ← Zurück zum Tool
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="toolId" value={toolId} />

      <h2 className={styles.title}>Deine Bewertung</h2>

      {existingRating && (
        <p className={styles.editHint}>
          Du hast dieses Tool bereits bewertet. Du kannst deine Bewertung aktualisieren.
        </p>
      )}

      {state.error && <p className={styles.error}>{state.error}</p>}

      {/* Gesamtbewertung */}
      <div className={styles.row}>
        <StarInput
          name="overallScore"
          label="Gesamtbewertung"
          description="Wie zufrieden bist du insgesamt?"
          defaultValue={existingRating?.score ?? 0}
          required
        />
      </div>

      {/* Kriterien */}
      {criteria.map((c) => (
        <div key={c.id} className={styles.row}>
          <StarInput
            name={`criterion_${c.id}`}
            label={c.name}
            defaultValue={scoreFor(c.id)}
          />
        </div>
      ))}

      {/* Kommentar */}
      <div className={styles.row}>
        <label htmlFor="comment" className={styles.label}>Deine Erfahrung</label>
        <textarea
          id="comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
          maxLength={MAX_COMMENT_LENGTH}
          rows={5}
          placeholder="Was hat dir gefallen, was nicht? (optional)"
          className={styles.textarea}
        />
        <p className={styles.counter}>{comment.length} / {MAX_COMMENT_LENGTH}</p>
      </div>

      <p className={styles.moderationHint}>
        Bewertungen werden vor Veröffentlichung geprüft.
      </p>

      <button type="submit" disabled={isPending} className={styles.submitBtn}>
        {isPending ? 'Wird eingereicht …' : 'Bewertung einreichen'}
      </button>
    </form>
  )
}
