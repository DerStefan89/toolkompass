/**
 * Datei: app/admin/layout.tsx
 *
 * Zweck: Wrapper für alle Admin-Seiten.
 * Lädt den eingeloggten User aus Supabase und zeigt die Sidebar.
 *
 * Auth-Schutz (Defense-in-Depth):
 * - Schicht 1: proxy.ts blockiert Nicht-Admins auf allen /admin-Routen
 * - Schicht 2: Dieses Layout prüft app_metadata.role direkt (User ist schon geladen)
 * - Schicht 3: Jede Server Action hat eigenen requireAdmin()-Call
 *
 * Kein User → Login-Seite (bare children ohne Sidebar).
 * User ohne Admin-Rolle → redirect auf / (falls proxy.ts umgangen wird).
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Kein User = Login-Seite, proxy.ts schützt alle anderen Routen bereits
  if (!user) {
    return <>{children}</>
  }

  // Defense-in-Depth: proxy.ts prüft bereits, aber Layout als zweite Schicht
  if (user.app_metadata?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
    }}>
      <AdminSidebar user={user} />

      <main style={{
        flex: 1,
        padding: '32px',
        overflow: 'auto',
      }}>
        {children}
      </main>
    </div>
  )
}
