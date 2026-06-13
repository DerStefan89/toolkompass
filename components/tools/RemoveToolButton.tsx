/**
 * Datei: components/tools/RemoveToolButton.tsx
 *
 * Zweck: Button zum Entfernen eines Tools aus dem eigenen Stack (/meine-tools).
 * Client Component wegen useTransition (optimistisches Ausblenden).
 *
 * Wird aufgerufen von:
 * - app/meine-tools/page.tsx (pro Stack-Eintrag)
 *
 * Wichtig:
 * - Kein Prisma-Import — die Action kommt als RPC-Referenz, die Eigentums-
 *   Prüfung passiert serverseitig.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeUserTool } from '@/app/meine-tools/actions'
import styles from '@/app/meine-tools/page.module.css'

interface RemoveToolButtonProps {
  userToolId: string
  toolName: string
}

export default function RemoveToolButton({ userToolId, toolName }: RemoveToolButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)

  function handleRemove() {
    setRemoved(true) // optimistisch ausblenden
    startTransition(async () => {
      const res = await removeUserTool(userToolId)
      if (res.success) {
        router.refresh()
      } else {
        setRemoved(false) // Rollback bei Fehler
      }
    })
  }

  // Optimistisch entfernt → Button ausblenden, bis der Refresh die Zeile entfernt
  if (removed) return null

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className={styles.removeBtn}
      aria-label={`${toolName} aus dem Stack entfernen`}
    >
      Entfernen
    </button>
  )
}
