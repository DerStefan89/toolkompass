/**
 * Datei: components/admin/ModerationActions.tsx
 *
 * Zweck: Freigeben-/Ablehnen-Buttons pro Bewertung in der Moderationsqueue.
 * Client Component wegen useTransition + Bestätigungsdialog.
 *
 * Wird aufgerufen von:
 * - app/admin/bewertungen/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-Import — die Actions kommen als RPC-Referenzen.
 */

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveRating, rejectRating } from '@/app/admin/bewertungen/actions'

interface ModerationActionsProps {
  ratingId: string
  isApproved: boolean
}

export default function ModerationActions({ ratingId, isApproved }: ModerationActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('ratingId', ratingId)
      const res = await approveRating(fd)
      if (res.error) alert(res.error)
      else router.refresh()
    })
  }

  function handleReject() {
    if (!window.confirm('Diese Bewertung wirklich ablehnen und dauerhaft löschen?')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('ratingId', ratingId)
      const res = await rejectRating(fd)
      if (res.error) alert(res.error)
      else router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
      {!isApproved && (
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#ffffff',
            backgroundColor: 'var(--color-success)',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          Freigeben
        </button>
      )}
      <button
        type="button"
        onClick={handleReject}
        disabled={isPending}
        style={{
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--color-error)',
          backgroundColor: 'transparent',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-btn)',
          cursor: isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {isApproved ? 'Entfernen' : 'Ablehnen'}
      </button>
    </div>
  )
}
