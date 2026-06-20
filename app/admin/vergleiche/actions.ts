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
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr } from '@/lib/utils/form'



type VergleichFormData = {
  toolAId: string
  toolBId: string
  slug: string
  verdict: string
  published: boolean
  rows: Array<{ criterion: string; toolAValue: string; toolBValue: string }>
  // V2 — neue, optionale Felder
  title: string | null
  subtitle: string | null
  keyDifference: string | null
  decisionGuide: { toolA: string[]; toolB: string[]; alternatives: string[] } | null
  targetGroups: { toolA: string[]; toolB: string[] } | null
  sections: Array<{ heading: string; content: string }>
  features: Array<{ feature: string; toolAValue: string; toolBValue: string }>
  alternatives: Array<{ toolId: string; reason: string }>
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/** Liest eine parallele Textliste (eine Zeile = ein Eintrag), getrimmt und ohne Leere. */
function parseList(formData: FormData, key: string): string[] {
  return (formData.getAll(key) as string[]).map(s => s.trim()).filter(Boolean)
}

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

  // ── V2: neue, optionale Felder ──

  const title         = parseStr(formData, 'title') || null
  const subtitle      = parseStr(formData, 'subtitle') || null
  const keyDifference = parseStr(formData, 'keyDifference') || null

  // decisionGuide: drei parallele Listen → JSON (null wenn komplett leer)
  const dgToolA = parseList(formData, 'dgToolA')
  const dgToolB = parseList(formData, 'dgToolB')
  const dgAlt   = parseList(formData, 'dgAlt')
  const decisionGuide = (dgToolA.length || dgToolB.length || dgAlt.length)
    ? { toolA: dgToolA, toolB: dgToolB, alternatives: dgAlt }
    : null

  // targetGroups: zwei parallele Listen → JSON (null wenn leer)
  const tgToolA = parseList(formData, 'tgToolA')
  const tgToolB = parseList(formData, 'tgToolB')
  const targetGroups = (tgToolA.length || tgToolB.length)
    ? { toolA: tgToolA, toolB: tgToolB }
    : null

  // Sektionen (parallele Felder) — nur mit Überschrift UND Inhalt
  const secHeadings = (formData.getAll('sectionHeading') as string[])
  const secContents = (formData.getAll('sectionContent') as string[])
  const sections = secHeadings
    .map((heading, i) => ({ heading: heading.trim(), content: (secContents[i] ?? '').trim() }))
    .filter(s => s.heading && s.content)

  // Features (parallele Felder) — nur mit Feature-Name
  const featNames = (formData.getAll('featureName') as string[])
  const featA     = (formData.getAll('featureToolA') as string[])
  const featB     = (formData.getAll('featureToolB') as string[])
  const features = featNames
    .map((feature, i) => ({
      feature: feature.trim(),
      toolAValue: (featA[i] ?? '').trim(),
      toolBValue: (featB[i] ?? '').trim(),
    }))
    .filter(f => f.feature)

  // Alternatives (parallele Felder) — nur mit Tool, dedupliziert (unique [comparisonId, toolId])
  const altToolIds = (formData.getAll('altToolId') as string[])
  const altReasons = (formData.getAll('altReason') as string[])
  const alternatives = altToolIds
    .map((toolId, i) => ({ toolId: toolId.trim(), reason: (altReasons[i] ?? '').trim() }))
    .filter(a => a.toolId)
    .filter((a, i, arr) => arr.findIndex(x => x.toolId === a.toolId) === i)

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
    data: {
      toolAId, toolBId, slug, verdict, published, rows,
      title, subtitle, keyDifference, decisionGuide, targetGroups,
      sections, features, alternatives,
    },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function createVergleich(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

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
        slug:          data.slug,
        verdict:       data.verdict,
        published:     data.published,
        toolAId:       data.toolAId,
        toolBId:       data.toolBId,
        title:         data.title,
        subtitle:      data.subtitle,
        keyDifference: data.keyDifference,
        decisionGuide: data.decisionGuide ?? Prisma.DbNull,
        targetGroups:  data.targetGroups ?? Prisma.DbNull,
        rows: {
          create: data.rows.map((r, i) => ({
            criterion:  r.criterion,
            toolAValue: r.toolAValue,
            toolBValue: r.toolBValue,
            sortOrder:  i,
          })),
        },
        sections: {
          create: data.sections.map((s, i) => ({
            heading:   s.heading,
            content:   s.content,
            sortOrder: i,
          })),
        },
        features: {
          create: data.features.map((f, i) => ({
            feature:    f.feature,
            toolAValue: f.toolAValue,
            toolBValue: f.toolBValue,
            sortOrder:  i,
          })),
        },
        alternatives: {
          create: data.alternatives.map((a, i) => ({
            reason:    a.reason,
            sortOrder: i,
            tool:      { connect: { id: a.toolId } },
          })),
        },
      },
    })
  } catch (error) {
    console.error('[createVergleich]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
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
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

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
        slug:          data.slug,
        verdict:       data.verdict,
        published:     data.published,
        toolAId:       data.toolAId,
        toolBId:       data.toolBId,
        title:         data.title,
        subtitle:      data.subtitle,
        keyDifference: data.keyDifference,
        decisionGuide: data.decisionGuide ?? Prisma.DbNull,
        targetGroups:  data.targetGroups ?? Prisma.DbNull,
        // Alle Relationen löschen und neu anlegen (gleiche Strategie wie rows)
        rows: {
          deleteMany: {},
          create: data.rows.map((r, i) => ({
            criterion:  r.criterion,
            toolAValue: r.toolAValue,
            toolBValue: r.toolBValue,
            sortOrder:  i,
          })),
        },
        sections: {
          deleteMany: {},
          create: data.sections.map((s, i) => ({
            heading:   s.heading,
            content:   s.content,
            sortOrder: i,
          })),
        },
        features: {
          deleteMany: {},
          create: data.features.map((f, i) => ({
            feature:    f.feature,
            toolAValue: f.toolAValue,
            toolBValue: f.toolBValue,
            sortOrder:  i,
          })),
        },
        alternatives: {
          deleteMany: {},
          create: data.alternatives.map((a, i) => ({
            reason:    a.reason,
            sortOrder: i,
            tool:      { connect: { id: a.toolId } },
          })),
        },
      },
    })
  } catch (error) {
    console.error('[updateVergleich]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
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
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  try {
    await prisma.comparison.delete({ where: { id } })
  } catch (error) {
    console.error('[deleteVergleich]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Löschen fehlgeschlagen.' }
  }
  revalidatePath('/admin/vergleiche')
  revalidatePath('/vergleichen')
  revalidatePath('/')
  return {}
}

// Toggled published true↔false.
export async function toggleVergleichPublished(id: string): Promise<void> {
  try {
    await requireAdmin()
  } catch {
    return
  }

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
