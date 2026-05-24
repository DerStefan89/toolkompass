/**
 * Datei: app/admin/artikel/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten eines bestehenden Artikels im Admin-Bereich.
 * Lädt den Artikel mit seinen Sections aus der DB und übergibt defaultValues an ArtikelForm.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArtikelForm from '@/components/admin/ArtikelForm'
import { updateArtikel } from '../actions'
import type { ArtikelFormDefaults } from '@/components/admin/ArtikelForm'

export default async function EditArtikelPage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      sections: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!article) notFound()

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
  }

  const boundUpdate = updateArtikel.bind(null, article.id)

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

      <ArtikelForm action={boundUpdate} defaultValues={defaultValues} />
    </div>
  )
}
