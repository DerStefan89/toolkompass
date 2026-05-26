/**
 * Datei: app/admin/vendors/actions.ts
 *
 * Zweck: Server Actions für Vendor-Formulare (Erstellen und Bearbeiten).
 * Validierung, Datenbankzugriff und Cache-Invalidierung sind hier zentralisiert.
 *
 * Wird aufgerufen von:
 * - app/admin/vendors/neu/page.tsx  (createVendor)
 * - app/admin/vendors/[id]/page.tsx (updateVendor.bind(null, id))
 */

'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ActionState } from '@/lib/types/admin'
import { createClient } from '@/lib/supabase/server'
import { parseStr } from '@/lib/utils/form'



// Interne Repräsentation der validierten Formulardaten
type VendorFormData = {
  name: string
  slug: string
  website: string | null
  description: string | null
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

// Extrahiert alle Felder aus FormData, validiert sie und gibt entweder
// gültige Daten oder ein Fehler-Objekt zurück.
function parseVendorForm(formData: FormData): {
  data: VendorFormData
  errors: Record<string, string> | null
} {
  const name        = parseStr(formData, 'name')
  const slug        = parseStr(formData, 'slug')
  const website     = parseStr(formData, 'website') || null
  const description = parseStr(formData, 'description') || null

  const errors: Record<string, string> = {}

  if (!name) {
    errors.name = 'Name ist erforderlich.'
  }
  if (!slug) {
    errors.slug = 'Slug ist erforderlich.'
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'
  }
  // Website ist optional — wenn angegeben, muss sie ein gültiges URL-Format haben
  if (website && !/^https?:\/\/.+/.test(website)) {
    errors.website = 'Bitte eine gültige URL angeben (beginnt mit http:// oder https://).'
  }

  return {
    data: { name, slug, website, description },
    errors: Object.keys(errors).length > 0 ? errors : null,
  }
}

// ─── Server Actions ──────────────────────────────────────────────────────────

// Erstellt einen neuen Vendor.
export async function createVendor(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseVendorForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen
  const duplicate = await prisma.vendor.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.vendor.create({
      data: {
        name:        data.name,
        slug:        data.slug,
        website:     data.website,
        description: data.description,
      },
    })
  } catch (error) {
    console.error('[createVendor]', error)
    return { error: 'Datenbankfehler beim Erstellen. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}

// Aktualisiert einen bestehenden Vendor.
// Die Vendor-ID wird per .bind(null, id) in der Seite vorgefüllt.
export async function updateVendor(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  const { data, errors } = parseVendorForm(formData)
  if (errors) return { fieldErrors: errors }

  // Slug-Eindeutigkeit prüfen — den eigenen Eintrag ausschließen
  const duplicate = await prisma.vendor.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  })
  if (duplicate) return { fieldErrors: { slug: 'Dieser Slug ist bereits vergeben.' } }

  try {
    await prisma.vendor.update({
      where: { id },
      data: {
        name:        data.name,
        slug:        data.slug,
        website:     data.website,
        description: data.description,
      },
    })
  } catch (error) {
    console.error('[updateVendor]', error)
    return { error: 'Datenbankfehler beim Speichern. Bitte versuche es erneut.' }
  }

  revalidatePath('/admin/vendors')
  redirect('/admin/vendors')
}

// Löscht einen Vendor. Schlägt fehl wenn noch Tools zugeordnet sind
// (kein onDelete: Cascade auf Tool.vendorId — bewusste Entscheidung).
// Navigation nach Erfolg liegt beim Aufrufer (kein redirect hier).
export async function deleteVendor(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert.' }

  try {
    await prisma.vendor.delete({ where: { id } })
  } catch (error) {
    console.error('[deleteVendor]', error)
    return { error: 'Löschen fehlgeschlagen. Dem Anbieter sind möglicherweise noch Tools zugeordnet.' }
  }
  revalidatePath('/admin/vendors')
  revalidatePath('/')
  return {}
}
