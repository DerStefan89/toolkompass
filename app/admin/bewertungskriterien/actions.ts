/**
 * Datei: app/admin/bewertungskriterien/actions.ts
 *
 * Zweck: Server Actions für Bewertungskriterien (RatingCriterion) — CRUD.
 *
 * Wird aufgerufen von:
 * - app/admin/bewertungskriterien/neu/page.tsx  (createCriterion)
 * - app/admin/bewertungskriterien/[id]/page.tsx (updateCriterion.bind(null, id), deleteCriterion.bind(null, id))
 * - app/admin/bewertungskriterien/page.tsx       (deleteCriterion.bind(null, id))
 *
 * Wichtig:
 * - Slug-Eindeutigkeit wird über den DB-Unique-Constraint abgesichert
 *   (P2002 → freundlicher Fehler), nicht über einen Vorab-Check.
 * - delete löscht via Cascade auch Zuweisungen (ToolRatingCriterion) und
 *   RatingScores — die UI warnt davor.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parseStr, toSlug } from '@/lib/utils/form'

// Interne Repräsentation der validierten Formulardaten
type CriterionFormData = {
  name: string
  slug: string
  sortOrder: number
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

/** Extrahiert + validiert die Felder; Slug wird aus dem Namen abgeleitet wenn leer. */
function parseCriterionForm(formData: FormData): {
  data: CriterionFormData
  errors: Record<string, string> | null
} {
  const name = parseStr(formData, 'name')
  const slug = parseStr(formData, 'slug') || toSlug(name)
  const sortOrderParsed = parseInt(parseStr(formData, 'sortOrder'), 10)
  const sortOrder = Number.isNaN(sortOrderParsed) ? 0 : sortOrderParsed

  const errors: Record<string, string> = {}
  if (!name) {
    errors.name = 'Name ist erforderlich.'
  }
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }

  return {
    data: { name, slug, sortOrder },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

/** Prüft, ob ein Fehler eine Unique-Verletzung (P2002) ist. */
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/** Erstellt ein neues Bewertungskriterium. */
export async function createCriterion(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const { data, errors } = parseCriterionForm(formData)
  if (errors) return { fieldErrors: errors }

  try {
    await prisma.ratingCriterion.create({
      data: { name: data.name, slug: data.slug, sortOrder: data.sortOrder },
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { slug: 'Ein Kriterium mit diesem Slug existiert bereits.' } }
    }
    console.error('[createCriterion]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/bewertungskriterien')
  redirect('/admin/bewertungskriterien')
}

/** Aktualisiert ein bestehendes Bewertungskriterium. */
export async function updateCriterion(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  const { data, errors } = parseCriterionForm(formData)
  if (errors) return { fieldErrors: errors }

  try {
    await prisma.ratingCriterion.update({
      where: { id },
      data: { name: data.name, slug: data.slug, sortOrder: data.sortOrder },
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { fieldErrors: { slug: 'Ein Kriterium mit diesem Slug existiert bereits.' } }
    }
    console.error('[updateCriterion]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/bewertungskriterien')
  redirect('/admin/bewertungskriterien')
}

/**
 * Löscht ein Bewertungskriterium. Cascade entfernt auch die Tool-Zuweisungen
 * (ToolRatingCriterion) und alle zugehörigen RatingScores.
 * Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
 */
export async function deleteCriterion(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Nicht autorisiert.' }
  }

  try {
    await prisma.ratingCriterion.delete({ where: { id } })
  } catch (error) {
    console.error('[deleteCriterion]', error)
    if (process.env.SENTRY_DSN) {
      const { captureException } = await import('@sentry/nextjs')
      captureException(error)
    }
    return { error: 'Löschen fehlgeschlagen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/bewertungskriterien')
  return {}
}
