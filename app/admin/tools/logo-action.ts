/**
 * Datei: app/admin/tools/logo-action.ts
 *
 * Zweck: Server Action für Logo-Upload via Supabase Storage.
 * Empfängt die Datei als FormData, lädt sie serverseitig mit dem
 * Admin-Client (Service Role Key, bypassed RLS) in den Bucket hoch
 * und speichert die Public-URL in der DB.
 *
 * Wichtig:
 * - Nur Server-seitig aufrufen — der Admin-Client enthält einen Secret Key.
 * - Bucket "tool-logos" muss in Supabase als public markiert sein.
 * - Pfad-Format: {toolId}/logo.{ext} — wird per upsert überschrieben.
 */

'use server'

import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const MAX_BYTES   = 1 * 1024 * 1024
const ACCEPTED    = ['image/png', 'image/jpeg', 'image/svg+xml']
const BUCKET_NAME = 'tool-logos'

export type LogoActionState = {
  error?: string
  publicUrl?: string
}

export async function uploadToolLogo(
  toolId: string,
  _prev: LogoActionState,
  formData: FormData,
): Promise<LogoActionState> {
  const file = formData.get('logo') as File | null

  if (!file || file.size === 0) return { error: 'Keine Datei ausgewählt.' }
  if (!ACCEPTED.includes(file.type)) return { error: 'Nur PNG, JPG und SVG sind erlaubt.' }
  if (file.size > MAX_BYTES) return { error: 'Die Datei ist größer als 1 MB.' }

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${toolId}/logo.${ext}`

  const supabase = createAdminClient()
  const buffer   = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, { upsert: true, contentType: file.type })

  if (uploadError) {
    return { error: `Upload fehlgeschlagen: ${uploadError.message}` }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  try {
    await prisma.tool.update({ where: { id: toolId }, data: { logoUrl: publicUrl } })
  } catch {
    return { error: 'Datenbankfehler beim Speichern der Logo-URL.' }
  }

  revalidatePath(`/admin/tools/${toolId}`)
  return { publicUrl }
}
