/**
 * Datei: app/admin/vergleiche/actions.ts
 *
 * Zweck: Server Actions für Vergleichs-CRUD.
 *
 * Wird aufgerufen von:
 * - app/admin/vergleiche/neu/page.tsx  (createVergleich)
 * - app/admin/vergleiche/[id]/page.tsx (updateVergleich.bind(null, id), deleteVergleich.bind(null, id))
 *
 * Wichtig:
 * - toolAId darf nicht gleich toolBId sein (serverseitige Prüfung).
 * - Slug muss global eindeutig sein (@@unique).
 * - Vergleichszeilen (ComparisonRow) haben onDelete: Cascade — beim Update
 *   werden alle alten Rows gelöscht und neu angelegt (deleteMany + create).
 * - Leere Rows (ohne Kriterium) werden herausgefiltert.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { createClient } from '@/lib/supabase/server'
import { parseStr } from '@/lib/utils/form'



type VergleichFormData = {
  toolAId: string
  toolBId: string
  slug: string
  verdict: string
  published: boolean
  rows: Array<{ criterion: string; toolAValue: string; toolBValue: string }>
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function parseVergleichForm(formData: FormData): {
  data: VergleichFormData
  errors: Record<string, string> | null
} {
  const toolAId   = parseStr(formData, 'toolAId')
  const toolBId   = parseStr(formData, 'toolBId')
  const slug      = parseStr(formData, 'slug')
  const verdict   = parseStr(formData, 'verdict')
  const published = formData.get('published') === 'on'

  // Rows werden als parallele Arrays übertragen — gleicher Index = gleiche Zeile
  const criteria   = (formData.getAll('criterion')  as string[]).map(s => s.trim())
  const toolAVals  = (formData.getAll('toolAValue') as string[]).map(s => s.trim())
  const toolBVals  = (formData.getAll('toolBValue') as string[]).map(s => s.trim())

  const rows = criteria
    .map((criterion, i) => ({
      criterion,
      toolAValue: toolAVals[i] ?? '',
      toolBValue: toolBVals[i] ?? '',
    }))
    .filter(r => r.criterion) // Rows ohne Kriterium ignorieren

  const errors: Record<string, string> = {}
  if (!toolAId) errors.toolAId = 'Tool A ist erforderlich.'
  if (!toolBId) {
    errors.toolBId = 'Tool B ist erforderlich.'
  } else if (toolAId && toolAId === toolBId) {
    errors.toolBId = 'Tool A und Tool B müssen verschieden sein.'
  }
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  if (!verdict) errors.verdict = 'Fazit ist erforderlich.'

  return {
    data: { toolAId, toolBId, slug, verdict, published, rows },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createVergleich(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseVergleichForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.comparison.findUnique({
    where:  { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.comparison.create({
      data: {
        slug:      data.slug,
        verdict:   data.verdict,
        published: data.published,
        toolAId:   data.toolAId,
        toolBId:   data.toolBId,
        rows: {
          create: data.rows.map((r, i) => ({
            criterion:  r.criterion,
            toolAValue: r.toolAValue,
            toolBValue: r.toolBValue,
            sortOrder:  i,
          })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/vergleiche')
  revalidatePath('/vergleichen')
  redirect('/admin/vergleiche')
}

export async function updateVergleich(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseVergleichForm(formData)
  if (errors) return { fieldErrors: errors }

  const duplicate = await prisma.comparison.findFirst({
    where:  { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.comparison.update({
      where: { id },
      data: {
        slug:      data.slug,
        verdict:   data.verdict,
        published: data.published,
        toolAId:   data.toolAId,
        toolBId:   data.toolBId,
        // Alle bestehenden Rows löschen und neu anlegen (einfachste konsistente Strategie)
        rows: {
          deleteMany: {},
          create: data.rows.map((r, i) => ({
            criterion:  r.criterion,
            toolAValue: r.toolAValue,
            toolBValue: r.toolBValue,
            sortOrder:  i,
          })),
        },
      },
    })
  } catch {
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/vergleiche')
  revalidatePath(`/vergleichen/${data.slug}`)
  revalidatePath('/vergleichen')
  redirect('/admin/vergleiche')
}

// Löscht einen Vergleich inkl. aller ComparisonRows (onDelete: Cascade).
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteVergleich(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  try {
    await prisma.comparison.delete({ where: { id } })
  } catch {
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/vergleiche')
  revalidatePath('/vergleichen')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false.
export async function toggleVergleichPublished(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const item = await prisma.comparison.findUnique({
    where: { id },
    select: { published: true },
  })
  if (!item) return
  await prisma.comparison.update({
    where: { id },
    data: { published: !item.published },
  })
  revalidatePath('/admin/vergleiche')
  revalidatePath('/vergleichen')
  revalidatePath('/')
}
