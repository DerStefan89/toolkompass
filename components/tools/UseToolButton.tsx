/**
 * Datei: components/tools/UseToolButton.tsx
 *
 * Zweck: Button "Ich nutze das" / "Du nutzt das ✓" auf der Tool-Detailseite.
 * Fügt ein Tool dem Stack des eingeloggten Nutzers hinzu oder entfernt es.
 * Client Component wegen useState/useTransition (optimistisches Update).
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx (Hero-Action-Row)
 *
 * Wichtig:
 * - Kein Prisma-Import — die Action kommt als RPC-Referenz, die userId wird
 *   serverseitig aus der Session ermittelt.
 * - Sekundär-Button (nicht so prominent wie der Affiliate-CTA).
 */

'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toggleUserTool } from '@/app/tools/[slug]/stack-actions'
import styles from './UseToolButton.module.css'

interface UseToolButtonProps {
  toolId: string
  slug: string
  initialInStack: boolean // vom Server vorab geladen
  isLoggedIn: boolean // ob überhaupt ein User eingeloggt ist
}

export default function UseToolButton({
  toolId,
  slug,
  initialInStack,
  isLoggedIn,
}: UseToolButtonProps) {
  const [inStack, setInStack] = useState(initialInStack)
  const [isPending, startTransition] = useTransition()

  // Gast: kein Action-Call, sondern Link zum Login mit Rücksprung-Ziel
  if (!isLoggedIn) {
    return (
      <Link href={`/einloggen?next=/tools/${slug}`} className={styles.btn}>
        Ich nutze das
      </Link>
    )
  }

  function handleToggle() {
    const next = !inStack
    setInStack(next) // optimistisches Update
    startTransition(async () => {
      const res = await toggleUserTool(toolId, slug)
      if (res.success) {
        setInStack(res.inStack)
      } else {
        setInStack(!next) // Rollback bei Fehler
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={inStack}
      className={inStack ? styles.btnActive : styles.btn}
    >
      {inStack ? '✓ Du nutzt das' : '+ Ich nutze das'}
    </button>
  )
}
