/**
 * Datei: app/admin/tags/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten einer bestehenden Tag-Gruppe.
 * Lädt die Gruppe mit ihren Tags und übergibt sie als defaultValues an TagGroupForm.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TagGroupForm from '@/components/admin/TagGroupForm'
import { updateTagGroup } from '../actions'
import type { TagGroupFormDefaults } from '@/components/admin/TagGroupForm'

export default async function EditTagGroupPage({ params }: { params: { id: string } }) {
  const group = await prisma.tagGroup.findUnique({
    where: { id: params.id },
    include: { tags: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!group) notFound()

  const defaultValues: TagGroupFormDefaults = {
    name:        group.name,
    slug:        group.slug,
    description: group.description,
    sortOrder:   group.sortOrder,
    tagNames:    group.tags.map(t => t.name),
  }

  const boundUpdate = updateTagGroup.bind(null, group.id)

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
          Tag-Gruppe bearbeiten
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {group.name} · {group.tags.length} Tags
        </p>
      </div>

      <TagGroupForm action={boundUpdate} defaultValues={defaultValues} />
    </div>
  )
}
