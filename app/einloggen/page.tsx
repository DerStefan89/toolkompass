/**
 * Datei: app/einloggen/page.tsx
 *
 * Zweck: Nutzer-Login per Magic Link (Supabase signInWithOtp).
 * Server Component — liest ?fehler= und ?next= aus searchParams und rendert
 * das Client-Formular (components/auth/LoginForm.tsx).
 *
 * Design-Referenz:
 * - Kein eigener Screenshot — Stil wie app/admin/login/page.tsx
 *   (weiße Card auf Creme, gleiche Tokens), aber Magic Link statt Passwort.
 *
 * Wichtig:
 * - Fehlertexte kommen aus dem ?fehler=-Mapping (von /auth/confirm) —
 *   nie technische Details.
 */

import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Einloggen — ToolSucher',
  robots: { index: false },
}

/** Nutzerfreundliche Texte für die Fehlercodes aus /auth/confirm. */
const FEHLER_TEXTE: Record<string, string> = {
  'link-ungueltig': 'Dieser Link ist ungültig. Bitte fordere einen neuen an.',
  'link-abgelaufen': 'Dieser Link ist abgelaufen. Magic Links sind nur einmal verwendbar.',
}

export default async function EinloggenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; next?: string }>
}) {
  const { fehler, next } = await searchParams
  const fehlerText = fehler ? FEHLER_TEXTE[fehler] : undefined

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.cardIcon}>🧭</div>
        <h1 className={styles.cardTitle}>Einloggen</h1>
        <p className={styles.cardDesc}>
          Melde dich mit einem Magic Link an — kein Passwort nötig.
        </p>

        {fehlerText && <p className={styles.fehler}>{fehlerText}</p>}

        <LoginForm next={next} />
      </div>
    </main>
  )
}
