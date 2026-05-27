/**
 * Datei: components/layout/PublicFooter.tsx
 *
 * Zweck: Globaler Footer für alle öffentlichen Seiten.
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 *
 * Wichtig:
 * - Gleiche CSS-Variablen wie PublicHeader (via globals.css).
 * - Wird in app/layout.tsx direkt unter {children} eingebunden.
 * - Mobile: Spalten untereinander; Desktop (≥ 768px): Copyright links, Links rechts.
 */

import Link from 'next/link'
import styles from './PublicFooter.module.css'

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <span className={styles.copyright}>© 2026 ToolSucher</span>

        <nav className={styles.nav}>
          {[
            { label: 'Impressum',         href: '/impressum' },
            { label: 'Datenschutz',       href: '/datenschutz' },
            { label: 'Affiliate-Hinweis', href: '/affiliate-hinweis' },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>

      </div>
    </footer>
  )
}
