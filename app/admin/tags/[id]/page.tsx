/**
 * Datei: app/admin/tags/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten einer bestehenden Tag-Gruppe.
 * Lädt die Gruppe mit ihren Tags und übergibt sie als defaultValues an TagGroupForm.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TagGroupForm from '@/components/admin/TagGroupForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateTagGroup, deleteTagGroup } from '../actions'
import type { TagGroupFormDefaults } from '@/components/admin/TagGroupForm'

export default async function EditTagGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const group = await prisma.tagGroup.findUnique({
    where: { id },
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
  const boundDelete = deleteTagGroup.bind(null, group.id)

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

      {/* Gefahrenzone */}
      <div style={{
        marginTop: '24px',
        padding: '20px 24px',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Tag-Gruppe löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Löscht die Gruppe und alle {group.tags.length} enthaltenen Tags dauerhaft. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`Tag-Gruppe "${group.name}" und alle ${group.tags.length} Tags wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        />
      </div>
    </div>
  )
}
