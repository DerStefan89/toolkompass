/**
 * Datei: components/auth/ProfileForm.tsx
 *
 * Zweck: Profilformular der Konto-Seite (Vorname, Nachname, Firma).
 * Vier Zustände: Default / Loading / Gespeichert (3s) / Fehler.
 * Client Component wegen useActionState und Timer.
 *
 * Wird aufgerufen von:
 * - app/konto/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-/Server-Import — die Action kommt als RPC-Referenz.
 * - Styles aus app/konto/page.module.css (gemeinsam mit der Seite).
 */

'use client'

import { useActionState, useState, useEffect } from 'react'
import { updateProfile, type ProfileState } from '@/app/konto/actions'
import styles from '@/app/konto/page.module.css'

interface ProfileFormProps {
  firstName: string | null
  lastName: string | null
  company: string | null
}

export default function ProfileForm({ firstName, lastName, company }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {}
  )
  const [showSaved, setShowSaved] = useState(false)

  // "✓ Gespeichert" einblenden und nach 3s wieder ausblenden.
  useEffect(() => {
    if (!state.success) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSaved(true)
    const t = setTimeout(() => setShowSaved(false), 3000)
    return () => clearTimeout(t)
  }, [state])

  return (
    <form action={formAction} className={styles.form}>
      {state.error && <p className={styles.fehler}>{state.error}</p>}

      <div className={styles.field}>
        <label htmlFor="firstName" className={styles.label}>Vorname</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          defaultValue={firstName ?? ''}
          autoComplete="given-name"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="lastName" className={styles.label}>Nachname</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          defaultValue={lastName ?? ''}
          autoComplete="family-name"
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="company" className={styles.label}>
          Firma <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="company"
          type="text"
          name="company"
          defaultValue={company ?? ''}
          autoComplete="organization"
          className={styles.input}
        />
      </div>

      <div className={styles.saveRow}>
        <button type="submit" disabled={isPending} className={styles.submitBtn}>
          {isPending ? 'Wird gespeichert …' : 'Speichern'}
        </button>
        {showSaved && <span className={styles.saved}>Gespeichert.</span>}
      </div>
    </form>
  )
}
