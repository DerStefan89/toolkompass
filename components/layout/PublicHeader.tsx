/**
 * Datei: components/layout/PublicHeader.tsx
 *
 * Zweck: Hauptnavigation von ToolSucher
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 * - design-refs/4_Alle_Kategorien.png
 *
 * Produkt-Kontext:
 * Der Header erscheint auf allen öffentlichen Seiten.
 * Logo links, Navigation Mitte, CTA-Button rechts.
 *
 * Wichtig:
 * - Responsive-Logik läuft ausschließlich über CSS Modules
 *   (PublicHeader.module.css) — kein window.innerWidth, kein JS-Breakpoint.
 * - Body-Scroll wird per useEffect gesperrt, solange das Mobile-Menü offen ist.
 * - SVG-Attribute (stroke, fill) sind SVG-Properties, keine CSS-Inline-Styles.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthNavItem } from '@/components/auth/AuthNavItem';
import styles from './PublicHeader.module.css';

const navLinks = [
  { label: 'Entdecken',   href: '/kategorien' },
  { label: 'Vergleichen', href: '/vergleichen' },
  { label: 'Entwickeln',  href: '/entwickeln' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // ESC schließt das Mobile-Menü
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  // Body-Scroll sperren, solange das Menü offen ist
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.inner}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="2" fill="#8B7355"/>
              <line x1="16" y1="4"  x2="16" y2="10" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="22" x2="16" y2="28" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4"  y1="16" x2="10" y2="16" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="22" y1="16" x2="28" y2="16" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <polygon points="16,6 18,14 16,16 14,14" fill="#8B7355"/>
            </svg>
            <span className={styles.logoText}>ToolSucher</span>
          </Link>

          {/* Desktop-Navigation */}
          <nav className={styles.navDesktop}>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Rechte Seite: Burger (Mobile) + Heart + Einloggen (Desktop) */}
          <div className={styles.actions}>

            {/* Burger-Button — nur auf Mobile sichtbar */}
            <button
              className={styles.burger}
              onClick={() => setMenuOpen(prev => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Navigation schließen' : 'Navigation öffnen'}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Merkliste — nur auf Desktop sichtbar */}
            <button className={styles.heartBtn} aria-label="Merkliste">
              <Heart size={20} />
            </button>

            {/* Einloggen / Mein Konto — nur auf Desktop sichtbar */}
            <AuthNavItem className={styles.loginBtn} />

          </div>
        </div>
      </div>

      {/* Mobile Overlay — nur gerendert wenn menuOpen */}
      {menuOpen && (
        <>
          {/* Backdrop: Klick außerhalb schließt das Menü */}
          <div
            className={styles.backdrop}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menü-Panel */}
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${styles.mobileNavLink}${isActive ? ` ${styles.mobileNavLinkActive}` : ''}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <AuthNavItem
              className={styles.mobileLoginBtn}
              onClick={() => setMenuOpen(false)}
            />
          </nav>
        </>
      )}
    </header>
  );
}
