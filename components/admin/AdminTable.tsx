/**
 * Datei: components/admin/AdminTable.tsx
 *
 * Zweck: Gemeinsame Layout-Bausteine für alle Admin-Listenseiten.
 *
 * AdminPageHeader: Seitenüberschrift mit Untertitel und Aktions-Button.
 * AdminTable:      Tabellencontainer mit Spaltenheader und Leer-Zustand.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Admin-Bereich)
 *
 * Wichtig:
 * Rows werden von der jeweiligen Seite gerendert — AdminTable liefert nur
 * den Container, den Header und den Empty-State.
 * gridTemplateColumns muss in Header (AdminTable) und Rows (Seite) identisch sein.
 * Jede Seite definiert dafür COLUMNS + GRID als Modul-Konstanten.
 */

import type { ReactNode } from 'react'

// ─── AdminPageHeader ────────────────────────────────────────────────────────

interface AdminPageHeaderProps {
  title: string
  subtitle: string
  actionLabel: string
  actionHref: string
}

export function AdminPageHeader({ title, subtitle, actionLabel, actionHref }: AdminPageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          {title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {subtitle}
        </p>
      </div>
      <a
        href={actionHref}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--color-cta)',
          color: 'white',
          borderRadius: 'var(--radius-btn)',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {actionLabel}
      </a>
    </div>
  )
}

// ─── AdminTable ─────────────────────────────────────────────────────────────

interface AdminTableColumn {
  label: string
  width: string
}

interface AdminTableProps {
  columns: AdminTableColumn[]
  isEmpty: boolean
  emptyText?: string
  children?: ReactNode
}

export default function AdminTable({
  columns,
  isEmpty,
  emptyText = 'Keine Einträge vorhanden.',
  children,
}: AdminTableProps) {
  const gridTemplateColumns = columns.map(c => c.width).join(' ')

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns,
        padding: '12px 20px',
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {columns.map(col => (
          <span key={col.label}>{col.label}</span>
        ))}
      </div>

      {isEmpty ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
        }}>
          {emptyText}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
