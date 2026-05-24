/**
 * Datei: components/admin/PublishToggle.tsx
 *
 * Zweck: Wiederverwendbarer klickbarer Published-Status-Badge für alle
 *        Admin-Listenseiten. Die Toggle-Action wird von außen übergeben,
 *        damit diese Komponente nicht von einer spezifischen Entity abhängt.
 *
 * Verwendung:
 *   <PublishToggle
 *     published={tool.published}
 *     action={togglePublished.bind(null, tool.id)}
 *   />
 *
 * Die action muss eine Server Action sein, die per .bind() an eine ID gebunden
 * ist, sodass sie keine weiteren Argumente erwartet.
 */

'use client'

import { useTransition } from 'react'

type Props = {
  published: boolean
  action: () => Promise<void>
}

export default function PublishToggle({ published, action }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(() => { action() })
  }

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
      {isPending ? '…' : published ? 'Veröffentlicht' : 'Entwurf'}
    </button>
  )
}
