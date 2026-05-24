/**
 * Datei: app/admin/kategorien/actions.ts
 *
 * Zweck: Server Actions für Kategorie-Formulare (Erstellen und Bearbeiten).
 * Validierung, Datenbankzugriff und Cache-Invalidierung sind hier zentralisiert.
 *
 * Wird aufgerufen von:
 * - app/admin/kategorien/neu/page.tsx  (createKategorie)
 * - app/admin/kategorien/[id]/page.tsx (updateKategorie.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'

export type { ActionState }

// Interne Repräsentation der validierten Formulardaten
type KategorieFormData = {
  name: string
  slug: string
  description: string
  icon: string | null
  sortOrder: number
  published: boolean
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Extrahiert alle Felder aus FormData, validiert sie und gibt entweder
// gültige Daten oder ein Fehler-Objekt zurück.
function parseKategorieForm(formData: FormData): {
  data: KategorieFormData
  errors: Record<string, string> | null
} {
  const str = (key: string) => ((formData.get(key) as string) ?? '').trim()

  const name        = str('name')
  const slug        = str('slug')
  const description = str('description')
  const icon        = str('icon') || null
  const sortOrderRaw = str('sortOrder')
  const sortOrder   = sortOrderRaw !== '' ? parseInt(sortOrderRaw, 10) : 0
  const published   = formData.get('published') === 'on'

  const errors: Record<string, string> = {}

  if (!name) {
    errors.name = 'Name ist erforderlich.'
  }
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (isNaN(sortOrder)) {
    errors.sortOrder = 'Ungültige Zahl.'
  }

  return {
    data: { name, slug, description, icon, sortOrder, published },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt eine neue Kategorie inkl. deutscher Übersetzung.
export async function createKategorie(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseKategorieForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen
  const duplicate = await prisma.category.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.category.create({
      data: {
        slug:      data.slug,
        icon:      data.icon,
        sortOrder: data.sortOrder,
        published: data.published,
        translations: {
          create: {
            locale:      'de',
            name:        data.name,
            description: data.description,
          },
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/kategorien')
  revalidatePath('/kategorien')
  redirect('/admin/kategorien')
}

// Aktualisiert eine bestehende Kategorie.
// Die Kategorie-ID wird per .bind(null, id) in der Seite vorgefüllt.
export async function updateKategorie(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseKategorieForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen — die eigene Kategorie ausschließen
  const duplicate = await prisma.category.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        slug:      data.slug,
        icon:      data.icon,
        sortOrder: data.sortOrder,
        published: data.published,
        translations: {
          upsert: {
            where: { categoryId_locale: { categoryId: id, locale: 'de' } },
            create: { locale: 'de', name: data.name, description: data.description },
            update: { name: data.name, description: data.description },
          },
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/kategorien')
  revalidatePath(`/kategorien/${data.slug}`)
  revalidatePath('/kategorien')
  redirect('/admin/kategorien')
}

// Löscht eine Kategorie. Tool-Zuordnungen (ToolCategory) werden automatisch
// mitgelöscht (onDelete: Cascade). Die Tools selbst bleiben erhalten.
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteKategorie(id: string): Promise<{ error?: string }> {
  try {
    await prisma.category.delete({ where: { id } })
  } catch {
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/kategorien')
  revalidatePath('/kategorien')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false.
export async function toggleKategoriePublished(id: string): Promise<void> {
  const cat = await prisma.category.findUnique({
    where: { id },
    select: { published: true },
  })
  if (!cat) return

  await prisma.category.update({
    where: { id },
    data: { published: !cat.published },
  })

  revalidatePath('/admin/kategorien')
  revalidatePath('/kategorien')
  revalidatePath('/')
}
