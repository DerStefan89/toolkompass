/**
 * Datei: app/admin/artikel/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten eines bestehenden Artikels im Admin-Bereich.
 * Lädt den Artikel mit seinen Sections aus der DB und übergibt defaultValues an ArtikelForm.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArtikelForm from '@/components/admin/ArtikelForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateArtikel, deleteArtikel } from '../actions'
import type { ArtikelFormDefaults } from '@/components/admin/ArtikelForm'

export default async function EditArtikelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [article, tagGroups] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { sortOrder: 'asc' } },
        tags:     true,
      },
    }),
    prisma.tagGroup.findMany({
      include: { tags: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!article) notFound()

  const tagGroupOptions = tagGroups.map(g => ({
    id:   g.id,
    name: g.name,
    tags: g.tags.map(t => ({ id: t.id, name: t.name })),
  }))

  const defaultValues: ArtikelFormDefaults = {
    title:     article.title,
    slug:      article.slug,
    subtitle:  article.subtitle,
    type:      article.type as ArtikelFormDefaults['type'],
    published: article.published,
    sections:  article.sections.map(s => ({
      heading: s.heading ?? '',
      content: s.content,
    })),
    tagIds: article.tags.map(t => t.tagId),
  }

  const boundUpdate = updateArtikel.bind(null, article.id)
  const boundDelete = deleteArtikel.bind(null, article.id)

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
          Artikel bearbeiten
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {article.title}
        </p>
      </div>

      <ArtikelForm action={boundUpdate} tagGroups={tagGroupOptions} defaultValues={defaultValues} />

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
            Artikel löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Löscht den Artikel dauerhaft inkl. aller Abschnitte. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`"${article.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        />
      </div>
    </div>
  )
}
