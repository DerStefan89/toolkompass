'use client'

import { Mail } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function ContactButton() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <a
      href="mailto:toolsucher@gmail.com"
      aria-label="Kontakt aufnehmen"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-cta)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        textDecoration: 'none',
        zIndex: 50,
        opacity: 0.85,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
    >
      <Mail size={18} />
    </a>
  )
}
