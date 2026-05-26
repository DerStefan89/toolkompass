/**
 * Datei: components/admin/Pagination.tsx
 *
 * Zweck: Serverseitige Pagination-Leiste für Admin-Listen.
 * Rendert Erste/Vorige/Seite X von Y/Nächste/Letzte als Next.js Links.
 * Deaktivierte Einträge werden als <span> gerendert (kein Klick möglich).
 * Gibt null zurück wenn totalPages <= 1.
 */

import Link from 'next/link'

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null

  const isFirst = currentPage <= 1
  const isLast  = currentPage >= totalPages

  const btn = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    fontSize: '13px',
    textDecoration: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-btn)',
    backgroundColor: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
  }

  const off = {
    ...btn,
    color: 'var(--color-text-secondary)',
    opacity: 0.45,
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      marginTop: '16px',
      padding: '8px 0',
    }}>
      {isFirst
        ? <span style={off}>« Erste</span>
        : <Link href={`${basePath}?page=1`} style={btn}>« Erste</Link>}

      {isFirst
        ? <span style={off}>‹ Vorige</span>
        : <Link href={`${basePath}?page=${currentPage - 1}`} style={btn}>‹ Vorige</Link>}

      <span style={{ padding: '5px 14px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Seite {currentPage} von {totalPages}
      </span>

      {isLast
        ? <span style={off}>Nächste ›</span>
        : <Link href={`${basePath}?page=${currentPage + 1}`} style={btn}>Nächste ›</Link>}

      {isLast
        ? <span style={off}>Letzte »</span>
        : <Link href={`${basePath}?page=${totalPages}`} style={btn}>Letzte »</Link>}
    </div>
  )
}
