/**
 * Datei: components/admin/DeleteToolButton.tsx
 *
 * Zweck: Löschen-Button in der Admin-Tool-Liste.
 * Bestätigt via window.confirm, löscht dann ohne Seitenreload.
 */

'use client'

import { useTransition } from 'react'
import { deleteToolById } from '@/app/admin/tools/actions'

type Props = {
  toolId: string
  toolName: string
}

export default function DeleteToolButton({ toolId, toolName }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`"${toolName}" wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden.`)) return
    startTransition(() => {
      deleteToolById(toolId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isPending ? 'Wird gelöscht…' : `"${toolName}" löschen`}
      style={{
        padding: '5px 8px',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-btn)',
        backgroundColor: 'transparent',
        color: isPending ? 'var(--color-text-secondary)' : 'var(--color-error)',
        fontSize: '13px',
        cursor: isPending ? 'not-allowed' : 'pointer',
        lineHeight: 1,
        opacity: isPending ? 0.5 : 1,
      }}
    >
      {isPending ? '…' : '✕'}
    </button>
  )
}
