/**
 * Datei: components/admin/DeleteButton.tsx
 *
 * Zweck: Wiederverwendbarer Löschen-Button für alle Admin-Bearbeitungsseiten.
 * Zeigt einen window.confirm-Dialog vor dem Absenden und ruft dann die
 * übergebene Server Action direkt auf (per useTransition).
 *
 * Wichtig:
 * - Die action muss eine gebundene Server Action sein (z. B. deleteTool.bind(null, id)).
 * - Fehler (z. B. FK-Constraint bei Vendor mit zugeordneten Tools) werden per alert angezeigt.
 */

'use client'

import { useTransition } from 'react'

type DeleteButtonProps = {
  action: () => Promise<void>
  confirmMessage: string
}

export default function DeleteButton({ action, confirmMessage }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMessage)) return
    startTransition(async () => {
      try {
        await action()
      } catch {
        alert('Fehler beim Löschen. Bitte versuche es erneut.')
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '8px 20px',
        backgroundColor: 'transparent',
        color: isPending ? 'var(--color-text-secondary)' : 'var(--color-error)',
        border: `1px solid ${isPending ? 'var(--color-border)' : 'var(--color-error)'}`,
        borderRadius: 'var(--radius-btn)',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isPending ? 'not-allowed' : 'pointer',
        flexShrink: 0,
      }}
    >
      {isPending ? 'Wird gelöscht…' : 'Löschen'}
    </button>
  )
}
