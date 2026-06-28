/**
 * Datei: components/auth/LoginForm.tsx
 *
 * Zweck: Magic-Link-Login-Formular. Vier Zustände:
 *   Default → Loading → Gesendet (mit 60s-Cooldown) bzw. Fehler.
 * Client Component wegen useActionState, useState und Countdown-Timer.
 *
 * Wird aufgerufen von:
 * - app/einloggen/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-/Server-Import — die Action kommt als RPC-Referenz.
 * - Styles aus app/einloggen/page.module.css (gemeinsam mit der Seite).
 */

'use client'

import { useActionState, useState, useEffect } from 'react'
import Link from 'next/link'
import { sendMagicLink, type MagicLinkState } from '@/app/einloggen/actions'
import styles from '@/app/einloggen/page.module.css'

const COOLDOWN_SECONDS = 60

interface LoginFormProps {
  /** Rücksprung-Ziel nach Login — in dieser Phase nur vorbereitet, ungenutzt. */
  next?: string
}

export default function LoginForm({ next }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<MagicLinkState, FormData>(
    sendMagicLink,
    {}
  )

  const [email, setEmail] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Nach erfolgreichem Versand (auch beim erneuten Anfordern) Cooldown starten.
  useEffect(() => {
    if (state.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCooldown(COOLDOWN_SECONDS)
    }
  }, [state])

  // Sekündlicher Countdown bis 0.
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // ─── Zustand: Gesendet ──────────────────────────────────────
  if (state.success) {
    return (
      <div className={styles.successBox}>
        <p className={styles.successTitle}>Prüfe dein Postfach</p>
        <p className={styles.successText}>
          Wir haben einen Login-Link an <strong>{email}</strong> gesendet.
          Der Link ist 10 Minuten gültig und kann nur einmal verwendet werden.
        </p>

        {/* Erneut anfordern — resubmit per Hidden-Feldern, erst nach Cooldown aktiv */}
        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="acceptedTerms" value="on" />
          {next && <input type="hidden" name="next" value={next} />}
          <button
            type="submit"
            disabled={cooldown > 0 || isPending}
            className={styles.resendBtn}
          >
            {isPending
              ? 'Wird gesendet …'
              : cooldown > 0
                ? `Neuen Link anfordern in ${cooldown}s`
                : 'Neuen Link anfordern'}
          </button>
        </form>
      </div>
    )
  }

  // ─── Zustand: Default / Loading / Fehler ────────────────────
  return (
    <form action={formAction} className={styles.form}>
      {/* Fehler aus der Action */}
      {state.error && <p className={styles.fehler}>{state.error}</p>}

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="deine@email.de"
          className={styles.input}
        />
      </div>

      {next && <input type="hidden" name="next" value={next} />}

      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          name="acceptedTerms"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          required
          className={styles.checkbox}
        />
        <span className={styles.checkboxLabel}>
          Ich habe die{' '}
          <Link href="/datenschutz" className={styles.link}>Datenschutzerklärung</Link>{' '}
          gelesen und akzeptiere sie.
        </span>
      </label>

      <button type="submit" disabled={isPending} className={styles.submitBtn}>
        {isPending ? 'Wird gesendet …' : 'Login-Link anfordern'}
      </button>
    </form>
  )
}
