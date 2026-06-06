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
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr, parseLines } from '@/lib/utils/form'



type FaqItem = { question: string; answer: string }

// Interne Repräsentation der validierten Formulardaten
type ToolFormData = {
  name: string
  slug: string
  vendorId: string
  shortDescription: string
  longDescription: string | null
  startingPriceCents: number | null
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
  faqItems: FaqItem[]
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Extrahiert alle Tool-Felder aus FormData und validiert sie.
// Gibt entweder gültige Daten oder ein Fehler-Objekt zurück.
function parseToolForm(formData: FormData): {
  data: ToolFormData
  errors: Record<string, string> | null
} {
  const name = parseStr(formData, 'name')
  const slug = parseStr(formData, 'slug')
  const vendorId = parseStr(formData, 'vendorId')
  const shortDescription = parseStr(formData, 'shortDescription')
  const longDescription = parseStr(formData, 'longDescription') || null
  const priceRaw = parseStr(formData, 'startingPriceCents')
  const startingPriceCents = priceRaw !== '' ? Math.round(parseFloat(priceRaw) * 100) : null
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
  if (startingPriceCents !== null && isNaN(startingPriceCents)) {
    errors.startingPriceCents = 'Ungültiger Preis.'
  }

  let faqItems: FaqItem[] = []
  try {
    const raw = parseStr(formData, 'faqItems')
    if (raw) faqItems = JSON.parse(raw) as FaqItem[]
  } catch {
    // ungültiges JSON → leeres Array verwenden
  }

  return {
    data: {
      name, slug, vendorId, shortDescription, longDescription,
      startingPriceCents, hasFreePlan, isAffiliate, published, categoryIds, tagIds,
      features: parseLines(formData, 'features'),
      strengths: parseLines(formData, 'strengths'),
      weaknesses: parseLines(formData, 'weaknesses'),
      bestFor: parseLines(formData, 'bestFor'),
      notIdealFor: parseLines(formData, 'notIdealFor'),
      faqItems,
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
    faqItems: d.faqItems.length > 0 ? d.faqItems : Prisma.DbNull,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt ein neues Tool inkl. deutscher Übersetzung und Kategoriezuordnungen.
export async function createTool(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

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
        startingPriceCents: data.startingPriceCents,
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
  } catch (error) {
    console.error('[createTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
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
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

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
        startingPriceCents: data.startingPriceCents,
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
  } catch (error) {
    console.error('[updateTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/tools')
  revalidatePath(`/tools/${data.slug}`)
  revalidatePath('/')
  redirect('/admin/tools')
}

// Löscht ein Tool vollständig. Kaskadierendes Löschen (ToolCategory, ToolTag etc.)
// erfolgt automatisch via onDelete: Cascade im Schema.
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteTool(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  try {
    await prisma.tool.delete({ where: { id } })
  } catch (error) {
    console.error('[deleteTool]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Löschen fehlgeschlagen. Das Tool wird möglicherweise noch referenziert.' }
  }
  revalidatePath('/admin/tools')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false und setzt publishedAt entsprechend.
export async function togglePublished(id: string): Promise<void> {
  try {
    await requireAdmin()
  } catch {
    return
  }

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
