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
 * - Lädt Session- und Stack-Status SELBST per Server Action (getMyStackStatus),
 *   damit die Tool-Detailseite keinen Pro-User-State hat und per ISR cachebar
 *   bleibt. Während des Ladens: neutraler, nicht-aktiver Button.
 * - Kein Prisma-Import — die Actions kommen als RPC-Referenzen.
 */

'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { toggleUserTool, getMyStackStatus } from '@/app/tools/[slug]/stack-actions'
import styles from './UseToolButton.module.css'

interface UseToolButtonProps {
  toolId: string
  slug: string
}

export default function UseToolButton({ toolId, slug }: UseToolButtonProps) {
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [inStack, setInStack] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Status clientseitig nachladen — hält die Seite frei von Pro-User-State.
  useEffect(() => {
    let active = true
    getMyStackStatus(toolId)
      .then((res) => {
        if (!active) return
        setIsLoggedIn(res.isLoggedIn)
        setInStack(res.inStack)
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [toolId])

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

  // Ladezustand: neutraler, nicht-aktiver Button (kein Layout-Sprung)
  if (loading) {
    return (
      <span className={styles.btn} aria-hidden="true">
        Ich nutze das
      </span>
    )
  }

  // Gast: kein Action-Call, sondern Link zum Login mit Rücksprung-Ziel
  if (!isLoggedIn) {
    return (
      <Link href={`/einloggen?next=/tools/${slug}`} className={styles.btn}>
        Ich nutze das
      </Link>
    )
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
