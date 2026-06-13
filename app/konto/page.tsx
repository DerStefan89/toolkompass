/**
 * Datei: app/konto/page.tsx
 *
 * Zweck: Geschützte Konto-Seite — Profilbearbeitung und Abmelden.
 * Server Component, geschützt via requireUser() (zusätzlich zu proxy.ts).
 *
 * Design-Referenz:
 * - Kein eigener Screenshot — bestehende Tokens, Stil wie /einloggen.
 *
 * Wichtig:
 * - robots: noindex — die Konto-Seite darf nicht indexiert werden.
 * - E-Mail kommt aus der Session und ist nicht editierbar.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/auth/require-user'
import ProfileForm from '@/components/auth/ProfileForm'
import { logout } from './actions'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Mein Konto | ToolSucher',
  robots: { index: false },
}

export default async function KontoSeite() {
  let userSession: Awaited<ReturnType<typeof requireUser>>
  try {
    userSession = await requireUser()
  } catch {
    redirect('/einloggen?next=/konto')
  }

  const user = await prisma.user.findUnique({
    where: { id: userSession.userId },
    select: { email: true, firstName: true, lastName: true, company: true },
  })

  // Fallback auf die Session-E-Mail (requireUser garantiert die Row, TS-Guard)
  const email = user?.email ?? userSession.email

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Mein Konto
      </p>

      <h1 className={styles.title}>Mein Konto</h1>

      <div className={styles.card}>
        {/* E-Mail — nicht editierbar */}
        <div className={styles.field}>
          <label className={styles.label}>E-Mail</label>
          <p className={styles.emailValue}>{email}</p>
        </div>

        <ProfileForm
          firstName={user?.firstName ?? null}
          lastName={user?.lastName ?? null}
          company={user?.company ?? null}
        />

        <hr className={styles.divider} />

        {/* Abmelden */}
        <form action={logout}>
          <button type="submit" className={styles.logoutBtn}>
            Abmelden
          </button>
        </form>
      </div>
    </main>
  )
}
