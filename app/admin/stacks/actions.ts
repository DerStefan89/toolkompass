/**
 * Datei: app/admin/stacks/actions.ts
 *
 * Zweck: Server Actions für Tool-Stack-Formulare (Erstellen und Bearbeiten).
 * Ein Stack besteht aus einer deutschen Übersetzung (Name, Beschreibung, Zielgruppe)
 * und einer geordneten Liste von Tool-IDs.
 *
 * Wird aufgerufen von:
 * - app/admin/stacks/neu/page.tsx  (createStack)
 * - app/admin/stacks/[id]/page.tsx (updateStack.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { createClient } from '@/lib/supabase/server'
import { parseStr } from '@/lib/utils/form'



type StackFormData = {
  name: string
  slug: string
  description: string | null
  targetAudience: string
  published: boolean
  toolIds: string[]
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function parseStackForm(formData: FormData): {
  data: StackFormData
  errors: Record<string, string> | null
} {
  const name           = parseStr(formData, 'name')
  const slug           = parseStr(formData, 'slug')
  const description    = parseStr(formData, 'description') || null
  const targetAudience = parseStr(formData, 'targetAudience')
  const published      = formData.get('published') === 'on'
  const toolIds        = formData.getAll('toolIds') as string[]

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name ist erforderlich.'
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (!targetAudience) errors.targetAudience = 'Zielgruppe ist erforderlich.'

  return {
    data: { name, slug, description, targetAudience, published, toolIds },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createStack(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseStackForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.toolStack.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.toolStack.create({
      data: {
        slug:      data.slug,
        published: data.published,
        translations: {
          create: {
            locale:         'de',
            name:           data.name,
            description:    data.description,
            targetAudience: data.targetAudience,
          },
        },
        tools: {
          create: data.toolIds.map((toolId, i) => ({
            toolId,
            sortOrder: i,
          })),
        },
      },
    })
  } catch (error) {
    console.error('[createStack]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/stacks')
  revalidatePath('/tool-stacks')
  redirect('/admin/stacks')
}

export async function updateStack(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseStackForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.toolStack.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.toolStack.update({
      where: { id },
      data: {
        slug:      data.slug,
        published: data.published,
        translations: {
          upsert: {
            where: { toolStackId_locale: { toolStackId: id, locale: 'de' } },
            create: {
              locale:         'de',
              name:           data.name,
              description:    data.description,
              targetAudience: data.targetAudience,
            },
            update: {
              name:           data.name,
              description:    data.description,
              targetAudience: data.targetAudience,
            },
          },
        },
        // Tool-Zuordnungen atomisch ersetzen
        tools: {
          deleteMany: {},
          create: data.toolIds.map((toolId, i) => ({
            toolId,
            sortOrder: i,
          })),
        },
      },
    })
  } catch (error) {
    console.error('[updateStack]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/stacks')
  revalidatePath(`/tool-stacks/${data.slug}`)
  revalidatePath('/tool-stacks')
  redirect('/admin/stacks')
}

// Löscht einen Tool-Stack inkl. aller Übersetzungen und Tool-Zuordnungen (onDelete: Cascade).
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteStack(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  try {
    await prisma.toolStack.delete({ where: { id } })
  } catch (error) {
    console.error('[deleteStack]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/stacks')
  revalidatePath('/tool-stacks')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false.
export async function toggleStackPublished(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const item = await prisma.toolStack.findUnique({
    where: { id },
    select: { published: true },
  })
  if (!item) return
  await prisma.toolStack.update({
    where: { id },
    data: { published: !item.published },
  })
  revalidatePath('/admin/stacks')
  revalidatePath('/tool-stacks')
  revalidatePath('/')
}
