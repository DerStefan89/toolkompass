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
  'link-ungueltig': 'Dieser Login-Link ist ungültig. Bitte fordere einen neuen Link an.',
  'link-abgelaufen': 'Dieser Login-Link ist abgelaufen oder wurde bereits verwendet. Bitte fordere einen neuen Link an.',
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
          Bei ToolSucher meldest du dich ohne Passwort an. Du gibst deine E-Mail-Adresse ein und bekommst einen einmaligen Login-Link zugeschickt.
        </p>
        <p className={styles.cardDesc}>So funktioniert es:</p>
        <ol className={styles.steps}>
          <li>E-Mail-Adresse eingeben</li>
          <li>Login-Link per E-Mail erhalten</li>
          <li>Link öffnen und angemeldet sein</li>
        </ol>

        {fehlerText && <p className={styles.fehler}>{fehlerText}</p>}

        <LoginForm next={next} />
      </div>
    </main>
  )
}
