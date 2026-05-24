/**
 * Datei: app/admin/artikel/neu/page.tsx
 *
 * Zweck: Formularseite zum Erstellen eines neuen Artikels im Admin-Bereich.
 * Delegiert alle Logik an ArtikelForm + createArtikel Server Action.
 */

import { prisma } from '@/lib/prisma'
import ArtikelForm from '@/components/admin/ArtikelForm'
import { createArtikel } from '../actions'

export default async function NeuArtikelPage() {
  const tagGroups = await prisma.tagGroup.findMany({
    include: { tags: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  const tagGroupOptions = tagGroups.map(g => ({
    id:   g.id,
    name: g.name,
    tags: g.tags.map(t => ({ id: t.id, name: t.name })),
  }))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Neuer Artikel
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Erstelle einen neuen Guide, eine Top-Liste, einen Vergleich oder eine Anleitung.
        </p>
      </div>

      <ArtikelForm action={createArtikel} tagGroups={tagGroupOptions} />
    </div>
  )
}
