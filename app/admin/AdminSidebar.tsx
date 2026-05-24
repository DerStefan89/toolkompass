'use client'

/**
 * Datei: app/admin/AdminSidebar.tsx
 *
 * Zweck: Sidebar-Navigation im Admin-Bereich.
 * Client Component wegen Logout (Supabase signOut).
 */

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/admin',            label: 'Dashboard',  icon: '⊞'  },
  { href: '/admin/tools',      label: 'Tools',      icon: '🔧' },
  { href: '/admin/vendors',    label: 'Anbieter',   icon: '🏢' },
  { href: '/admin/kategorien', label: 'Kategorien', icon: '⊙'  },
  { href: '/admin/artikel',    label: 'Artikel',    icon: '✍️' },
  { href: '/admin/stacks',     label: 'Tool-Stacks',icon: '⊕'  },
  { href: '/admin/tags',       label: 'Tags',       icon: '◎'  },
]

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      backgroundColor: 'var(--color-cta)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{ fontSize: '20px', marginBottom: '4px' }}>🧭</p>
        <p style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '16px',
          fontWeight: '700',
          color: 'white',
          lineHeight: '1.2',
        }}>
          ToolKompass
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
          Admin
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid white' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {user.email}
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-btn)',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Abmelden
        </button>
      </div>

    </aside>
  )
}
