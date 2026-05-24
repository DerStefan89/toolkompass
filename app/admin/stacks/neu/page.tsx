/**
 * Datei: app/admin/stacks/neu/page.tsx
 *
 * Zweck: Formularseite zum Erstellen eines neuen Tool-Stacks.
 * Lädt alle verfügbaren Tools für die Tool-Auswahl.
 */

import { prisma } from '@/lib/prisma'
import StackForm from '@/components/admin/StackForm'
import { createStack } from '../actions'

export default async function NeuStackPage() {
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
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Neuer Tool-Stack
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Stelle eine kuratierte Tool-Kombination für eine bestimmte Zielgruppe zusammen.
        </p>
      </div>

      <StackForm action={createStack} tools={toolOptions} />
    </div>
  )
}
