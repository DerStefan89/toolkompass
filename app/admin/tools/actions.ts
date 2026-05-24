/**
 * Datei: app/admin/tools/actions.ts
 *
 * Zweck: Server Actions für Tool-Formulare (Erstellen und Bearbeiten).
 * Validierung, Datenbankzugriff und Cache-Invalidierung sind hier zentralisiert.
 *
 * Wird aufgerufen von:
 * - app/admin/tools/neu/page.tsx   (createTool)
 * - app/admin/tools/[id]/page.tsx  (updateTool.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ActionState = {
  error?: string                        // Allgemeiner Fehlertext
  fieldErrors?: Record<string, string>  // Fehler pro Formularfeld
}

// Interne Repräsentation der validierten Formulardaten
type ToolFormData = {
  name: string
  slug: string
  vendorId: string
  shortDescription: string
  longDescription: string | null
  startingPriceMonthly: number | null
  hasFreePlan: boolean
  isAffiliate: boolean
  published: boolean
  categoryIds: string[]
  tagIds: string[]
  features: string[]
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
  notIdealFor: string[]
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Wandelt einen Textarea-Wert (ein Eintrag pro Zeile) in ein bereinigtes Array um
function parseLines(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== 'string') return []
  return raw.split('\n').map(s => s.trim()).filter(Boolean)
}

// Extrahiert alle Tool-Felder aus FormData und validiert sie.
// Gibt entweder gültige Daten oder ein Fehler-Objekt zurück.
function parseToolForm(formData: FormData): {
  data: ToolFormData
  errors: Record<string, string> | null
} {
  const str = (key: string) => ((formData.get(key) as string) ?? '').trim()

  const name = str('name')
  const slug = str('slug')
  const vendorId = str('vendorId')
  const shortDescription = str('shortDescription')
  const longDescription = str('longDescription') || null
  const priceRaw = str('startingPriceMonthly')
  const startingPriceMonthly = priceRaw !== '' ? parseFloat(priceRaw) : null
  const hasFreePlan = formData.get('hasFreePlan') === 'on'
  const isAffiliate = formData.get('isAffiliate') === 'on'
  const published = formData.get('published') === 'on'
  const categoryIds = formData.getAll('categoryIds') as string[]
  const tagIds      = formData.getAll('tagIds') as string[]

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'Name ist erforderlich.'
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (!vendorId) errors.vendorId = 'Anbieter ist erforderlich.'
  if (!shortDescription) {
    errors.shortDescription = 'Kurzbeschreibung ist erforderlich.'
  } else if (shortDescription.length > 160) {
    errors.shortDescription = `Zu lang (${shortDescription.length}/160).`
  }
  if (startingPriceMonthly !== null && isNaN(startingPriceMonthly)) {
    errors.startingPriceMonthly = 'Ungültiger Preis.'
  }

  return {
    data: {
      name, slug, vendorId, shortDescription, longDescription,
      startingPriceMonthly, hasFreePlan, isAffiliate, published, categoryIds, tagIds,
      features: parseLines(formData.get('features')),
      strengths: parseLines(formData.get('strengths')),
      weaknesses: parseLines(formData.get('weaknesses')),
      bestFor: parseLines(formData.get('bestFor')),
      notIdealFor: parseLines(formData.get('notIdealFor')),
    },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// Erzeugt das deutsche Übersetzungs-Objekt — identisch für create und update
function buildTranslation(d: ToolFormData) {
  return {
    locale: 'de' as const,
    name: d.name,
    shortDescription: d.shortDescription,
    longDescription: d.longDescription,
    features: d.features,
    strengths: d.strengths,
    weaknesses: d.weaknesses,
    bestFor: d.bestFor,
    notIdealFor: d.notIdealFor,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt ein neues Tool inkl. deutscher Übersetzung und Kategoriezuordnungen.
export async function createTool(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseToolForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen
  const duplicate = await prisma.tool.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.tool.create({
      data: {
        slug: data.slug,
        startingPriceMonthly: data.startingPriceMonthly,
        hasFreePlan: data.hasFreePlan,
        isAffiliate: data.isAffiliate,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        vendor: { connect: { id: data.vendorId } },
        translations: { create: buildTranslation(data) },
        categories: {
          create: data.categoryIds.map(categoryId => ({ categoryId })),
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

  revalidatePath('/admin/tools')
  revalidatePath('/')
  redirect('/admin/tools')
}

// Aktualisiert ein bestehendes Tool.
// Die Tool-ID wird per .bind(null, id) in der Seite vorgefüllt.
export async function updateTool(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { data, errors } = parseToolForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen (das eigene Tool ausschließen)
  const duplicate = await prisma.tool.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  // publishedAt nur setzen wenn noch nicht vorhanden — nicht bei jedem Edit überschreiben
  const existing = await prisma.tool.findUnique({
    where: { id },
    select: { publishedAt: true },
  })

  try {
    await prisma.tool.update({
      where: { id },
      data: {
        slug: data.slug,
        startingPriceMonthly: data.startingPriceMonthly,
        hasFreePlan: data.hasFreePlan,
        isAffiliate: data.isAffiliate,
        published: data.published,
        publishedAt: data.published ? (existing?.publishedAt ?? new Date()) : null,
        vendor: { connect: { id: data.vendorId } },
        translations: {
          upsert: {
            where: { toolId_locale: { toolId: id, locale: 'de' } },
            create: buildTranslation(data),
            update: buildTranslation(data),
          },
        },
        // Kategoriezuordnungen atomisch ersetzen
        categories: {
          deleteMany: {},
          create: data.categoryIds.map(categoryId => ({ categoryId })),
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

  revalidatePath('/admin/tools')
  revalidatePath(`/tools/${data.slug}`)
  revalidatePath('/')
  redirect('/admin/tools')
}

// Löscht ein Tool vollständig. Kaskadierendes Löschen (ToolCategory, ToolTag etc.)
// erfolgt automatisch via onDelete: Cascade im Schema.
export async function deleteTool(id: string): Promise<void> {
  try {
    await prisma.tool.delete({ where: { id } })
  } catch {
    throw new Error('Löschen fehlgeschlagen. Das Tool wird möglicherweise noch referenziert.')
  }
  revalidatePath('/admin/tools')
  revalidatePath('/')
  redirect('/admin/tools')
}

// Für die Tool-Liste: löscht ohne redirect, gibt Fehlerstatus zurück.
export async function deleteToolById(id: string): Promise<{ error?: string }> {
  try {
    await prisma.tool.delete({ where: { id } })
  } catch {
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/tools')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false und setzt publishedAt entsprechend.
export async function togglePublished(id: string): Promise<void> {
  const tool = await prisma.tool.findUnique({
    where: { id },
    select: { published: true },
  })
  if (!tool) return

  await prisma.tool.update({
    where: { id },
    data: {
      published: !tool.published,
      publishedAt: !tool.published ? new Date() : null,
    },
  })

  revalidatePath('/admin/tools')
  revalidatePath('/')
}
