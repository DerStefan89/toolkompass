/**
 * Datei: app/einloggen/page.tsx
 *
 * Zweck: Platzhalter-Seite für den Nutzer-Login.
 * Wird in einer späteren Phase durch echte Supabase Auth ersetzt.
 */

import Link from 'next/link'

export default function EinloggenSeite() {
  return (
    <main style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '48px 40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧭</div>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}>
          Einloggen
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.6',
          marginBottom: '24px',
        }}>
          Login für Nutzer kommt bald.
        </p>
        <Link href="/" style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}>
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  )
}
