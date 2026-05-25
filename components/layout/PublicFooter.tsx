/**
 * Datei: components/layout/PublicFooter.tsx
 *
 * Zweck: Globaler Footer für alle öffentlichen Seiten.
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 *
 * Wichtig:
 * - Gleiche CSS-Variablen und Schriften wie PublicHeader.
 * - Wird in app/layout.tsx direkt unter {children} eingebunden.
 */

import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-bg)',
      borderTop: '1px solid var(--color-border)',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>

        {/* Copyright */}
        <span style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
        }}>
          © 2026 ToolSucher
        </span>

        {/* Links */}
        <nav style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Impressum',        href: '/impressum' },
            { label: 'Datenschutz',      href: '/datenschutz' },
            { label: 'Affiliate-Hinweis', href: '/affiliate-hinweis' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </footer>
  )
}
