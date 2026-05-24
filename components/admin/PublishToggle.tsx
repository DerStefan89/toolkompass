/**
 * Datei: components/admin/PublishToggle.tsx
 *
 * Zweck: Klickbarer Published-Status-Badge in der Admin-Tool-Liste.
 * Toggled published true↔false via Server Action, ohne Seitenreload.
 */

'use client'

import { useTransition } from 'react'
import { togglePublished } from '@/app/admin/tools/actions'

type Props = {
  toolId: string
  published: boolean
}

export default function PublishToggle({ toolId, published }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => {
      togglePublished(toolId)
    })
  }

  const label = isPending ? '…' : published ? 'Veröffentlicht' : 'Entwurf'

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isPending ? 'Wird gespeichert…' : published ? 'Klick zum Deaktivieren' : 'Klick zum Veröffentlichen'}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        border: 'none',
        cursor: isPending ? 'wait' : 'pointer',
        backgroundColor: isPending
          ? 'var(--color-badge-bg)'
          : published
            ? 'var(--color-success-bg)'
            : 'var(--color-warning-bg)',
        color: isPending
          ? 'var(--color-text-secondary)'
          : published
            ? 'var(--color-success-text)'
            : 'var(--color-warning-text)',
        transition: 'opacity 0.15s',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  )
}
