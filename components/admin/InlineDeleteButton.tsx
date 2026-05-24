/**
 * Datei: components/admin/InlineDeleteButton.tsx
 *
 * Zweck: Generischer Löschen-Button für Admin-Listenseiten.
 * Die Delete-Action wird von außen übergeben, damit diese Komponente
 * entityübergreifend (Tools, Kategorien, Vergleiche, …) einsetzbar ist.
 *
 * Verwendung:
 *   <InlineDeleteButton
 *     action={deleteToolById.bind(null, tool.id)}
 *     confirmMessage={`"${name}" wirklich löschen?`}
 *   />
 *
 * Die action muss eine Server Action sein, die per .bind() vorgefüllt ist
 * und { error?: string } zurückgibt.
 */

'use client'

import { useTransition } from 'react'

type Props = {
  action: () => Promise<{ error?: string }>
  confirmMessage: string
}

export default function InlineDeleteButton({ action, confirmMessage }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(async () => {
      const result = await action()
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isPending ? 'Wird gelöscht…' : 'Löschen'}
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
