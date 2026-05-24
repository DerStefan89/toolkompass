/**
 * Datei: app/admin/stacks/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten eines bestehenden Tool-Stacks.
 * Lädt Stack-Daten + alle Tools und übergibt beides an StackForm.
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StackForm from '@/components/admin/StackForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateStack, deleteStack } from '../actions'
import type { StackFormDefaults } from '@/components/admin/StackForm'

export default async function EditStackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [stack, allTools] = await Promise.all([
    prisma.toolStack.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: 'de' } },
        tools: { orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.tool.findMany({
      include: { translations: { where: { locale: 'de' } } },
      orderBy: { slug: 'asc' },
    }),
  ])

  if (!stack) notFound()

  const translation = stack.translations[0]

  const defaultValues: StackFormDefaults = {
    name:           translation?.name ?? '',
    slug:           stack.slug,
    description:    translation?.description ?? null,
    targetAudience: translation?.targetAudience ?? '',
    published:      stack.published,
    toolIds:        stack.tools.map(t => t.toolId),
  }

  const toolOptions = allTools.map(t => ({
    id:   t.id,
    name: t.translations[0]?.name ?? t.slug,
    slug: t.slug,
  }))

  const boundUpdate = updateStack.bind(null, stack.id)
  const boundDelete = deleteStack.bind(null, stack.id)

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
          Stack bearbeiten
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {translation?.name ?? stack.slug}
        </p>
      </div>

      <StackForm action={boundUpdate} tools={toolOptions} defaultValues={defaultValues} />

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
            Stack löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Löscht den Stack dauerhaft inkl. aller Tool-Zuordnungen. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`"${translation?.name ?? stack.slug}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        />
      </div>
    </div>
  )
}
