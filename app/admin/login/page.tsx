'use client'

/**
 * Datei: app/admin/login/page.tsx
 *
 * Zweck: Login-Seite für den Admin-Bereich.
 * Nutzt Supabase Auth mit E-Mail + Passwort.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-card)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>🧭</p>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            ToolKompass Admin
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Melde dich an um fortzufahren
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* E-Mail */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}>
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="deine@email.de"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                fontSize: '14px',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Passwort */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                fontSize: '14px',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Fehler */}
          {error && (
            <p style={{
              fontSize: '13px',
              color: 'var(--color-error)',
              marginBottom: '16px',
              padding: '10px 12px',
              backgroundColor: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--color-error-border)',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? 'var(--color-text-secondary)' : 'var(--color-cta)',
              color: 'white',
              padding: '12px',
              borderRadius: 'var(--radius-btn)',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </main>
  )
}
