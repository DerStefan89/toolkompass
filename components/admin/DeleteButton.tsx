/**
 * Datei: components/admin/DeleteButton.tsx
 *
 * Zweck: Wiederverwendbarer Löschen-Button für alle Admin-Bearbeitungsseiten.
 * Zeigt einen window.confirm-Dialog, ruft die Action auf und navigiert
 * nach Erfolg zur redirectTo-URL (kein redirect in der Server Action selbst).
 *
 * Wichtig:
 * - Die action muss eine gebundene Server Action sein (z. B. deleteTool.bind(null, id)).
 * - Fehler (z. B. FK-Constraint bei Vendor mit zugeordneten Tools) werden per alert angezeigt.
 */

'use client'

import { useTransition } from 'react'

type DeleteButtonProps = {
  action: () => Promise<{ error?: string }>
  confirmMessage: string
  redirectTo: string
}

export default function DeleteButton({ action, confirmMessage, redirectTo }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMessage)) return
    startTransition(async () => {
      const result = await action()
      if (result?.error) {
        alert(result.error)
      } else {
        window.location.href = redirectTo
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
