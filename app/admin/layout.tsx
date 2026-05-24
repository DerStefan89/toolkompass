/**
 * Datei: app/admin/layout.tsx
 *
 * Zweck: Wrapper für alle Admin-Seiten.
 * Lädt den eingeloggten User aus Supabase und zeigt die Sidebar.
 * Middleware schützt bereits die Routen — redirect hier als zweite Sicherung.
 */

import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Kein User = Login-Seite, Middleware schützt alle anderen Routen bereits
  if (!user) {
    return <>{children}</>
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
