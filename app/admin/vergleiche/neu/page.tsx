/**
 * Datei: app/admin/vergleiche/neu/page.tsx
 *
 * Zweck: Formularseite zum Erstellen eines neuen Vergleichs.
 * Lädt alle verfügbaren Tools für die Dropdown-Auswahl.
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import VergleichForm from '@/components/admin/VergleichForm'
import { createVergleich } from '../actions'

export default async function NeuVergleichPage() {
  const tools = await prisma.tool.findMany({
    include: { translations: { where: { locale: 'de' } } },
    orderBy: { slug: 'asc' },
  })

  const toolOptions = tools.map(t => ({
    id:   t.id,
    name: t.translations[0]?.name ?? t.slug,
    slug: t.slug,
  }))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/admin/vergleiche"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Vergleichsliste
        </Link>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
          marginBottom: '4px',
        }}>
          Neuer Vergleich
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Vergleiche zwei Tools anhand konkreter Kriterien und gib eine klare Empfehlung.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <VergleichForm action={createVergleich} tools={toolOptions} />
      </div>
    </div>
  )
}
