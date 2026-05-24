/**
 * Datei: app/admin/artikel/actions.ts
 *
 * Zweck: Server Actions für Artikel-Formulare (Erstellen und Bearbeiten).
 * Verarbeitet Titel, Slug, Typ, Sections (als JSON) und published-Status.
 *
 * Wird aufgerufen von:
 * - app/admin/artikel/neu/page.tsx  (createArtikel)
 * - app/admin/artikel/[id]/page.tsx (updateArtikel.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'

export type { ActionState }

export type SectionInput = {
  heading: string
  content: string
}

type ArtikelFormData = {
  title: string
  slug: string
  subtitle: string
  type: 'guide' | 'top_list' | 'comparison' | 'tutorial'
  published: boolean
  sections: SectionInput[]
  tagIds: string[]
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Parst und validiert alle Formularfelder inkl. JSON-kodierter Sections
function parseArtikelForm(formData: FormData): {
  data: ArtikelFormData
  errors: Record<string, string> | null
} {
  const str = (key: string) => ((formData.get(key) as string) ?? '').trim()

  const title     = str('title')
  const slug      = str('slug')
  const subtitle  = str('subtitle')
  const type      = str('type') as ArtikelFormData['type']
  const published = formData.get('published') === 'on'
  const tagIds    = formData.getAll('tagIds') as string[]

  // Sections kommen als JSON-String aus dem Hidden-Field
  let sections: SectionInput[] = []
  try {
    const raw = str('sections_json')
    if (raw) sections = JSON.parse(raw)
  } catch {
    // Bei ungültigem JSON: leere Sections, Validierung schlägt unten an
  }

  const errors: Record<string, string> = {}

  if (!title) errors.title = 'Titel ist erforderlich.'
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (!subtitle) errors.subtitle = 'Untertitel ist erforderlich.'

  const validTypes = ['guide', 'top_list', 'comparison', 'tutorial']
  if (!validTypes.includes(type)) errors.type = 'Bitte einen gültigen Typ auswählen.'

  // Mindestens ein Abschnitt mit Inhalt
  const filledSections = sections.filter(s => s.content.trim())
  if (filledSections.length === 0) {
    errors.sections = 'Mindestens ein Abschnitt mit Inhalt ist erforderlich.'
  }

  return {
    data: { title, slug, subtitle, type, published, sections: filledSections, tagIds },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt einen neuen Artikel inkl. aller Sections.
export async function createArtikel(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseArtikelForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.article.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.article.create({
      data: {
        title:       data.title,
        slug:        data.slug,
        subtitle:    data.subtitle,
        type:        data.type,
        locale:      'de',
        published:   data.published,
        publishedAt: data.published ? new Date() : null,
        sections: {
          create: data.sections.map((s, i) => ({
            heading:   s.heading.trim() || null,
            content:   s.content.trim(),
            sortOrder: i,
          })),
        },
        // Tags optional — kein Fehler wenn keine gewählt
        tags: {
          create: data.tagIds.map(tagId => ({ tagId })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/artikel')
  revalidatePath('/ratgeber')
  redirect('/admin/artikel')
}

// Aktualisiert einen bestehenden Artikel.
// Die Artikel-ID wird per .bind(null, id) in der Seite vorgefüllt.
export async function updateArtikel(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseArtikelForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.article.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  const existing = await prisma.article.findUnique({
    where: { id },
    select: { publishedAt: true },
  })

  try {
    await prisma.article.update({
      where: { id },
      data: {
        title:       data.title,
        slug:        data.slug,
        subtitle:    data.subtitle,
        type:        data.type,
        published:   data.published,
        publishedAt: data.published ? (existing?.publishedAt ?? new Date()) : null,
        // Sections atomisch ersetzen
        sections: {
          deleteMany: {},
          create: data.sections.map((s, i) => ({
            heading:   s.heading.trim() || null,
            content:   s.content.trim(),
            sortOrder: i,
          })),
        },
        // Tag-Zuordnungen atomisch ersetzen (optional — leere Liste ist gültig)
        tags: {
          deleteMany: {},
          create: data.tagIds.map(tagId => ({ tagId })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/artikel')
  revalidatePath(`/ratgeber/${data.slug}`)
  revalidatePath('/ratgeber')
  redirect('/admin/artikel')
}

// Löscht einen Artikel inkl. aller Sections (onDelete: Cascade).
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteArtikel(id: string): Promise<{ error?: string }> {
  try {
    await prisma.article.delete({ where: { id } })
  } catch {
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/artikel')
  revalidatePath('/ratgeber')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false und setzt publishedAt entsprechend.
export async function toggleArtikelPublished(id: string): Promise<void> {
  const item = await prisma.article.findUnique({
    where: { id },
    select: { published: true },
  })
  if (!item) return
  await prisma.article.update({
    where: { id },
    data: {
      published:   !item.published,
      publishedAt: !item.published ? new Date() : null,
    },
  })
  revalidatePath('/admin/artikel')
  revalidatePath('/ratgeber')
  revalidatePath('/')
}
