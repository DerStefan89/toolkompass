/**
 * Datei: app/admin/tags/actions.ts
 *
 * Zweck: Server Actions für TagGroup-Formulare (Erstellen und Bearbeiten).
 * Eine TagGroup enthält mehrere Tags — diese werden als Textarea (ein Name pro Zeile)
 * erfasst und bei jedem Speichern atomisch ersetzt (deleteMany + create).
 *
 * Wird aufgerufen von:
 * - app/admin/tags/neu/page.tsx  (createTagGroup)
 * - app/admin/tags/[id]/page.tsx (updateTagGroup.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ActionState = {
  error?: string
  fieldErrors?: Record<string, string>
}

type TagGroupFormData = {
  name: string
  slug: string
  description: string | null
  sortOrder: number
  tagNames: string[]
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseTagGroupForm(formData: FormData): {
  data: TagGroupFormData
  errors: Record<string, string> | null
} {
  const str = (key: string) => ((formData.get(key) as string) ?? '').trim()

  const name        = str('name')
  const slug        = str('slug')
  const description = str('description') || null
  const sortOrderRaw = str('sortOrder')
  const sortOrder   = sortOrderRaw !== '' ? parseInt(sortOrderRaw, 10) : 0
  const tagsRaw     = (formData.get('tags') as string) ?? ''
  const tagNames    = tagsRaw.split('\n').map(s => s.trim()).filter(Boolean)

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name ist erforderlich.'
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (isNaN(sortOrder)) errors.sortOrder = 'Muss eine Zahl sein.'

  return {
    data: { name, slug, description, sortOrder, tagNames },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createTagGroup(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseTagGroupForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.tagGroup.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.tagGroup.create({
      data: {
        name:        data.name,
        slug:        data.slug,
        description: data.description,
        sortOrder:   data.sortOrder,
        tags: {
          create: data.tagNames.map((tagName, i) => ({
            name:      tagName,
            slug:      toSlug(tagName),
            sortOrder: i,
          })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/tags')
  redirect('/admin/tags')
}

export async function updateTagGroup(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseTagGroupForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.tagGroup.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.tagGroup.update({
      where: { id },
      data: {
        name:        data.name,
        slug:        data.slug,
        description: data.description,
        sortOrder:   data.sortOrder,
        // Tags atomisch ersetzen — Slugs werden aus Namen generiert
        tags: {
          deleteMany: {},
          create: data.tagNames.map((tagName, i) => ({
            name:      tagName,
            slug:      toSlug(tagName),
            sortOrder: i,
          })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/tags')
  redirect('/admin/tags')
}
