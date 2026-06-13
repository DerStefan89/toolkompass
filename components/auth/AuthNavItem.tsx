/**
 * Datei: components/auth/AuthNavItem.tsx
 *
 * Zweck: Header-Navigations-Eintrag, der je nach Session-Zustand
 * "Mein Konto" (eingeloggt) oder "Einloggen" (ausgeloggt) zeigt.
 * Client-Island — prüft die Supabase-Session im Browser und reagiert
 * live auf Auth-Änderungen (onAuthStateChange).
 *
 * Wird aufgerufen von:
 * - components/layout/PublicHeader.tsx (Desktop + Mobile)
 *
 * Wichtig:
 * - Während des initialen Ladens wird nichts gerendert (Flackern vermeiden).
 * - onClick wird im Mobile-Menü genutzt, um das Menü beim Klick zu schließen.
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface AuthNavItemProps {
  className?: string
  onClick?: () => void
}

export function AuthNavItem({ className, onClick }: AuthNavItemProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return null // kurzes Flackern vermeiden

  return isLoggedIn ? (
    <Link href="/konto" className={className} onClick={onClick}>
      Mein Konto
    </Link>
  ) : (
    <Link href="/einloggen" className={className} onClick={onClick}>
      Einloggen
    </Link>
  )
}
