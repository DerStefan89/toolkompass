/**
 * Datei: components/layout/PublicHeader.tsx
 *
 * Zweck: Hauptnavigation von ToolKompass
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 * - design-refs/4_Alle_Kategorien.png
 *
 * Produkt-Kontext:
 * Der Header erscheint auf allen öffentlichen Seiten.
 * Logo links, Navigation Mitte, CTA-Button rechts.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { label: 'Entdecken', href: '/tools' },
  { label: 'Vergleichen', href: '/vergleichen' },
  { label: 'Tool-Stacks', href: '/tool-stacks' },
  { label: 'Ratgeber', href: '/ratgeber' },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#8B7355" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="2" fill="#8B7355"/>
              <line x1="16" y1="4" x2="16" y2="10" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="22" x2="16" y2="28" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4" y1="16" x2="10" y2="16" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="22" y1="16" x2="28" y2="16" stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round"/>
              <polygon points="16,6 18,14 16,16 14,14" fill="#8B7355"/>
            </svg>
            <span style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
            }}>
              ToolKompass
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav style={{ display: 'flex', gap: '36px' }}>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    fontSize: '15px',
                    color: 'var(--color-text-primary)',
                    fontWeight: isActive ? '600' : '400',
                    borderBottom: isActive ? '2px solid #1e3a2a' : '2px solid transparent',
                    paddingBottom: '4px',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Rechte Seite */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-primary)' }}
              aria-label="Merkliste"
            >
              <Heart size={20} />
            </button>
            <Link
              href="/einloggen"
              style={{
                backgroundColor: '#1e3a2a',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Einloggen
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}